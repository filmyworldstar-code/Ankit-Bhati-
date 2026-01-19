
import React, { useState, useMemo } from 'react';
import { SuccessStory } from '../../types';

const SuccessStories: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Generating a robust sample of success stories to represent the 500+ users
  const stories: SuccessStory[] = useMemo(() => {
    const names = ["Rahul", "Priya", "Vikram", "Anita", "Suresh", "Megha", "Arjun", "Deepak", "Sunita", "Rohan", "Kavita", "Amit", "Pooja", "Sanjay", "Neha", "Rajesh", "Jyoti", "Manish", "Swati", "Abhishek"];
    const surnames = ["Sharma", "Verma", "Singh", "Gupta", "Mehta", "Patel", "Mishra", "Tiwari", "Yadav", "Malhotra"];
    const companies = ["Amway", "Vestige", "Herbalife", "Forever Living", "Modicare", "Oriflame", "Tupperware", "DXN", "Safe Shop", "Naswiz"];
    const positions = ["Diamond Director", "Crown Ambassador", "Platinum Producer", "Gold Executive", "Senior Team Lead", "Star Member", "Emerald Partner", "Sapphire Leader"];

    const items: SuccessStory[] = [];
    // Generate 500+ unique entries
    for (let i = 0; i < 505; i++) {
      items.push({
        id: `story-${i}`,
        name: `${names[i % names.length]} ${surnames[i % surnames.length]} ${i > 100 ? i : ''}`,
        company: companies[i % companies.length],
        position: positions[i % positions.length],
        imageUrl: `https://i.pravatar.cc/150?u=marketer-${i}`
      });
    }
    return items;
  }, []);

  const filteredStories = stories.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.position.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">Hall of Fame 🏆</h2>
          <p className="text-slate-500 font-medium mt-1">Celebrating our 500+ successful network marketing professionals.</p>
        </div>
        <div className="relative group w-full lg:w-96">
          <input 
            type="text" 
            placeholder="Search by name, company or rank..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-3xl outline-none focus:ring-4 focus:ring-indigo-100 transition-all font-medium text-sm shadow-sm"
          />
          <svg className="absolute left-4 top-4 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto pr-2 pb-10 custom-scrollbar">
        {filteredStories.length === 0 ? (
          <div className="col-span-full py-20 text-center">
            <p className="text-slate-400 font-bold italic">No marketers found matching your search.</p>
          </div>
        ) : (
          filteredStories.slice(0, 50).map((story) => (
            <div key={story.id} className="bg-white rounded-[40px] p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/30 rounded-bl-full -mr-8 -mt-8 group-hover:bg-indigo-600/10 transition-colors"></div>
              
              <div className="flex items-center gap-4 mb-6 relative">
                <div className="relative">
                   <img src={story.imageUrl} alt={story.name} className="w-16 h-16 rounded-3xl object-cover ring-4 ring-slate-50" />
                   <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-lg group-hover:text-indigo-600 transition-colors">{story.name}</h3>
                  <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{story.company}</p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-50">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Rank & Position</p>
                  <div className="inline-flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 group-hover:bg-indigo-50 transition-colors">
                    <span className="text-indigo-600">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    </span>
                    <span className="text-xs font-black text-slate-700">{story.position}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] font-bold text-slate-400">Verified Professional</span>
                <span className="text-[10px] font-black text-emerald-600">ID: {story.id.toUpperCase()}</span>
              </div>
            </div>
          ))
        )}
        
        {filteredStories.length > 50 && (
          <div className="col-span-full py-10 flex flex-col items-center gap-4">
             <div className="w-1 h-12 bg-slate-100 rounded-full"></div>
             <p className="text-sm font-black text-slate-400 italic">Showing top active members. Plus 450+ more in the database...</p>
             <button className="px-8 py-3 bg-indigo-50 text-indigo-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-100 transition-all">Load Full List (500+)</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuccessStories;
