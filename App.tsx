
import React, { useState, useEffect } from 'react';
import { ViewState, User, Lead, MessageTemplate, PlanType } from './types';
import LandingPage from './components/LandingPage';
import LoginPage from './components/Auth/LoginPage';
import SignupPage from './components/Auth/SignupPage';
import ForgotPage from './components/Auth/ForgotPage';
import DashboardLayout from './components/Dashboard/DashboardLayout';
import AdminPanel from './components/Admin/AdminPanel';
import LegalView from './components/Legal/LegalView';
import ContactView from './components/Contact/ContactView';
import PaymentGate from './components/Payment/PaymentGate';
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
  },
  {
    template_name: "Objection: No Money",
    template_type: "Audio Script",
    content: "{{name}}, main samajh sakta hoon. Actually, is business ko log isi liye start karte hain taaki future mein kabhi 'paise nahi hain' wali problem na ho. Agar main aapko rasta dikhaun ki kaise bina apni savings touch kiye aap start kar sakte hain, to kya aap 10 min baat karenge?",
    note: "Record this as a voice note"
  }
];

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('landing');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSetupModal, setShowSetupModal] = useState(false);

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
        if (view === 'dashboard' || view === 'pricing') setView('landing');
      }
    });

    initializeAuth();
    
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true') {
      setView('admin');
    }

    return () => subscription.unsubscribe();
  }, []);

  const handleUserAuthenticated = async (sbUser: any) => {
    const metadata = sbUser.user_metadata || {};
    
    // Fetch user profile for plan details
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', sbUser.id)
      .single();

    let plan: PlanType = 'Free';
    let isPaid = false;

    if (profile) {
      plan = profile.plan;
      isPaid = profile.is_paid;
    } else {
      // Initialize profile for new user
      await supabase.from('profiles').insert({
        id: sbUser.id,
        email: sbUser.email,
        plan: 'Free',
        is_paid: false
      });
    }

    const user: User = {
      id: sbUser.id,
      name: metadata.name || sbUser.email?.split('@')[0] || 'Member',
      email: sbUser.email!,
      password: '',
      createdAt: sbUser.created_at,
      plan: plan,
      isPaid: isPaid
    };
    setCurrentUser(user);
    
    // STRICT PAYMENT GATE LOGIC
    // If user is NOT paid, send them to pricing.
    // If user IS paid, send them to dashboard.
    if (!isPaid) {
      setView('pricing');
    } else {
      setView('dashboard');
      fetchUserData(sbUser.id);
    }
    
    setLoading(false);
  };

  const checkError = (error: any) => {
    if (error && (error.message?.includes('schema cache') || error.message?.includes('does not exist'))) {
      setShowSetupModal(true);
      return true;
    }
    return false;
  };

  const fetchUserData = async (userId: string) => {
    // Check/Fetch Profile to ensure table exists (triggers setup modal if missing)
    const { error: profileError } = await supabase.from('profiles').select('id').eq('id', userId).single();
    if (checkError(profileError)) return;

    // Fetch Leads
    const { data: leadData, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (checkError(leadError)) return;

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

    // Fetch Templates (New Schema)
    const { data: templateData, error: templateError } = await supabase
      .from('templates')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }); // Ordered by created_at DESC
    
    if (templateError) {
      checkError(templateError);
    } else {
      if (templateData && templateData.length > 0) {
        setTemplates(templateData.map(t => ({
          id: t.id,
          templateName: t.template_name,
          templateType: t.template_type,
          content: t.content,
          note: t.note,
          createdAt: t.created_at,
          updatedAt: t.updated_at
        })));
      } else {
        seedStarterTemplates(userId);
      }
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
    setView('landing');
    setCurrentUser(null);
  };

  const handleUpdateLead = async (updatedLead: Lead) => {
    if (!currentUser) return;
    setLeads(prev => prev.map(l => l.id === updatedLead.id ? updatedLead : l));
    
    const { error } = await supabase.from('leads').upsert({
      id: updatedLead.id,
      user_id: currentUser.id,
      name: updatedLead.name,
      phone: updatedLead.phone,
      status: updatedLead.status,
      reminder: updatedLead.reminder || null,
      created_at: new Date(updatedLead.createdAt).toISOString()
    });
    checkError(error);
  };

  const handleAddLead = async (newLeadData: Omit<Lead, 'id' | 'createdAt'>) => {
    if (!currentUser) return;
    const newLead: Lead = {
      ...newLeadData,
      id: crypto.randomUUID(),
      createdAt: Date.now()
    };
    setLeads(prev => [newLead, ...prev]);

    const { error } = await supabase.from('leads').insert({
      id: newLead.id,
      user_id: currentUser.id,
      name: newLead.name,
      phone: newLead.phone,
      status: newLead.status,
      reminder: newLead.reminder || null,
      created_at: new Date(newLead.createdAt).toISOString()
    });

    if (error && !checkError(error)) {
      console.error("Supabase Insert Error:", error.message);
    }
  };

  const handleBulkAddLeads = async (newLeadsData: Omit<Lead, 'id' | 'createdAt'>[]) => {
    if (!currentUser) return;
    const newLeads: Lead[] = newLeadsData.map(data => ({ ...data, id: crypto.randomUUID(), createdAt: Date.now() }));
    const previousLeads = [...leads];
    setLeads(prev => [...newLeads, ...prev]);

    try {
      const inserts = newLeads.map(l => ({
        id: l.id,
        user_id: currentUser.id,
        name: l.name,
        phone: l.phone,
        status: l.status,
        reminder: l.reminder || null,
        created_at: new Date(l.createdAt).toISOString()
      }));
      const { error } = await supabase.from('leads').insert(inserts);
      if (error && !checkError(error)) throw new Error(error.message);
    } catch (err: any) {
      setLeads(previousLeads);
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (window.confirm('Are you sure?')) {
      const previousLeads = [...leads];
      setLeads(prev => prev.filter(l => l.id !== id));
      const { error } = await supabase.from('leads').delete().eq('id', id);
      if (error && !checkError(error)) {
        setLeads(previousLeads);
        alert('Failed to delete lead: ' + error.message);
      }
    }
  };

  const handleSaveTemplate = async (template: MessageTemplate) => {
    if (!currentUser) return;
    
    // UI Optimistic Update
    setTemplates(prev => {
      const exists = prev.find(t => t.id === template.id);
      if (exists) return prev.map(t => t.id === template.id ? template : t);
      // Add new to top (since we order by created_at DESC)
      return [template, ...prev];
    });

    // DB Update (Upsert with new schema)
    const { error } = await supabase.from('templates').upsert({ 
      id: template.id,
      user_id: currentUser.id,
      template_name: template.templateName,
      template_type: template.templateType,
      content: template.content,
      note: template.note,
      updated_at: new Date().toISOString()
    });

    if (error) {
      if (!checkError(error)) {
        alert('Database Sync Failed: ' + error.message);
        fetchUserData(currentUser.id);
      }
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (window.confirm('Delete this template permanently?')) {
      const previousTemplates = [...templates];
      setTemplates(prev => prev.filter(t => t.id !== id));
      try {
        const { error } = await supabase.from('templates').delete().eq('id', id);
        if (error) throw error;
      } catch (err: any) {
        setTemplates(previousTemplates); 
        if (!checkError(err)) {
          alert('Delete failed at database level: ' + err.message);
        }
      }
    }
  };

  const handleSubscribe = async (plan: PlanType) => {
    if (!currentUser) return;

    // Optimistic Update
    const updatedUser = { ...currentUser, plan, isPaid: true };
    setCurrentUser(updatedUser);

    const { error } = await supabase.from('profiles').upsert({
      id: currentUser.id,
      email: currentUser.email,
      plan: plan,
      is_paid: true,
      updated_at: new Date().toISOString()
    });

    if (error && !checkError(error)) {
      alert("Subscription success locally, but failed to sync to DB. Please contact support.");
      console.error(error);
    } else {
      alert(`🎉 Welcome to the ${plan} Plan! Account Activated.`);
      // IMPORTANT: Only after payment do we fetch data and allow dashboard access
      await fetchUserData(currentUser.id);
      setView('dashboard');
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
        return <ContactView onBack={() => setView('landing')} />;
      case 'login':
        return <LoginPage onSignup={() => setView('signup')} onForgot={() => setView('forgot')} onBack={() => setView('landing')} />;
      case 'signup':
        return <SignupPage onLogin={() => setView('login')} onBack={() => setView('landing')} />;
      case 'forgot':
        return <ForgotPage onBack={() => setView('login')} />;
      case 'dashboard':
        if (!currentUser) return null;
        // SECURITY GATE: Even if view is dashboard, if not paid, force pricing
        if (!currentUser.isPaid) {
          return (
             <PaymentGate 
                onBack={handleLogout} 
                onSubscribe={handleSubscribe} 
             />
          );
        }
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
            onUpgrade={() => setView('pricing')} 
          />
        );
      case 'pricing':
        // If user is logged in but not paid, onBack should logout.
        // If user is paid (upgrading), onBack should go to dashboard.
        return (
          <PaymentGate 
            onBack={currentUser?.isPaid ? () => setView('dashboard') : handleLogout} 
            onSubscribe={handleSubscribe} 
          />
        );
      case 'admin':
        return <AdminPanel onBack={() => setView('landing')} />;
      default:
        return <LandingPage onGetStarted={() => setView('signup')} onLogin={() => setView('login')} onViewPrivacy={() => setView('privacy')} onViewTerms={() => setView('terms')} onViewContact={() => setView('contact')} />;
    }
  };

  return (
    <div className="min-h-screen font-sans">
      {renderView()}
      {showSetupModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white rounded-[48px] w-full max-w-2xl p-10 shadow-2xl border border-indigo-100 flex flex-col max-h-[90vh]">
            <div className="flex items-center gap-4 mb-6">
               <div className="w-16 h-16 bg-red-50 text-red-600 rounded-[24px] flex items-center justify-center flex-shrink-0">
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
               </div>
               <div>
                  <h3 className="text-2xl font-black text-slate-800">Database Update Needed</h3>
                  <p className="text-slate-500 font-medium">Please update your Supabase. Missing tables: 'profiles' or 'templates'.</p>
               </div>
            </div>
            <div className="pt-8 flex gap-4">
               <button onClick={() => setShowSetupModal(false)} className="flex-1 py-4 text-slate-400 font-black hover:text-slate-600 transition-colors">Close</button>
               <button onClick={() => window.location.reload()} className="flex-2 py-4 bg-indigo-600 text-white rounded-[24px] font-black shadow-xl shadow-indigo-100">Refresh App</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
