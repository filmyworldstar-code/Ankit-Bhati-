
import React, { useState } from 'react';
import { MessageTemplate, TemplateType } from '../types';

interface TemplateManagerProps {
  templates: MessageTemplate[];
  onSave: (template: MessageTemplate) => void;
  onDelete: (id: string) => void;
}

const TemplateManager: React.FC<TemplateManagerProps> = ({ templates, onSave, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<MessageTemplate>({ 
    id: '', 
    templateName: '', 
    templateType: 'WhatsApp Text', 
    content: '', 
    note: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleStartNew = () => {
    setFormData({ 
      id: crypto.randomUUID(), 
      templateName: '', 
      templateType: 'WhatsApp Text', 
      content: '', 
      note: ''
    });
    setIsEditing(true);
  };

  const handleEdit = (t: MessageTemplate) => {
    // Clone to avoid mutating props directly
    setFormData({ ...t });
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    onDelete(id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation: Name and Content required
    if (!formData.templateName.trim() || !formData.content.trim()) {
      alert("Template Name and Content are required.");
      return;
    }

    setIsSaving(true);
    
    // Save exactly what user writes, no auto-formatting
    onSave(formData);

    setTimeout(() => {
      setIsEditing(false);
      setIsSaving(false);
    }, 300);
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      alert('Template copied to clipboard! (No auto-send)');
    });
  };

  const getTypeColor = (type: TemplateType) => {
    switch (type) {
      case 'WhatsApp Text': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Audio Script': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Video Script': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-slate-50 text-slate-600';
    }
  };

  const getTypeIcon = (type: TemplateType) => {
    switch (type) {
      case 'WhatsApp Text': return <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>;
      case 'Audio Script': return <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>;
      case 'Video Script': return <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800">Template Manager</h2>
          <p className="text-sm text-slate-500 font-medium italic">Reuse your best scripts anytime.</p>
        </div>
        <button 
          onClick={handleStartNew} 
          className="bg-indigo-600 text-white px-8 py-4 rounded-[24px] font-black text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all transform active:scale-95 flex items-center gap-2"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
          Create Template
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-20 custom-scrollbar pr-2">
        {templates.length === 0 ? (
          <div className="col-span-full py-24 bg-white rounded-[40px] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-300 text-center px-10">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6 text-indigo-600">
               <svg className="h-10 w-10" fill="currentColor" viewBox="0 0 24 24"><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            </div>
            <p className="font-bold text-lg text-slate-800">No Templates Found</p>
            <p className="text-sm">Create your first reusable template above.</p>
          </div>
        ) : (
          templates.map(t => (
            <div key={t.id} className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex flex-col h-full hover:shadow-md transition-shadow group relative">
              <div className="flex justify-between items-start mb-4">
                <div className="pr-12">
                   <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border mb-3 ${getTypeColor(t.templateType)}`}>
                      {getTypeIcon(t.templateType)}
                      {t.templateType}
                   </div>
                   <h3 className="font-black text-slate-800 text-lg line-clamp-1" title={t.templateName}>{t.templateName}</h3>
                </div>
                <div className="flex gap-1 absolute top-5 right-5">
                  <button onClick={() => handleEdit(t)} className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" title="Edit">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  <button onClick={() => handleDelete(t.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Delete">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
              
              <div className="flex-1 bg-slate-50 p-4 rounded-[20px] mb-4 border border-slate-100/50">
                <p className="text-sm text-slate-600 line-clamp-2 whitespace-pre-wrap font-medium font-mono leading-relaxed opacity-80">{t.content}</p>
              </div>

              {t.note && (
                <div className="mb-4 flex items-center gap-2">
                   <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                   <p className="text-xs text-slate-500 italic line-clamp-1">{t.note}</p>
                </div>
              )}

              <button 
                onClick={() => handleCopy(t.content)} 
                className="w-full py-4 bg-slate-900 text-white hover:bg-indigo-600 rounded-[20px] font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-lg active:scale-95"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                Copy Content
              </button>
            </div>
          ))
        )}
      </div>

      {isEditing && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <form onSubmit={handleSubmit} className="bg-white rounded-[40px] w-full max-w-2xl p-10 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto ring-1 ring-slate-100">
            <div className="text-center">
               <h3 className="text-3xl font-black text-slate-800">{formData.id ? 'Edit Template' : 'New Template'}</h3>
               <p className="text-sm font-medium text-slate-500 italic">Saved to your account.</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Template Name <span className="text-red-500">*</span></label>
                <input 
                  required 
                  value={formData.templateName} 
                  onChange={e => setFormData({...formData, templateName: e.target.value})} 
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 transition-all font-bold" 
                  placeholder="e.g. Income Follow-up" 
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Template Type <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-3 gap-3">
                  {['WhatsApp Text', 'Audio Script', 'Video Script'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({...formData, templateType: type as TemplateType})}
                      className={`py-3 rounded-xl text-xs font-black uppercase tracking-wide border transition-all ${formData.templateType === type ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Message Content <span className="text-red-500">*</span></label>
                <textarea 
                  required 
                  rows={6} 
                  value={formData.content} 
                  onChange={e => setFormData({...formData, content: e.target.value})} 
                  className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[32px] outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 transition-all font-medium text-sm leading-relaxed font-mono" 
                  placeholder="Hi {{name}}, just checking in..." 
                />
                <p className="text-[10px] text-slate-400 mt-2 px-2">
                  Tip: Use <span className="font-mono bg-slate-100 px-1 rounded">{`{{name}}`}</span>, <span className="font-mono bg-slate-100 px-1 rounded">{`{{time}}`}</span>, <span className="font-mono bg-slate-100 px-1 rounded">{`{{date}}`}</span> as placeholders. We save text exactly as written.
                </p>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Internal Note (Optional)</label>
                <input 
                  value={formData.note || ''} 
                  onChange={e => setFormData({...formData, note: e.target.value})} 
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 transition-all text-sm font-medium" 
                  placeholder="e.g. Use after 2 days" 
                />
              </div>
            </div>
            
            <div className="flex gap-4 pt-4">
              <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-5 font-black text-slate-400 uppercase text-xs tracking-widest">Discard</button>
              <button 
                type="submit" 
                disabled={isSaving} 
                className="flex-2 py-5 bg-indigo-600 text-white rounded-[24px] font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {isSaving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Save Template'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default TemplateManager;
