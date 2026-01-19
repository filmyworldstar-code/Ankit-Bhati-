
import React, { useState, useEffect } from 'react';
import { User, IncomeEntry } from '../types';
import { supabase } from '../services/supabaseClient';

interface IncomeTrackerProps {
  user: User;
}

const IncomeTracker: React.FC<IncomeTrackerProps> = ({ user }) => {
  const [entries, setEntries] = useState<IncomeEntry[]>([]);
  const [formData, setFormData] = useState({ amount: '', source: '', date: new Date().toISOString().split('T')[0] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIncome();
  }, [user.id]);

  const fetchIncome = async () => {
    const { data } = await supabase
      .from('income_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });
    
    if (data) {
      setEntries(data);
    }
    setLoading(false);
  };

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry = {
      user_id: user.id,
      amount: parseFloat(formData.amount),
      source: formData.source,
      date: formData.date
    };

    const { data, error } = await supabase.from('income_entries').insert(newEntry).select();
    if (data) {
      setEntries([data[0], ...entries]);
      setFormData({ amount: '', source: '', date: new Date().toISOString().split('T')[0] });
    }
  };

  const deleteEntry = async (id: string) => {
    if (window.confirm('Delete this record?')) {
      await supabase.from('income_entries').delete().eq('id', id);
      setEntries(entries.filter(e => e.id !== id));
    }
  };

  const totalIncome = entries.reduce((sum, e) => sum + e.amount, 0);
  const thisMonthIncome = entries
    .filter(e => new Date(e.date).getMonth() === new Date().getMonth())
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="h-full flex flex-col space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Earnings</p>
          <h3 className="text-4xl font-black text-emerald-600 tracking-tight">₹{totalIncome.toLocaleString()}</h3>
        </div>
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">This Month</p>
          <h3 className="text-4xl font-black text-indigo-600 tracking-tight">₹{thisMonthIncome.toLocaleString()}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm sticky top-0">
            <h3 className="text-xl font-black text-slate-800 mb-6">Add New Commission</h3>
            <form onSubmit={handleAddEntry} className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Amount (₹)</label>
                <input required type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl outline-none" placeholder="0.00" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Source (e.g. Weekly Payout)</label>
                <input required type="text" value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl outline-none" placeholder="Sales Commission" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Date</label>
                <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl outline-none" />
              </div>
              <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-100">Add Entry</button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100">
              <h3 className="text-xl font-black text-slate-800">History</h3>
            </div>
            {entries.length === 0 ? (
              <div className="p-20 text-center text-slate-400 italic">No earnings logged yet. Log your first commission!</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {entries.map(e => (
                  <div key={e.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div>
                      <p className="font-black text-slate-800">{e.source}</p>
                      <p className="text-xs text-slate-400">{new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <p className="text-lg font-black text-emerald-600">+₹{e.amount}</p>
                      <button onClick={() => deleteEntry(e.id)} className="text-slate-300 hover:text-red-500 p-2">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomeTracker;
