
import React, { useState, useMemo, useRef } from 'react';
import { Lead, MessageTemplate } from '../types';
import * as XLSX from 'xlsx';
import { GoogleGenAI } from "@google/genai";

interface LeadManagerProps {
  leads: Lead[];
  templates: MessageTemplate[];
  onAddLead: (lead: Omit<Lead, 'id' | 'createdAt'>) => void;
  onBulkAddLeads: (leads: Omit<Lead, 'id' | 'createdAt'>[]) => Promise<void>;
  onUpdateLead: (lead: Lead) => void;
  onDeleteLead: (id: string) => void;
}

const LeadManager: React.FC<LeadManagerProps> = ({ leads, templates, onAddLead, onBulkAddLeads, onUpdateLead, onDeleteLead }) => {
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'schedule' | 'template' | 'import' | 'quick-status' | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [formData, setFormData] = useState({ name: '', phone: '', status: 'New Lead' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStatus, setProcessStatus] = useState<string>('');
  
  const [reminderData, setReminderData] = useState({ 
    date: new Date().toISOString().split('T')[0], 
    time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }), 
    type: 'call' as 'call' | 'whatsapp' | 'message',
    note: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stageFilters = ["New Lead", "1 Day MC", "2 Day MC", "3 Day MC", "Level Up"];
  const outcomeFilters = ["Busy", "Not Pickup", "Interested", "Not Interested", "Video Sent", "Message Sent"];

  const getDateString = (daysOffset: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    return d.toISOString().split('T')[0];
  };

  const getNext7Days = () => {
    const days = [];
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const dayName = weekdays[d.getDay()];
      const dateNum = d.getDate();
      const monthName = months[d.getMonth()];
      
      let label = "";
      if (i === 0) label = `Today (${dayName})`;
      else if (i === 1) label = `Tomorrow (${dayName})`;
      else label = `${dayName}, ${dateNum} ${monthName}`;

      days.push({ label, date: d.toISOString().split('T')[0] });
    }
    return days;
  };

  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      const matchesSearch = 
        l.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        l.phone.includes(searchQuery) ||
        l.status.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = activeFilter === 'All' || l.status === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [leads, activeFilter, searchQuery]);

  const handleSaveLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === 'add') {
      onAddLead({ ...formData, status: formData.status || 'New Lead' });
    } else if (modalMode === 'edit' && selectedLead) {
      onUpdateLead({ ...selectedLead, ...formData });
    }
    closeModals();
  };

  const handleSaveReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedLead) {
      onUpdateLead({
        ...selectedLead,
        reminder: {
          dateTime: `${reminderData.date}T${reminderData.time}`,
          type: reminderData.type,
          note: reminderData.note,
          completed: false
        }
      });
    }
    closeModals();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleExport = () => {
    try {
      if (leads.length === 0) {
        alert("No leads to export.");
        return;
      }
      
      const exportData = leads.map(l => ({
        "Full Name": l.name,
        "Phone Number": l.phone,
        "Status": l.status,
        "Date Added": new Date(l.createdAt).toLocaleDateString(),
        "Next Follow-up": l.reminder ? `${new Date(l.reminder.dateTime).toLocaleString()} (${l.reminder.type})` : "Not Scheduled"
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "My Leads");
      XLSX.writeFile(wb, "NetworkBiz_Leads_Backup.xlsx");
      
    } catch (error) {
      console.error(error);
      alert("Failed to export leads.");
    }
  };

  const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        resolve(result ? result.split(',')[1] : '');
      };
      reader.readAsDataURL(file);
    });
    return {
      inlineData: { data: await base64EncodedDataPromise as string, mimeType: file.type },
    };
  };

  const readExcelFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const bstr = evt.target?.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = XLSX.utils.sheet_to_json(ws);
          resolve(data);
        } catch (e) {
          reject(e);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsBinaryString(file);
    });
  };

  const isExcelFile = (file: File) => {
    return file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv');
  };

  const handleProcessFile = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);

    try {
      if (isExcelFile(selectedFile)) {
        setProcessStatus('Reading file...');
        const data = await readExcelFile(selectedFile);
        
        const newLeads = data.map((row: any) => ({
          name: row['Name'] || row['name'] || row['Full Name'] || row['Customer Name'] || 'Unknown',
          phone: String(row['Phone'] || row['phone'] || row['Mobile'] || row['Contact'] || ''),
          status: row['Status'] || row['status'] || 'New Lead'
        })).filter((l: any) => l.name !== 'Unknown' && l.phone !== '');

        if (newLeads.length > 0) {
          setProcessStatus(`Adding ${newLeads.length} leads...`);
          onBulkAddLeads(newLeads);
          closeModals();
          setTimeout(() => alert(`Success! ${newLeads.length} leads added instantly.`), 100);
        } else {
          alert("No valid leads found in Excel file. Ensure columns are named 'Name' and 'Phone'.");
        }
      } 
      else if (selectedFile.type.startsWith('image/')) {
        setProcessStatus('⚡ AI extracting leads...');
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const imagePart = await fileToGenerativePart(selectedFile);
        
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: {
            role: 'user',
            parts: [
              imagePart,
              { text: "Extract Name, Phone, Status. JSON Array: [{name, phone, status}]. Default status: 'New Lead'." }
            ]
          },
          config: {
            responseMimeType: 'application/json',
            temperature: 0.1
          }
        });

        const text = response.text || '';
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        
        try {
          const parsed = JSON.parse(cleanText);
          if (Array.isArray(parsed) && parsed.length > 0) {
             const newLeads = parsed.map((l: any) => ({
               name: l.name || 'Unknown',
               phone: String(l.phone || ''),
               status: l.status || 'New Lead'
            }));
            
            setProcessStatus(`Adding ${newLeads.length} leads...`);
            onBulkAddLeads(newLeads);
            closeModals();
            setTimeout(() => alert(`⚡ Boom! ${newLeads.length} leads extracted and added instantly.`), 100);
          } else {
            alert("Could not extract valid data from image.");
          }
        } catch (e) {
          console.error(e);
          alert("Failed to parse AI response.");
        }
      }
      else {
        alert("Supported formats: .xlsx, .xls, .png, .jpg, .jpeg");
      }
    } catch (error) {
      console.error(error);
      alert("Error processing file. Please check the file format.");
    } finally {
      setIsProcessing(false);
      setProcessStatus('');
    }
  };

  const closeModals = () => {
    setModalMode(null);
    setSelectedLead(null);
    setSelectedFile(null);
    setIsProcessing(false);
    setProcessStatus('');
    setFormData({ name: '', phone: '', status: 'New Lead' });
    setReminderData({ date: getDateString(0), time: '10:00', type: 'call', note: '' });
  };

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('interested')) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (s.includes('not interested')) return 'bg-red-100 text-red-700 border-red-200';
    if (s.includes('busy') || s.includes('not pickup')) return 'bg-amber-100 text-amber-700 border-amber-200';
    if (s.includes('video') || s.includes('message')) return 'bg-blue-100 text-blue-700 border-blue-200';
    return 'bg-indigo-100 text-indigo-700 border-indigo-200';
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col xl:flex-row gap-4 items-stretch xl:items-center justify-between">
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input 
            type="text" 
            placeholder="Search leads, status, or notes..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-[28px] outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-300 transition-all font-medium text-sm shadow-sm"
          />
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} className="bg-white text-slate-600 border border-slate-200 px-6 py-4 rounded-[24px] text-sm font-black hover:bg-slate-50 transition-all active:scale-95 flex items-center gap-2">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Export
          </button>
          <button onClick={() => setModalMode('import')} className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-6 py-4 rounded-[24px] text-sm font-black hover:bg-emerald-100 transition-all active:scale-95 flex items-center gap-2">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Import
          </button>
          <button onClick={() => setModalMode('add')} className="bg-indigo-600 text-white px-8 py-4 rounded-[24px] text-sm font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
            + Add New Lead
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex-shrink-0">Filter:</span>
         <button onClick={() => setActiveFilter('All')} className={`px-4 py-2 rounded-xl text-xs font-black transition-all border whitespace-nowrap ${activeFilter === 'All' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-500 border-slate-200'}`}>All</button>
         {[...stageFilters, ...outcomeFilters].map(f => (
           <button key={f} onClick={() => setActiveFilter(f)} className={`px-4 py-2 rounded-xl text-xs font-black transition-all border whitespace-nowrap ${activeFilter === f ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-500 border-slate-200'}`}>{f}</button>
         ))}
      </div>

      <div className="flex-1 overflow-y-auto bg-white rounded-[40px] border border-slate-100 shadow-sm min-h-0">
        <div className="divide-y divide-slate-50">
          {filteredLeads.map(lead => (
            <div key={lead.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-slate-50/50 transition-all group gap-4">
              <div className="flex gap-5 items-center">
                <div className={`w-14 h-14 rounded-[22px] flex items-center justify-center font-black text-xl border transition-colors ${getStatusColor(lead.status).split(' ')[0]}`}>
                  {lead.name[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-lg leading-tight group-hover:text-indigo-600 transition-colors">{lead.name}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <p className="text-xs text-slate-400 font-bold">{lead.phone}</p>
                    <button onClick={() => { setSelectedLead(lead); setModalMode('quick-status'); }} className={`text-[10px] px-2.5 py-1 rounded-lg font-black uppercase tracking-wider border hover:scale-105 transition-all ${getStatusColor(lead.status)}`}>
                      {lead.status} ▾
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto items-center">
                <button onClick={() => window.open(`tel:${lead.phone}`, '_self')} className="flex-1 sm:flex-none p-4 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-2xl transition-all shadow-sm" title="Call"><svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg></button>
                <button onClick={() => window.open(`https://wa.me/${lead.phone.replace(/\D/g,'')}`, '_blank')} className="flex-1 sm:flex-none p-4 text-emerald-600 bg-emerald-50 hover:bg-emerald-600 hover:text-white rounded-2xl transition-all shadow-sm" title="WhatsApp Message"><svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg></button>
                <button onClick={() => { setSelectedLead(lead); setModalMode('schedule'); }} className={`flex-1 sm:flex-none p-4 hover:text-white rounded-2xl transition-all shadow-sm ${lead.reminder && !lead.reminder.completed ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-600' : 'text-slate-400 bg-slate-50 hover:bg-slate-400'}`} title="Schedule"><svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></button>
                <button onClick={() => { setSelectedLead(lead); setFormData({name: lead.name, phone: lead.phone, status: lead.status}); setModalMode('edit'); }} className="flex-1 sm:flex-none p-4 text-slate-400 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-2xl transition-all shadow-sm" title="Edit"><svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                <button onClick={() => onDeleteLead(lead.id)} className="flex-1 sm:flex-none p-4 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all" title="Delete"><svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      {modalMode === 'import' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] w-full max-w-lg p-10 shadow-2xl space-y-6">
            <div className="text-center">
              <h3 className="text-3xl font-black text-slate-800">Universal Import</h3>
              <p className="text-slate-500 font-medium mt-2">Upload Excel, Images, or Documents.</p>
            </div>
            <div className="space-y-6">
              <input type="file" accept=".xlsx, .xls, .csv, image/*" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} className="w-full py-12 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 font-bold hover:border-indigo-500 hover:text-indigo-600 transition-all flex flex-col items-center gap-2">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                {selectedFile ? selectedFile.name : 'Choose Source File'}
              </button>
              {selectedFile && (
                <button onClick={handleProcessFile} disabled={isProcessing} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl disabled:opacity-50 flex items-center justify-center gap-2">
                  {isProcessing ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Extract & Import Leads 🚀'}
                </button>
              )}
              <button onClick={closeModals} className="w-full py-2 text-slate-400 font-black hover:text-slate-600">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {modalMode === 'quick-status' && selectedLead && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] w-full max-w-sm p-8 shadow-2xl space-y-6">
            <h3 className="text-xl font-black text-slate-800 text-center">Fast Status Update</h3>
            <div className="grid grid-cols-2 gap-2">
               {[...stageFilters, ...outcomeFilters].map(s => (
                 <button key={s} onClick={() => { onUpdateLead({...selectedLead, status: s}); closeModals(); }} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-tight hover:bg-indigo-50 hover:text-indigo-600 transition-all">{s}</button>
               ))}
            </div>
            <button onClick={() => setModalMode('edit')} className="w-full py-4 bg-indigo-50 text-indigo-600 rounded-xl font-black text-xs uppercase tracking-widest">Write Custom Note</button>
            <button onClick={closeModals} className="w-full text-center font-black text-slate-400 text-xs">Close</button>
          </div>
        </div>
      )}

      {(modalMode === 'add' || modalMode === 'edit') && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <form onSubmit={handleSaveLead} className="bg-white rounded-[40px] w-full max-w-lg p-10 shadow-2xl space-y-8 overflow-y-auto max-h-[90vh]">
            <h3 className="text-3xl font-black text-slate-800 text-center">{modalMode === 'add' ? 'Create Lead' : 'Update Lead'}</h3>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Full Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl outline-none font-medium" placeholder="E.g. Rahul Sharma" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Phone Number</label>
                <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl outline-none font-medium" placeholder="91XXXXXXXXXX" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Level / Status (Customizable)</label>
                <div className="flex flex-wrap gap-2 mb-4">
                   {[...stageFilters, ...outcomeFilters].map(tag => (
                     <button key={tag} type="button" onClick={() => setFormData({...formData, status: tag})} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all border ${formData.status === tag ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>{tag}</button>
                   ))}
                </div>
                <textarea rows={2} value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full p-4 bg-white border-2 border-indigo-100 rounded-2xl outline-none focus:border-indigo-600 font-bold text-sm text-indigo-700 resize-none" placeholder="Add custom notes..." />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={closeModals} className="flex-1 font-black text-slate-400">Cancel</button>
              <button type="submit" className="flex-2 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl">Save Info</button>
            </div>
          </form>
        </div>
      )}

      {modalMode === 'schedule' && selectedLead && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <form onSubmit={handleSaveReminder} className="bg-white rounded-[40px] w-full max-w-md p-10 shadow-2xl space-y-8 max-h-[90vh] overflow-y-auto">
            <div className="text-center">
               <h3 className="text-2xl font-black text-slate-800">Schedule Follow-up</h3>
               <p className="text-sm font-medium text-slate-500">For {selectedLead.name}.</p>
            </div>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Follow-up Type</label>
                <div className="flex gap-2">
                  {['call', 'whatsapp', 'message'].map((t) => (
                    <button 
                      key={t}
                      type="button" 
                      onClick={() => setReminderData({...reminderData, type: t as any})}
                      className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-wide border transition-all ${reminderData.type === t ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Select Date</label>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-2">
                  <button type="button" onClick={() => setReminderData({...reminderData, date: getDateString(-1)})} className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-tight transition-all border flex-shrink-0 ${reminderData.date === getDateString(-1) ? 'bg-slate-800 text-white border-slate-800' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>Yesterday</button>
                  {getNext7Days().map(day => (
                    <button key={day.date} type="button" onClick={() => setReminderData({...reminderData, date: day.date})} className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-tight transition-all border flex-shrink-0 flex flex-col items-center ${reminderData.date === day.date ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                      <span className="text-[8px] opacity-70">{day.label.includes('(') ? day.label.split('(')[1].replace(')', '') : 'Upcoming'}</span>
                      <span className="font-black mt-0.5">{day.label.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input required type="date" value={reminderData.date} onChange={e => setReminderData({...reminderData, date: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm" />
                  <input required type="time" value={reminderData.time} onChange={e => setReminderData({...reminderData, time: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Reminder Note (Optional)</label>
                <textarea 
                  value={reminderData.note}
                  onChange={(e) => setReminderData({...reminderData, note: e.target.value})}
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 transition-all font-medium text-sm resize-none"
                  placeholder="e.g. Income discussion, Mom's objection..."
                  rows={2}
                />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={closeModals} className="flex-1 font-black text-slate-400">Cancel</button>
              <button type="submit" className="flex-2 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl">Confirm Schedule</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default LeadManager;
