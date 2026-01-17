/**
 * OpenAI + Browser TTS Hybrid Voice Assistant
 * Mikrofon → Speech Recognition → OpenAI → Browser TTS
 */

import React, { useState, useRef, useCallback } from 'react';
import { Mic, MicOff, Loader2, Volume2, VolumeX } from 'lucide-react';
import OpenAI from 'openai';

interface HybridVoiceProps {
    systemPrompt: string;
    onResponse?: (text: string) => void;
    onError?: (error: string) => void;
}

export const HybridVoiceAssistant: React.FC<HybridVoiceProps> = ({
    systemPrompt,
    onResponse,
    onError
}) => {
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [aiResponse, setAiResponse] = useState('');

    const recognitionRef = useRef<any>(null);
    const synthRef = useRef<SpeechSynthesis | null>(null);
    const openaiRef = useRef<OpenAI | null>(null);
    const conversationRef = useRef<any[]>([]);

    // OpenAI istemcisini başlat
    React.useEffect(() => {
        if (!openaiRef.current && import.meta.env.VITE_OPENAI_API_KEY) {
            openaiRef.current = new OpenAI({
                apiKey: import.meta.env.VITE_OPENAI_API_KEY,
                dangerouslyAllowBrowser: true // Yalnız development üçün
            });
        }

        synthRef.current = window.speechSynthesis;
    }, []);

    // Səsi dayandır
    const stopSpeaking = useCallback(() => {
        if (synthRef.current) {
            synthRef.current.cancel();
            setIsSpeaking(false);
        }
    }, []);

    // Mətn oxu (TTS)
    const speak = useCallback((text: string) => {
        if (!synthRef.current || !text) return;

        stopSpeaking();

        const utterance = new SpeechSynthesisUtterance(text);

        // Azərbaycanca səs tap (və ya ən yaxşı alternativi)
        const voices = synthRef.current.getVoices();
        const azVoice = voices.find(v => v.lang.startsWith('az')) ||
            voices.find(v => v.lang.startsWith('tr')) || // Türkcə alternativ
            voices.find(v => v.lang.startsWith('ru')) || // Rusca alternativ
            voices[0]; // Default

        if (azVoice) utterance.voice = azVoice;

        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => {
            setIsSpeaking(false);
            onError?.('TTS xətası baş verdi');
        };

        synthRef.current.speak(utterance);
    }, [stopSpeaking, onError]);

    // Speech Recognition başlat
    const startListening = useCallback(() => {
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            onError?.('Bu brauzer səs tanımayı dəstəkləmir');
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();

        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'az-AZ'; // Azərbaycanca

        recognitionRef.current.onstart = () => {
            setIsListening(true);
            setTranscript('');
        };

        recognitionRef.current.onresult = async (event: any) => {
            const text = event.results[0][0].transcript;
            setTranscript(text);
            setIsListening(false);

            // OpenAI-yə göndər
            await processWithOpenAI(text);
        };

        recognitionRef.current.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
            onError?.(`Səs tanıma xətası: ${event.error}`);
        };

        recognitionRef.current.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current.start();
    }, [onError]);

    // Dinləməni dayan
    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    }, []);

    // OpenAI ilə işlə
    const processWithOpenAI = async (userMessage: string) => {
        if (!openaiRef.current) {
            onError?.('OpenAI konfiqurasiya edilməyib');
            return;
        }

        setIsProcessing(true);

        try {
            // Söhbət tarixçəsinə əlavə et
            conversationRef.current.push({
                role: 'user',
                content: userMessage
            });

            const completion = await openaiRef.current.chat.completions.create({
                model: 'gpt-4o-mini', // Daha ucuz variant (gpt-4o da olar)
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...conversationRef.current
                ],
                temperature: 0.7,
                max_tokens: 500
            });

            const assistantMessage = completion.choices[0]?.message?.content || '';

            // Tarixçəyə əlavə et
            conversationRef.current.push({
                role: 'assistant',
                content: assistantMessage
            });

            setAiResponse(assistantMessage);
            onResponse?.(assistantMessage);

            // Cavabı oxu
            speak(assistantMessage);

        } catch (error: any) {
            console.error('OpenAI error:', error);
            const errorMsg = error.message || 'OpenAI xətası baş verdi';
            onError?.(errorMsg);
            setAiResponse(`Xəta: ${errorMsg}`);
        } finally {
            setIsProcessing(false);
        }
    };

    // Toggle mikrofon
    const toggleMicrophone = () => {
        if (isListening) {
            stopListening();
        } else {
            stopSpeaking(); // Əvvəl danışığı dayan
            startListening();
        }
    };

    return (
        <div className="hybrid-voice-assistant flex flex-col items-center gap-4 p-6">
            {/* Mikrofon düyməsi */}
            <div className="relative">
                {isListening && (
                    <div className="absolute inset-0 -m-4">
                        <div className="w-full h-full rounded-full border-2 border-emerald-500/30 animate-ping"></div>
                    </div>
                )}

                <button
                    onClick={toggleMicrophone}
                    disabled={isProcessing || isSpeaking}
                    className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg relative z-10 ${isListening
                            ? 'bg-red-500 text-white shadow-red-500/20 scale-110'
                            : isProcessing || isSpeaking
                                ? 'bg-gray-400 text-white cursor-not-allowed'
                                : 'bg-emerald-500 text-white shadow-emerald-500/20 hover:scale-105'
                        }`}
                >
                    {isProcessing ? (
                        <Loader2 className="w-8 h-8 animate-spin" />
                    ) : isListening ? (
                        <MicOff className="w-8 h-8" />
                    ) : (
                        <Mic className="w-8 h-8" />
                    )}
                </button>
            </div>

            {/* Status */}
            <div className="text-center min-h-[60px]">
                {isListening && (
                    <p className="text-sm font-bold text-emerald-600 uppercase tracking-wide">
                        🎤 Dinləyirəm...
                    </p>
                )}
                {isProcessing && (
                    <p className="text-sm font-bold text-blue-600 uppercase tracking-wide">
                        🤔 Düşünürəm...
                    </p>
                )}
                {isSpeaking && (
                    <div className="flex items-center gap-2 justify-center">
                        <Volume2 className="w-5 h-5 text-purple-600 animate-pulse" />
                        <p className="text-sm font-bold text-purple-600 uppercase tracking-wide">
                            Danışıram...
                        </p>
                    </div>
                )}
                {!isListening && !isProcessing && !isSpeaking && (
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wide">
                        Mikrofona basıb danışın
                    </p>
                )}
            </div>

            {/* Transkript */}
            {transcript && (
                <div className="w-full max-w-md p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs font-bold text-blue-600 uppercase mb-1">Siz:</p>
                    <p className="text-sm text-slate-700">{transcript}</p>
                </div>
            )}

            {/* AI cavabı */}
            {aiResponse && (
                <div className="w-full max-w-md p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <p className="text-xs font-bold text-emerald-600 uppercase mb-1">AI Asistent:</p>
                    <p className="text-sm text-slate-700">{aiResponse}</p>

                    {!isSpeaking && (
                        <button
                            onClick={() => speak(aiResponse)}
                            className="mt-2 text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                        >
                            <Volume2 className="w-3 h-3" />
                            Yenidən oxu
                        </button>
                    )}
                </div>
            )}

            {/* Səsi dayan düyməsi */}
            {isSpeaking && (
                <button
                    onClick={stopSpeaking}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-full text-sm font-bold hover:bg-red-600 transition-colors"
                >
                    <VolumeX className="w-4 h-4" />
                    Səsi Dayan
                </button>
            )}
        </div>
    );
};

export default HybridVoiceAssistant;
