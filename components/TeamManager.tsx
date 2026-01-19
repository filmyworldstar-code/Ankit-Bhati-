
import React, { useState, useEffect } from 'react';
import { User, DownlineMember } from '../types';
import { supabase } from '../services/supabaseClient';

interface TeamManagerProps {
  user: User;
}

const TeamManager: React.FC<TeamManagerProps> = ({ user }) => {
  const [team, setTeam] = useState<DownlineMember[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', rank: '' });

  useEffect(() => {
    fetchTeam();
  }, [user.id]);

  const fetchTeam = async () => {
    const { data } = await supabase
      .from('downline_members')
      .select('*')
      .eq('user_id', user.id)
      .order('name', { ascending: true });
    
    if (data) setTeam(data);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const newMember = { ...formData, user_id: user.id, joinedAt: new Date().toISOString() };
    const { data } = await supabase.from('downline_members').insert(newMember).select();
    if (data) {
      setTeam([...team, data[0]]);
      setShowAdd(false);
      setFormData({ name: '', phone: '', rank: '' });
    }
  };

  return (
    <div className="h-full flex flex-col space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-800">My Team ({team.length})</h2>
          <p className="text-sm text-slate-500 font-medium">Manage your downline members and track their growth.</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 transform active:scale-95 transition-all">
          + Add Team Member
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {team.length === 0 ? (
          <div className="col-span-full py-24 bg-white rounded-[40px] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-300 text-center px-10">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <svg className="h-10 w-10 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            </div>
            <p className="font-bold text-lg">No Downline Members Yet.</p>
            <p className="text-sm">Team build karein aur system mein add karein to track progress.</p>
          </div>
        ) : (
          team.map(member => (
            <div key={member.id} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-xl border border-indigo-100">
                    {member.name[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800">{member.name}</h3>
                    <span className="text-[10px] px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-lg font-black uppercase tracking-wider">{member.rank}</span>
                  </div>
                </div>
                <div className="space-y-3 pt-6 border-t border-slate-50 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Phone</span>
                    <span className="font-black text-slate-700">{member.phone}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Joined</span>
                    <span className="font-black text-slate-700">{new Date(member.joinedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => window.open(`tel:${member.phone}`, '_self')} className="flex-1 py-3 bg-blue-50 text-blue-600 rounded-2xl font-black text-xs hover:bg-blue-100 transition-all flex items-center justify-center gap-2" title="Call">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                </button>
                <button onClick={() => window.open(`https://wa.me/${member.phone.replace(/\D/g,'')}`, '_blank')} className="flex-1 py-3 bg-emerald-50 text-emerald-600 rounded-2xl font-black text-xs hover:bg-emerald-100 transition-all flex items-center justify-center gap-2" title="WhatsApp">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <form onSubmit={handleAdd} className="bg-white p-10 rounded-[40px] shadow-2xl w-full max-w-md space-y-6 ring-1 ring-slate-100">
            <h3 className="text-2xl font-black text-slate-800 text-center">New Team Member</h3>
            <div className="space-y-4">
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Full Name" className="w-full p-4 bg-slate-50 border rounded-2xl outline-none" />
              <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="Phone (91...)" className="w-full p-4 bg-slate-50 border rounded-2xl outline-none" />
              <input required type="text" value={formData.rank} onChange={e => setFormData({...formData, rank: e.target.value})} placeholder="Rank (e.g. Silver, Gold)" className="w-full p-4 bg-slate-50 border rounded-2xl outline-none" />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-4 font-bold text-slate-400">Cancel</button>
              <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-100">Add Member</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default TeamManager;
