
import React, { useState } from 'react';
import { User, DashboardTab, Lead, MessageTemplate } from '../../types';
import Overview from './Overview';
import Profile from './Profile';
import LeadManager from '../LeadManager';
import TasksView from '../TasksView';
import TemplateManager from '../TemplateManager';
import ContactView from '../Contact/ContactView';
import IncomeTracker from '../IncomeTracker';
import TeamManager from '../TeamManager';
import ContentGen from '../ContentGen';
import SuccessStories from './SuccessStories';
import VideoStudio from '../VideoStudio';

interface DashboardLayoutProps {
  user: User;
  leads: Lead[];
  templates: MessageTemplate[];
  onLogout: () => void;
  onUpdateProfile: (user: User) => void;
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  setTemplates: React.Dispatch<React.SetStateAction<MessageTemplate[]>>;
  onAddLead: (lead: Omit<Lead, 'id' | 'createdAt'>) => void;
  onBulkAddLeads: (leads: Omit<Lead, 'id' | 'createdAt'>[]) => Promise<void>;
  onUpdateLead: (lead: Lead) => void;
  onDeleteLead: (id: string) => void;
  onSaveTemplate: (template: MessageTemplate) => void;
  onDeleteTemplate: (id: string) => void;
  onUpgrade: () => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  user, leads, templates, onLogout, onUpdateProfile, setLeads, setTemplates,
  onAddLead, onBulkAddLeads, onUpdateLead, onDeleteLead, onSaveTemplate, onDeleteTemplate, onUpgrade
}) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');

  const menuItems: { id: DashboardTab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Dashboard Overview', icon: <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /> },
    { id: 'leads', label: 'Lead CRM Manager', icon: <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /> },
    { id: 'ai-coach', label: 'Master Objection Library', icon: <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /> },
    { id: 'templates', label: 'Sales Script Studio', icon: <path d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /> },
    { id: 'tasks', label: 'Daily Target List', icon: <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /> },
    { id: 'video-studio', label: 'AI Marketing Video', icon: <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /> },
    { id: 'team', label: 'Downline Tracker', icon: <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /> },
    { id: 'income', label: 'Earning Analytics', icon: <path d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /> },
    { id: 'profile', label: 'My Settings', icon: <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /> },
  ];

  const handleShare = async () => {
    const shareData = {
      title: 'Join NetworkBiz AI!',
      text: `Business grow karne ke liye best AI tool. Objection handling, CRM aur Scripts sab ek jagah. Join here:`,
      url: window.location.origin,
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch (err) { console.log('Error sharing', err); }
    } else {
      navigator.clipboard.writeText(window.location.origin);
      alert('Website link copied! Share with your team.');
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-slate-100 p-6 overflow-y-auto">
        <div className="flex items-center gap-3 mb-12 px-3 flex-shrink-0">
          <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-xl shadow-indigo-100">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <span className="text-xl font-black text-slate-900 tracking-tighter">NetworkBiz AI</span>
        </div>

        <nav className="flex-1 space-y-1.5">
          {menuItems.map(item => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[13px] font-black transition-all ${
                activeTab === item.id 
                  ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-200' 
                  : 'text-slate-400 hover:bg-indigo-50/50 hover:text-indigo-600'
              }`}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">{item.icon}</svg>
              {item.label}
            </button>
          ))}
          
          <div className="pt-8 space-y-3">
            <div className="px-3 pb-2 border-b border-slate-50 mb-2">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Referral</p>
            </div>
            
            <button 
              onClick={handleShare}
              className="w-full flex items-center gap-4 px-5 py-5 rounded-[24px] text-sm font-black transition-all text-white bg-indigo-600 shadow-xl shadow-indigo-200 hover:bg-indigo-700 transform active:scale-95 border-b-4 border-indigo-900"
            >
              <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center text-white">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
              </div>
              Share Website
            </button>
          </div>
        </nav>

        <div className="mt-6 pt-6 border-t border-slate-100 space-y-2 flex-shrink-0">
          <button onClick={onLogout} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[13px] font-black text-red-400 hover:bg-red-50 hover:text-red-600 transition-all">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-24 bg-white border-b border-slate-100 flex items-center justify-between px-8 lg:px-12 flex-shrink-0">
          <div className="flex items-center gap-6">
            {activeTab !== 'overview' && (
              <button 
                onClick={() => setActiveTab('overview')}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 text-slate-600 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-slate-100"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Home
              </button>
            )}
            <h2 className="text-2xl font-black text-slate-900 capitalize tracking-tight truncate">
              {activeTab === 'overview' ? 'Dashboard Overview' : activeTab === 'ai-coach' ? 'Master Objection Library' : activeTab.replace('-', ' ')}
            </h2>
          </div>
          
          <div className="flex items-center gap-6">
             {!user.isPaid && (
               <button onClick={onUpgrade} className="hidden xl:flex items-center gap-3 bg-indigo-600 text-white px-6 py-2.5 rounded-full shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95">
                 <span className="text-[11px] font-black uppercase tracking-[0.15em]">Upgrade to Pro</span>
                 <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
               </button>
             )}
            <div className="text-right hidden sm:block">
              <p className="text-[13px] font-black text-slate-900">{user.name}</p>
              <div className="flex items-center gap-1.5 justify-end">
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600">
                  {user.plan} Plan {user.isPaid ? '(Active)' : '(Free)'}
                </p>
                <svg className="h-3.5 w-3.5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              </div>
            </div>
            <div className="w-12 h-12 bg-indigo-600 text-white rounded-[20px] flex items-center justify-center font-black text-lg shadow-lg shadow-indigo-100">
              {user.name[0]?.toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
          <div className="max-w-7xl mx-auto h-full">
            {activeTab === 'overview' && <Overview user={user} leads={leads} templates={templates} onTabSwitch={setActiveTab} onShare={handleShare} onUpgrade={onUpgrade} />}
            
            {activeTab === 'ai-coach' && (
              <iframe 
                src="https://enjoy-comic-fb1167ad-2106.app.omni-coder.com" 
                className="w-full h-full rounded-[40px] border border-slate-100 shadow-sm bg-white"
                title="Objection Handling"
              />
            )}
            
            {activeTab === 'content-gen' && <ContentGen />}
            {activeTab === 'leads' && (
              <LeadManager 
                leads={leads} 
                templates={templates} 
                onAddLead={onAddLead}
                onBulkAddLeads={onBulkAddLeads}
                onUpdateLead={onUpdateLead}
                onDeleteLead={onDeleteLead}
              />
            )}
            {activeTab === 'success-stories' && <SuccessStories />}
            {activeTab === 'video-studio' && <VideoStudio user={user} />}
            {activeTab === 'team' && <TeamManager user={user} />}
            {activeTab === 'income' && <IncomeTracker user={user} />}
            {activeTab === 'tasks' && <TasksView leads={leads} templates={templates} onUpdateLead={onUpdateLead} />}
            {activeTab === 'templates' && (
              <TemplateManager 
                templates={templates} 
                onSave={onSaveTemplate} 
                onDelete={onDeleteTemplate} 
              />
            )}
            {activeTab === 'profile' && <Profile user={user} onUpdate={onUpdateProfile} onUpgrade={onUpgrade} />}
            {activeTab === 'contact' && <ContactView onBack={() => setActiveTab('overview')} isDashboard />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
