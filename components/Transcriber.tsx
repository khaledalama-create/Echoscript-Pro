
import React, { useState, useRef } from 'react';
import { processAudioIntelligence } from '../geminiService';
import { TranscriptionResult, FileInfo, ExtractionMode } from '../types';
import IntelligenceResult from './IntelligenceResult';

const Transcriber: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [mode, setMode] = useState<ExtractionMode>('bant');
  const [result, setResult] = useState<TranscriptionResult>({ text: '', status: 'idle' });
  const [progressMessage, setProgressMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith('audio/') && !selectedFile.type.startsWith('video/')) {
        alert("Please select an audio or video file.");
        return;
      }
      setFile(selectedFile);
      setFileInfo({
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type,
        lastModified: selectedFile.lastModified,
      });
      setResult({ text: '', status: 'idle' });
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const startProcessing = async () => {
    if (!file) return;

    setResult({ text: '', status: 'processing' });
    setProgressMessage("Deep-scanning conversation...");

    try {
      const base64 = await fileToBase64(file);
      const text = await processAudioIntelligence(base64, file.type, mode);
      setResult({ text, status: 'completed' });
    } catch (err: any) {
      setResult({ 
        text: '', 
        status: 'error', 
        error: err.message || "An error occurred." 
      });
    } finally {
      setProgressMessage('');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result.text);
    alert("Copied intelligence to clipboard!");
  };

  return (
    <div className="max-w-6xl mx-auto w-full px-4 py-8 space-y-12">
      <div className="bg-white rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-100 px-10 py-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Intelligence Workspace</h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Capture • Analyze • Strategy</p>
          </div>
          <div className="bg-blue-600/10 text-blue-600 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
            Gemini Flash Engine
          </div>
        </div>

        <div className="p-8 md:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-12">
             <div className="lg:col-span-5">
                <label className="block text-[10px] font-black text-slate-400 mb-4 uppercase tracking-[0.2em]">Source Content</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`
                    h-48 border-2 border-dashed rounded-3xl cursor-pointer transition-all duration-300
                    flex flex-col items-center justify-center text-center p-6
                    ${file ? 'border-blue-500 bg-blue-50/20 shadow-inner' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}
                  `}
                >
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="audio/*,video/*" />
                  {!file ? (
                    <>
                      <div className="bg-white shadow-sm p-3 rounded-2xl mb-3 text-slate-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                      </div>
                      <p className="text-slate-900 font-bold text-sm">Select Media</p>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white mb-1 shadow-lg">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                      </div>
                      <p className="text-slate-900 font-extrabold text-xs max-w-[150px] truncate">{fileInfo?.name}</p>
                      <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="text-rose-500 text-[10px] font-black uppercase tracking-widest mt-1 hover:underline">Clear</button>
                    </div>
                  )}
                </div>
             </div>

             <div className="lg:col-span-7">
                <label className="block text-[10px] font-black text-slate-400 mb-4 uppercase tracking-[0.2em]">Extraction Goal</label>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { id: 'bant', label: 'BANT Sales Analysis', desc: 'Identify Budget, Authority, Need, and Timeline.' },
                    { id: 'followup', label: 'Follow-up Magic', desc: 'Find unique personal hooks for a memorable follow-up.' },
                    { id: 'transcript', label: 'Call Transcription', desc: 'Verbatim record with speaker tagging.' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setMode(item.id as ExtractionMode)}
                      className={`
                        w-full p-4 rounded-2xl border-2 transition-all text-left flex items-center gap-4 group
                        ${mode === item.id ? 'border-blue-600 bg-blue-50/30' : 'border-slate-100 hover:border-slate-200 bg-white'}
                      `}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${mode === item.id ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-400 group-hover:text-slate-600'}`}>
                        {item.id === 'bant' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
                        {item.id === 'followup' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>}
                        {item.id === 'transcript' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                      </div>
                      <div>
                        <p className={`text-sm font-black ${mode === item.id ? 'text-blue-900' : 'text-slate-900'}`}>{item.label}</p>
                        <p className="text-[11px] text-slate-400 font-medium">{item.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
             </div>
          </div>

          <div className="flex flex-col items-center justify-center py-6">
            <button
              onClick={startProcessing}
              disabled={!file || result.status === 'processing'}
              className={`
                px-16 py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-[11px] text-white shadow-xl transition-all transform active:scale-95 flex items-center gap-4
                ${!file || result.status === 'processing' 
                  ? 'bg-slate-200 cursor-not-allowed text-slate-400 shadow-none' 
                  : 'bg-slate-900 hover:bg-black hover:-translate-y-1 hover:shadow-2xl'}
              `}
            >
              {result.status === 'processing' ? 'Processing...' : 'Generate Intelligence'}
            </button>
            {progressMessage && (
              <div className="mt-8 flex flex-col items-center gap-2">
                <div className="w-48 h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 animate-[bar_2s_infinite]"></div>
                </div>
                <span className="text-[9px] font-black text-blue-600 uppercase tracking-[0.3em]">{progressMessage}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {(result.status === 'completed' || result.status === 'processing' || result.status === 'error') && (
        <div className="bg-white rounded-[2.5rem] p-10 md:p-14 border border-slate-100 shadow-xl min-h-[400px]">
          {result.status === 'processing' && (
             <div className="flex flex-col items-center justify-center py-32 space-y-6 text-center">
                <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Engine Warmup...</p>
             </div>
          )}
          {result.status === 'completed' && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-50">
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                   <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Intelligence Live</span>
                </div>
                <button onClick={copyToClipboard} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors">
                  Copy Brief
                </button>
              </div>
              <IntelligenceResult text={result.text} mode={mode} />
            </div>
          )}
          {result.status === 'error' && (
            <div className="h-[300px] flex flex-col items-center justify-center text-rose-500 text-center px-6">
              <p className="font-black text-sm uppercase tracking-widest mb-2">Failed</p>
              <p className="text-xs font-bold opacity-60 max-w-sm">{result.error}</p>
            </div>
          )}
        </div>
      )}
      <style>{`
        @keyframes bar { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }
      `}</style>
    </div>
  );
};

export default Transcriber;
