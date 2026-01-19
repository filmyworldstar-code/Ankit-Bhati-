
import React from 'react';
import { User, Lead, MessageTemplate, DashboardTab } from '../../types';

interface OverviewProps {
  user: User;
  leads: Lead[];
  templates: MessageTemplate[];
  onTabSwitch: (tab: DashboardTab) => void;
  onShare: () => void;
}

const Overview: React.FC<OverviewProps> = ({ user, leads, templates, onTabSwitch, onShare }) => {
  const stats = {
    totalLeads: leads.length,
    pendingTasks: leads.filter(l => l.reminder && !l.reminder.completed).length,
    conversionRate: leads.length > 0 ? Math.round((leads.filter(l => l.status.toLowerCase().includes('closed') || l.status.toLowerCase().includes('joined')).length / leads.length) * 100) : 0,
    communitySize: "500+"
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-4xl font-black text-slate-900">Namaste, {(user.name || '').split(' ')[0]} 👋</h1>
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-indigo-600 text-white">
              Elite Edition
            </span>
          </div>
          <p className="text-lg text-slate-500 font-medium italic">"Ab closing hogi pehle se 3 guna zyada fast with AI."</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => onTabSwitch('success-stories')}
            className="hidden sm:flex bg-white text-slate-700 border-2 border-slate-100 px-8 py-4 rounded-[28px] font-black text-sm hover:bg-slate-50 transition-all items-center gap-3 shadow-sm"
          >
            🏆 Success Wall
          </button>
          <button 
            onClick={onShare}
            className="bg-indigo-600 text-white px-10 py-5 rounded-[28px] font-black text-sm shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all transform active:scale-95 flex items-center gap-3"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
            Invite Team
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Elite Members", value: stats.communitySize, icon: "🔥", color: "bg-orange-50 text-orange-600", border: "ring-4 ring-orange-100/50" },
          { label: "Leads Database", value: stats.totalLeads, icon: "📂", color: "bg-blue-50 text-blue-600", border: "" },
          { label: "Closing Ratio", value: stats.conversionRate + "%", icon: "💎", color: "bg-emerald-50 text-emerald-600", border: "" },
          { label: "Membership", value: "Business Elite", icon: "👑", color: "bg-indigo-50 text-indigo-600", border: "" }
        ].map((s, i) => (
          <div 
             key={i} 
             className={`bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-xl transition-all relative overflow-hidden ${s.border}`}
          >
            <div className={`w-14 h-14 ${s.color} rounded-[22px] flex items-center justify-center text-2xl mb-8 shadow-sm`}>{s.icon}</div>
            <div>
              <p className="text-4xl font-black text-slate-900 mb-1">{s.value}</p>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <div className="bg-white p-12 rounded-[60px] border border-slate-100 shadow-sm">
            <h3 className="text-2xl font-black text-slate-900 mb-10">Essential Tools 🛠️</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {[
                { label: "CRM", icon: "👤", tab: "leads" as DashboardTab },
                { label: "Templates", icon: "✍️", tab: "templates" as DashboardTab },
                { label: "Objections", icon: "🛡️", tab: "ai-coach" as DashboardTab },
                { label: "Schedule", icon: "📅", tab: "tasks" as DashboardTab }
              ].map((a, i) => (
                <button 
                  key={i} 
                  onClick={() => onTabSwitch(a.tab)}
                  className="flex flex-col items-center gap-4 p-8 rounded-[32px] transition-all transform hover:-translate-y-2 relative group overflow-hidden shadow-sm bg-slate-50 hover:bg-indigo-600 hover:text-white border-transparent"
                >
                  <span className="text-3xl">{a.icon}</span>
                  <span className="text-[11px] font-black uppercase tracking-widest">{a.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-10">
          <div className="bg-white p-10 rounded-[60px] border border-slate-100 shadow-sm overflow-hidden">
             <div className="flex justify-between items-center mb-8">
               <h3 className="text-xl font-black text-slate-900">Elite Hall</h3>
               <button onClick={() => onTabSwitch('success-stories')} className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full uppercase tracking-widest hover:bg-indigo-100">Browse 500+</button>
             </div>
             <div className="space-y-6">
                {[
                  { name: "Amit P.", company: "Vestige", position: "Diamond", text: "AI Script writing ne meri team ki growth triple kar di!" },
                  { name: "Sneha R.", company: "Amway", position: "Founder Platinum", text: "Objection handling ab bachon ka khel hai." },
                  { name: "Rajat V.", company: "Herbalife", position: "Presidents Team", text: "Everything is super fast and easy to use." }
                ].map((s, i) => (
                  <div key={i} className="flex gap-4 items-start p-4 bg-slate-50 rounded-3xl border border-slate-100">
                    <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-black text-xs flex-shrink-0">{s.name[0]}</div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-indigo-500 mb-1">{s.company} • {s.position}</p>
                      <p className="text-xs font-bold text-slate-700 leading-relaxed italic">"{s.text}"</p>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
