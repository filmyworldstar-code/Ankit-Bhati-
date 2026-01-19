
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
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  user, leads, templates, onLogout, onUpdateProfile, setLeads, setTemplates,
  onAddLead, onBulkAddLeads, onUpdateLead, onDeleteLead, onSaveTemplate, onDeleteTemplate
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

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-slate-100 p-6 overflow-y-auto">
        <div className="flex items-center gap-3 mb-12 px-3 flex-shrink-0">
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-2.5 rounded-2xl shadow-lg shadow-indigo-100/50 flex items-center justify-center">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-xl font-black text-slate-900 tracking-tighter">Netmarketer</span>
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em]">One Hub</span>
          </div>
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
        </nav>

        <div className="mt-6 pt-6 border-t border-slate-100 flex-shrink-0">
          <button onClick={onLogout} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[13px] font-black text-red-400 hover:bg-red-50 transition-all">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-24 bg-white border-b border-slate-100 flex items-center justify-between px-8 lg:px-12 flex-shrink-0">
          <h2 className="text-2xl font-black text-slate-900 capitalize tracking-tight truncate">
            {activeTab.replace('-', ' ')}
          </h2>
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-[13px] font-black text-slate-900">{user.name}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Business Elite Edition</p>
            </div>
            <div className="w-12 h-12 bg-slate-900 text-white rounded-[20px] flex items-center justify-center font-black text-lg shadow-lg">
              {user.name[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
          <div className="max-w-7xl mx-auto h-full">
            {activeTab === 'overview' && <Overview user={user} leads={leads} templates={templates} onTabSwitch={setActiveTab} onShare={() => {}} />}
            {activeTab === 'ai-coach' && (
              <iframe 
                src="https://enjoy-comic-fb1167ad-2106.app.omni-coder.com" 
                className="w-full h-full rounded-[40px] border border-slate-100 shadow-sm bg-white"
                title="Objection Handling"
              />
            )}
            {activeTab === 'leads' && <LeadManager leads={leads} templates={templates} onAddLead={onAddLead} onBulkAddLeads={onBulkAddLeads} onUpdateLead={onUpdateLead} onDeleteLead={onDeleteLead} />}
            {activeTab === 'team' && <TeamManager user={user} />}
            {activeTab === 'income' && <IncomeTracker user={user} />}
            {activeTab === 'tasks' && <TasksView leads={leads} templates={templates} onUpdateLead={onUpdateLead} />}
            {activeTab === 'templates' && <TemplateManager templates={templates} onSave={onSaveTemplate} onDelete={onDeleteTemplate} />}
            {activeTab === 'video-studio' && <VideoStudio user={user} />}
            {activeTab === 'success-stories' && <SuccessStories />}
            {activeTab === 'profile' && <Profile user={user} onUpdate={onUpdateProfile} />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
