
import React from 'react';

interface ContactViewProps {
  onBack: () => void;
  isDashboard?: boolean;
}

const ContactView: React.FC<ContactViewProps> = ({ onBack, isDashboard }) => {
  return (
    <div className={`${isDashboard ? 'bg-transparent py-0 px-0' : 'min-h-screen bg-slate-50 py-20 px-6'}`}>
      <div className={`${isDashboard ? 'max-w-full' : 'max-w-4xl mx-auto'}`}>
        {!isDashboard && (
          <button 
            onClick={onBack} 
            className="mb-12 inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-indigo-600 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to home
          </button>
        )}

        <div className={`text-center ${isDashboard ? 'mb-10' : 'mb-16'}`}>
          <h1 className={`${isDashboard ? 'text-3xl' : 'text-5xl'} font-black text-slate-900 mb-6 leading-[1.1]`}>
            Contact <span className="text-indigo-600">Our Team.</span>
          </h1>
          <p className="text-slate-500 text-lg leading-relaxed max-w-xl mx-auto font-medium">
            Humein aapki help karke khushi hogi. Neeche diye gaye platforms par humse connect karein for support and queries.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Email Card */}
          <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-indigo-50/50 transition-all group flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">Email Support</h3>
            <p className="text-slate-500 mb-8 font-medium">Humein mail bhejein, hum 24 ghante mein reply karenge.</p>
            <a 
              href="mailto:support@networkbiz.ai" 
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all text-center"
            >
              support@networkbiz.ai
            </a>
          </div>

          {/* Discord Card */}
          <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-indigo-50/50 transition-all group flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg className="h-10 w-10" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.23 10.23 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.06.06 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">Discord Community</h3>
            <p className="text-slate-500 mb-8 font-medium">Hamare exclusive creator server mein shamil hon for live help.</p>
            <a 
              href="https://discord.gg/networkbizai" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-full py-4 bg-[#5865F2] text-white rounded-2xl font-black text-sm shadow-lg shadow-indigo-100 hover:bg-[#4752c4] transition-all text-center"
            >
              Join Discord Server
            </a>
          </div>
        </div>

        <div className={`mt-16 bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm text-center ${isDashboard ? 'mb-20' : ''}`}>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-2 px-1">Support Hours</p>
          <p className="text-slate-800 font-black text-lg">Monday — Saturday | 10:00 AM - 08:00 PM (IST)</p>
        </div>
      </div>
    </div>
  );
};

export default ContactView;
