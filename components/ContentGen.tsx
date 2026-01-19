
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";

const ContentGen: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const generateContent = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate a viral social media post idea and a persuasive caption for a Network Marketer about: ${topic}. Respond in a mix of Hindi and English (Hinglish). Include emojis and hashtags.`,
        config: { temperature: 0.8 }
      });
      setResult(response.text || '');
    } catch (err) {
      alert("Error generating content. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-8">
        <div>
          <h2 className="text-3xl font-black text-slate-800 mb-2">Social Media Content AI 📱</h2>
          <p className="text-sm text-slate-500 font-medium italic">Viral post ideas aur high-converting captions generate karein MLM ke liye.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <input 
            type="text" 
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Personal growth, passive income, work from home benefits..."
            className="flex-1 p-5 bg-slate-50 border rounded-[24px] outline-none focus:ring-4 focus:ring-indigo-100 font-medium"
          />
          <button 
            onClick={generateContent}
            disabled={loading || !topic.trim()}
            className="px-10 py-5 bg-indigo-600 text-white rounded-[24px] font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Generate Magic'}
          </button>
        </div>
      </div>

      {result && (
        <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm animate-in zoom-in-95 duration-300">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-black text-slate-800 uppercase text-xs tracking-[0.2em]">Generated Strategy</h3>
            <button 
              onClick={() => { navigator.clipboard.writeText(result); alert('Copied!'); }}
              className="text-indigo-600 font-black text-[10px] uppercase hover:underline"
            >
              Copy Everything
            </button>
          </div>
          <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100 text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
            {result}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Post Hook", hint: "Attention grabbing first lines." },
          { label: "CTA Generator", hint: "Powerful closing statements." },
          { label: "Hashtag Bank", hint: "Best tags for MLM reach." }
        ].map((item, i) => (
          <button 
            key={i} 
            onClick={() => setTopic(item.label)}
            className="bg-white p-6 rounded-3xl border border-slate-100 hover:border-indigo-200 transition-all text-left group"
          >
            <p className="font-black text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">{item.label}</p>
            <p className="text-xs text-slate-400 font-medium">{item.hint}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ContentGen;
