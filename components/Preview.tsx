import React, { useEffect, useRef, useState, useCallback } from 'react';

interface PreviewProps {
  code: string;
  isGenerating: boolean;
  activeLanguage: 'web' | 'python';
}

export const Preview: React.FC<PreviewProps> = ({ code, isGenerating, activeLanguage }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoadingOutput, setIsLoadingOutput] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pythonOutput, setPythonOutput] = useState<string[]>([]);
  const [pyodide, setPyodide] = useState<any>(null);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);
  
  const prevIsGenerating = useRef(isGenerating);

  useEffect(() => {
    if (activeLanguage === 'python' && !pyodide && (window as any).loadPyodide) {
      (window as any).loadPyodide().then((res: any) => setPyodide(res));
    }
  }, [activeLanguage, pyodide]);

  useEffect(() => {
    if (prevIsGenerating.current && !isGenerating) {
      setIsLoadingOutput(true);
      const timer = setTimeout(() => setIsLoadingOutput(false), 1200);
      return () => clearTimeout(timer);
    }
    prevIsGenerating.current = isGenerating;
  }, [isGenerating]);

  useEffect(() => {
    if (isGenerating || isLoadingOutput || !code) return;
    setRuntimeError(null);
    if (activeLanguage === 'web') {
      if (iframeRef.current) {
        try { 
          iframeRef.current.srcdoc = code; 
        } catch (err: any) { 
          setRuntimeError(err.message); 
        }
      }
    } else if (activeLanguage === 'python' && pyodide) {
      const runPython = async () => {
        setPythonOutput(['Initializing Runtime...']);
        try {
          pyodide.setStdout({ batched: (text: string) => setPythonOutput(prev => [...prev, text]) });
          pyodide.setStderr({ batched: (text: string) => setPythonOutput(prev => [...prev, `[SYSERR] ${text}`]) });
          await pyodide.runPythonAsync(code);
        } catch (err: any) {
          setPythonOutput(prev => [...prev, `[RUNTIME ERROR] ${err.message}`]);
          setRuntimeError(err.message);
        }
      };
      runPython();
    }
  }, [code, isGenerating, isLoadingOutput, activeLanguage, pyodide]);

  const handleReload = useCallback(() => {
    setIsLoadingOutput(true);
    setTimeout(() => setIsLoadingOutput(false), 800);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const h = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', h);
    return () => document.removeEventListener('fullscreenchange', h);
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full bg-white relative overflow-hidden transition-all flex flex-col font-inter">
      {/* Precision Toolbar - Always visible, higher prominence */}
      <div className="absolute top-6 right-6 z-50 flex items-center gap-2 p-1.5 bg-[#0b0e14]/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl opacity-60 hover:opacity-100 transition-opacity duration-300">
        <button onClick={handleReload} className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all" title="Reload Output">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
        <button onClick={toggleFullscreen} className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all" title="Full Screen">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
      </div>

      <div className="flex-1 relative">
        {activeLanguage === 'web' ? (
          <iframe 
            ref={iframeRef} 
            title="Vayu Output" 
            className={`w-full h-full border-none transition-all duration-1000 transform ${isGenerating || isLoadingOutput ? 'opacity-0 scale-[0.99] blur-3xl grayscale' : 'opacity-100 scale-100 blur-0 grayscale-0'}`} 
            sandbox="allow-scripts allow-forms allow-modals allow-popups allow-same-origin" 
          />
        ) : (
          <div className={`w-full h-full bg-[#05070a] p-12 font-mono text-sm overflow-auto custom-scrollbar transition-all duration-1000 ${isGenerating || isLoadingOutput ? 'opacity-0 scale-[0.99] blur-3xl' : 'opacity-100 scale-100 blur-0'}`}>
             {pythonOutput.map((line, i) => <div key={i} className={`mb-2 animate-fade-in ${line.startsWith('[SYSERR]') || line.startsWith('[RUNTIME ERROR]') ? 'text-red-400/80' : 'text-slate-400'}`}>{line}</div>)}
             {!pyodide && <div className="text-blue-500 animate-pulse mt-8 font-bold tracking-widest uppercase text-[10px]">Uplinking Runtime...</div>}
             <div className="h-32" />
          </div>
        )}

        {/* Neural Overlay - Minimalist, no heavy text */}
        {isGenerating && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/95 backdrop-blur-3xl z-40 animate-fade-in text-center p-12">
            <div className="w-32 h-32 relative">
              <div className="absolute inset-0 border-[8px] border-blue-500/5 rounded-full"></div>
              <div className="absolute inset-0 border-[8px] border-t-blue-500 rounded-full animate-spin shadow-[0_0_30px_rgba(59,130,246,0.4)]"></div>
              <div className="absolute inset-8 bg-blue-500/5 rounded-full flex items-center justify-center border border-white/5 shadow-inner">
                <div className="w-8 h-8 bg-blue-500 rounded-full animate-pulse shadow-[0_0_40px_#3b82f6]"></div>
              </div>
            </div>
          </div>
        )}

        {!isGenerating && isLoadingOutput && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0b0e14] z-50 animate-fade-in">
            <div className="w-[300px] h-1 bg-white/5 rounded-full overflow-hidden shadow-2xl">
               <div className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-fuchsia-600 animate-[loading_1.5s_ease-in-out_infinite]"></div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes loading { 
          0% { width: 0%; transform: translateX(-100%); } 
          100% { width: 100%; transform: translateX(100%); } 
        }
      `}</style>
    </div>
  );
};