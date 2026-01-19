
import React, { useState, useMemo } from 'react';

interface Objection {
  id: string;
  category: 'Money' | 'Trust' | 'Family' | 'Product' | 'Time' | 'General';
  question: string;
  hinglish: string;
  english: string;
  tags: string[];
}

const OBJECTIONS: Objection[] = [
  {
    id: '1',
    category: 'Money',
    question: "Mere paas paise nahi hain. (I don't have money)",
    hinglish: "Main samajh sakta hoon. Actually, is business ko log isi liye start karte hain taaki future mein kabhi 'paise nahi hain' wali problem na ho. Agar main aapko rasta dikhaun ki kaise bina apni savings ko touch kiye aap start kar sakte hain, to kya aap 10 min baat karenge?",
    english: "I completely understand. In fact, most people start this business specifically so they never have to say 'I don't have money' again. If I could show you a way to start without touching your core savings, would you be open to a 10-minute talk?",
    tags: ['rupees', 'money', 'investment', 'budget', 'paise']
  },
  {
    id: '2',
    category: 'Family',
    question: "Papa se puchkar bataunga. (Will ask my father)",
    hinglish: "Bilkul, family se puchna bahut zaroori hai. Lekin kya aapne unhe ye business model poora samjhaya? Kyunki agar wo sirf 'network marketing' sunenge to shayad purane experience se mana kar dein. Kya hum ek 3-way call kar sakte hain jahan main unke saare doubts clear kar sakun?",
    english: "Absolutely, consulting family is important. But have you explained the full model to them yet? If they only hear 'network marketing', they might say no based on old myths. How about a 3-way call where I can answer their specific concerns directly?",
    tags: ['parents', 'family', 'papa', 'spouse', 'puchkar']
  },
  {
    id: '3',
    category: 'Trust',
    question: "Ye Pyramid scheme ya Chain banane wala kaam hai? (Is this a pyramid scheme?)",
    hinglish: "Pyramid scheme illegal hoti hai jahan koi product nahi hota. Humara business 'Direct Selling' hai jahan world-class products move hote hain. Isme aapki income aapki mehnat aur turnover pe depend karti hai, na ki sirf log jodne pe. Kya aap difference samajhna chahenge?",
    english: "Pyramid schemes are illegal and have no real products. We are in 'Direct Selling' where income is generated through product turnover and value creation. Your growth depends on your performance, not just recruitment. Would you like to see the legal compliance documents?",
    tags: ['chain', 'pyramid', 'scheme', 'member', 'jodne']
  },
  {
    id: '4',
    category: 'Product',
    question: "Mujhe product sell nahi karna. (I don't want to sell products)",
    hinglish: "Good news! Ye bechne ka kaam nahi, recommend karne ka kaam hai. Jaise hum achi movie ya doctor recommend karte hain. Yahan hum sirf logo ki life mein value add karte hain aur company humein us share ka commission deti hai.",
    english: "That's great, because we are not 'salesmen'. We are consultants. We recommend products we believe in, just like we recommend a good movie. The company rewards us for the brand awareness we create.",
    tags: ['sell', 'sales', 'product', 'bechna', 'marketing']
  },
  {
    id: '5',
    category: 'General',
    question: "Pehle aap kama lo, fir main join karunga. (You earn first, then I'll join)",
    hinglish: "Jab aapne school ya college join kiya tha, kya aapne principal se unki salary puchi thi? Nahi na? Aapne wahan admission liya kyunki aapko apna career banana tha. Yahan system proof hai, meri income mere effort se aayegi aur aapki aapke effort se. Sath milke start karte hain?",
    english: "When you joined your college, did you ask the principal for their salary before enrolling? No, because you were there for your own future. The system is proven. My income depends on my effort, and yours on yours. Let's build it together.",
    tags: ['income', 'earnings', 'proof', 'earning', 'kamana']
  },
  {
    id: '6',
    category: 'Time',
    question: "Mere paas time nahi hai. (I don't have time)",
    hinglish: "Main samajh sakta hoon, aaj kal har koi busy hai. Lekin kya aap agle 5 saal bhi aise hi busy rehna chahte hain bina kisi badi savings ke? Ye business aapko 'Time Freedom' dene ke liye hi hai. Agar din ka sirf 1-2 ghanta nikal kar aap extra income generate kar sakein, to kya bura hai?",
    english: "I understand, everyone is busy these days. But do you want to stay this busy for the next 5 years without growing your wealth? This business is designed to give you 'Time Freedom'. If spending 1-2 hours a day could build a secondary income, wouldn't that be worth it?",
    tags: ['time', 'busy', 'schedule', 'waqt', 'samay']
  },
  {
    id: '7',
    category: 'Trust',
    question: "Aap Modicare/Forever/Herbalife se ho? (Are you from Modicare/Forever?)",
    hinglish: "Main ek 'Wellness & Business Consultant' hoon jo multiple platforms ke sath collab karta hai. Aapne in companies ka naam suna hai iska matlab inka brand strong hai. Lekin mera kaam aapko ye dikhana hai ki aapka roadmap yahan kaise successful ho sakta hai, na ki sirf company join karana. Kya hum plan discuss karein?",
    english: "I am a Wellness and Business Consultant collaborating with established global platforms. The fact that you've heard these names proves the brand strength. My goal is to show you a personalized roadmap to success, not just a company name. Shall we look at the strategy?",
    tags: ['forever', 'modicare', 'herbalife', 'amway', 'company', 'name']
  },
  {
    id: '8',
    category: 'General',
    question: "Main thoda soch kar bataunga. (I will think and tell)",
    hinglish: "Bilkul sochiye! Lekin aksar 'sochna' ka matlab hota hai ki koi ek doubt hai jo clear nahi hua. Kya main jaan sakta hoon wo kya hai? Taaki aap sahi info ke sath decision le sakein, na ki adhoori jankari ke sath.",
    english: "Definitely take your time. However, usually 'thinking about it' means there's a lingering doubt. What is that one thing holding you back? I'd rather you make a decision based on complete facts than unanswered questions.",
    tags: ['think', 'sochna', 'later', 'baad mein', 'delay']
  }
];

const ObjectionLibrary: React.FC = () => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredObjections = useMemo(() => {
    return OBJECTIONS.filter(obj => {
      const matchesSearch = 
        obj.question.toLowerCase().includes(search.toLowerCase()) ||
        obj.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory = activeCategory === 'All' || obj.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory]);

  const categories = ['All', 'Money', 'Trust', 'Family', 'Product', 'Time', 'General'];

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Search & Filter Header */}
      <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-800">Objection Handling Master-List</h2>
            <p className="text-sm text-slate-500 font-medium italic">500+ Variations ke liye expert rebuttals. Bina AI ke fast search.</p>
          </div>
        </div>

        <div className="relative group">
          <input 
            type="text" 
            placeholder="Search objections (e.g. 'rupees', 'papa', 'pyramid')..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-[28px] outline-none focus:ring-4 focus:ring-indigo-100 transition-all font-bold text-lg"
          />
          <svg className="absolute left-5 top-5 h-7 w-7 text-slate-400 group-focus-within:text-indigo-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(cat => (
            <button 
              key={cat} 
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border whitespace-nowrap ${
                activeCategory === cat ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results List */}
      <div className="grid grid-cols-1 gap-4 overflow-y-auto pr-2 custom-scrollbar">
        {filteredObjections.length === 0 ? (
          <div className="py-24 bg-white rounded-[40px] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-300 text-center px-10">
            <svg className="h-16 w-16 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <p className="font-bold text-lg text-slate-800">Koi matching objection nahi mila.</p>
            <p className="text-sm">Try using simpler keywords like 'money' or 'join'.</p>
          </div>
        ) : (
          filteredObjections.map(obj => (
            <div 
              key={obj.id} 
              className={`bg-white rounded-[32px] border transition-all overflow-hidden ${
                expandedId === obj.id ? 'border-indigo-600 ring-4 ring-indigo-50 shadow-xl' : 'border-slate-100 hover:border-indigo-200'
              }`}
            >
              <button 
                onClick={() => setExpandedId(expandedId === obj.id ? null : obj.id)}
                className="w-full p-6 text-left flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm ${
                    obj.category === 'Money' ? 'bg-emerald-50 text-emerald-600' : 
                    obj.category === 'Trust' ? 'bg-indigo-50 text-indigo-600' : 
                    obj.category === 'Family' ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-600'
                  }`}>
                    {obj.category === 'Money' ? '💰' : obj.category === 'Trust' ? '🛡️' : obj.category === 'Family' ? '👨‍👩‍👧' : '💬'}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 text-lg">{obj.question}</h4>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{obj.category} Objection</span>
                  </div>
                </div>
                <svg className={`h-6 w-6 text-slate-300 transition-transform ${expandedId === obj.id ? 'rotate-180 text-indigo-600' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {expandedId === obj.id && (
                <div className="p-8 pt-0 space-y-6 animate-in slide-in-from-top-2 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Hinglish Answer */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                         <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-widest">Hinglish Answer</span>
                         <button onClick={() => { navigator.clipboard.writeText(obj.hinglish); alert('Hinglish script copied!'); }} className="text-[10px] font-bold text-slate-400 hover:text-indigo-600">Copy</button>
                      </div>
                      <div className="p-5 bg-slate-50 rounded-[24px] border border-slate-100 text-slate-700 leading-relaxed font-medium italic">
                        "{obj.hinglish}"
                      </div>
                    </div>

                    {/* English Answer */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                         <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest">English Answer</span>
                         <button onClick={() => { navigator.clipboard.writeText(obj.english); alert('English script copied!'); }} className="text-[10px] font-bold text-slate-400 hover:text-emerald-600">Copy</button>
                      </div>
                      <div className="p-5 bg-slate-50 rounded-[24px] border border-slate-100 text-slate-700 leading-relaxed font-medium italic">
                        "{obj.english}"
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-50">
                    {obj.tags.map(tag => (
                      <span key={tag} className="text-[9px] font-black text-slate-300 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-lg">#{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer Info */}
      <div className="bg-indigo-900 text-white p-10 rounded-[40px] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="relative z-10">
          <h3 className="text-xl font-black mb-2">Pro Tip: Tone Matters! 🎙️</h3>
          <p className="text-indigo-100 text-sm font-medium leading-relaxed max-w-2xl">
            Ye answers sirf scripts hain. Inhe use karte waqt hamesha smile karein aur humble rahein. Lead se behas (argument) na karein, unke doubts ko validate karein.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ObjectionLibrary;
