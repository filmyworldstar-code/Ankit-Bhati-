
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { User } from '../types';

interface VideoStudioProps {
  user: User;
}

interface Generation {
  id: string;
  prompt: string;
  status: 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  timestamp: number;
}

const VideoStudio: React.FC<VideoStudioProps> = ({ user }) => {
  const [prompt, setPrompt] = useState('');
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio?.hasSelectedApiKey) {
        const has = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(has);
      }
    };
    checkKey();
    
    // Load local history
    const saved = localStorage.getItem(`video_gen_${user.id}`);
    if (saved) setGenerations(JSON.parse(saved));
  }, [user.id]);

  const saveGenerations = (newGens: Generation[]) => {
    setGenerations(newGens);
    localStorage.setItem(`video_gen_${user.id}`, JSON.stringify(newGens));
  };

  const handleOpenKeySelector = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      // Guidelines: "Assume the key selection was successful after triggering openSelectKey()"
      setHasApiKey(true);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    
    setIsGenerating(true);
    const genId = crypto.randomUUID();
    const newGen: Generation = {
      id: genId,
      prompt: prompt,
      status: 'processing',
      timestamp: Date.now()
    };

    saveGenerations([newGen, ...generations]);
    setPrompt('');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '16:9'
        }
      });

      // Poll for operation status
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const blob = await response.blob();
        const videoUrl = URL.createObjectURL(blob);
        
        setGenerations(prev => prev.map(g => 
          g.id === genId ? { ...g, status: 'completed', videoUrl } : g
        ));
      } else {
        throw new Error("No video link returned");
      }

    } catch (err: any) {
      console.error("Video Generation Error:", err);
      if (err.message?.includes("Requested entity was not found")) {
        setHasApiKey(false);
        alert("API Key expired ya invalid hai. Please select again.");
      }
      setGenerations(prev => prev.map(g => 
        g.id === genId ? { ...g, status: 'failed' } : g
      ));
    } finally {
      setIsGenerating(false);
    }
  };

  const deleteGeneration = (id: string) => {
    saveGenerations(generations.filter(g => g.id !== id));
  };

  if (!hasApiKey) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-10 text-center space-y-8 bg-white rounded-[40px] border border-slate-100 shadow-sm">
        <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-[32px] flex items-center justify-center shadow-inner">
          <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="max-w-md">
          <h2 className="text-3xl font-black text-slate-900 mb-4">AI Marketing Studio</h2>
          <p className="text-slate-500 font-medium mb-8">
            Veo AI models ka use karke apne business ke liye high-quality short videos banayein. Iske liye aapko apna **Paid API Key** select karna hoga.
          </p>
          <a 
            href="https://ai.google.dev/gemini-api/docs/billing" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-xs font-bold text-indigo-600 uppercase tracking-widest hover:underline block mb-6"
          >
            Billing Documentation Padhein
          </a>
          <button 
            onClick={handleOpenKeySelector}
            className="px-10 py-5 bg-indigo-600 text-white rounded-3xl font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all transform active:scale-95"
          >
            Select Paid API Key
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-8 animate-in fade-in duration-500">
      {/* Header & Prompt Section */}
      <div className="bg-white p-8 md:p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-8">
        <div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">Create Marketing Magic ✨</h2>
          <p className="text-sm text-slate-500 font-medium italic">Describe the scene, AI will animate it for your business.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative group">
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. A professional networking event where people are shaking hands and smiling, cinematic lighting, 4k..."
              className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[32px] outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-200 transition-all font-medium text-sm resize-none min-h-[120px]"
            />
          </div>
          <button 
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="md:w-48 bg-indigo-600 text-white rounded-[32px] font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center justify-center gap-2 py-8"
          >
            {isGenerating ? (
              <>
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs">Dreaming...</span>
              </>
            ) : (
              <>
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Generate</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="flex-1 space-y-6">
        <h3 className="text-lg font-black text-slate-800 px-2 flex items-center gap-2">
          Your Studio Gallery
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">{generations.length} Clips</span>
        </h3>
        
        {generations.length === 0 ? (
          <div className="py-24 bg-white rounded-[40px] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-300 text-center px-10">
            <svg className="h-20 w-20 opacity-20 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
            </svg>
            <p className="font-bold text-lg">Empty Studio.</p>
            <p className="text-sm">Prompt likhein aur "Generate" par click karein to start.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
            {generations.map(gen => (
              <div key={gen.id} className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden group hover:shadow-xl hover:shadow-indigo-50/50 transition-all flex flex-col">
                <div className="aspect-video bg-slate-900 relative">
                  {gen.status === 'processing' ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-indigo-400 space-y-4">
                      <div className="relative">
                        <div className="w-16 h-16 border-4 border-indigo-500/30 rounded-full"></div>
                        <div className="absolute inset-0 w-16 h-16 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">Rendering Clip...</p>
                    </div>
                  ) : gen.status === 'completed' ? (
                    <video 
                      src={gen.videoUrl} 
                      controls 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-red-400 p-10 text-center space-y-2">
                      <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-xs font-black uppercase">Generation Failed</p>
                      <p className="text-[10px] opacity-60">Check billing or prompt content rules.</p>
                    </div>
                  )}
                </div>
                
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-xs text-slate-500 font-medium italic line-clamp-2 mb-4">"{gen.prompt}"</p>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {new Date(gen.timestamp).toLocaleDateString()}
                    </span>
                    <button 
                      onClick={() => deleteGeneration(gen.id)}
                      className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoStudio;
