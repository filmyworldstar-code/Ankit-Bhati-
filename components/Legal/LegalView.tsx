
import React from 'react';

interface LegalViewProps {
  type: 'privacy' | 'terms';
  onBack: () => void;
}

const LegalView: React.FC<LegalViewProps> = ({ type, onBack }) => {
  const content = {
    privacy: {
      title: "Privacy Policy",
      lastUpdated: "January 20, 2024",
      sections: [
        {
          heading: "1. Information We Collect",
          body: "We collect information you provide directly to us when you create an account, manage leads, or interact with our AI Coach. This includes your name, email address, lead contact details, and message templates."
        },
        {
          heading: "2. How We Use Your Information",
          body: "We use the information we collect to provide, maintain, and improve our services, including the AI objection handling and CRM features. We do not sell your personal data to third parties."
        },
        {
          heading: "3. Data Security",
          body: "We implement industry-standard security measures to protect your data. All lead information and personal data are stored securely via Supabase with encrypted connections."
        },
        {
          heading: "4. Your Choices",
          body: "You can update your account information at any time through the profile settings. You may also request deletion of your account and all associated lead data."
        }
      ]
    },
    terms: {
      title: "Terms of Service",
      lastUpdated: "January 20, 2024",
      sections: [
        {
          heading: "1. Acceptance of Terms",
          body: "By accessing or using NetworkBiz AI, you agree to be bound by these Terms of Service. If you do not agree, you may not use our platform."
        },
        {
          heading: "2. User Accounts",
          body: "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account."
        },
        {
          heading: "3. Prohibited Conduct",
          body: "You agree not to use the service for any illegal purposes or to spam leads. Automated scraping or misuse of the AI coaching system is strictly prohibited."
        },
        {
          heading: "4. Limitation of Liability",
          body: "NetworkBiz AI is provided 'as is'. We are not liable for any business losses, failed lead conversions, or technical issues resulting from the use of our platform."
        }
      ]
    }
  };

  const data = content[type];

  return (
    <div className="min-h-screen bg-white py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={onBack} 
          className="mb-12 inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-indigo-600 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to home
        </button>

        <h1 className="text-4xl font-black text-slate-900 mb-2">{data.title}</h1>
        <p className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-12">Last Updated: {data.lastUpdated}</p>

        <div className="space-y-10">
          {data.sections.map((section, idx) => (
            <div key={idx} className="space-y-4">
              <h2 className="text-xl font-black text-slate-800">{section.heading}</h2>
              <p className="text-slate-500 leading-relaxed font-medium">
                {section.body}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-20 pt-10 border-t border-slate-100 text-center">
          <p className="text-slate-400 text-sm font-medium">
            Questions? Contact us at <span className="text-indigo-600 font-bold">support@networkbiz.ai</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LegalView;
