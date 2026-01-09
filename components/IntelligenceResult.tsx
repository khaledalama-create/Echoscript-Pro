
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';

interface Props {
  text: string;
  mode: string;
  chatHistory?: ChatMessage[];
  onSendMessage?: (message: string) => void;
  isTyping?: boolean;
}

const IntelligenceResult: React.FC<Props> = ({ text, mode, chatHistory = [], onSendMessage, isTyping = false }) => {
  const [inputValue, setInputValue] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mode === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isTyping, mode]);

  const sanitize = (str: string) => {
    return str
      .replace(/\*\*/g, '')
      .replace(/^\s*[\-\*]\s*/, '')
      .replace(/###/g, '')
      .trim();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && onSendMessage) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  // 1. TRANSCRIPT MODE
  if (mode === 'transcript') {
    return (
      <div className="p-2">
        <div className="whitespace-pre-wrap leading-relaxed text-slate-700 text-sm md:text-base font-medium">
          {text}
        </div>
      </div>
    );
  }

  // 2. CHAT / Q&A MODE
  if (mode === 'chat') {
    return (
      <div className="flex flex-col h-[500px] md:h-[600px] relative">
        <div className="flex-grow overflow-y-auto px-2 space-y-6 pb-24 scroll-smooth">
          {chatHistory.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div className={`
                max-w-[85%] px-6 py-4 rounded-3xl text-sm font-medium leading-relaxed
                ${msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-slate-100 text-slate-800 rounded-tl-none'}
              `}>
                {msg.text}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start animate-in fade-in duration-300">
              <div className="bg-slate-100 px-6 py-4 rounded-3xl rounded-tl-none flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask anything about the record..."
              className="flex-grow px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className={`
                px-6 rounded-2xl flex items-center justify-center transition-all
                ${!inputValue.trim() || isTyping ? 'bg-slate-100 text-slate-400' : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-lg shadow-blue-600/20'}
              `}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 12h14M12 5l7 7-7 7" /></svg>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 3. FOLLOW-UP MODE
  if (mode === 'followup') {
    const hooksSection = text.split('## 1. Memorable Hooks')[1]?.split('## 2. The "Recall" Points')[0] || '';
    const recallSection = text.split('## 2. The "Recall" Points')[1] || '';

    const getHookStyles = (type: string) => {
      if (type.includes('PROFESSIONAL')) return 'border-blue-100 bg-blue-50/50 text-blue-700';
      if (type.includes('NICE')) return 'border-emerald-100 bg-emerald-50/50 text-emerald-700';
      if (type.includes('FUNNY')) return 'border-indigo-100 bg-indigo-50/50 text-indigo-700';
      return 'border-slate-100 bg-slate-50 text-slate-700';
    };

    return (
      <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <section>
          <div className="flex items-center gap-3 mb-8">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">01. Memorable Hooks</h3>
            <div className="h-px bg-slate-100 flex-1"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {hooksSection.split('\n').filter(l => l.includes(':')).map((l, i) => {
              const [type, content] = l.split(':');
              return (
                <div key={i} className={`p-6 rounded-3xl border-2 transition-all hover:scale-[1.02] ${getHookStyles(type)}`}>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-3 opacity-60">{sanitize(type)}</p>
                  <p className="text-sm font-bold leading-relaxed">"{sanitize(content)}"</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-8">02. Conversation Anchors</h3>
            <div className="space-y-6">
              {recallSection.split('\n').filter(l => l.trim().startsWith('-')).map((l, i) => (
                <div key={i} className="flex gap-4 items-start group">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 text-[10px] font-black group-hover:bg-blue-500 transition-colors">
                    {i + 1}
                  </div>
                  <p className="text-slate-300 text-[13px] font-medium leading-relaxed italic">
                    {sanitize(l)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  // 4. BANT MODE
  const bantSections = text.split('###').slice(1);
  const strategySection = text.split('## 2. Closing Strategy')[1]?.split('## 3. Lead Summary')[0] || '';
  const leadSection = text.split('## 3. Lead Summary')[1] || '';

  const getStatusStyles = (statusText: string) => {
    const s = statusText.toLowerCase();
    if (s.includes('confirmed') || s.includes('critical') || s.includes('immediate')) return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    if (s.includes('pending') || s.includes('opportunity') || s.includes('medium')) return 'bg-amber-50 text-amber-700 border-amber-100';
    if (s.includes('unclear') || s.includes('exploratory') || s.includes('long')) return 'bg-blue-50 text-blue-700 border-blue-100';
    return 'bg-rose-50 text-rose-700 border-rose-100';
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <section>
        <div className="flex items-center gap-3 mb-8">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">01. Qualification Analysis</h3>
          <div className="h-px bg-slate-100 flex-1"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bantSections.map((section, idx) => {
            const lines = section.trim().split('\n');
            const title = sanitize(lines[0].replace('[', '').replace(']', ''));
            const status = sanitize(lines.find(l => l.toLowerCase().includes('status:'))?.split(':')[1] || 'Unknown');
            const analysis = sanitize(lines.find(l => l.toLowerCase().includes('analysis:'))?.split(':')[1] || '');
            const quote = sanitize(lines.find(l => l.toLowerCase().includes('quote:'))?.split(':')[1] || '').replace(/^"/, '').replace(/"$/, '');
            if (!analysis && !quote) return null;
            return (
              <div key={idx} className="bg-white border border-slate-200 rounded-[1.5rem] p-7 shadow-sm transition-all hover:shadow-md">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-xs font-black text-slate-900 tracking-widest uppercase">{title}</h4>
                  <div className={`text-[10px] font-extrabold px-3 py-1 rounded-full border shadow-sm ${getStatusStyles(status)}`}>{status}</div>
                </div>
                <p className="text-slate-600 text-[13px] leading-relaxed mb-6 font-medium">{analysis}</p>
                {quote && quote.toLowerCase() !== 'missing' && (
                  <div className="relative pl-5 py-1">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-100 rounded-full"></div>
                    <p className="text-slate-400 text-xs italic leading-relaxed">"{quote}"</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {strategySection.trim() && (
        <section className="bg-slate-950 rounded-[2.5rem] p-10 md:p-14 text-white relative shadow-2xl overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-blue-500 text-[10px] font-black uppercase tracking-[0.4em] mb-12">02. Strategic Closing Playbook</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {strategySection.trim().split('\n').filter(l => l.trim().startsWith('-')).map((l, i) => {
                const parts = sanitize(l.replace(/^-/, '')).split(':');
                const label = parts.length > 1 ? parts[0] : `Strategy ${i + 1}`;
                const detail = parts.length > 1 ? parts.slice(1).join(':') : parts[0];
                return (
                  <div key={i} className="flex flex-col gap-4">
                    <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center text-blue-400 font-black text-xs">{i + 1}</div>
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
                const cleanVal = sanitize(val);
                if (!cleanVal || cleanVal.toLowerCase().includes('not mentioned')) return null;
                return (
                  <div key={i}>
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{sanitize(key)}</div>
                    <div className="text-sm font-extrabold text-slate-900 break-words tracking-tight">{cleanVal}</div>
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
