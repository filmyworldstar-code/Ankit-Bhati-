
import React from 'react';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
  onViewPrivacy: () => void;
  onViewTerms: () => void;
  onViewContact: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ 
  onGetStarted, onLogin, onViewPrivacy, onViewTerms, onViewContact 
}) => {
  const reviews = [
    { name: "Rahul Sharma", rating: 5, comment: "Bhai, AI coach ne objection handle karna sikha diya! Closing double ho gayi." },
    { name: "Priya Verma", rating: 5, comment: "Best tool for network marketers. Sab features premium feel dete hain." },
    { name: "Vikram Singh", rating: 4, comment: "Great app! CRM feature is very helpful for follow-ups." },
    { name: "Anita Devi", rating: 5, comment: "Amazing experience. Sab kuch bahut smooth hai, training ke liye best platform hai." },
    { name: "Suresh Gupta", rating: 5, comment: "WhatsApp automation scripts are high converting. 100% Recommended." },
    { name: "Megha Rao", rating: 5, comment: "AI answers are very professional. Lead impress ho jate hain." },
    { name: "Arjun Kapoor", rating: 4, comment: "Follow-up reminders are my favorite. No more missed calls." },
    { name: "Deepak Jha", rating: 5, comment: "Systematic way to grow business. Highly recommended to my team." }
  ];

  const renderStars = (count: number) => {
    return Array(5).fill(0).map((_, i) => (
      <svg key={i} className={`h-4 w-4 ${i < count ? 'text-yellow-400' : 'text-slate-200'}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <div className="bg-white overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-xl z-[100] border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-2.5 rounded-[18px] shadow-xl shadow-indigo-200/50 flex items-center justify-center">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-xl font-black text-slate-900 tracking-tighter">Netmarketer</span>
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em]">One Hub</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-600">
            <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
            <a href="#testimonials" className="hover:text-indigo-600 transition-colors">Community</a>
            <button onClick={onViewContact} className="hover:text-indigo-600 transition-colors">Support</button>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={onLogin} className="text-sm font-bold text-slate-600 px-4 py-2 hover:text-indigo-600 transition-colors">Login</button>
            <button onClick={onGetStarted} className="bg-slate-900 text-white px-7 py-3 rounded-2xl text-sm font-black shadow-xl hover:bg-indigo-600 transition-all active:scale-95">Get Started</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-48 pb-32 px-6 relative text-center">
        <div className="max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-slate-50 border border-slate-200 text-slate-400 text-[10px] font-black uppercase tracking-[0.25em] mb-10">
             ⚡ The Pro-Standard for Networking
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-slate-900 leading-[0.95] mb-10 tracking-tighter">
            Stop Losing Leads. <br/><span className="bg-gradient-to-r from-indigo-600 to-violet-700 bg-clip-text text-transparent">Start Closing.</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-500 mb-16 max-w-2xl mx-auto leading-relaxed font-medium italic">
            "Professional AI-powered objection handling and smart CRM built to scale your networking empire."
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button onClick={onGetStarted} className="w-full sm:w-auto px-12 py-6 bg-indigo-600 text-white rounded-[32px] text-xl font-black shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transform hover:-translate-y-1 transition-all">
              Activate Dashboard
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-black text-slate-900 mb-6 tracking-tight">Premium Business <span className="text-indigo-600">Toolkit.</span></h2>
            <p className="text-slate-500 font-medium max-w-xl mx-auto italic">Scale your business with professional tools designed for network marketing leaders.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Leads CRM', icon: '👤', desc: 'Manage your prospects, follow-ups, and conversion pipeline effortlessly.' },
              { name: 'AI Objection Coach', icon: '🧠', desc: 'Get instant, word-for-word rebuttals for common objections like \"No Money\" or \"No Time\".' },
              { name: 'Script Studio', icon: '✍️', desc: 'AI-generated calling and WhatsApp scripts that sound natural and close fast.' }
            ].map((feat, i) => (
              <div key={i} className="bg-white p-12 rounded-[56px] shadow-sm border border-slate-100 flex flex-col h-full transform transition hover:-translate-y-2 duration-500">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl mb-8 border border-slate-100">{feat.icon}</div>
                <h3 className="text-xl font-black uppercase tracking-widest mb-4">{feat.name}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
           <div className="text-center mb-24">
              <h2 className="text-5xl font-black text-slate-900 mb-4 tracking-tight">Elite <span className="text-indigo-600">Wall.</span></h2>
              <p className="text-slate-500 font-medium max-w-2xl mx-auto italic">Real professionals, real growth.</p>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {reviews.map((rev, i) => (
                <div key={i} className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm flex flex-col hover:shadow-xl transition-all">
                  <div className="flex gap-1 mb-6">{renderStars(rev.rating)}</div>
                  <p className="text-slate-600 font-medium italic mb-10 text-sm leading-relaxed flex-1">"{rev.comment}"</p>
                  <p className="text-xs font-black text-slate-900">{rev.name}</p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 p-2.5 rounded-[14px] flex items-center justify-center">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tighter">Netmarketer One Hub</span>
          </div>
          <div className="flex gap-10 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
            <button onClick={onViewContact} className="hover:text-indigo-600">Support</button>
            <button onClick={onViewTerms} className="hover:text-indigo-600">Terms</button>
            <button onClick={onViewPrivacy} className="hover:text-indigo-600">Privacy</button>
          </div>
          <p className="text-slate-400 text-sm font-medium">© 2024 Netmarketer One Hub. Premium Edition.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
