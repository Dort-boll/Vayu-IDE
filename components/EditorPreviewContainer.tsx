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
  Cpu
} from 'lucide-react';
import { FileEntry, DiagnosticReport } from '../types';
import { cn } from '../src/lib/utils';

interface EditorPreviewContainerProps {
  files: FileEntry[];
  activeFilePath: string;
  onFileChange: (path: string, content: string) => void;
  onActiveFileChange: (path: string) => void;
  isGenerating: boolean;
  bundledCode: string;
  onDiagnosticUpdate: (report: DiagnosticReport) => void;
}

export const EditorPreviewContainer: React.FC<EditorPreviewContainerProps> = ({
  files,
  activeFilePath,
  onFileChange,
  onActiveFileChange,
  isGenerating,
  bundledCode,
  onDiagnosticUpdate
}) => {
  const [viewMode, setViewMode] = useState<'code' | 'preview'>('code');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showConsole, setShowConsole] = useState(false);
  const [logs, setLogs] = useState<{ type: 'LOG' | 'ERROR'; content: string; timestamp: number }[]>([]);
  const [runtimeStatus, setRuntimeStatus] = useState<'idle' | 'running' | 'error'>('idle');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeFile = files.find(f => f.path === activeFilePath) || files[0];

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
      iframeRef.current.srcdoc = captureScript + bundledCode;
      setRuntimeStatus('idle');
    }
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

  return (
    <div ref={containerRef} className="flex-1 flex flex-col bg-[#05070a] overflow-hidden relative">
      {/* File Tabs & View Switcher */}
      <div className="h-12 border-b border-white/5 bg-[#0b0e14] flex items-center justify-between px-4 shrink-0 z-20">
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar no-scrollbar">
          {files.map((file) => (
            <button
              key={file.path}
              onClick={() => onActiveFileChange(file.path)}
              className={cn(
                "flex items-center gap-2 px-3 h-8 rounded-lg text-xs font-medium transition-all shrink-0",
                activeFilePath === file.path 
                  ? "bg-white/10 text-white shadow-sm" 
                  : "text-gray-500 hover:bg-white/5 hover:text-gray-300"
              )}
            >
              <FileCode size={14} className={activeFilePath === file.path ? "text-blue-400" : "text-gray-500"} />
              {file.path}
            </button>
          ))}
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/10 ml-4">
          <button
            onClick={() => setViewMode('code')}
            className={cn(
              "flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
              viewMode === 'code' ? "bg-white/10 text-white shadow-lg" : "text-gray-500 hover:text-gray-300"
            )}
          >
            <Code2 size={14} />
            Code
          </button>
          <button
            onClick={() => setViewMode('preview')}
            className={cn(
              "flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
              viewMode === 'preview' ? "bg-white/10 text-white shadow-lg" : "text-gray-500 hover:text-gray-300"
            )}
          >
            <MonitorPlay size={14} />
            Preview
          </button>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {viewMode === 'code' ? (
            <motion.div
              key="code"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex flex-col"
            >
              <Editor
                height="100%"
                language={activeFile.language}
                value={activeFile.content}
                onChange={(val) => onFileChange(activeFilePath, val || '')}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  fontFamily: "'JetBrains Mono', monospace",
                  lineNumbers: 'on',
                  roundedSelection: true,
                  scrollBeyondLastLine: false,
                  readOnly: isGenerating,
                  automaticLayout: true,
                  padding: { top: 20, bottom: 20 },
                  cursorStyle: 'line',
                  cursorBlinking: 'smooth',
                  smoothScrolling: true,
                  contextmenu: false,
                }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex flex-col bg-white"
            >
              <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
                <button 
                  onClick={() => setShowConsole(!showConsole)}
                  className={cn(
                    "p-2 rounded-xl backdrop-blur-md border transition-all",
                    showConsole 
                      ? "bg-blue-500/20 border-blue-500/50 text-blue-600" 
                      : "bg-white/80 border-gray-200 text-gray-500 hover:bg-white shadow-sm"
                  )}
                  title="Toggle Console"
                >
                  <Terminal size={16} />
                </button>
                <button 
                  onClick={toggleFullscreen}
                  className="p-2 rounded-xl bg-white/80 backdrop-blur-md border border-gray-200 text-gray-500 hover:bg-white shadow-sm transition-all"
                  title="Fullscreen"
                >
                  {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
              </div>
              
              <iframe
                ref={iframeRef}
                title="Preview"
                className="w-full h-full border-none"
                sandbox="allow-scripts allow-forms allow-modals allow-popups allow-same-origin"
              />
              
              {/* Console Overlay */}
              <AnimatePresence>
                {showConsole && (
                  <motion.div 
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    className="absolute bottom-0 left-0 right-0 h-1/3 bg-[#0b0e14]/95 backdrop-blur-xl border-t border-white/10 flex flex-col z-40 shadow-2xl"
                  >
                    <div className="h-10 border-b border-white/5 flex items-center justify-between px-4 bg-white/5 shrink-0">
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        <Terminal size={12} />
                        Debug Console
                      </div>
                      <button onClick={() => setShowConsole(false)} className="text-gray-500 hover:text-white transition-colors">
                        <X size={16} />
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-2 custom-scrollbar">
                      {logs.length === 0 && <div className="text-gray-600 italic">No output detected...</div>}
                      {logs.map((log, i) => (
                        <div key={i} className={cn(
                          "flex gap-3 p-2 rounded-lg border",
                          log.type === 'ERROR' 
                            ? "text-red-400 bg-red-500/5 border-red-500/20" 
                            : "text-gray-300 bg-white/5 border-white/5"
                        )}>
                          <span className="opacity-30 shrink-0 font-bold">{new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}</span>
                          <span className="whitespace-pre-wrap">{log.content}</span>
                        </div>
                      ))}
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
