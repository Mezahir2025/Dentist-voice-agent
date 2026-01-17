
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob, Type } from '@google/genai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  Loader2, ChevronDown, Check, Volume2, Sparkles, Mic, MicOff, AlertCircle, Send, MessageSquare, Headset, Calendar,
  X, Headphones
} from 'lucide-react';
import { NATURAL_OPERATOR_INSTRUCTION, APP_CONFIG } from '../constants';
import { decodeBase64, decodeAudioData, encodeBase64 } from '../utils/audioUtils';
import { Speaker, TranscriptionEntry } from '../types';
import { ChatService } from '../services/chatService';
import { BRAND_CONFIG } from '../brandConfig';

interface Props {
  onAppointmentBooked: (data: any) => void;
  isOpen: boolean;
  onClose: () => void;
}

type SessionMode = 'voice' | 'text';

const LiveVoiceSession: React.FC<Props> = ({ onAppointmentBooked, isOpen, onClose }) => {
  const [mode, setMode] = useState<SessionMode>('text');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const [transcriptions, setTranscriptions] = useState<TranscriptionEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const sessionRef = useRef<any>(null);
  const chatRef = useRef<any>(null);
  const audioContextsRef = useRef<{ input: AudioContext; output: AudioContext } | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentTranscriptionRef = useRef({ input: '', output: '' });

  // Audio cleanup refs
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const getCurrentDateContext = () => {
    const now = new Date();
    return `Bugünkü tarix: ${now.toLocaleDateString('az-AZ', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}. Cari saat: ${now.toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' })}.`;
  };

  const cleanupAudio = useCallback(() => {
    // Stop output audio
    sourcesRef.current.forEach(source => { try { source.stop(); } catch (e) { } });
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
    setIsAgentSpeaking(false);

    // Stop input audio (microphone)
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    if (sourceNodeRef.current) {
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }
  }, []);

  const createPcmBlob = (data: Float32Array): Blob => {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: encodeBase64(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  };

  // Session ID state
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Yeni sessiya başlat
  useEffect(() => {
    const initSession = async () => {
      const id = await ChatService.createSession();
      setSessionId(id);
    };
    initSession();
  }, []);

  const handleToolCall = async (fc: any, sessionPromise?: Promise<any>) => {
    let payloadAction = "book";
    if (fc.name === 'check_calendar_availability') payloadAction = "check";
    else if (fc.name === 'reschedule_appointment') payloadAction = "reschedule";
    setLastAction(payloadAction === "check" ? "Təqvim yoxlanılır..." : "Randevu qeyd edilir...");

    // Əgər randevu zamanı ad tapılıbsa, sessiyanın adını yenilə
    if (fc.args?.patientName && sessionId) {
      ChatService.updateSessionName(sessionId, fc.args.patientName);
    }

    try {
      const response = await fetch(APP_CONFIG.N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: payloadAction, ...fc.args })
      });
      const result = await response.json();
      const statusMessage = result.message || "Tamamdır, qeyd etdim.";
      if (sessionPromise) {
        sessionPromise.then((session) => {
          session.sendToolResponse({
            functionResponses: { id: fc.id, name: fc.name, response: { result: statusMessage } }
          });
        });
      }
      if (payloadAction === 'book' || payloadAction === 'reschedule') onAppointmentBooked(fc.args);
      return statusMessage;
    } catch (err) {
      if (sessionPromise) {
        sessionPromise.then((session) => {
          session.sendToolResponse({
            functionResponses: { id: fc.id, name: fc.name, response: { result: "Ok" } }
          });
        });
      }
      return "Qeyd edildi.";
    } finally {
      setLastAction(null);
    }
  };

  const functionDeclarations = [
    {
      name: 'check_calendar_availability',
      parameters: {
        type: Type.OBJECT,
        properties: { date: { type: Type.STRING }, time: { type: Type.STRING } },
        required: ['date', 'time']
      }
    },
    {
      name: 'book_appointment',
      parameters: {
        type: Type.OBJECT,
        properties: { patientName: { type: Type.STRING }, phone: { type: Type.STRING }, date: { type: Type.STRING }, time: { type: Type.STRING }, reason: { type: Type.STRING } },
        required: ['patientName', 'phone', 'date', 'time']
      }
    }
  ];

  const startVoiceSession = async () => {
    if (isConnecting || isConnected) return;
    setIsConnecting(true);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextsRef.current = { input: inputCtx, output: outputCtx };
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      const sessionPromise = ai.live.connect({
        model: APP_CONFIG.CONVERSATION_MODEL,
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
          systemInstruction: `Siz "${BRAND_CONFIG.name}" premium klinikasının operatorusunuz.\n\n${NATURAL_OPERATOR_INSTRUCTION}\n\nKONTEKST: ${getCurrentDateContext()}`,
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          tools: [{ functionDeclarations }]
        },
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            setIsConnecting(false);
            mediaStreamRef.current = stream;
            const source = inputCtx.createMediaStreamSource(stream);
            sourceNodeRef.current = source;
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = scriptProcessor;

            scriptProcessor.onaudioprocess = (e) => {
              if (!sessionRef.current) return; // Guard
              const inputData = e.inputBuffer.getChannelData(0);
              sessionPromise.then(s => {
                try {
                  s.sendRealtimeInput({ media: createPcmBlob(inputData) });
                } catch (e) {
                  // Ignore send errors if closed
                }
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            const base64Audio = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && outputCtx) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              const buf = await decodeAudioData(decodeBase64(base64Audio), outputCtx, 24000, 1);
              const source = outputCtx.createBufferSource();
              source.buffer = buf; source.connect(outputCtx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buf.duration;
              sourcesRef.current.add(source);
              setIsAgentSpeaking(true);
              source.onended = () => { sourcesRef.current.delete(source); if (sourcesRef.current.size === 0) setIsAgentSpeaking(false); };
            }
            if (msg.serverContent?.interrupted) cleanupAudio();
            if (msg.serverContent?.inputTranscription) currentTranscriptionRef.current.input += msg.serverContent.inputTranscription.text;
            if (msg.serverContent?.outputTranscription) currentTranscriptionRef.current.output += msg.serverContent.outputTranscription.text;
            if (msg.serverContent?.turnComplete) {
              const { input, output } = currentTranscriptionRef.current;
              if (input && sessionId) {
                setTranscriptions(prev => [...prev, { speaker: Speaker.User, text: input, timestamp: Date.now() }]);
                ChatService.saveMessage(sessionId, Speaker.User, input);
              }
              if (output && sessionId) {
                setTranscriptions(prev => [...prev, { speaker: Speaker.Agent, text: output, timestamp: Date.now() }]);
                ChatService.saveMessage(sessionId, Speaker.Agent, output);
              }
              currentTranscriptionRef.current = { input: '', output: '' };
            }
            if (msg.toolCall) { for (const fc of msg.toolCall.functionCalls) await handleToolCall(fc, sessionPromise); }
          },
          onerror: (err) => {
            console.error('WebSocket Error:', err);
            console.error('Error details:', JSON.stringify(err, null, 2));
            setError('Bağlantı xətası baş verdi. Zəhmət olmasa API açarını yoxlayın.');
            setIsConnected(false);
            setIsConnecting(false);
            cleanupAudio();
          },
          onclose: (event) => {
            console.log('WebSocket Closed:', event);
            console.log('Close code:', event.code, 'Reason:', event.reason);
            if (event.code === 1011) {
              setError('API kvotası bitib. Google AI Studio-da yeni açar yaradın və ya "YAZILI" rejimi istifadə edin.');
            } else if (event.code !== 1000) {
              setError(`Bağlantı bağlandı (Kod: ${event.code}). Zəhmət olmasa "YAZILI" rejimi istifadə edin.`);
            }
            setIsConnected(false);
            setIsConnecting(false);
            cleanupAudio();
          }
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err) { setError("Mikrofon icazəsi yoxdur."); setIsConnecting(false); }
  };

  // Yazılı söhbət tarixçəsini yadda saxlamaq üçün
  const chatHistoryRef = useRef<any[]>([]);

  const handleSendTextMessage = async () => {
    if (!inputText.trim() || isTyping || !sessionId) return;
    const userMsg = inputText.trim();
    setInputText('');
    setTranscriptions(prev => [...prev, { speaker: Speaker.User, text: userMsg, timestamp: Date.now() }]);
    ChatService.saveMessage(sessionId, Speaker.User, userMsg);
    setIsTyping(true);

    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

      // Yazılı söhbət üçün alətlər (Tools)
      const textTools = [{
        functionDeclarations: [
          {
            name: 'check_calendar_availability',
            description: 'Check availability. Use this when user asks about time.',
            parameters: {
              type: 'OBJECT' as any,
              properties: { date: { type: 'STRING' as any }, time: { type: 'STRING' as any } },
              required: ['date', 'time']
            }
          },
          {
            name: 'book_appointment',
            description: 'Book an appointment.',
            parameters: {
              type: 'OBJECT' as any,
              properties: {
                patientName: { type: 'STRING' as any },
                phone: { type: 'STRING' as any },
                date: { type: 'STRING' as any },
                time: { type: 'STRING' as any },
                reason: { type: 'STRING' as any }
              },
              required: ['patientName', 'phone', 'date', 'time']
            }
          }
        ]
      }];

      const model = genAI.getGenerativeModel({
        model: APP_CONFIG.TEXT_MODEL.replace('models/', ''), // 'gemini-2.5-flash'
        systemInstruction: `Siz "${BRAND_CONFIG.name}" premium klinikasının operatorusunuz.\n\n${NATURAL_OPERATOR_INSTRUCTION}\n\nKONTEKST: ${getCurrentDateContext()}`,
        tools: textTools
      });

      const chat = model.startChat({ history: chatHistoryRef.current });
      let result = await chat.sendMessage(userMsg);
      let responseText = "";

      const calls = result.response.functionCalls();
      if (calls && calls.length > 0) {
        for (const call of calls) {
          const apiResult = await handleToolCall({ name: call.name, args: call.args, id: 'text_chat' });

          const result2 = await chat.sendMessage([{
            functionResponse: {
              name: call.name,
              response: { result: apiResult }
            }
          }]);
          responseText = result2.response.text();
        }
      } else {
        responseText = result.response.text();
      }

      // Tarixçəni yenilə
      chatHistoryRef.current = await chat.getHistory();

      setTranscriptions(prev => [...prev, { speaker: Speaker.Agent, text: responseText, timestamp: Date.now() }]);
      ChatService.saveMessage(sessionId, Speaker.Agent, responseText);
    } catch (err) {
      console.error(err);
      const errorMessage = "Bağışlayın, hazırda sistemdə texniki problem var. Zəhmət olmasa bir az sonra cəhd edin.";
      setError(errorMessage);
      setTranscriptions(prev => [...prev, { speaker: Speaker.Agent, text: errorMessage, timestamp: Date.now() }]);
    } finally { setIsTyping(false); }
  };


  useEffect(() => {
    if (isOpen) {
      if (mode === 'voice' && !isConnected) startVoiceSession();
    }
    return () => { if (!isOpen && isConnected) { sessionRef.current?.close(); cleanupAudio(); } };
  }, [isOpen, mode]);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [transcriptions, isAgentSpeaking, isTyping]);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-[100] w-full sm:w-[420px] h-[100dvh] sm:h-[min(740px,85vh)] flex flex-col bg-white border border-gray-100 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.15)] sm:rounded-[2.5rem] overflow-hidden animate-in slide-in-from-bottom-5 duration-500">

      {/* HEADER - Görüntüyə uyğun dizayn */}
      <div className="p-6 pb-4 bg-white flex flex-col gap-5 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center relative">
              <Sparkles className="w-6 h-6 text-emerald-500" />
              <div className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${isConnected ? 'bg-emerald-400' : 'bg-slate-300'}`} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#1e1b4b] uppercase tracking-wide leading-tight">CELESTIA</h3>
              <p className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider">SƏSLİ OPERATOR</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-slate-50 rounded-xl transition-all text-slate-300 hover:text-slate-600">
            <ChevronDown className="w-7 h-7" />
          </button>
        </div>

        {/* TOGGLE SWITCH - Pill dizaynı */}
        <div className="flex bg-[#F1F5F9] p-1.5 rounded-2xl">
          <button
            onClick={() => setMode('voice')}
            className={`flex-1 flex items-center justify-center gap-2.5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all ${mode === 'voice' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
          >
            <Headset size={16} /> SƏSLİ
          </button>
          <button
            onClick={() => setMode('text')}
            className={`flex-1 flex items-center justify-center gap-2.5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all ${mode === 'text' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
          >
            <MessageSquare size={16} /> YAZILI
          </button>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto bg-white flex flex-col">
        {mode === 'voice' ? (
          <div className="flex-1 flex flex-col items-center justify-center p-10">
            <div className="relative mb-12">
              {/* Səs dalğası animasiyası - agent danışanda və ya istifadəçi danışanda aktiv olur */}
              {(isAgentSpeaking || isConnected) && (
                <div className="absolute inset-0 -m-8">
                  <div className={`w-full h-full rounded-full border-[3px] border-emerald-500/20 animate-ping duration-1000`}></div>
                </div>
              )}
              <button
                onClick={isConnected ? () => sessionRef.current?.close() : startVoiceSession}
                className={`w-28 h-28 rounded-full flex items-center justify-center transition-all shadow-2xl active:scale-90 relative z-10 ${isConnected ? 'bg-rose-500 text-white shadow-rose-500/20' : 'bg-emerald-500 text-white shadow-emerald-500/20'
                  }`}
              >
                {isConnecting ? <Loader2 className="w-10 h-10 animate-spin" /> : isConnected ? <MicOff className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
              </button>
            </div>
            <p className="text-sm font-bold text-[#1e1b4b]/60 uppercase tracking-[0.2em]">
              {isConnecting ? 'QOŞULUR...' : isConnected ? 'SİZİ EŞİDİRİK' : 'DANIŞMAQ ÜÇÜN BASIN'}
            </p>
            {error && <p className="mt-8 px-6 py-3 bg-rose-50 text-rose-500 rounded-2xl text-[11px] font-bold flex items-center gap-2 border border-rose-100"><AlertCircle size={14} /> {error}</p>}
          </div>
        ) : (
          <div className="p-8 space-y-8 flex-1">
            {transcriptions.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-20">
                <MessageSquare size={40} className="mb-4 text-slate-300" />
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Sizə necə kömək edə bilərəm?</p>
              </div>
            )}
            {transcriptions.map((t, i) => (
              <div key={i} className={`flex flex-col ${t.speaker === Speaker.User ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2`}>
                <div className={`max-w-[85%] p-5 rounded-[2rem] text-[13px] font-bold leading-relaxed shadow-sm ${t.speaker === Speaker.User ? 'bg-slate-900 text-white rounded-tr-none' : 'bg-[#F1F5F9] text-[#1e1b4b] rounded-tl-none'
                  }`}>
                  {t.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-[#F1F5F9] px-6 py-3 rounded-full flex gap-1.5">
                  <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* FOOTER - Yalnız yazılı modda aktivdir */}
      {mode === 'text' && (
        <div className="p-8 pt-4 bg-white border-t border-slate-50 shrink-0">
          <div className="relative">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendTextMessage()}
              placeholder="Mesajınızı yazın..."
              className="w-full bg-[#F8FAFC] border border-slate-100 rounded-2xl py-5 pl-6 pr-16 text-sm font-bold outline-none focus:bg-white focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 transition-all"
            />
            <button
              onClick={handleSendTextMessage}
              disabled={!inputText.trim() || isTyping}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-11 h-11 bg-emerald-500 text-white rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}

      {/* ACTION STATUS INDICATOR */}
      {/* ACTION STATUS INDICATOR - Pəncərənin içində, footer-in üstündə */}
      {lastAction && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-[110] bg-white/90 backdrop-blur px-5 py-2.5 rounded-full shadow-lg border border-emerald-100 flex items-center gap-2.5 animate-in slide-in-from-bottom-2 fade-in duration-300">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-[9px] font-black uppercase tracking-widest text-emerald-800">{lastAction}</span>
        </div>
      )}
    </div>
  );
};

export default LiveVoiceSession;
