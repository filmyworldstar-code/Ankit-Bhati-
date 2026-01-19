
import React, { useState } from 'react';
import { User } from '../../types';

interface ProfileProps {
  user: User;
  onUpdate: (user: User) => void;
  onUpgrade: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdate, onUpgrade }) => {
  const [formData, setFormData] = useState({ name: user.name, email: user.email });
  const [saving, setSaving] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      onUpdate({ ...user, ...formData });
      setSaving(false);
      alert('Profile updated!');
    }, 800);
  };

  return (
    <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm">
            <h3 className="text-2xl font-black text-slate-800 mb-2">My Profile</h3>
            <p className="text-slate-500 mb-10 font-medium">Sahi information se networking asan ho jati hai.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Display Name</label>
                  <input 
                    required 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 transition-all font-medium"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Email Address</label>
                  <input 
                    required 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 transition-all font-medium"
                  />
                </div>
              </div>
              <button type="submit" disabled={saving} className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50">
                {saving ? 'Updating...' : 'Save Changes'}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm">
             <h3 className="text-xl font-black text-slate-800 mb-6">Security</h3>
             <button className="w-full py-4 px-6 border border-slate-100 rounded-2xl text-left flex items-center justify-between group hover:bg-slate-50 transition-all">
                <div>
                   <p className="font-black text-slate-700">Change Password</p>
                   <p className="text-xs text-slate-400">Regularly updates helpful for security.</p>
                </div>
                <svg className="h-5 w-5 text-slate-300 group-hover:text-indigo-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
             </button>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-8">
           <div className={`rounded-[40px] p-10 text-white relative overflow-hidden group ${user.isPaid ? 'bg-slate-900' : 'bg-slate-800'}`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl"></div>
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2">Membership Status</p>
              <h4 className="text-3xl font-black mb-6">{user.plan} {user.isPaid ? 'Elite' : ''}</h4>
              
              <div className="space-y-4 mb-8">
                 <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${user.isPaid ? 'bg-emerald-400' : 'bg-orange-400'}`}></div>
                    <span className="text-xs font-medium text-slate-300">
                      {user.isPaid ? 'Features: All Unlocked' : 'Features: Limited'}
                    </span>
                 </div>
              </div>

              {!user.isPaid ? (
                <button 
                  onClick={onUpgrade}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-indigo-900 hover:bg-indigo-500 transition-all"
                >
                  Upgrade Now
                </button>
              ) : (
                <p className="text-[10px] text-slate-500 italic">Plan active. Thank you for being an Elite member.</p>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
