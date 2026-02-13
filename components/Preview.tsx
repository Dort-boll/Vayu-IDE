import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Maximize2, Loader2, Zap, RefreshCw, Activity, ShieldCheck, Cpu, Terminal, X, ChevronUp, ChevronDown, MonitorPlay } from 'lucide-react';
import { DiagnosticReport, ChatMessage } from '../types';

interface PreviewProps {
  code: string;
  isGenerating: boolean;
  messages: ChatMessage[];
  activeLanguage: 'web' | 'python';
  onDiagnosticUpdate: (report: DiagnosticReport) => void;
}

export const Preview: React.FC<PreviewProps> = ({ code, isGenerating, messages, activeLanguage, onDiagnosticUpdate }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pythonOutput, setPythonOutput] = useState<string[]>([]);
  const [webLogs, setWebLogs] = useState<{type: 'LOG' | 'ERROR', content: string}[]>([]);
  const [pyodide, setPyodide] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [runtimeStatus, setRuntimeStatus] = useState<'idle' | 'running' | 'error'>('idle');
  const [showConsole, setShowConsole] = useState(false);

  useEffect(() => {
    if (activeLanguage === 'python' && !pyodide && (window as any).loadPyodide) {
      (window as any).loadPyodide().then((res: any) => setPyodide(res));
    }
  }, [activeLanguage, pyodide]);

  const runCode = useCallback(async () => {
    if (!code) return;
    setRuntimeStatus('running');

    if (activeLanguage === 'web') {
      if (iframeRef.current) {
        const captureScript = `
          <script>
            (function() {
              const originalLog = console.log;
              const originalError = console.error;
              console.log = function(...args) {
                window.parent.postMessage({ type: 'LOG', content: args.join(' ') }, '*');
                originalLog.apply(console, args);
              };
              console.error = function(...args) {
                window.parent.postMessage({ type: 'ERROR', content: args.join(' ') }, '*');
                originalError.apply(console, args);
              };
              window.onerror = function(msg, url, line, col, error) {
                window.parent.postMessage({ type: 'ERROR', content: msg + ' (Line: ' + line + ')' }, '*');
                return false;
              };
            })();
          </script>
        `;
        // Isolated execution via srcdoc
        iframeRef.current.srcdoc = captureScript + code;
        setRuntimeStatus('idle');
      }
    } else if (activeLanguage === 'python' && pyodide) {
      setPythonOutput(['>>> Initializing Logic Trace...']);
      try {
        pyodide.setStdout({ batched: (text: string) => setPythonOutput(prev => [...prev, text]) });
        pyodide.setStderr({ batched: (text: string) => {
          setPythonOutput(prev => [...prev, `[FAULT] ${text}`]);
          setRuntimeStatus('error');
        }});
        await pyodide.runPythonAsync(code);
        setRuntimeStatus('idle');
      } catch (err: any) {
        setPythonOutput(prev => [...prev, `[CRITICAL] ${err.message}`]);
        setRuntimeStatus('error');
      }
    }
  }, [code, activeLanguage, pyodide]);

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data.type === 'LOG' || e.data.type === 'ERROR') {
        setWebLogs(prev => [...prev.slice(-49), e.data]);
        if (e.data.type === 'ERROR') setRuntimeStatus('error');
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    const errorLogs = webLogs.filter(l => l.type === 'ERROR').map(l => l.content);
    if (errorLogs.length > 0) {
      onDiagnosticUpdate({
        timestamp: Date.now(),
        error: errorLogs[errorLogs.length - 1],
        logs: errorLogs
      });
    }
  }, [webLogs, onDiagnosticUpdate]);

  // Reactive instant run
  useEffect(() => {
    runCode();
  }, [code, refreshKey, runCode]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full bg-[#f8fafc] relative flex flex-col group overflow-hidden">
      {/* Viewport Controls HUD */}
      <div className="absolute top-8 right-10 z-[50] flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
        <div className="flex items-center gap-4 px-5 py-2.5 bg-[#0b0e14]/90 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl">
           <div className={`w-2 h-2 rounded-full ${runtimeStatus === 'error' ? 'bg-rose-500 shadow-[0_0_12px_#f43f5e]' : 'bg-emerald-500 shadow-[0_0_12px_#10b981]'}`} />
           <span className="text-[10px] font-black uppercase text-slate-300 tracking-widest">{runtimeStatus === 'error' ? 'FAULT_DETECTED' : 'LIVE_SYNC_READY'}</span>
        </div>
        
        <button onClick={() => setRefreshKey(k => k + 1)} className="p-3 bg-white shadow-2xl text-slate-700 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all active:scale-90" title="Manual Re-sync">
          <RefreshCw size={16} className={runtimeStatus === 'running' ? 'animate-spin' : ''} />
        </button>
        
        <button onClick={() => setShowConsole(!showConsole)} className={`p-3 shadow-2xl rounded-xl border transition-all active:scale-90 ${showConsole ? 'bg-blue-600 text-white border-blue-500' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`} title="Debugger Terminal">
          <Terminal size={16} />
        </button>
        
        <button onClick={toggleFullscreen} className="p-3 bg-white shadow-2xl text-slate-700 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all active:scale-90" title="Immersive Mode">
          <Maximize2 size={16} />
        </button>
      </div>

      {/* Synthesis Active Alert */}
      {isGenerating && (
        <div className="absolute top-8 left-10 z-[50] animate-in slide-in-from-left-6 fade-in duration-500">
           <div className="flex items-center gap-4 px-6 py-3 bg-blue-600 text-white rounded-2xl shadow-2xl shadow-blue-500/25 synthesis-active">
             <MonitorPlay size={16} className="animate-pulse" />
             <span className="text-[11px] font-black uppercase tracking-widest">Neural Synthesis Syncing</span>
           </div>
        </div>
      )}

      <div className="flex-1 relative overflow-hidden flex flex-col">
        {activeLanguage === 'web' ? (
          <div className="flex-1 relative">
            <iframe 
              ref={iframeRef} 
              title="Vayu Viewport" 
              className={`w-full h-full border-none transition-all duration-700 bg-white`} 
              sandbox="allow-scripts allow-forms allow-modals allow-popups allow-same-origin" 
            />
          </div>
        ) : (
          <div className="flex-1 bg-[#05070a] p-16 font-mono text-[14px] overflow-auto text-slate-300 custom-scrollbar">
             <div className="flex items-center gap-4 mb-10 opacity-40">
                <Cpu size={22} />
                <span className="text-[11px] font-black uppercase tracking-widest">Logic VM Active Pipeline</span>
             </div>
             <div className="space-y-4">
               {pythonOutput.map((line, i) => (
                 <div key={i} className={`flex gap-6 ${line.includes('[FAULT]') ? 'text-rose-400' : 'text-slate-300'}`}>
                   <span className="opacity-15 text-[10px] w-5 text-right font-bold">{i+1}</span>
                   <span className="font-medium whitespace-pre-wrap">{line}</span>
                 </div>
               ))}
             </div>
             {!pyodide && <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#05070a]"><Loader2 size={40} className="animate-spin text-blue-500/15" /></div>}
          </div>
        )}

        {/* Runtime Console HUD */}
        <div className={`absolute bottom-0 left-0 right-0 bg-[#0b0e14]/98 backdrop-blur-3xl border-t border-white/10 transition-transform duration-500 z-40 h-80 overflow-hidden flex flex-col shadow-[0_-25px_60px_rgba(0,0,0,0.6)] ${showConsole ? 'translate-y-0' : 'translate-y-full'}`}>
           <div className="px-8 py-5 border-b border-white/5 flex items-center justify-between bg-black/40">
              <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-3"><Terminal size={16} className="text-blue-500" /> Kernel Runtime Trace</span>
              <div className="flex items-center gap-6">
                <button onClick={() => setWebLogs([])} className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors">Wipe Logs</button>
                <button onClick={() => setShowConsole(false)} className="text-slate-500 hover:text-white transition-colors"><X size={18} /></button>
              </div>
           </div>
           <div className="flex-1 overflow-y-auto p-8 font-mono text-[13px] space-y-3 custom-scrollbar">
              {webLogs.length === 0 && <div className="text-slate-700 italic py-6 text-center text-sm">Waiting for application runtime output...</div>}
              {webLogs.map((log, i) => (
                <div key={i} className={`flex gap-5 p-4 rounded-2xl ${log.type === 'ERROR' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/15' : 'bg-white/5 text-slate-300 border border-white/5'}`}>
                   <span className="opacity-25 text-[11px] font-black min-w-[70px]">{new Date().toLocaleTimeString()}</span>
                   <span className="whitespace-pre-wrap flex-1">{log.content}</span>
                </div>
              ))}
           </div>
        </div>

        {/* Global Loading Overlay */}
        {isGenerating && messages && messages.length > 0 && messages[messages.length-1].content === '' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#05070a]/70 backdrop-blur-3xl z-[60] transition-all duration-1000">
            <div className="relative mb-10 flex items-center justify-center">
              <div className="w-28 h-28 border-2 border-blue-500/20 rounded-full animate-[spin_3s_linear_infinite]" />
              <Zap size={40} className="absolute text-blue-500 fill-blue-500/30 animate-pulse" />
            </div>
            <p className="text-[12px] font-black uppercase tracking-[0.6em] text-blue-400/80 animate-pulse">Synthesis Stream Establishing</p>
          </div>
        )}
      </div>
    </div>
  );
};