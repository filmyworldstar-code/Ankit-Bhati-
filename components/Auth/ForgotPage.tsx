
import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';

interface ForgotPageProps {
  onBack: () => void;
}

const ForgotPage: React.FC<ForgotPageProps> = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });

      if (resetError) throw resetError;
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[40px] p-10 shadow-2xl shadow-indigo-100 border border-slate-100 text-center">
        {!sent ? (
          <>
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-2">Forgot Password?</h2>
            <p className="text-slate-500 mb-10 font-medium">Enter your email and we'll send you a recovery link.</p>
            
            {error && <p className="text-red-500 text-xs font-bold mb-4">{error}</p>}

            <form onSubmit={handleReset} className="space-y-4">
              <input 
                required 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 transition-all font-medium mb-4"
                placeholder="Email address"
              />
              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-5 bg-indigo-600 text-white rounded-[20px] font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 mb-6 flex items-center justify-center"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Send Link'}
              </button>
            </form>
            <button onClick={onBack} className="text-slate-400 font-bold hover:text-slate-600">Back to Login</button>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-green-50 text-green-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-2">Check Email.</h2>
            <p className="text-slate-500 mb-10 font-medium">We sent a password reset link to {email}.</p>
            <button onClick={onBack} className="w-full py-5 bg-slate-50 text-slate-700 rounded-[20px] font-black text-lg hover:bg-slate-100 transition-all">
              Return to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPage;
