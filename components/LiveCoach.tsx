
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';

const FRAME_RATE = 5; // Low frame rate for efficiency
const JPEG_QUALITY = 0.4;

const LiveCoach: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'active'>('idle');
  const [error, setError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const frameIntervalRef = useRef<number | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Helper: Decode base64 (Manual implementation per guidelines)
  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  // Helper: Encode to base64 (Manual implementation per guidelines)
  const encode = (bytes: Uint8Array) => {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  // Helper: Decode Audio Data
  async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  }

  const startSession = async () => {
    try {
      setStatus('connecting');
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = inputCtx;
      outputAudioContextRef.current = outputCtx;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setStatus('active');
            setIsActive(true);

            // 1. Setup Audio Streaming
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
              
              const pcmBlob: Blob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              
              sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);

            // 2. Setup Video Streaming
            const canvas = canvasRef.current;
            const video = videoRef.current;
            if (canvas && video) {
              const ctx = canvas.getContext('2d');
              frameIntervalRef.current = window.setInterval(() => {
                canvas.width = 320; // Lower res for latency
                canvas.height = 240;
                ctx?.drawImage(video, 0, 0, 320, 240);
                canvas.toBlob(async (blob) => {
                  if (blob) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      const result = reader.result as string;
                      if (result) {
                        const base64Data = result.split(',')[1];
                        sessionPromise.then(s => s.sendRealtimeInput({
                          media: { data: base64Data, mimeType: 'image/jpeg' }
                        }));
                      }
                    };
                    reader.readAsDataURL(blob);
                  }
                }, 'image/jpeg', JPEG_QUALITY);
              }, 1000 / FRAME_RATE);
            }
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), outputCtx, 24000, 1);
              const source = outputCtx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputCtx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error("Live Error:", e);
            setError("Connection galti hui. Kripya restart karein.");
            stopSession();
          },
          onclose: () => stopSession()
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } }
          },
          systemInstruction: 'You are an Elite Sales Coach. The user is practicing objection handling. Play the role of a lead who is skeptical, or provide immediate verbal feedback on their tone and choice of words. Talk like a real person in Hindi/English mix.'
        }
      });
      sessionRef.current = await sessionPromise;

    } catch (err: any) {
      setError("Camera/Mic access denied or connection failed.");
      setStatus('idle');
    }
  };

  const stopSession = () => {
    if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
    if (audioContextRef.current) audioContextRef.current.close();
    if (outputAudioContextRef.current) outputAudioContextRef.current.close();
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    }
    setIsActive(false);
    setStatus('idle');
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-black text-slate-800">Live Objection Coach 🎥</h2>
          <p className="text-sm text-slate-500 font-medium">Talk to AI in real-time to practice closing leads. Roleplay start karein!</p>
        </div>
        <button 
          onClick={isActive ? stopSession : startSession}
          disabled={status === 'connecting'}
          className={`px-10 py-5 rounded-[24px] font-black text-lg shadow-xl transition-all transform active:scale-95 flex items-center gap-3 ${
            isActive ? 'bg-red-500 text-white shadow-red-100 hover:bg-red-600' : 'bg-indigo-600 text-white shadow-indigo-100 hover:bg-indigo-700'
          }`}
        >
          {status === 'connecting' ? (
            <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : isActive ? (
            <>
              <span className="w-3 h-3 bg-white rounded-full animate-pulse"></span>
              End Session
            </>
          ) : (
            <>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/></svg>
              Start Live Roleplay
            </>
          )}
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 min-h-0 pb-10">
        {/* User View */}
        <div className="bg-slate-900 rounded-[40px] relative overflow-hidden flex items-center justify-center border-4 border-white shadow-2xl">
          <video 
            ref={videoRef} 
            autoPlay 
            muted 
            playsInline 
            className={`w-full h-full object-cover transition-opacity duration-1000 ${isActive ? 'opacity-100' : 'opacity-20'}`}
          />
          {!isActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white/40 text-center p-10">
              <svg className="h-20 w-20 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              <p className="font-bold">Camera Preview Off</p>
              <p className="text-xs">Click 'Start' to begin the roleplay.</p>
            </div>
          )}
          {isActive && (
            <div className="absolute top-6 left-6 flex items-center gap-2 bg-red-600 px-3 py-1.5 rounded-full text-white text-[10px] font-black uppercase tracking-widest animate-pulse">
              Live Roleplay Active
            </div>
          )}
        </div>

        {/* AI View / Waveform */}
        <div className="bg-indigo-600 rounded-[40px] relative overflow-hidden flex flex-col items-center justify-center text-center p-10 shadow-2xl">
          <div className={`w-32 h-32 bg-white/10 rounded-full flex items-center justify-center mb-8 relative ${isActive ? 'animate-pulse' : ''}`}>
             <div className="absolute inset-0 bg-white/20 rounded-full animate-ping opacity-20"></div>
             <svg className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
          </div>
          <h3 className="text-white text-2xl font-black mb-4">Elite Sales Coach</h3>
          <p className="text-indigo-100 text-sm font-medium leading-relaxed max-w-xs">
            {isActive 
              ? "Main sun raha hoon. Apne lead ka objection boliye ya roleplay start karein..." 
              : "AI Coach is waiting. Ready to sharpen your sales skills?"}
          </p>
          
          {error && (
            <div className="mt-8 bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl text-white text-xs font-bold border border-white/20">
              {error}
            </div>
          )}
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default LiveCoach;
