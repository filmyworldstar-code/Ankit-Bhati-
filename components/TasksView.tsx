
import React, { useState, useMemo } from 'react';
import { Lead, MessageTemplate } from '../types';

interface TasksViewProps {
  leads: Lead[];
  templates: MessageTemplate[];
  onUpdateLead: (lead: Lead) => void;
}

const TasksView: React.FC<TasksViewProps> = ({ leads, templates, onUpdateLead }) => {
  const [rescheduleLead, setRescheduleLead] = useState<Lead | null>(null);
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newTime, setNewTime] = useState('10:00');

  const pendingLeads = useMemo(() => leads.filter(l => l.reminder && !l.reminder.completed), [leads]);

  const today = new Date().toISOString().split('T')[0];
  const now = new Date();

  const isMissed = (date: string, time: string) => {
    const taskDate = new Date(`${date}T${time}`);
    return taskDate < now;
  };

  const todayTasks = useMemo(() => 
    pendingLeads
      .filter(l => {
        const date = l.reminder!.dateTime.split('T')[0];
        return date === today;
      })
      .sort((a, b) => new Date(a.reminder!.dateTime).getTime() - new Date(b.reminder!.dateTime).getTime())
  , [pendingLeads, today]);

  const overdueTasks = useMemo(() => 
    pendingLeads
      .filter(l => {
        const date = l.reminder!.dateTime.split('T')[0];
        const time = l.reminder!.dateTime.split('T')[1];
        return date < today || (date === today && isMissed(date, time));
      })
      .sort((a, b) => new Date(a.reminder!.dateTime).getTime() - new Date(b.reminder!.dateTime).getTime())
  , [pendingLeads, today]);

  const upcomingTasks = useMemo(() => 
    pendingLeads
      .filter(l => {
        const date = l.reminder!.dateTime.split('T')[0];
        return date > today;
      })
      .sort((a, b) => new Date(a.reminder!.dateTime).getTime() - new Date(b.reminder!.dateTime).getTime())
  , [pendingLeads, today]);

  const markDone = (lead: Lead) => {
    onUpdateLead({
      ...lead,
      reminder: { ...lead.reminder!, completed: true }
    });
  };

  const handleRescheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rescheduleLead && rescheduleLead.reminder) {
      onUpdateLead({
        ...rescheduleLead,
        reminder: {
          ...rescheduleLead.reminder,
          dateTime: `${newDate}T${newTime}`,
          completed: false // Ensure it stays pending
        }
      });
      setRescheduleLead(null);
    }
  };

  const renderTaskCard = (lead: Lead, isOverdueItem: boolean = false) => {
    const [date, time] = lead.reminder!.dateTime.split('T');
    const missed = isOverdueItem || isMissed(date, time);
    
    const timeDisplay = new Date(lead.reminder!.dateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

    return (
      <div key={lead.id} className={`bg-white rounded-[32px] p-6 border shadow-sm transition-all hover:shadow-md flex flex-col justify-between ${missed ? 'border-red-100 bg-red-50/10' : 'border-slate-100'}`}>
        <div>
          <div className="flex justify-between items-start mb-4">
            <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2 ${missed ? 'bg-red-100 text-red-600' : 'bg-indigo-50 text-indigo-600'}`}>
              <div className={`w-2 h-2 rounded-full ${missed ? 'bg-red-500 animate-pulse' : 'bg-indigo-500'}`}></div>
              {missed ? 'Missed Call' : 'Scheduled'}
            </div>
            <p className="text-xl font-black text-slate-800">{timeDisplay}</p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-black text-slate-800 mb-1">{lead.name}</h3>
            <div className="flex items-center gap-2 mb-3">
               <span className="text-xs font-bold text-slate-400">{lead.phone}</span>
               <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md uppercase">{lead.reminder?.type}</span>
            </div>
            
            {lead.reminder?.note && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-xs text-slate-500 font-medium italic">"{lead.reminder.note}"</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {/* Call Button */}
          <button 
            onClick={() => window.open(`tel:${lead.phone}`, '_self')}
            className="col-span-1 py-3 bg-blue-50 text-blue-600 rounded-2xl font-black text-xs hover:bg-blue-100 transition-all flex items-center justify-center"
            title="Call"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
          </button>

          {/* WhatsApp Button */}
          <button 
            onClick={() => window.open(`https://wa.me/${lead.phone.replace(/\D/g,'')}`, '_blank')}
            className="col-span-1 py-3 bg-emerald-50 text-emerald-600 rounded-2xl font-black text-xs hover:bg-emerald-100 transition-all flex items-center justify-center"
            title="WhatsApp"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
          </button>
          
          <button 
            onClick={() => { setRescheduleLead(lead); setNewDate(date); setNewTime(time); }}
            className="col-span-1 py-3 bg-white border border-slate-200 text-slate-500 rounded-2xl font-bold text-xs hover:bg-slate-50 transition-all flex items-center justify-center"
            title="Reschedule"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </button>

          <button 
            onClick={() => markDone(lead)}
            className="col-span-1 py-3 bg-emerald-50 text-emerald-600 rounded-2xl font-bold text-xs hover:bg-emerald-100 transition-all flex items-center justify-center"
            title="Mark as Done"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Today's Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-black text-slate-800">Today's Follow-ups</h2>
            <p className="text-sm text-slate-500 font-medium">{new Date().toLocaleDateString('en-US', {weekday: 'long', month: 'long', day: 'numeric'})}</p>
          </div>
          <div className="bg-white px-5 py-2 rounded-2xl border border-slate-100 shadow-sm">
             <span className="text-2xl font-black text-indigo-600">{todayTasks.length}</span>
             <span className="text-[10px] font-bold text-slate-400 uppercase ml-2">Pending</span>
          </div>
        </div>

        {todayTasks.length === 0 ? (
          <div className="bg-white rounded-[40px] p-12 border-2 border-dashed border-slate-100 text-center">
             <p className="text-slate-400 font-bold text-lg">No follow-ups scheduled for today.</p>
             <p className="text-slate-400 text-sm">Relax or check upcoming tasks.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {todayTasks.map(l => renderTaskCard(l))}
          </div>
        )}
      </div>

      {/* Missed / Overdue Section */}
      {overdueTasks.length > 0 && (
        <div className="pt-8 border-t border-slate-100">
          <h3 className="text-xl font-black text-red-500 mb-6 flex items-center gap-2">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Missed Follow-ups ({overdueTasks.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {overdueTasks.map(l => renderTaskCard(l, true))}
          </div>
        </div>
      )}

      {/* Upcoming Section */}
      <div className="pt-8 border-t border-slate-100">
         <h3 className="text-lg font-black text-slate-400 mb-6 uppercase tracking-widest">Upcoming</h3>
         {upcomingTasks.length === 0 ? (
           <p className="text-sm text-slate-400 italic">No upcoming tasks.</p>
         ) : (
           <div className="space-y-4">
             {upcomingTasks.map(l => (
               <div key={l.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-bold text-slate-400 shadow-sm text-xs">
                      {new Date(l.reminder!.dateTime).getDate()}
                    </div>
                    <div>
                      <p className="font-bold text-slate-700">{l.name}</p>
                      <p className="text-xs text-slate-400">{new Date(l.reminder!.dateTime).toLocaleDateString()} • {l.reminder!.type}</p>
                    </div>
                  </div>
                  <button onClick={() => { setRescheduleLead(l); setNewDate(l.reminder!.dateTime.split('T')[0]); setNewTime(l.reminder!.dateTime.split('T')[1]); }} className="text-xs font-bold text-indigo-600 hover:underline">Reschedule</button>
               </div>
             ))}
           </div>
         )}
      </div>

      {/* Reschedule Modal */}
      {rescheduleLead && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] w-full max-w-sm p-8 shadow-2xl space-y-6">
            <h3 className="text-2xl font-black text-slate-800 text-center">Reschedule</h3>
            <p className="text-center text-sm text-slate-500 -mt-4">When should we move {rescheduleLead.name}?</p>
            
            <form onSubmit={handleRescheduleSubmit} className="space-y-4">
              <input required type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm" />
              <input required type="time" value={newTime} onChange={e => setNewTime(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm" />
              
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setRescheduleLead(null)} className="flex-1 py-4 font-black text-slate-400">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-100">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksView;
