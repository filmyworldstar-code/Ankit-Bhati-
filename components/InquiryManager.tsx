
import React, { useState } from 'react';
import { Inquiry } from '../types';

interface InquiryManagerProps {
  inquiries: Inquiry[];
  onUpdateStatus: (id: string, status: Inquiry['status']) => void;
}

const InquiryManager: React.FC<InquiryManagerProps> = ({ inquiries, onUpdateStatus }) => {
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Inbound Inquiries</h2>
          <p className="text-sm text-slate-500">Messages received from your landing page form.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-hidden h-full">
        {/* List */}
        <div className="lg:col-span-1 bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-y-auto">
          {inquiries.length === 0 ? (
            <div className="p-10 text-center text-slate-400 italic">No inquiries yet.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {inquiries.map(inq => (
                <button 
                  key={inq.id} 
                  onClick={() => setSelectedInquiry(inq)}
                  className={`w-full p-6 text-left hover:bg-slate-50 transition-all relative ${selectedInquiry?.id === inq.id ? 'bg-indigo-50/50 ring-1 ring-inset ring-indigo-100' : ''}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-lg font-black uppercase ${inq.status === 'new' ? 'bg-red-100 text-red-600' : inq.status === 'contacted' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-600'}`}>
                      {inq.status}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">{new Date(inq.created_at).toLocaleDateString()}</span>
                  </div>
                  <h4 className="font-black text-slate-800 truncate">{inq.name}</h4>
                  <p className="text-xs text-slate-500 truncate">{inq.subject}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detail View */}
        <div className="lg:col-span-2 bg-white rounded-[32px] border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          {selectedInquiry ? (
            <>
              <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-black text-slate-800">{selectedInquiry.name}</h3>
                  <p className="text-sm text-indigo-600 font-bold">{selectedInquiry.email} • {selectedInquiry.phone}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => onUpdateStatus(selectedInquiry.id, 'contacted')}
                    className="px-4 py-2 bg-green-50 text-green-600 rounded-xl text-xs font-black uppercase hover:bg-green-100 transition-all"
                  >
                    Mark Contacted
                  </button>
                  <button 
                    onClick={() => onUpdateStatus(selectedInquiry.id, 'archived')}
                    className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-black uppercase hover:bg-slate-100 transition-all"
                  >
                    Archive
                  </button>
                </div>
              </div>
              <div className="flex-1 p-8 overflow-y-auto space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Subject</label>
                  <p className="text-lg font-bold text-slate-800">{selectedInquiry.subject}</p>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Message Body</label>
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {selectedInquiry.message}
                  </div>
                </div>
                <div className="pt-6 border-t border-slate-50">
                  <div className="flex gap-4">
                    <button onClick={() => window.open(`mailto:${selectedInquiry.email}`)} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
                      Reply via Email
                    </button>
                    <button onClick={() => window.open(`https://wa.me/${selectedInquiry.phone.replace(/\D/g,'')}`)} className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all">
                      WhatsApp Message
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-20 text-center space-y-4">
              <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center">
                <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
              <p className="text-slate-400 font-bold">Select an inquiry from the list to view details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InquiryManager;
