
import React, { useState, useEffect } from 'react';
import { ViewState, User, Lead, MessageTemplate } from './types';
import LandingPage from './components/LandingPage';
import LoginPage from './components/Auth/LoginPage';
import SignupPage from './components/Auth/SignupPage';
import ForgotPage from './components/Auth/ForgotPage';
import DashboardLayout from './components/Dashboard/DashboardLayout';
import LegalView from './components/Legal/LegalView';
import ContactView from './components/Contact/ContactView';
import { supabase } from './services/supabaseClient';

const STARTER_TEMPLATES = [
  {
    template_name: "Direct Approach (Hinglish)",
    template_type: "WhatsApp Text",
    content: "Hi {{name}}, maine aapki profile dekhi aur mujhe laga ki aap ka mindset business oriented hai. Hum ek project pe kaam kar rahe hain jisme hum log social media ke through passive income generate karte hain. Agar aap interested hain to kya hum 5 min call pe baat kar sakte hain?",
    note: "Use for cold leads on Instagram"
  },
  {
    template_name: "Follow-up After Video",
    template_type: "WhatsApp Text",
    content: "Hi {{name}}, hope you're doing well! Maine jo video link share kiya tha, kya aapne use poora dekh liya hai? Usme sabse best part aapko kya laga? Batayein, phir hum next step discuss karte hain.",
    note: "Send 2 hours after sharing video"
  }
];

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('landing');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        handleUserAuthenticated(session.user);
      } else {
        setLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        handleUserAuthenticated(session.user);
      } else {
        setCurrentUser(null);
        setLeads([]);
        setTemplates([]);
        setView('landing');
      }
    });

    initializeAuth();
    return () => subscription.unsubscribe();
  }, []);

  const handleUserAuthenticated = async (sbUser: any) => {
    const metadata = sbUser.user_metadata || {};
    
    // Everyone gets Business Elite access for free
    const user: User = {
      id: sbUser.id,
      name: metadata.name || sbUser.email?.split('@')[0] || 'Member',
      email: sbUser.email!,
      password: '',
      createdAt: sbUser.created_at,
      plan: 'Business',
      isPaid: true
    };
    
    setCurrentUser(user);
    setView('dashboard');
    fetchUserData(sbUser.id);
    setLoading(false);
  };

  const fetchUserData = async (userId: string) => {
    const { data: leadData } = await supabase
      .from('leads')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (leadData) {
      setLeads(leadData.map(l => ({
        id: l.id,
        name: l.name,
        phone: l.phone,
        status: l.status,
        createdAt: new Date(l.created_at).getTime(),
        reminder: l.reminder
      })));
    }

    const { data: templateData } = await supabase
      .from('templates')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (templateData && templateData.length > 0) {
      setTemplates(templateData.map(t => ({
        id: t.id,
        templateName: t.template_name,
        templateType: t.template_type,
        content: t.content,
        note: t.note,
        createdAt: t.created_at
      })));
    } else {
      seedStarterTemplates(userId);
    }
  };

  const seedStarterTemplates = async (userId: string) => {
    const newTemplates = STARTER_TEMPLATES.map(t => ({
      id: crypto.randomUUID(),
      user_id: userId,
      template_name: t.template_name,
      template_type: t.template_type,
      content: t.content,
      note: t.note
    }));
    const { error } = await supabase.from('templates').insert(newTemplates);
    if (!error) {
      setTemplates(newTemplates.map(t => ({
        id: t.id,
        templateName: t.template_name,
        templateType: t.template_type as any,
        content: t.content,
        note: t.note,
        createdAt: new Date().toISOString()
      })));
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleUpdateLead = async (updatedLead: Lead) => {
    if (!currentUser) return;
    setLeads(prev => prev.map(l => l.id === updatedLead.id ? updatedLead : l));
    await supabase.from('leads').upsert({
      id: updatedLead.id,
      user_id: currentUser.id,
      name: updatedLead.name,
      phone: updatedLead.phone,
      status: updatedLead.status,
      reminder: updatedLead.reminder || null,
      created_at: new Date(updatedLead.createdAt).toISOString()
    });
  };

  const handleAddLead = async (newLeadData: Omit<Lead, 'id' | 'createdAt'>) => {
    if (!currentUser) return;
    const newLead: Lead = {
      ...newLeadData,
      id: crypto.randomUUID(),
      createdAt: Date.now()
    };
    setLeads(prev => [newLead, ...prev]);
    await supabase.from('leads').insert({
      id: newLead.id,
      user_id: currentUser.id,
      name: newLead.name,
      phone: newLead.phone,
      status: newLead.status,
      reminder: newLead.reminder || null,
      created_at: new Date(newLead.createdAt).toISOString()
    });
  };

  const handleBulkAddLeads = async (newLeadsData: Omit<Lead, 'id' | 'createdAt'>[]) => {
    if (!currentUser) return;
    const newLeads: Lead[] = newLeadsData.map(data => ({ ...data, id: crypto.randomUUID(), createdAt: Date.now() }));
    setLeads(prev => [...newLeads, ...prev]);
    const inserts = newLeads.map(l => ({
      id: l.id,
      user_id: currentUser.id,
      name: l.name,
      phone: l.phone,
      status: l.status,
      reminder: l.reminder || null,
      created_at: new Date(l.createdAt).toISOString()
    }));
    await supabase.from('leads').insert(inserts);
  };

  const handleDeleteLead = async (id: string) => {
    if (window.confirm('Are you sure?')) {
      setLeads(prev => prev.filter(l => l.id !== id));
      await supabase.from('leads').delete().eq('id', id);
    }
  };

  const handleSaveTemplate = async (template: MessageTemplate) => {
    if (!currentUser) return;
    setTemplates(prev => {
      const exists = prev.find(t => t.id === template.id);
      if (exists) return prev.map(t => t.id === template.id ? template : t);
      return [template, ...prev];
    });
    await supabase.from('templates').upsert({ 
      id: template.id,
      user_id: currentUser.id,
      template_name: template.templateName,
      template_type: template.templateType,
      content: template.content,
      note: template.note,
      updated_at: new Date().toISOString()
    });
  };

  const handleDeleteTemplate = async (id: string) => {
    if (window.confirm('Delete this template?')) {
      setTemplates(prev => prev.filter(t => t.id !== id));
      await supabase.from('templates').delete().eq('id', id);
    }
  };

  const renderView = () => {
    if (loading) return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

    switch (view) {
      case 'landing':
        return <LandingPage onGetStarted={() => setView('signup')} onLogin={() => setView('login')} onViewPrivacy={() => setView('privacy')} onViewTerms={() => setView('terms')} onViewContact={() => setView('contact')} />;
      case 'privacy':
        return <LegalView type="privacy" onBack={() => setView('landing')} />;
      case 'terms':
        return <LegalView type="terms" onBack={() => setView('landing')} />;
      case 'contact':
        return <ContactView onBack={() => (currentUser ? setView('dashboard') : setView('landing'))} isDashboard={!!currentUser} />;
      case 'login':
        return <LoginPage onSignup={() => setView('signup')} onForgot={() => setView('forgot')} onBack={() => setView('landing')} />;
      case 'signup':
        return <SignupPage onLogin={() => setView('login')} onBack={() => setView('landing')} />;
      case 'forgot':
        return <ForgotPage onBack={() => setView('login')} />;
      case 'dashboard':
        if (!currentUser) return null;
        return (
          <DashboardLayout 
            user={currentUser} 
            leads={leads} 
            templates={templates}
            onLogout={handleLogout}
            onUpdateProfile={(u) => setCurrentUser(u)}
            setLeads={setLeads}
            setTemplates={setTemplates}
            onAddLead={handleAddLead}
            onBulkAddLeads={handleBulkAddLeads}
            onUpdateLead={handleUpdateLead}
            onDeleteLead={handleDeleteLead}
            onSaveTemplate={handleSaveTemplate}
            onDeleteTemplate={handleDeleteTemplate}
          />
        );
      default:
        return <LandingPage onGetStarted={() => setView('signup')} onLogin={() => setView('login')} onViewPrivacy={() => setView('privacy')} onViewTerms={() => setView('terms')} onViewContact={() => setView('contact')} />;
    }
  };

  return (
    <div className="min-h-screen font-sans">
      {renderView()}
    </div>
  );
};

export default App;
