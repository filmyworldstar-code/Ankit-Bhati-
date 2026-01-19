
import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';

interface LoginPageProps {
  onSignup: () => void;
  onForgot: () => void;
  onBack: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onSignup, onForgot, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;
      
      // App.tsx handles the state change via onAuthStateChange
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[40px] p-10 shadow-2xl shadow-indigo-100 border border-slate-100">
        <button onClick={onBack} className="mb-10 text-slate-400 hover:text-indigo-600 flex items-center gap-2 transition-colors font-bold text-sm">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to home
        </button>
        <h2 className="text-3xl font-black text-slate-900 mb-2">Welcome Back.</h2>
        <p className="text-slate-500 mb-10 font-medium">Log in to manage your network marketing business.</p>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold border border-red-100 animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Email Address</label>
            <input 
              required 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 transition-all font-medium"
              placeholder="alex@example.com"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2 px-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Password</label>
              <button type="button" onClick={onForgot} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Forgot?</button>
            </div>
            <input 
              required 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 transition-all font-medium"
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-5 bg-indigo-600 text-white rounded-[20px] font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-3 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : 'Login'}
          </button>
        </form>

        <p className="mt-10 text-center text-sm text-slate-500 font-medium">
          Don't have an account? <button onClick={onSignup} className="text-indigo-600 font-black hover:underline">Sign up for free</button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
