import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Loader2, ChevronDown, Volume2, Sparkles, Mic, MicOff, AlertCircle,
  Headset, Keyboard, Send
} from 'lucide-react';
import { NATURAL_OPERATOR_INSTRUCTION, APP_CONFIG } from '../constants';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Speaker, TranscriptionEntry } from '../types';
import { ChatService, ChatMessage } from '../services/chatService';
import { BRAND_CONFIG } from '../brandConfig';
import { AudioUtils } from '../utils/audioUtils';

const SESSION_STORAGE_KEY = 'stom_ai_session_id';

interface Props {
  onAppointmentBooked: (data: any) => void;
  isOpen: boolean;
  onClose: () => void;
}

const LiveVoiceSession: React.FC<Props> = ({ onAppointmentBooked, isOpen, onClose }) => {
  const [mode, setMode] = useState<'text' | 'voice'>('text'); // Default to text mode
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcriptions, setTranscriptions] = useState<TranscriptionEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(() => {
    // Load session from localStorage on mount
    return localStorage.getItem(SESSION_STORAGE_KEY);
  });
  const [isMobile, setIsMobile] = useState(false);
  const [firebaseMessages, setFirebaseMessages] = useState<ChatMessage[]>([]);

  // Text mode states
  const [textInput, setTextInput] = useState('');
  const [textMessages, setTextMessages] = useState<{ role: 'user' | 'assistant', text: string, isLocal?: boolean }[]>([]);
  const [isTextLoading, setIsTextLoading] = useState(false);

  // Refs
  const scrollRef = useRef<HTMLDivElement>(null);
  const websocketRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const audioQueueRef = useRef<Int16Array[]>([]);
  const isPlayingRef = useRef(false);
  const nextPlayTimeRef = useRef(0);
  const isComponentMounted = useRef(true);
  const currentExchanceRef = useRef({ agentText: "" });
  const recognitionRef = useRef<any>(null); // For Web Speech API

  // 1. Lifecycle & Mobile Check
  // 1. Lifecycle & Mobile Check
  // 1. Lifecycle & Mobile Check
  useEffect(() => {
    isComponentMounted.current = true;

    // Cleanup if closed
    if (!isOpen) {
      if (isConnected) {
        disconnectSession();
      }
      // Don't clear sessionId - keep it for next time
    }

    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      isComponentMounted.current = false;
      window.removeEventListener('resize', checkMobile);
      disconnectSession();
    };
  }, [isOpen]); // Re-run when isOpen changes

  // Subscribe to Firebase messages when session exists
  useEffect(() => {
    if (!sessionId) return;

    const unsubscribe = ChatService.subscribeToSessionMessages(sessionId, (messages) => {
      setFirebaseMessages(messages);
    });

    return () => {
      unsubscribe();
    };
  }, [sessionId]);

  // 2. Audio Playback Engine
  const playNextAudioChunk = useCallback(() => {
    if (!audioContextRef.current || audioQueueRef.current.length === 0) {
      isPlayingRef.current = false;
      setIsSpeaking(false);
      return;
    }

    isPlayingRef.current = true;
    setIsSpeaking(true);

    const ctx = audioContextRef.current;
    const chunk = audioQueueRef.current.shift()!;

    // Create audio buffer (1 channel, length, 24kHz usually for Gemini output)
    // Gemini output is usually 24kHz
    const audioBuffer = ctx.createBuffer(1, chunk.length, 24000);
    const channelData = audioBuffer.getChannelData(0);

    // Int16 -> Float32
    for (let i = 0; i < chunk.length; i++) {
      channelData[i] = chunk[i] / 32768.0;
    }

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);

    // Schedule playback for seamless audio
    const now = ctx.currentTime;
    // ensure we don't schedule in the past
    if (nextPlayTimeRef.current < now) {
      nextPlayTimeRef.current = now;
    }

    source.start(nextPlayTimeRef.current);
    nextPlayTimeRef.current += audioBuffer.duration;

    source.onended = () => {
      // If queue is empty, we stopped speaking
      if (audioQueueRef.current.length === 0) {
        // small delay to ensure UI doesn't flicker too much
        setTimeout(() => {
          if (audioQueueRef.current.length === 0) setIsSpeaking(false);
        }, 100);
      }
    };

    // Process next chunk roughly when this one finishes (or just loop)
    // Actually we can just loop immediately because we schedule based on time
    playNextAudioChunk();

  }, []);

  const queueAudioForPlayback = useCallback((base64Audio: string) => {
    try {
      const buffer = AudioUtils.base64ToArrayBuffer(base64Audio);
      const int16 = new Int16Array(buffer);
      audioQueueRef.current.push(int16);

      // Buffer approach: Wait for at least 3 chunks before starting/resuming
      // This adds slight latency but prevents choppy audio/silence gaps
      if (!isPlayingRef.current && audioQueueRef.current.length >= 3) {
        playNextAudioChunk();
      }
    } catch (e) {
      console.error('Error processing receiving audio:', e);
    }
  }, [playNextAudioChunk]);

  // Helper: Ensure session exists or create one
  const ensureSession = async (): Promise<string | null> => {
    if (sessionId) return sessionId;

    // Check localStorage first
    const storedSessionId = localStorage.getItem(SESSION_STORAGE_KEY);
    if (storedSessionId) {
      if (isComponentMounted.current) setSessionId(storedSessionId);
      return storedSessionId;
    }

    // Create new session
    try {
      const id = await ChatService.createSession();
      if (isComponentMounted.current) {
        setSessionId(id);
        localStorage.setItem(SESSION_STORAGE_KEY, id);
      }
      return id;
    } catch (e) {
      console.error("Failed to create session lazily", e);
      return null;
    }
  };

  // 3. Tool Handling
  const handleToolCall = async (call: any) => {
    console.log('🔧 Tool called locally:', call);
    const functionInfo = call.functionCalls[0];
    const { name, args } = functionInfo;
    const callId = functionInfo.id; // Needed for response

    // Ensure session exists regarding tool actions (e.g. status updates)
    const currentSessionId = await ensureSession();

    // Notify UI
    if (currentSessionId && args?.patientName) {
      ChatService.updateSessionName(currentSessionId, args.patientName);
    }

    // Handle transfer_to_doctor
    if (name === 'transfer_to_doctor') {
      if (currentSessionId) {
        await ChatService.updateSessionStatus(currentSessionId, 'waiting_for_doctor');
        // Send confirmation back to Gemini
        const toolResponse = {
          tool_response: {
            function_responses: [{
              response: { result: { success: true, message: "Həkim tərəfindən cavablanacaq..." } },
              id: callId
            }]
          }
        };
        if (websocketRef.current?.readyState === WebSocket.OPEN) {
          websocketRef.current.send(JSON.stringify(toolResponse));
        }
      }
      return;
    }

    // Execute other tools (check/book)
    try {
      // 1. Immediately update UI/DB for booking, regardless of webhook success
      if (name === 'book_appointment') {
        onAppointmentBooked(args);
      }

      // 2. Call Webhook (Fire & Forget or non-blocking for booking)
      const webhookPromise = fetch(APP_CONFIG.N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: name === 'check_calendar_availability' ? 'check' : 'book',
          ...args
        })
      });

      // For availability check, we MUST wait for the result
      let result = { success: true };
      if (name === 'check_calendar_availability') {
        const response = await webhookPromise;
        result = await response.json();
      } else {
        // For booking, we just log the webhook result but don't block the UI confirmation
        webhookPromise.catch(e => console.error("Webhook failed:", e));
      }

      // Send response back to Gemini
      const toolResponse = {
        tool_response: {
          function_responses: [{
            response: { result: result },
            id: callId
          }]
        }
      };

      if (websocketRef.current?.readyState === WebSocket.OPEN) {
        websocketRef.current.send(JSON.stringify(toolResponse));
      }

    } catch (e) {
      console.error('Tool execution error', e);
      // Even if everything fails, tell Gemini it worked so it continues the convo
      const toolResponse = {
        tool_response: {
          function_responses: [{
            response: { result: { error: "Internal processing error, but booked locally." } },
            id: callId
          }]
        }
      };
      if (websocketRef.current?.readyState === WebSocket.OPEN) {
        websocketRef.current.send(JSON.stringify(toolResponse));
      }
    }
  };

  // 2. Connection Handling
  useEffect(() => {
    if (isConnected) {
      // Agent is connected, trigger initial greeting
      const sayHello = async () => {
        // Perform a small delay to ensure audio is ready
        await new Promise(r => setTimeout(r, 1000));
        if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
          const msg = {
            client_content: {
              turns: [{
                role: "user",
                parts: [{ text: "Salam de." }]
              }],
              turn_complete: true
            }
          };
          websocketRef.current.send(JSON.stringify(msg));
        }
      };
      sayHello();
    }
  }, [isConnected]);

  const sendTextMessage = async () => {
    if (!textInput.trim() || isTextLoading) return;

    const userMessage = textInput.trim();
    setTextInput('');
    setTextMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsTextLoading(true);
    setError(null);

    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction: `Siz "${BRAND_CONFIG.name}" premium stomatologiya klinikasının peşəkar operatorusunuz. 
Adınız Stom AI-dır.
Sizin ana diliniz Azərbaycan dilidir. Çox səlis, təmiz və səmimi Azərbaycan dilində danışırsınız.

Vacib qaydalar:
1. Qısa və konkret cavablar verin.
2. Mehriban və peşəkar olun.
3. Müştəriyə "Siz" deyə müraciət edin.

${NATURAL_OPERATOR_INSTRUCTION}

Bugün: ${new Date().toLocaleString('az-AZ')}

MÜHÜM: Müştərinin dediklərini təkrar ETMƏYİN. Onlara CAVAB verin, kömək edin.
Məsələn, əgər "dişim ağrıyır" desələr, siz "Çox təəssüf edirəm. Dərhal randevu təyin edək" deyin.
`,
        tools: [{
          functionDeclarations: [
            {
              name: 'check_calendar_availability',
              description: 'Müştəri randevu vaxtı soruşanda istifadə edin',
              parameters: {
                type: 'OBJECT' as any,
                properties: {
                  date: { type: 'STRING' as any, description: 'YYYY-MM-DD format (e.g. 2024-01-26)' },
                  time: { type: 'STRING' as any, description: '24-hour format (e.g. 14:00)' }
                },
                required: ['date', 'time']
              }
            },
            {
              name: 'book_appointment',
              description: 'Randevu qeyd etmək üçün istifadə edin',
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
        }]
      });

      // Ensure session exists before saving messages
      const currentSessionId = await ensureSession();

      // IMMEDIATE SAVE: Save user message to DB *before* API call
      if (currentSessionId) {
        // If this is a new session, save the initial local greeting first
        if (!sessionId) {
          const greeting = textMessages.find(m => m.isLocal && m.role === 'assistant');
          if (greeting) {
            await ChatService.saveMessage(currentSessionId, Speaker.Agent, greeting.text);
          }
        }
        await ChatService.saveMessage(currentSessionId, Speaker.User, userMessage);
      }

      const chat = model.startChat({
        history: textMessages
          .filter(m => !m.isLocal) // Filter out local-only messages (like initial greeting) from API history
          .map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.text }]
          }))
      });
      const result = await chat.sendMessage(userMessage);
      const response = result.response;


      // Check for function calls in response
      const candidate = response.candidates?.[0];
      const functionCall = candidate?.content?.parts?.find((part: any) => part.functionCall)?.functionCall;

      if (functionCall) {
        const { name, args } = functionCall;

        // Update session name if booking
        if (currentSessionId && (args as any)?.patientName) {
          ChatService.updateSessionName(currentSessionId, (args as any).patientName);
        }

        // Execute tool
        // Note: For text mode, we keep this simple. Ideally unify with handleToolCall logic.
        const toolResult = await fetch(APP_CONFIG.N8N_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: name === 'check_calendar_availability' ? 'check' : 'book',
            ...args
          })
        });
        const toolResponse = await toolResult.json();

        if (name === 'book_appointment') onAppointmentBooked(args);

        // Get final response after tool execution
        const finalResult = await chat.sendMessage([{
          functionResponse: {
            name: functionCall.name,
            response: toolResponse
          }
        }]);



        const finalText = finalResult.response.text();
        setTextMessages(prev => [...prev, { role: 'assistant', text: finalText }]);

        // Save to chat service
        if (currentSessionId) {
          await ChatService.saveMessage(currentSessionId, Speaker.Agent, finalText);
        }
      } else {
        const assistantText = response.text();
        setTextMessages(prev => [...prev, { role: 'assistant', text: assistantText }]);

        // Save to chat service
        if (currentSessionId) {
          await ChatService.saveMessage(currentSessionId, Speaker.Agent, assistantText);
        }
      }
    } catch (err: any) {
      console.error('Text message error:', err);
      setError('Mesaj göndərilmədi. Yenidən cəhd edin.');
    } finally {
      setIsTextLoading(false);
    }
  };

  // 5. WebSocket Setup
  const connectSession = useCallback(async () => {
    if (isConnecting || isConnected) return;
    setIsConnecting(true);
    setError(null);

    try {
      // A. Setup Audio Context
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContext({ sampleRate: 16000 }); // Input must be 16k desireable

      // B. Get Mic Stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      audioStreamRef.current = stream;

      // C. Setup WebSocket
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      // Revert: The server rejected 'model' in URL query params
      const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${apiKey}`;

      const ws = new WebSocket(wsUrl);
      websocketRef.current = ws;

      ws.onopen = () => {
        console.log('✅ Connected to Gemini Live');
        setIsConnected(true);
        setIsConnecting(false);
        setIsListening(true); // Mic is live

        // Send Initial Setup
        const setupMessage = {
          setup: {
            model: "models/gemini-2.5-flash-native-audio-preview-12-2025",
            generation_config: {
              response_modalities: ["AUDIO"],
              speech_config: {
                voice_config: { prebuilt_voice_config: { voice_name: "Kore" } }
              }
            },
            system_instruction: {
              parts: [{
                text: `
Siz "${BRAND_CONFIG.name}" premium stomatologiya klinikasının peşəkar operatorusunuz. 
Adınız Stom AI-dır.
Sizin ana diliniz Azərbaycan dilidir. Çox səlis, təmiz və səmimi Azərbaycan dilində danışırsınız.
Aksentiniz yoxdur. Xarici vətəndaş kimi danışmayın. Yerli Bakı sakini kimi danışın.

Vacib qaydalar:
1. Qısa və konkret cavablar verin. Uzun-uzadı danışmayın.
2. Səs tonunuz mehriban, qayğıkeş və peşəkar olmalıdır. Robot kimi yox, canlı insan kimi danışın.
3. Sözləri düzgün tələffüz edin. Cümlələr arasında təbii pauzalar verin.
4. Müştəriyə "Siz" deyə müraciət edin.

${NATURAL_OPERATOR_INSTRUCTION}

Bugün: ${new Date().toLocaleString('az-AZ')}
` }]
            },
            tools: [{
              function_declarations: [
                {
                  name: 'check_calendar_availability',
                  description: 'Check availability. Use this when user asks about time.',
                  parameters: {
                    type: 'OBJECT',
                    properties: {
                      date: { type: 'STRING', description: 'YYYY-MM-DD' },
                      time: { type: 'STRING', description: 'HH:mm (24-hour)' }
                    },
                    required: ['date', 'time']
                  }
                },
                {
                  name: 'book_appointment',
                  description: 'Book an appointment.',
                  parameters: {
                    type: 'OBJECT',
                    properties: {
                      patientName: { type: 'STRING' },
                      phone: { type: 'STRING' },
                      date: { type: 'STRING' },
                      time: { type: 'STRING' },
                      reason: { type: 'STRING' }
                    },
                    required: ['patientName', 'phone', 'date', 'time']
                  }
                },
                {
                  name: 'transfer_to_doctor',
                  description: 'Transfer the conversation to a human doctor when patient requests to speak with doctor.',
                  parameters: {
                    type: 'OBJECT',
                    properties: {},
                    required: []
                  }
                }
              ]
            }]
          }
        };
        ws.send(JSON.stringify(setupMessage));

        // Start Audio Recorder
        startAudioRecorder(stream, ws);
      };

      ws.onmessage = async (event) => {
        let data;
        if (event.data instanceof Blob) {
          data = JSON.parse(await event.data.text());
        } else {
          data = JSON.parse(event.data);
        }

        // 1. Audio Server -> Client
        if (data.serverContent?.modelTurn?.parts?.[0]?.inlineData) {
          const base64Audio = data.serverContent.modelTurn.parts[0].inlineData.data;
          queueAudioForPlayback(base64Audio);
        }

        // 1.5. Text Server -> Client (Agent Transcript)
        if (data.serverContent?.modelTurn?.parts?.[0]?.text) {
          const text = data.serverContent.modelTurn.parts[0].text;
          // Regex to identify internal thoughts (starts with ** or contains typical headers)
          const isInternalThought = /^\s*\*\*/.test(text) ||
            /^\s*Crafting/i.test(text) ||
            /^\s*Thinking/i.test(text) ||
            /Defining the Stom AI persona/i.test(text);

          if (!isInternalThought) {
            const sid = await ensureSession();
            if (sid) {
              await ChatService.saveMessage(sid, Speaker.Agent, text);
            }
          } else {
            console.log("🚫 Filtered internal thought:", text);
          }
        }

        // 2. Transcript User/Model (Just for UI)
        if (data.serverContent?.turnComplete) {
          // End of turn
        }

        // 3. Tool Call
        if (data.toolCall) {
          handleToolCall(data.toolCall);
        }
      };

      ws.onerror = (e) => {
        console.error('WebSocket Error:', e);
        setError('Bağlantı xətası');
        disconnectSession();
      };

      ws.onclose = (event) => {
        console.log('🔌 WebSocket Closed. Code:', event.code, 'Reason:', event.reason);
        if (event.code === 1006) {
          console.error('❌ Connection closed abnormally (1006). Usually API Key or Network issue.');
        } else if (event.code >= 4000) {
          console.error('❌ Google Gemini Error Code:', event.code, event.reason);
        }
        disconnectSession();
      };

    } catch (err: any) {
      console.error('Connection failed:', err);
      setError(err.message || "Mikrofon xətası");
      setIsConnecting(false);
    }
  }, [isConnecting, isConnected]);

  // 5. Send Audio to Server
  const startAudioRecorder = (stream: MediaStream, ws: WebSocket) => {
    if (!audioContextRef.current) return;
    const ctx = audioContextRef.current;
    const source = ctx.createMediaStreamSource(stream);
    const processor = ctx.createScriptProcessor(4096, 1, 1);
    processorRef.current = processor;

    processor.onaudioprocess = (e) => {
      if (ws.readyState !== WebSocket.OPEN) return;

      const inputData = e.inputBuffer.getChannelData(0);

      // Downsample if needed (input usually 44.1 or 48k, model wants 16k)
      const downsampled = AudioUtils.resampleBuffer(inputData, ctx.sampleRate, 16000);
      const pcm16 = AudioUtils.floatTo16BitPCM(downsampled);
      const base64 = AudioUtils.arrayBufferToBase64(pcm16.buffer as ArrayBuffer);

      const msg = {
        realtime_input: {
          media_chunks: [{
            mime_type: "audio/pcm;rate=16000",
            data: base64
          }]
        }
      };
      ws.send(JSON.stringify(msg));
    };

    source.connect(processor);
    processor.connect(ctx.destination); // Required for script processor to run

    // Setup Speech Recognition for USER transcript
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'az-AZ';

      recognition.onresult = async (event: any) => {
        // Echo Cancellation: If agent is speaking, ignore input
        if (isSpeaking || isPlayingRef.current) {
          console.log("🔇 Agent is speaking, ignoring microphone input to prevent echo.");
          return;
        }

        const transcript = event.results[event.results.length - 1][0].transcript;
        if (transcript.trim()) {
          console.log("🎤 User said:", transcript);
          const sid = await ensureSession();
          if (sid) {
            await ChatService.saveMessage(sid, Speaker.User, transcript);
          }
        }
      };

      recognition.onerror = (e: any) => console.error("Speech recognition error", e);
      recognition.start();
      recognitionRef.current = recognition;
    }
  };

  const disconnectSession = () => {
    if (websocketRef.current) {
      websocketRef.current.close();
      websocketRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(t => t.stop());
      audioStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsConnected(false);
    setIsConnecting(false);
    setIsSpeaking(false);
    setIsListening(false);
    audioQueueRef.current = [];
    isPlayingRef.current = false;

    // Stop Speech Recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
  };

  const handleError = () => {
    // placeholder
  };

  const handleClose = () => {
    disconnectSession();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none flex items-end justify-center sm:items-end sm:justify-end sm:p-6">
      <div
        className={`pointer-events-auto flex flex-col bg-navy-900 border border-gold-500/20 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.5)] overflow-hidden font-sans relative transition-all duration-300 ${isMobile ? '' : 'rounded-[2rem]'} opacity-100 animate-in slide-in-from-bottom-10 fade-in`}
        style={{
          width: isMobile ? '100%' : '400px',
          height: isMobile ? '100dvh' : '600px'
        }}
      >
        {/* HEADER */}
        <div className="p-5 pb-4 bg-navy-950 flex flex-col gap-4 shrink-0 border-b border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-navy-800 rounded-xl flex items-center justify-center relative border border-white/5">
                <Sparkles className="w-5 h-5 text-gold-500" />
                {mode === 'voice' && (
                  <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-navy-950 ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-navy-600'}`} />
                )}
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-white uppercase tracking-tight leading-tight">Stom AI</h3>
                <p className="text-[10px] font-bold text-gold-500/80 uppercase tracking-widest">
                  {mode === 'text' ? 'Yazışma Rejimi' : 'Səsli Rejim'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Mode Toggle */}
              <div className="flex bg-navy-800 rounded-lg p-1 border border-white/5">
                <button
                  onClick={() => {
                    if (mode === 'voice' && isConnected) disconnectSession();
                    setMode('text');
                  }}
                  className={`p-2 rounded transition-all ${mode === 'text' ? 'bg-gold-500 text-navy-950' : 'text-navy-400 hover:text-white'}`}
                  title="Text Chat"
                >
                  <Keyboard className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setMode('voice')}
                  className={`p-2 rounded transition-all ${mode === 'voice' ? 'bg-gold-500 text-navy-950' : 'text-navy-400 hover:text-white'}`}
                  title="Voice Chat"
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>
              <button onClick={handleClose} className="p-2 hover:bg-navy-800 rounded-lg transition-all text-navy-400 hover:text-white">
                <ChevronDown className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* CONTENT AREA */}
        {mode === 'text' ? (
          // TEXT CHAT MODE
          <div className="flex-1 flex flex-col bg-navy-900 overflow-hidden">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {(() => {
                // Merge Firebase messages with local text messages
                const allMessages: Array<{ role: 'user' | 'assistant' | 'doctor', text: string, timestamp?: number, isLocal?: boolean }> = [];

                // Add Firebase messages
                firebaseMessages.forEach(msg => {
                  if (msg.speaker === Speaker.User) {
                    allMessages.push({ role: 'user', text: msg.text, timestamp: msg.timestamp });
                  } else if (msg.speaker === Speaker.Agent) {
                    allMessages.push({ role: 'assistant', text: msg.text, timestamp: msg.timestamp });
                  } else if (msg.speaker === Speaker.Doctor || msg.speaker === 'doctor') {
                    allMessages.push({ role: 'doctor', text: msg.text, timestamp: msg.timestamp });
                  }
                });

                // Add local messages that aren't in Firebase yet
                textMessages.forEach(msg => {
                  // Only add if not already in Firebase (check by text content)
                  const existsInFirebase = allMessages.some(fm => fm.text === msg.text);
                  if (!existsInFirebase) {
                    allMessages.push(msg);
                  }
                });

                // Sort by timestamp (Firebase messages have timestamp, local messages don't)
                allMessages.sort((a, b) => {
                  if (a.timestamp && b.timestamp) return a.timestamp - b.timestamp;
                  if (a.timestamp) return -1;
                  if (b.timestamp) return 1;
                  return 0;
                });

                if (allMessages.length === 0) {
                  return (
                    <div className="h-full flex flex-col items-center justify-center text-center px-8">
                      <Sparkles className="w-12 h-12 text-gold-500/30 mb-4" />
                      <p className="text-white/40 text-sm font-medium">Sualınızı yazın...</p>
                    </div>
                  );
                }

                return allMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : msg.role === 'doctor' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] px-4 py-3 rounded-2xl ${msg.role === 'user'
                      ? 'bg-gold-500 text-navy-950 rounded-tr-none'
                      : msg.role === 'doctor'
                        ? 'bg-blue-500 text-white rounded-tr-none'
                        : 'bg-navy-800 text-white border border-white/5 rounded-tl-none'
                      }`}>
                      {msg.role === 'doctor' && (
                        <p className="text-[10px] font-bold mb-1 opacity-70 uppercase">Həkim</p>
                      )}
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                    </div>
                  </div>
                ));
              })()}
              {isTextLoading && (
                <div className="flex justify-start">
                  <div className="bg-navy-800 px-4 py-3 rounded-2xl rounded-tl-none border border-white/5">
                    <Loader2 className="w-4 h-4 text-gold-500 animate-spin" />
                  </div>
                </div>
              )}
            </div>

            {/* Text Input */}
            <div className="p-4 bg-navy-950 border-t border-white/5">
              {error && (
                <p className="mb-3 px-3 py-2 bg-red-500/10 text-red-400 rounded-lg text-xs flex items-center gap-2 border border-red-500/20">
                  <AlertCircle size={12} /> {error}
                </p>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendTextMessage()}
                  placeholder="Mesajınızı yazın..."
                  disabled={isTextLoading}
                  className="flex-1 bg-navy-800 border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-gold-500/50 transition-all disabled:opacity-50"
                />
                <button
                  onClick={sendTextMessage}
                  disabled={!textInput.trim() || isTextLoading}
                  className="bg-gold-500 text-navy-950 p-3 rounded-xl hover:bg-gold-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          // VOICE MODE
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-navy-900 relative">
            {/* Animations */}
            <div className="relative mb-8">
              {isSpeaking && (
                <div className="absolute inset-0 -m-8">
                  <div className="w-full h-full rounded-full border-[2px] border-gold-500/30 animate-ping duration-1000"></div>
                </div>
              )}
              {isConnected && !isSpeaking && (
                <div className="absolute inset-0 -m-4">
                  <div className="w-full h-full rounded-full border border-green-500/20 animate-pulse"></div>
                </div>
              )}

              <button
                onClick={() => isConnected ? disconnectSession() : connectSession()}
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-2xl active:scale-95 relative z-10 ${isConnecting ? 'bg-gold-500/50' :
                  isConnected
                    ? (isSpeaking ? 'bg-gold-500 text-navy-950 shadow-gold-500/50' : 'bg-navy-800 border-2 border-green-500 text-green-500')
                    : 'bg-navy-800 text-navy-500 border border-white/5'
                  }`}
              >
                {isConnecting ? <Loader2 className="w-8 h-8 animate-spin text-white" /> :
                  isConnected ? (isSpeaking ? <Volume2 className="w-8 h-8" /> : <Mic className="w-8 h-8" />) :
                    <MicOff className="w-8 h-8" />}
              </button>
            </div>

            <p className="text-xs font-bold text-gold-500 uppercase tracking-[0.2em] text-center mt-4">
              {isConnecting ? 'BAĞLANIR...' :
                !isConnected ? 'BAŞLAMAQ ÜÇÜN BASIN' :
                  isSpeaking ? 'DANIŞIR...' : 'SİZİ EŞİDİRİK...'}
            </p>

            {error && (
              <p className="mt-6 px-4 py-3 bg-red-500/10 text-red-400 rounded-xl text-[10px] font-bold flex items-center gap-2 border border-red-500/20">
                <AlertCircle size={14} /> {error}
              </p>
            )}

            {/* Instructions Hint */}
            {!isConnected && !isConnecting && (
              <p className="absolute bottom-10 text-[10px] text-white/30 max-w-[200px] text-center">
                AI Səsli Asistent (Real-time)
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveVoiceSession;
