import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { Preview } from './components/Preview';
import { AIModel, ChatMessage, FileEntry, MODEL_LIST, DiagnosticReport } from './types';
import { 
  Code2, 
  MessageSquare, 
  Download, 
  Zap, 
  FolderTree,
  Send,
  BrainCircuit,
  Terminal,
  Layers,
  Sparkles,
  Plus,
  Trash2,
  ChevronDown,
  Activity,
  ShieldAlert,
  Copy,
  Check,
  RefreshCw,
  Box,
  FileCode,
  Globe,
  FileJson,
  MonitorPlay
} from 'lucide-react';

const getFileIcon = (path: string) => {
  const ext = path.split('.').pop()?.toLowerCase();
  if (ext === 'html') return <Globe size={18} className="text-orange-400" />;
  if (ext === 'json') return <FileJson size={18} className="text-yellow-400" />;
  if (ext === 'css') return <Box size={18} className="text-pink-400" />;
  if (['ts', 'tsx', 'js', 'jsx'].includes(ext || '')) return <FileCode size={18} className="text-blue-400" />;
  return <Code2 size={18} className="text-slate-400" />;
};

const VayuLogo = ({ active }: { active: boolean }) => (
  <div className="relative flex items-center justify-center w-10 h-10 group cursor-pointer">
    <svg viewBox="0 0 100 100" className={`w-full h-full transition-all duration-1000 ${active ? 'scale-110 rotate-[360deg]' : 'group-hover:scale-110'}`}>
      <defs>
        <linearGradient id="vayuGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      <path 
        d="M25 25 L50 80 L75 25" 
        fill="none" 
        stroke="url(#vayuGrad)" 
        strokeWidth="10" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        style={{ filter: 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.4))' }}
      />
      <circle cx="50" cy="80" r="5" fill="#fff" className={active ? 'animate-ping' : ''} />
    </svg>
    {active && <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full animate-pulse" />}
  </div>
);

const ChatCodeBlock: React.FC<{ 
  code: string; 
  language: string; 
  filePath?: string;
  onApply: (path: string, content: string) => void;
  onRefine: (code: string) => void;
}> = ({ code, language, filePath, onApply, onRefine }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="group/code relative my-5 rounded-2xl overflow-hidden border border-white/10 bg-[#0d1117]/80 shadow-2xl transition-all hover:border-blue-500/40">
      <div className="flex items-center justify-between px-5 py-3 bg-white/[0.03] border-b border-white/5 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{language}</div>
          {filePath && <div className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 truncate max-w-[160px]">{filePath}</div>}
        </div>
        <div className="flex items-center gap-2 opacity-0 group-hover/code:opacity-100 transition-opacity duration-300">
          <button onClick={handleCopy} className="p-2 hover:bg-white/10 rounded-xl text-slate-400 transition-colors">
            {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
          </button>
          <button onClick={() => onRefine(code)} className="p-2 hover:bg-white/10 rounded-xl text-slate-400 transition-colors" title="Refine logic">
            <RefreshCw size={14} />
          </button>
          {filePath && (
            <button 
              onClick={() => onApply(filePath, code)} 
              className="ml-2 flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black rounded-xl transition-all active:scale-95 shadow-lg shadow-blue-500/30"
            >
              <Zap size={14} className="fill-current" />
              APPLY
            </button>
          )}
        </div>
      </div>
      <div className="p-6 overflow-x-auto custom-scrollbar bg-black/20">
        <pre className="text-[13px] leading-relaxed font-fira text-slate-300 selection:bg-blue-500/30"><code>{code}</code></pre>
      </div>
    </div>
  );
};

const INITIAL_FILES: FileEntry[] = [
  {
    path: 'index.html',
    language: 'html',
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background: #05070a; color: #f8fafc; font-family: 'Inter', sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; overflow: hidden; }
    .glass { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(40px); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 3rem; padding: 5rem; text-align: center; box-shadow: 0 50px 100px -20px rgba(0,0,0,0.7); }
    h1 { font-size: 5rem; font-weight: 900; background: linear-gradient(to right, #60a5fa, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: -0.05em; }
    .status { margin-top: 1.5rem; color: #64748b; font-size: 0.875rem; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; }
  </style>
</head>
<body>
  <div class="glass">
    <h1>VAYU OS</h1>
    <div class="status">Neural Core Synchronized</div>
  </div>
</body>
</html>`
  }
];

const App: React.FC = () => {
  const [files, setFiles] = useState<FileEntry[]>(INITIAL_FILES);
  const [activeFilePath, setActiveFilePath] = useState<string>('index.html');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeModel, setActiveModel] = useState<AIModel>(AIModel.GPT_4O);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [activeSidebarTab, setActiveSidebarTab] = useState<'chat' | 'files'>('chat');
  const [currentStatus, setCurrentStatus] = useState<'analyzing' | 'coding' | 'diagnosing' | 'idle'>('idle');
  const [terminalLogs, setTerminalLogs] = useState<string[]>(['[VAYU] Kernel Handshake Complete.', '[VAYU] Cloud Shell Ready.']);
  const [debouncedBundledCode, setDebouncedBundledCode] = useState('');
  const [lastDiagnostic, setLastDiagnostic] = useState<DiagnosticReport | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeFile = useMemo(() => files.find(f => f.path === activeFilePath) || files[0], [files, activeFilePath]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsModelDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Neural Bundler: Combines project files into a single previewable stream
  useEffect(() => {
    if (activeFile.path.endsWith('.py')) {
      setDebouncedBundledCode(activeFile.content);
      return;
    }
    const htmlFile = files.find(f => f.path === 'index.html');
    let content = htmlFile ? htmlFile.content : `<!DOCTYPE html><html><body><div id="root"></div></body></html>`;
    const styles = files.filter(f => f.path.endsWith('.css')).map(f => `<style data-path="${f.path}">${f.content}</style>`).join('\n');
    const scripts = files.filter(f => f.path.endsWith('.js') || f.path.endsWith('.ts') || f.path.endsWith('.tsx') || f.path.endsWith('.jsx')).map(f => {
      const isReactOrTS = f.path.endsWith('.ts') || f.path.endsWith('.tsx') || f.path.endsWith('.jsx');
      return `<script type="${isReactOrTS ? 'text/babel' : 'module'}" ${isReactOrTS ? 'data-presets="react,typescript"' : ''} data-path="${f.path}">${f.content}</script>`;
    }).join('\n');
    
    if (content.includes('</head>')) content = content.replace('</head>', `${styles}\n</head>`);
    if (content.includes('</body>')) content = content.replace('</body>', `${scripts}\n</body>`);

    const handler = setTimeout(() => setDebouncedBundledCode(content), 100); 
    return () => clearTimeout(handler);
  }, [files, activeFile]);

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  const addLog = useCallback((msg: string) => {
    setTerminalLogs(prev => [...prev.slice(-15), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  }, []);

  const applyFileChange = useCallback((path: string, content: string) => {
    setFiles(prev => {
      const idx = prev.findIndex(f => f.path === path);
      const cleanContent = content.trim();
      if (idx !== -1) {
        if (prev[idx].content === cleanContent) return prev;
        const next = [...prev];
        next[idx] = { ...next[idx], content: cleanContent };
        return next;
      }
      return [...prev, { path, content: cleanContent, language: path.split('.').pop() || 'plaintext' }];
    });
  }, []);

  const handleSendMessage = async (forceDiagnostic = false) => {
    const textToProcess = forceDiagnostic ? "NEURAL_DIAGNOSTIC_RUN: Full project audit requested. Analyze runtime status and synthesize optimized patches." : userInput;
    if (!textToProcess.trim() || isGenerating) return;
    
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: textToProcess, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setUserInput('');
    setIsGenerating(true);
    setCurrentStatus(forceDiagnostic ? 'diagnosing' : 'analyzing');

    const assistantId = (Date.now() + 1).toString();
    const assistantMsg: ChatMessage = { id: assistantId, role: 'assistant', content: '', model: activeModel, timestamp: Date.now(), isStreaming: true };
    setMessages(prev => [...prev, assistantMsg]);

    try {
      const workspaceContext = files.map(f => `[FILE: ${f.path}]\n${f.content}`).join('\n\n');
      const diagContext = forceDiagnostic && lastDiagnostic ? `RUNTIME_FAULTS:\n${lastDiagnostic.error}\nTRACE:\n${lastDiagnostic.logs.join('\n')}` : '';

      const systemPrompt = `You are VAYU_NEURAL_IDE. An expert browser-software architect.
      
      CONTEXT:
      ${workspaceContext}
      ${diagContext}

      GOAL: Synthesize high-quality, professional code based on user commands.
      
      SYNTHESIS RULES:
      1. To update or create files, output: [FILE: path] followed by a code block.
      2. If modifying a file, output its ENTIRE new content.
      3. Use top-tier design: Tailwind CSS, Glassmorphism, smooth animations.
      4. Auto-patching is active. Your output is rendered LIVE in the editor.`;

      const response = await window.puter.ai.chat(
        `${systemPrompt}\n\nUSER_COMMAND: ${textToProcess}`,
        { 
          model: activeModel, 
          stream: true 
        }
      );

      let fullContent = '';
      for await (const chunk of response) {
        const text = typeof chunk === 'string' ? chunk : (chunk?.text || chunk?.message?.content || "");
        if (text) {
          fullContent += text;
          setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: fullContent } : m));

          // Neural stream analyzer for file synthesis
          const fileRegex = /\[FILE:\s*([a-zA-Z0-9._\-/]+)\]\s*```[a-z]*\n([\s\S]*?)(?:```|$)/g;
          let match;
          while ((match = fileRegex.exec(fullContent)) !== null) {
            const path = match[1].trim();
            const content = match[2].trim();
            if (content.length > 5) {
              applyFileChange(path, content);
            }
          }
        }
      }
      setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, isStreaming: false, status: 'idle' } : m));
      addLog(`Synthesis Successful: ${activeModel.toUpperCase()}`);
    } catch (err: any) {
      addLog(`AI_FAULT: ${err.message}`);
      setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, isStreaming: false, error: err.message } : m));
    } finally {
      setIsGenerating(false);
      setCurrentStatus('idle');
    }
  };

  const renderMessageContent = (msg: ChatMessage) => {
    const parts = msg.content.split(/```/);
    return parts.map((part, i) => {
      if (i % 2 === 0) return <div key={i} className="whitespace-pre-wrap leading-relaxed opacity-90">{part}</div>;
      const lines = part.split('\n');
      const langMatch = lines[0].trim();
      const code = lines.slice(1).join('\n').trim();
      const prevPart = parts[i-1] || "";
      const fileMatch = prevPart.match(/\[FILE:\s*([a-zA-Z0-9._\-/]+)\]/);
      const filePath = fileMatch ? fileMatch[1] : undefined;

      return (
        <ChatCodeBlock 
          key={i} 
          code={code} 
          language={langMatch || 'text'} 
          filePath={filePath}
          onApply={applyFileChange}
          onRefine={(snip) => { setUserInput(`Optimize this synthesis module:\n\n\`\`\`\n${snip}\n\`\`\`\n`); setActiveSidebarTab('chat'); }}
        />
      );
    });
  };

  return (
    <div className="flex h-screen w-full bg-[#05070a] text-slate-200 overflow-hidden font-inter selection:bg-blue-500/30">
      {/* Activity HUD Bar */}
      <div className="w-16 flex flex-col items-center py-10 bg-[#080b10] border-r border-white/5 gap-12 z-[60]">
        <VayuLogo active={isGenerating} />
        <div className="flex flex-col gap-10">
          <button onClick={() => setActiveSidebarTab('chat')} className={`p-3.5 rounded-2xl transition-all relative ${activeSidebarTab === 'chat' ? 'text-blue-400 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.1)]' : 'text-slate-600 hover:text-slate-400'}`}>
            <MessageSquare size={24} />
            {activeSidebarTab === 'chat' && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-l-full shadow-[0_0_15px_#3b82f6]" />}
          </button>
          <button onClick={() => setActiveSidebarTab('files')} className={`p-3.5 rounded-2xl transition-all relative ${activeSidebarTab === 'files' ? 'text-blue-400 bg-blue-500/10' : 'text-slate-600 hover:text-slate-400'}`}>
            <FolderTree size={24} />
            {activeSidebarTab === 'files' && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-l-full shadow-[0_0_15px_#3b82f6]" />}
          </button>
        </div>
        <div className="mt-auto pb-8 flex flex-col gap-10">
          <button onClick={() => handleSendMessage(true)} className="p-3 text-slate-600 hover:text-rose-500 transition-colors" title="System Audit">
            <ShieldAlert size={24} className={lastDiagnostic?.error ? 'animate-pulse text-rose-500' : ''} />
          </button>
          <button onClick={() => window.location.reload()} className="p-3 text-slate-600 hover:text-blue-400 transition-colors" title="Kernel Restart">
            <RefreshCw size={24} />
          </button>
        </div>
      </div>

      {/* Control Sidebar */}
      <div className="w-[420px] flex flex-col bg-[#0b0e14] border-r border-white/5 relative z-50 shadow-2xl">
        <div className="h-20 px-8 border-b border-white/5 flex items-center justify-between bg-black/20 backdrop-blur-3xl">
          <span className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500 flex items-center gap-3">
            {activeSidebarTab === 'chat' ? <BrainCircuit size={18} className="text-blue-500" /> : <Layers size={18} className="text-indigo-500" />}
            {activeSidebarTab === 'chat' ? 'Neural Core' : 'Project Hierarchy'}
          </span>
          {activeSidebarTab === 'chat' && (
            <div className="relative" ref={dropdownRef}>
              <button onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)} className="flex items-center gap-2.5 bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-[10px] font-bold text-slate-300 hover:bg-white/10 hover:border-blue-500/30 transition-all">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: MODEL_LIST.find(m => m.id === activeModel)?.color }}></div>
                {MODEL_LIST.find(m => m.id === activeModel)?.name}
                <ChevronDown size={14} className={`transition-transform duration-300 ${isModelDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {isModelDropdownOpen && (
                <div className="absolute right-0 mt-4 w-72 glass-panel rounded-2xl shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-3 border-white/10">
                  {MODEL_LIST.map((m) => (
                    <button key={m.id} onClick={() => { setActiveModel(m.id); setIsModelDropdownOpen(false); addLog(`Neural alignment shifted: ${m.name}`); }} className={`w-full flex flex-col gap-1.5 px-6 py-5 text-left hover:bg-white/5 transition-colors border-l-2 ${activeModel === m.id ? 'bg-blue-500/5 border-blue-500' : 'border-transparent'}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-bold">{m.name}</span>
                        <span className={`text-[9px] px-2.5 py-0.5 rounded-full uppercase font-black ${m.status === 'optimal' ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400 bg-white/5'}`}>{m.status}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest">{m.capability} Synthesis</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-hidden relative">
          {activeSidebarTab === 'chat' ? (
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar pb-48">
                {messages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center px-12 py-16 opacity-30">
                    <Sparkles size={48} className="mb-8 text-blue-500 animate-float" />
                    <p className="text-sm font-medium leading-relaxed uppercase tracking-widest leading-loose">Synthesis Engine Online.<br/>Define project scope.</p>
                  </div>
                )}
                {messages.map(msg => (
                  <div key={msg.id} className={`flex flex-col gap-3 ${msg.role === 'user' ? 'items-end' : 'items-start animate-in fade-in slide-in-from-bottom-2'}`}>
                    <div className={`max-w-[98%] p-6 rounded-3xl text-[13px] border ${msg.role === 'user' ? 'bg-blue-600 text-white border-blue-500/50 shadow-xl shadow-blue-500/15' : 'bg-white/[0.04] text-slate-200 border-white/5 backdrop-blur-md'}`}>
                      {renderMessageContent(msg)}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#0b0e14] via-[#0b0e14] to-transparent">
                <div className="bg-[#161b24]/95 backdrop-blur-3xl border border-white/10 rounded-2xl p-6 shadow-2xl focus-within:border-blue-500/50 transition-all">
                  <textarea 
                    value={userInput} 
                    onChange={(e) => setUserInput(e.target.value)} 
                    onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }} 
                    placeholder="Describe synthesis target..." 
                    className="w-full bg-transparent outline-none resize-none text-[13px] min-h-[60px] max-h-[180px] custom-scrollbar leading-relaxed" 
                  />
                  <div className="flex justify-between items-center mt-5 pt-5 border-t border-white/5">
                    <div className="flex items-center gap-4 text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">
                      <Activity size={14} className={isGenerating ? 'animate-spin text-blue-500' : ''} />
                      {currentStatus}
                    </div>
                    <button onClick={() => handleSendMessage()} disabled={isGenerating || !userInput.trim()} className="p-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-20 rounded-xl text-white shadow-2xl active:scale-95 transition-all">
                      <Send size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="p-6 flex justify-between items-center border-b border-white/5 bg-white/[0.01]">
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Workspace Artifacts</span>
                <button onClick={() => {
                  const name = window.prompt("Synthesis Object Identifier:");
                  if (name) applyFileChange(name, "");
                }} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5"><Plus size={18} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {files.map(file => (
                  <div key={file.path} className="group relative">
                    <button onClick={() => setActiveFilePath(file.path)} className={`w-full flex items-center gap-5 px-6 py-5 rounded-2xl text-xs transition-all border ${activeFilePath === file.path ? 'bg-blue-500/10 border-blue-500/40 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.08)]' : 'border-transparent text-slate-500 hover:bg-white/5'}`}>
                      {getFileIcon(file.path)}
                      <span className="flex-1 text-left truncate font-bold tracking-tight">{file.path}</span>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setFiles(f => f.filter(fi => fi.path !== file.path)); }} className="absolute right-5 top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover:opacity-100 hover:text-rose-500 text-slate-600 bg-[#0b0e14] rounded-xl shadow-lg transition-all"><Trash2 size={18} /></button>
                  </div>
                ))}
              </div>
              <div className="h-56 bg-black/60 border-t border-white/5 p-6 font-mono text-[11px] text-slate-500 overflow-y-auto custom-scrollbar">
                <div className="flex items-center gap-3 mb-4 text-slate-600 font-bold uppercase tracking-widest border-b border-white/5 pb-3"><Terminal size={16} /> SHELL_OUTPUT</div>
                {terminalLogs.map((log, i) => <div key={i} className="py-1 opacity-80 leading-relaxed font-mono">{log}</div>)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Synthesis Workspace */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#05070a]">
        <div className="h-20 px-10 flex items-center justify-between border-b border-white/5 bg-[#0b0e14]/70 backdrop-blur-3xl relative z-40">
          <div className="flex items-center gap-8">
            <span className="text-[11px] font-black text-blue-400 uppercase bg-blue-500/10 px-4 py-2 rounded-xl border border-blue-500/20 shadow-inner">{activeFile.language}</span>
            <span className="text-sm font-bold text-slate-300 tracking-tight flex items-center gap-4">
               <div className="w-1.5 h-4 bg-blue-500/40 rounded-full" />
               {activeFile.path}
            </span>
          </div>
          <div className="flex items-center gap-8">
             <div className="flex items-center gap-4 text-[11px] font-black text-emerald-500 uppercase tracking-widest px-5 py-2.5 bg-emerald-500/5 rounded-full border border-emerald-500/10 shadow-[0_0_25px_rgba(16,185,129,0.06)]">
               <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_12px_#10b981] animate-pulse"></div>
               KERNEL_READY
             </div>
             <button onClick={() => {
                const zip = new window.JSZip();
                files.forEach(f => zip.file(f.path, f.content));
                zip.generateAsync({type:"blob"}).then(c => {
                   const url = URL.createObjectURL(c);
                   const a = document.createElement('a'); a.href = url; a.download = 'vayu-project-synthesis.zip'; a.click();
                });
             }} className="p-3.5 hover:bg-white/5 rounded-2xl text-slate-500 transition-all active:scale-90"><Download size={26} /></button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* EDITOR FRAME */}
          <div className="flex-1 border-r border-white/5 relative bg-[#0b0e14]/40">
            <Editor 
              height="100%"
              path={activeFile.path}
              language={activeFile.language}
              theme="vs-dark"
              value={activeFile.content}
              options={{ 
                minimap: { enabled: false }, 
                fontSize: 14, 
                fontFamily: "'Fira Code', monospace", 
                automaticLayout: true,
                padding: { top: 40 },
                lineNumbers: 'on',
                renderLineHighlight: 'all',
                cursorSmoothCaretAnimation: 'on',
                smoothScrolling: true,
                bracketPairColorization: { enabled: true },
                readOnly: isGenerating,
                scrollbar: { vertical: 'hidden', horizontal: 'hidden' }
              }}
              onChange={(val) => { if (!isGenerating) setFiles(prev => prev.map(f => f.path === activeFile.path ? { ...f, content: val || '' } : f)); }}
            />
          </div>
          {/* PREVIEW FRAME */}
          <div className="flex-1 bg-white relative overflow-hidden">
            <Preview 
              code={debouncedBundledCode} 
              isGenerating={isGenerating} 
              messages={messages}
              activeLanguage={activeFile.path.endsWith('.py') ? 'python' : 'web'} 
              onDiagnosticUpdate={setLastDiagnostic}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;