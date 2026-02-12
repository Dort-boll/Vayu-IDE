import React, { useEffect, useRef, useState } from 'react';
import { Maximize2, Loader2, Zap } from 'lucide-react';

interface PreviewProps {
  code: string;
  isGenerating: boolean;
  activeLanguage: 'web' | 'python';
}

export const Preview: React.FC<PreviewProps> = ({ code, isGenerating, activeLanguage }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pythonOutput, setPythonOutput] = useState<string[]>([]);
  const [pyodide, setPyodide] = useState<any>(null);
  
  useEffect(() => {
    if (activeLanguage === 'python' && !pyodide && (window as any).loadPyodide) {
      (window as any).loadPyodide().then((res: any) => setPyodide(res));
    }
  }, [activeLanguage, pyodide]);

  useEffect(() => {
    if (isGenerating || !code) return;
    
    if (activeLanguage === 'web') {
      if (iframeRef.current) {
        // Reset iframe source doc to trigger full reload
        iframeRef.current.srcdoc = code;
      }
    } else if (activeLanguage === 'python' && pyodide) {
      const runPython = async () => {
        setPythonOutput(['>>> Executing Neural Trace...']);
        try {
          pyodide.setStdout({ batched: (text: string) => setPythonOutput(prev => [...prev, text]) });
          pyodide.setStderr({ batched: (text: string) => setPythonOutput(prev => [...prev, `[ERR] ${text}`]) });
          await pyodide.runPythonAsync(code);
        } catch (err: any) {
          setPythonOutput(prev => [...prev, `[RUNTIME_ERR] ${err.message}`]);
        }
      };
      runPython();
    }
  }, [code, isGenerating, activeLanguage, pyodide]);

  const toggleFullscreen = () => {
    if (containerRef.current?.requestFullscreen) {
      containerRef.current.requestFullscreen();
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full bg-[#05070a] relative flex flex-col group">
      {/* Precision Controls */}
      <div className="absolute top-6 right-6 z-40 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
        <button 
          className="p-2.5 bg-white/5 backdrop-blur-xl text-white rounded-xl border border-white/10 shadow-2xl hover:bg-white/10 transition-all" 
          title="Full Manifestation" 
          onClick={toggleFullscreen}
        >
          <Maximize2 size={16} />
        </button>
      </div>

      <div className="flex-1 relative overflow-hidden">
        {activeLanguage === 'web' ? (
          <iframe 
            ref={iframeRef} 
            title="Vayu Realtime Output" 
            className={`w-full h-full border-none bg-white transition-all duration-700 ${isGenerating ? 'opacity-20 pointer-events-none blur-sm' : 'opacity-100'}`} 
            sandbox="allow-scripts allow-forms allow-modals allow-popups allow-same-origin" 
          />
        ) : (
          <div className="w-full h-full bg-[#05070a] p-10 font-mono text-sm overflow-auto text-slate-400 custom-scrollbar">
             <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500/80">Python Virtualization Active</span>
             </div>
             {pythonOutput.map((line, i) => (
               <div key={i} className={`mb-2 font-medium leading-relaxed ${line.startsWith('[ERR]') ? 'text-rose-400' : 'text-slate-300'}`}>
                 {line}
               </div>
             ))}
             {!pyodide && activeLanguage === 'python' && (
               <div className="flex items-center gap-3 text-blue-500 font-bold text-[11px] uppercase tracking-widest bg-blue-500/5 p-4 rounded-xl border border-blue-500/10">
                 <Loader2 size={16} className="animate-spin" />
                 Synchronizing Pyodide Runtime...
               </div>
             )}
          </div>
        )}

        {isGenerating && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#05070a]/60 backdrop-blur-2xl z-30 transition-all">
            <div className="relative">
              <div className="w-20 h-20 border-2 border-blue-500/10 rounded-full animate-[ping_3s_infinite]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(37,99,235,0.4)] animate-pulse">
                  <Zap size={24} className="text-white fill-white" />
                </div>
              </div>
            </div>
            <div className="mt-8 text-center">
              <p className="text-[11px] font-black uppercase tracking-[0.5em] text-blue-500 mb-2">Architecting Reality</p>
              <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Compiling Neural Artifacts...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};