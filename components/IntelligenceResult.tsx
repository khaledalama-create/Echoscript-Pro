
import React from 'react';

interface Props {
  text: string;
  mode: string;
}

const IntelligenceResult: React.FC<Props> = ({ text, mode }) => {
  // Helper to strip markdown artifacts and clean up AI text
  const sanitize = (str: string) => {
    return str
      .replace(/\*\*/g, '') // Remove bold markers
      .replace(/^\s*[\-\*]\s*/, '') // Remove leading bullets
      .replace(/###/g, '') // Remove stray hashes
      .trim();
  };

  if (mode !== 'bant') {
    return (
      <div className="p-2">
        <div className="whitespace-pre-wrap leading-relaxed text-slate-700 text-sm md:text-base font-medium">
          {sanitize(text)}
        </div>
      </div>
    );
  }

  // Parse sections
  const sections = text.split('###').slice(1);
  const strategySection = text.split('## 2. Closing Strategy')[1]?.split('## 3. Lead Summary')[0] || '';
  const leadSection = text.split('## 3. Lead Summary')[1] || '';

  const getStatusStyles = (statusText: string) => {
    const s = statusText.toLowerCase();
    if (s.includes('confirmed') || s.includes('critical') || s.includes('immediate')) 
      return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    if (s.includes('pending') || s.includes('opportunity') || s.includes('medium')) 
      return 'bg-amber-50 text-amber-700 border-amber-100';
    if (s.includes('unclear') || s.includes('exploratory') || s.includes('long')) 
      return 'bg-blue-50 text-blue-700 border-blue-100';
    return 'bg-rose-50 text-rose-700 border-rose-100';
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* 1. BANT Qualification Cards */}
      <section>
        <div className="flex items-center gap-3 mb-8">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">01. Qualification Analysis</h3>
          <div className="h-px bg-slate-100 flex-1"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections.map((section, idx) => {
            const lines = section.trim().split('\n');
            const rawTitle = lines[0].replace('[', '').replace(']', '').trim();
            const title = sanitize(rawTitle);
            
            const statusRaw = lines.find(l => l.toLowerCase().includes('status:'))?.split(':')[1]?.trim() || 'Unknown';
            const status = sanitize(statusRaw);
            
            const analysisRaw = lines.find(l => l.toLowerCase().includes('analysis:'))?.split(':')[1]?.trim() || '';
            const analysis = sanitize(analysisRaw);
            
            const quoteRaw = lines.find(l => l.toLowerCase().includes('quote:'))?.split(':')[1]?.trim() || '';
            const quote = sanitize(quoteRaw).replace(/^"/, '').replace(/"$/, '');

            if (!analysis && !quote) return null;

            return (
              <div key={idx} className="bg-white border border-slate-200 rounded-[1.5rem] p-7 shadow-sm transition-all hover:shadow-md">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-xs font-black text-slate-900 tracking-widest uppercase">{title}</h4>
                  <div className={`text-[10px] font-extrabold px-3 py-1 rounded-full border shadow-sm ${getStatusStyles(status)}`}>
                    {status}
                  </div>
                </div>

                <p className="text-slate-600 text-[13px] leading-relaxed mb-6 font-medium">
                  {analysis}
                </p>

                {quote && quote.toLowerCase() !== 'missing' && (
                  <div className="relative pl-5 py-1">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-100 rounded-full"></div>
                    <p className="text-slate-400 text-xs italic leading-relaxed">
                      "{quote}"
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. Executive Strategy Brief */}
      {strategySection.trim() && (
        <section className="bg-slate-950 rounded-[2.5rem] p-10 md:p-14 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute -top-10 -right-10 opacity-5">
             <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 20 20">
               <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" />
             </svg>
          </div>
          
          <div className="relative z-10">
            <h3 className="text-blue-500 text-[10px] font-black uppercase tracking-[0.4em] mb-12">02. Strategic Closing Playbook</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {strategySection.trim().split('\n').filter(l => l.trim().startsWith('-')).map((l, i) => {
                const rawText = l.replace(/^-/, '').trim();
                const cleanText = sanitize(rawText);
                
                const parts = cleanText.split(':');
                const label = parts.length > 1 ? parts[0] : `Strategy ${i + 1}`;
                const detail = parts.length > 1 ? parts.slice(1).join(':') : parts[0];

                return (
                  <div key={i} className="flex flex-col gap-4">
                    <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center text-blue-400 font-black text-xs">
                      {i + 1}
                    </div>
                    <div>
                      <h5 className="text-white text-xs font-black uppercase tracking-wider mb-2">{label}</h5>
                      <p className="text-slate-400 text-[13px] font-medium leading-relaxed">{detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 3. Lead Summary Information */}
      {leadSection.trim() && (
        <section>
          <div className="flex items-center gap-3 mb-8">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">03. Lead Context</h3>
            <div className="h-px bg-slate-100 flex-1"></div>
          </div>
          
          <div className="bg-white border border-slate-100 rounded-[2rem] p-10 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
              {leadSection.trim().split('\n').filter(l => l.includes(':')).map((l, i) => {
                const [key, val] = l.split(':');
                const cleanKey = sanitize(key);
                const cleanVal = sanitize(val);
                
                if (!cleanVal || cleanVal.toLowerCase().includes('not mentioned')) return null;

                return (
                  <div key={i} className="group">
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 group-hover:text-blue-500 transition-colors">
                      {cleanKey}
                    </div>
                    <div className="text-sm font-extrabold text-slate-900 break-words tracking-tight">
                      {cleanVal}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default IntelligenceResult;
