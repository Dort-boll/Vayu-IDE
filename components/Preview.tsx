import React, { useEffect, useRef, useState, useCallback } from 'react';
import { RefreshCw, Maximize2, Loader2, Play } from 'lucide-react';

interface PreviewProps {
  code: string;
  isGenerating: boolean;
  activeLanguage: 'web' | 'python';
}

export const Preview: React.FC<PreviewProps> = ({ code, isGenerating, activeLanguage }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoadingOutput, setIsLoadingOutput] = useState(false);
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
        iframeRef.current.srcdoc = code;
      }
    } else if (activeLanguage === 'python' && pyodide) {
      const runPython = async () => {
        setPythonOutput(['--- Runtime Initiated ---']);
        try {
          pyodide.setStdout({ batched: (text: string) => setPythonOutput(prev => [...prev, text]) });
          pyodide.setStderr({ batched: (text: string) => setPythonOutput(prev => [...prev, `Error: ${text}`]) });
          await pyodide.runPythonAsync(code);
        } catch (err: any) {
          setPythonOutput(prev => [...prev, `Runtime Error: ${err.message}`]);
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
    <div ref={containerRef} className="w-full h-full bg-white relative flex flex-col group">
      {/* Precision Controls */}
      <div className="absolute top-4 right-4 z-40 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="p-2 bg-[#0b0e14] text-white rounded-lg border border-white/10 shadow-xl hover:bg-slate-900 transition-colors" title="Toggle Fullscreen" onClick={toggleFullscreen}>
          <Maximize2 size={14} />
        </button>
      </div>

      <div className="flex-1 relative overflow-hidden bg-[#05070a]">
        {activeLanguage === 'web' ? (
          <iframe 
            ref={iframeRef} 
            title="Vayu Output" 
            className={`w-full h-full border-none bg-white transition-opacity duration-500 ${isGenerating ? 'opacity-30 pointer-events-none grayscale' : 'opacity-100'}`} 
            sandbox="allow-scripts allow-forms allow-modals allow-popups allow-same-origin" 
          />
        ) : (
          <div className="w-full h-full bg-[#05070a] p-8 font-mono text-sm overflow-auto text-slate-400">
             {pythonOutput.map((line, i) => (
               <div key={i} className={`mb-1 ${line.includes('Error') ? 'text-red-400' : ''}`}>
                 {line}
               </div>
             ))}
             {!pyodide && activeLanguage === 'python' && (
               <div className="flex items-center gap-2 text-blue-500 animate-pulse">
                 <Loader2 size={14} className="animate-spin" />
                 <span>Uplinking Python Runtime...</span>
               </div>
             )}
          </div>
        )}

        {isGenerating && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0b0e14]/80 backdrop-blur-md z-30 transition-all">
            <div className="w-16 h-16 relative">
              <div className="absolute inset-0 border-4 border-blue-500/10 rounded-full" />
              <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin" />
              <div className="absolute inset-4 bg-blue-500 rounded-full animate-pulse shadow-[0_0_20px_#3b82f6]" />
            </div>
            <p className="mt-6 text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 animate-pulse">Architecting Solution</p>
          </div>
        )}
      </div>
    </div>
  );
};