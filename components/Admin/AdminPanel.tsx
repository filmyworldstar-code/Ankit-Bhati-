
import React, { useState, useEffect } from 'react';
import { User } from '../../types';

interface AdminPanelProps {
  onBack: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [credentials, setCredentials] = useState({ user: '', pass: '' });
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (isAuthorized) {
      const stored = JSON.parse(localStorage.getItem('saas_users') || '[]');
      setUsers(stored);
    }
  }, [isAuthorized]);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (credentials.user === 'admin' && credentials.pass === 'admin123') {
      setIsAuthorized(true);
    } else {
      alert('Unauthorized');
    }
  };

  const deleteUser = (id: string) => {
    if (window.confirm('Delete user and all data?')) {
      const updated = users.filter(u => u.id !== id);
      setUsers(updated);
      localStorage.setItem('saas_users', JSON.stringify(updated));
    }
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="w-full max-w-sm bg-white rounded-[40px] p-10 text-center">
          <h2 className="text-2xl font-black mb-8 text-slate-800">Admin Gateway</h2>
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <input 
              required 
              value={credentials.user} 
              onChange={e => setCredentials({...credentials, user: e.target.value})}
              className="w-full p-4 bg-slate-50 border rounded-2xl outline-none" 
              placeholder="Admin Username" 
            />
            <input 
              required 
              type="password" 
              value={credentials.pass} 
              onChange={e => setCredentials({...credentials, pass: e.target.value})}
              className="w-full p-4 bg-slate-50 border rounded-2xl outline-none" 
              placeholder="Admin Password" 
            />
            <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black">Authorize</button>
          </form>
          <button onClick={onBack} className="mt-8 text-slate-400 font-bold text-sm">Return Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-20">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-black text-slate-900">System Control Panel</h1>
          <button onClick={onBack} className="px-6 py-2 bg-white rounded-xl font-bold border shadow-sm">Exit Admin</button>
        </div>

        <div className="bg-white rounded-[40px] border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">User Details</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Plan</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Joined</th>
                <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-6">
                    <p className="font-black text-slate-800">{u.name}</p>
                    <p className="text-sm text-slate-500">{u.email}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-wider">{u.plan}</span>
                  </td>
                  <td className="px-8 py-6 text-sm text-slate-500 font-medium">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button onClick={() => deleteUser(u.id)} className="p-3 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-slate-400 font-bold italic">No users registered in system.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
