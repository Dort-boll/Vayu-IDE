import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Code2, 
  MonitorPlay, 
  Maximize2, 
  Minimize2, 
  RefreshCw, 
  ChevronRight, 
  ChevronLeft,
  FileCode,
  Terminal,
  X,
  Zap,
  Activity,
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles,
  Command,
  Database,
  Share2,
  Lock,
  AlertTriangle,
  Check
} from 'lucide-react';
import { FileEntry } from '../types';
import { cn } from '../src/lib/utils';

interface EditorPreviewContainerProps {
  files: FileEntry[];
  activeFilePath: string;
  onFileChange: (path: string, content: string) => void;
  onActiveFileChange: (path: string) => void;
  isGenerating: boolean;
  bundledCode: string;
  onDiagnosticUpdate: (report: any) => void;
  isMobile: boolean;
  activeMobileTab: 'chat' | 'code' | 'preview';
}

export const EditorPreviewContainer: React.FC<EditorPreviewContainerProps> = ({
  files,
  activeFilePath,
  onFileChange,
  onActiveFileChange,
  isGenerating,
  bundledCode,
  onDiagnosticUpdate,
  isMobile,
  activeMobileTab
}) => {
  const [viewMode, setViewMode] = useState<'code' | 'preview'>(activeMobileTab === 'preview' ? 'preview' : 'code');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showConsole, setShowConsole] = useState(false);
  const [logs, setLogs] = useState<{ type: 'LOG' | 'ERROR'; content: string; timestamp: number }[]>([]);
  const [runtimeStatus, setRuntimeStatus] = useState<'idle' | 'running' | 'error'>('idle');
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isSharing, setIsSharing] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeFile = files.find(f => f.path === activeFilePath) || files[0];

  const handleShare = async () => {
    setIsSharing(true);
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Vayu Synthesis: ${activeFile.path}`,
          text: activeFile.content,
        });
      } else {
        await navigator.clipboard.writeText(activeFile.content);
        alert('Code copied to clipboard for sharing!');
      }
    } catch (e) {
      console.error('Sharing failed:', e);
    } finally {
      setTimeout(() => setIsSharing(false), 2000);
    }
  };

  useEffect(() => {
    if (isMobile) {
      if (activeMobileTab === 'code') setViewMode('code');
      if (activeMobileTab === 'preview') setViewMode('preview');
    }
  }, [activeMobileTab, isMobile]);

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data.type === 'LOG' || e.data.type === 'ERROR') {
        const newLog = { 
          type: e.data.type as 'LOG' | 'ERROR', 
          content: e.data.content, 
          timestamp: Date.now() 
        };
        setLogs(prev => [...prev.slice(-99), newLog]);
        if (e.data.type === 'ERROR') setRuntimeStatus('error');
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    if (!bundledCode) return;
    setRuntimeStatus('running');
    
    const handler = setTimeout(() => {
      if (iframeRef.current) {
        const captureScript = `
          <script>
            (function() {
              const originalLog = console.log;
              const originalError = console.error;
              console.log = function(...args) {
                window.parent.postMessage({ type: 'LOG', content: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') }, '*');
                originalLog.apply(console, args);
              };
              console.error = function(...args) {
                window.parent.postMessage({ type: 'ERROR', content: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') }, '*');
                originalError.apply(console, args);
              };
              window.onerror = function(msg, url, line, col, error) {
                window.parent.postMessage({ type: 'ERROR', content: msg + ' (Line: ' + line + ')' }, '*');
                return false;
              };
              // Disable right click in preview for cleaner feel
              document.addEventListener('contextmenu', e => e.preventDefault());
            })();
          </script>
        `;
        // Injecting a reset and some basic styling for sub-renders
        const baseStyle = `<style>body{margin:0;overflow:auto;background:transparent;}</style>`;
        iframeRef.current.srcdoc = captureScript + baseStyle + bundledCode;
        setRuntimeStatus('idle');
      }
    }, 100);
    return () => clearTimeout(handler);
  }, [bundledCode]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    } else {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    }
  };

  const clearLogs = () => setLogs([]);

  return (
    <div ref={containerRef} className="flex-1 flex flex-col bg-[#020408] overflow-hidden relative selection:bg-blue-500/30">
      {/* Background Neural Detail */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 blur-[120px] rounded-full" />
      </div>

      {/* Control Bar */}
      <div className="h-14 border-b border-white/5 bg-black/40 backdrop-blur-3xl flex items-center justify-between px-6 shrink-0 z-30 relative shadow-2xl">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 flex-grow max-w-[70%] md:max-w-none">
          <AnimatePresence mode="popLayout">
            {files.map((file) => (
              <motion.button
                key={file.path}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => onActiveFileChange(file.path)}
                className={cn(
                  "flex items-center gap-2.5 px-5 h-9 rounded-xl text-[10px] font-black tracking-[0.15em] transition-all duration-500 shrink-0 border group relative overflow-hidden uppercase",
                  activeFilePath === file.path 
                    ? "bg-white/10 text-white border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)]" 
                    : "text-gray-500 border-transparent hover:text-gray-300 hover:bg-white/5"
                )}
              >
                <FileCode size={14} className={cn("transition-transform duration-500 group-hover:scale-110", activeFilePath === file.path ? "text-blue-500" : "text-gray-600")} />
                <span className="truncate max-w-[120px]">{file.path}</span>
                {activeFilePath === file.path && (
                    <motion.div 
                      layoutId="activeTabIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,1)] z-10" 
                    />
                )}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-4 ml-4">
          {!isMobile && (
              <div className="flex items-center bg-white/5 p-1 rounded-2xl border border-white/10 backdrop-blur-xl">
                  <button
                      onClick={() => setViewMode('code')}
                      className={cn(
                          "flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all relative z-10",
                          viewMode === 'code' ? "text-white" : "text-gray-500 hover:text-gray-300"
                      )}
                  >
                      {viewMode === 'code' && (
                          <motion.div layoutId="viewModeBack" className="absolute inset-0 bg-white/10 rounded-xl -z-10 shadow-inner" />
                      )}
                      <Code2 size={14} /> CODE
                  </button>
                  <button
                      onClick={() => setViewMode('preview')}
                      className={cn(
                          "flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all relative z-10",
                          viewMode === 'preview' ? "text-white" : "text-gray-500 hover:text-gray-300"
                      )}
                  >
                      {viewMode === 'preview' && (
                          <motion.div layoutId="viewModeBack" className="absolute inset-0 bg-white/10 rounded-xl -z-10 shadow-inner" />
                      )}
                      <MonitorPlay size={14} /> PREVIEW
                  </button>
              </div>
          )}
          
          <button 
            onClick={handleShare}
            className={cn(
              "p-2.5 rounded-xl bg-white/5 border border-white/10 transition-all shadow-xl active:scale-95 flex items-center gap-2",
              isSharing ? "text-emerald-400 border-emerald-500/30" : "text-gray-400 hover:text-white hover:bg-white/10"
            )}
            title="Share active file"
          >
            {isSharing ? <Check size={18} /> : <Share2 size={18} />}
          </button>
          
          <button 
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all shadow-xl active:scale-95"
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative z-10">
        <AnimatePresence mode="wait">
          {viewMode === 'code' ? (
            <motion.div
              key="code"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex flex-col bg-[#05070a]"
            >
              <AnimatePresence>
                {isGenerating && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-10 pointer-events-none border-2 border-blue-500/20 shadow-[inset_0_0_100px_rgba(59,130,246,0.1)] animate-pulse"
                  />
                )}
              </AnimatePresence>
              <Editor
                height="100%"
                language={activeFile.language}
                value={activeFile.content}
                onChange={(val) => onFileChange(activeFilePath, val || '')}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 15,
                  fontFamily: "'JetBrains Mono', monospace",
                  lineNumbers: 'on',
                  roundedSelection: true,
                  scrollBeyondLastLine: false,
                  readOnly: isGenerating,
                  automaticLayout: true,
                  padding: { top: 24, bottom: 24 },
                  cursorStyle: 'line',
                  cursorBlinking: 'expand',
                  smoothScrolling: true,
                  contextmenu: false,
                  renderLineHighlight: 'all',
                  fontWeight: '500',
                  letterSpacing: 0.5,
                  scrollbar: {
                    vertical: 'hidden',
                    horizontal: 'hidden'
                  }
                }}
              />
              
              {/* Floating Editor Info */}
              <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between z-20 pointer-events-none select-none">
                 <div className="flex items-center gap-6 px-6 py-3 bg-black/60 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-3xl">
                    <div className="flex items-center gap-3">
                        <Lock size={12} className="text-blue-500" />
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none">Secured Sandbox</span>
                    </div>
                    {runtimeStatus === 'error' && (
                        <>
                             <div className="w-px h-4 bg-white/10" />
                             <div className="flex items-center gap-3">
                                <AlertTriangle size={12} className="text-red-500 animate-bounce" />
                                <span className="text-[10px] font-black text-red-400 uppercase tracking-widest leading-none">Diagnostic Required</span>
                             </div>
                        </>
                    )}
                 </div>
                 <div className="flex items-center gap-6 px-6 py-3 bg-black/60 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-3xl">
                    <div className="flex items-center gap-3">
                        <Activity size={14} className="text-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Neural Link Active</span>
                    </div>
                    <div className="w-px h-4 bg-white/10" />
                    <div className="flex items-center gap-3">
                        <Layers size={14} className="text-blue-400" />
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">{activeFile.language}</span>
                    </div>
                 </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className={cn(
                  "absolute inset-0 flex flex-col bg-white overflow-hidden shadow-2xl transition-all duration-700",
                  isMobile ? "m-0 rounded-none" : "m-6 rounded-[2.5rem] border border-white/20"
              )}
            >
              {/* Preview Controls Overlay */}
              <div className="absolute top-6 right-6 z-40 flex items-center gap-3">
                 <div className="flex items-center bg-black/80 backdrop-blur-3xl rounded-2xl border border-white/10 p-1 shadow-2xl">
                    <button 
                      onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="text-[9px] font-black tracking-widest text-white px-2 cursor-pointer hover:text-blue-400 transition-colors" onClick={() => setZoomLevel(100)}>
                      {zoomLevel}%
                    </span>
                    <button 
                      onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))}
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                    >
                      <ChevronRight size={16} />
                    </button>
                 </div>

                <button 
                  onClick={() => setShowConsole(!showConsole)}
                  className={cn(
                    "p-3 rounded-2xl backdrop-blur-3xl border transition-all duration-500 shadow-2xl active:scale-90",
                    showConsole 
                      ? "bg-blue-600 border-blue-400 text-white shadow-blue-500/20" 
                      : "bg-black/80 border-white/10 text-white hover:bg-black"
                  )}
                >
                  <Terminal size={18} />
                </button>
              </div>

              {/* Status Indicator for Preview */}
              <div className="absolute top-6 left-6 z-40">
                <div className="flex items-center gap-3 px-4 py-2 bg-black/80 backdrop-blur-3xl rounded-xl border border-white/10 shadow-2xl">
                  <div className={cn(
                    "w-2 h-2 rounded-full shadow-[0_0_10px_currentColor]",
                    runtimeStatus === 'error' ? "text-red-500 bg-red-500" : 
                    runtimeStatus === 'running' ? "text-blue-500 bg-blue-500 animate-pulse" : 
                    "text-emerald-500 bg-emerald-500"
                  )} />
                  <span className="text-[9px] font-black tracking-[0.2em] text-white uppercase">
                    {runtimeStatus === 'idle' ? 'VAYU_AGI_STABLE' : runtimeStatus.toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div className="flex-1 w-full relative overflow-auto bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat">
                <div 
                  className="w-full h-full transition-transform duration-500 origin-top-left"
                  style={{ transform: `scale(${zoomLevel / 100})` }}
                >
                  <iframe
                    ref={iframeRef}
                    title="Vayu Preview"
                    className="w-full h-full border-none shadow-inner"
                    sandbox="allow-scripts allow-forms allow-modals allow-popups allow-same-origin"
                  />
                </div>
              </div>
              
              <AnimatePresence>
                {showConsole && (
                  <motion.div 
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className={cn(
                        "absolute bottom-0 left-0 right-0 bg-[#080b12]/98 backdrop-blur-3xl border-t border-white/10 flex flex-col z-[50] shadow-[0_-20px_50px_rgba(0,0,0,0.5)]",
                        isMobile ? "h-2/3" : "h-[45%] rounded-t-[2.5rem]"
                    )}
                  >
                    <div className="h-14 border-b border-white/5 flex items-center justify-between px-8 bg-white/5 shrink-0">
                      <div className="flex items-center gap-3">
                        <Terminal size={14} className="text-blue-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400">Vayu AGI Nexus Console</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={clearLogs}
                          className="text-[9px] font-black text-gray-500 hover:text-white uppercase tracking-widest transition-colors flex items-center gap-2"
                        >
                          <RefreshCw size={12} /> Clear
                        </button>
                        <div className="w-px h-4 bg-white/10" />
                        <button onClick={() => setShowConsole(false)} className="p-2 text-gray-500 hover:text-white transition-colors bg-white/5 rounded-lg border border-white/10">
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-8 font-mono text-[11px] space-y-4 custom-scrollbar no-scrollbar">
                      {logs.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center opacity-30 gap-6">
                            <Activity size={40} className="text-blue-500" />
                            <div className="text-[10px] font-black uppercase tracking-[0.5em] text-center max-w-xs leading-relaxed italic">
                              Awaiting neural execution events from Vayu Core...
                            </div>
                        </div>
                      )}
                      {logs.map((log, i) => (
                        <motion.div 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          key={i} 
                          className={cn(
                             "flex gap-6 p-4 rounded-2xl border transition-all hover:bg-white/5",
                             log.type === 'ERROR' ? "bg-red-500/10 border-red-500/20 text-red-300 shadow-[0_0_20px_rgba(239,68,68,0.05)]" : "bg-white/[0.02] border-white/5 text-blue-100/70"
                          )}
                        >
                          <span className="opacity-30 text-[9px] font-black mt-1 tabular-nums">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' })}
                          </span>
                          <span className="leading-relaxed font-medium break-all whitespace-pre-wrap flex-1">{log.content}</span>
                        </motion.div>
                      ))}
                    </div>

                    <div className="h-10 border-t border-white/5 bg-black/40 px-8 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-4 text-[8px] font-black text-gray-600 tracking-widest uppercase">
                            <span>Status: Linked</span>
                            <div className="w-1 h-1 rounded-full bg-emerald-500" />
                            <span>Latency: 2ms</span>
                        </div>
                        <div className="text-[8px] font-black text-gray-600 tracking-widest uppercase">
                            Total Events: {logs.length}
                        </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
