
import React from 'react';
import Transcriber from './components/Transcriber';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-100 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900 italic">EchoScribe<span className="text-blue-600 font-black">PRO</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded">Enterprise Ready</span>
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      <header className="pt-20 pb-10 text-center px-4">
        <div className="inline-block px-4 py-1.5 mb-6 bg-blue-50 border border-blue-100 rounded-full">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-[0.2em]">Sales Deal Intelligence</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter mb-6 leading-tight">
          Turn Conversations into <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-900">Closing Strategies.</span>
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
          Upload your sales calls. Extract BANT metrics, contact profiles, or full transcripts 
          using industry-grade deal strategist AI.
        </p>
      </header>

      {/* Main Content */}
      <main className="flex-grow pb-32">
        <Transcriber />
      </main>

      {/* Simplified Footer */}
      <footer className="bg-white border-t border-slate-100 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-xs font-bold tracking-widest uppercase">© 2025 EchoScribe Intelligence Unit</p>
          <div className="flex gap-6 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <a href="#" className="hover:text-blue-600">Privacy</a>
            <a href="#" className="hover:text-blue-600">Security</a>
            <a href="#" className="hover:text-blue-600">API</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
