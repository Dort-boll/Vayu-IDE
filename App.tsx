
import * as React from 'react';
import Editor from '@monaco-editor/react';
import { Preview } from './components/Preview';
import { AIModel, ChatMessage, FileEntry } from './types';
import { GoogleGenAI } from "@google/genai";
import { 
  Code2, 
  MessageSquare, 
  Download, 
  Settings, 
  Zap, 
  FolderTree,
  Send,
  Cpu,
  BrainCircuit,
  Terminal,
  Layers,
  Sparkles
} from 'lucide-react';

const { useState, useEffect, useRef, useMemo, useCallback } = React;

const INITIAL_FILES: FileEntry[] = [
  {
    path: 'index.html',
    language: 'html',
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { 
      background: radial-gradient(circle at top right, #0a0e14, #05070a); 
      color: #f8fafc; 
      font-family: 'Inter', sans-serif; 
      height: 100vh; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      margin: 0; 
      overflow: hidden;
    }
    .hero-container {
      text-align: center;
      animation: fadeIn 1s ease-out;
    }
    h1 {
      font-size: 5rem;
      font-weight: 900;
      letter-spacing: -0.05em;
      background: linear-gradient(to bottom right, #fff, #64748b);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin: 0;
    }
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: rgba(59, 130, 246, 0.1);
      border: 1px solid rgba(59, 130, 246, 0.2);
      border-radius: 100px;
      font-size: 0.75rem;
      font-weight: 600;
      color: #60a5fa;
      margin-bottom: 2rem;
    }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  </style>
</head>
<body>
  <div class="hero-container">
    <div class="status-badge"><div class="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div> SYSTEM READY</div>
    <h1>VAYU CODE</h1>
    <p style="color: #64748b; font-size: 1.125rem; margin-top: 1rem; font-weight: 400;">Describe your vision to begin synthesis.</p>
  </div>
</body>
</html>`
  }
];

const App: React.FC = () => {
  const [files, setFiles] = useState<FileEntry[]>(INITIAL_FILES);
  const [activeFilePath, setActiveFilePath] = useState<string>('index.html');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeModel, setActiveModel] = useState<string>(AIModel.GEMINI_FLASH);
  const [activeSidebarTab, setActiveSidebarTab] = useState<'chat' | 'files'>('chat');
  const [currentStatus, setCurrentStatus] = useState<'analyzing' | 'coding' | 'idle'>('idle');
  const [streamingFile, setStreamingFile] = useState<string | null>(null);
  const [debouncedBundledCode, setDebouncedBundledCode] = useState('');
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  const activeFile = useMemo(() => files.find(f => f.path === activeFilePath) || files[0], [files, activeFilePath]);

  const rawBundledCode = useMemo(() => {
    if (activeFile.path.endsWith('.py')) return activeFile.content;
    const htmlFile = files.find(f => f.path === 'index.html');
    let content = htmlFile ? htmlFile.content : `<!DOCTYPE html><html><head><script src="https://cdn.tailwindcss.com"></script></head><body><div id="root"></div></body></html>`;
    
    const styles = files.filter(f => f.path.endsWith('.css')).map(f => `<style data-path="${f.path}">${f.content}</style>`).join('\n');
    const scripts = files.filter(f => f.path.endsWith('.js') || f.path.endsWith('.ts') || f.path.endsWith('.tsx')).map(f => {
      const isReactOrTS = f.path.endsWith('.ts') || f.path.endsWith('.tsx');
      return `<script type="${isReactOrTS ? 'text/babel' : 'module'}" ${isReactOrTS ? 'data-presets="react,typescript"' : ''} data-path="${f.path}">${f.content}</script>`;
    }).join('\n');
    
    if (content.includes('</head>')) content = content.replace('</head>', `${styles}\n</head>`);
    if (content.includes('</body>')) content = content.replace('</body>', `${scripts}\n</body>`);
    return content;
  }, [files, activeFile]);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedBundledCode(rawBundledCode), 400); 
    return () => clearTimeout(handler);
  }, [rawBundledCode]);

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  const handleDownload = async () => {
    if (!window.JSZip) return;
    const zip = new window.JSZip();
    files.forEach(f => zip.file(f.path, f.content));
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vayu-project.zip`;
    a.click();
  };

  const parseAndApplyFiles = useCallback((text: string) => {
    const fileRegex = /\[FILE:\s*([a-zA-Z0-9._\-/]+)\]\s*```[a-z]*\n([\s\S]*?)(?:```|$)/g;
    let match;
    let lastPath: string | null = null;

    setFiles(currentFiles => {
      let nextFiles = [...currentFiles];
      let hasChanges = false;

      while ((match = fileRegex.exec(text)) !== null) {
        const path = match[1].trim();
        const content = match[2].trim();
        lastPath = path;

        const idx = nextFiles.findIndex(f => f.path === path);
        if (idx !== -1) {
          if (nextFiles[idx].content !== content) {
            nextFiles[idx] = { ...nextFiles[idx], content };
            hasChanges = true;
          }
        } else {
          nextFiles.push({
            path, content,
            language: path.endsWith('.py') ? 'python' : 
                      (path.endsWith('.tsx') || path.endsWith('.ts')) ? 'typescript' : 
                      path.split('.').pop() || 'plaintext'
          });
          hasChanges = true;
        }
      }
      return hasChanges ? nextFiles : currentFiles;
    });

    if (lastPath && lastPath !== streamingFile) {
      setStreamingFile(lastPath);
      setActiveFilePath(lastPath);
    }
  }, [streamingFile]);

  const handleSendMessage = async () => {
    if (!prompt.trim() || isGenerating) return;
    
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: prompt, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setPrompt('');
    setIsGenerating(true);
    setCurrentStatus('analyzing');

    const assistantId = (Date.now() + 1).toString();
    const assistantMsg: ChatMessage = { id: assistantId, role: 'assistant', content: '', model: activeModel, timestamp: Date.now(), isStreaming: true };
    setMessages(prev => [...prev, assistantMsg]);

    try {
      const systemInstruction = `You are VAYU ARCHITECT, an elite neural IDE engine.
      
      PHASE 1: ARCHITECTURAL ANALYSIS
      Based on the user's request, you must first determine the optimal technology stack:
      - For logic, algorithms, or data processing: Use Python (.py).
      - For interactive UIs, dashboards, or web apps: Use React (TSX), Tailwind CSS, and Lucide Icons.
      - For 3D or high-performance graphics: Use Three.js.
      - DO NOT combine frameworks unnecessarily. Keep it efficient and targeted.

      PHASE 2: SYNTHESIS PROTOCOL
      First, state your architectural choices (e.g., "I will build this using React and Tailwind for a modern glassmorphic UI").
      Then, output the files in this EXACT format:
      
      [FILE: path/to/file.ext]
      \`\`\`language
      CONTENT
      \`\`\`

      Current Workspace:
      ${files.map(f => `- ${f.path}`).join('\n')}
      
      User Request: ${userMsg.content}`;

      let fullContent = '';

      if (activeModel.startsWith('gemini')) {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const result = await ai.models.generateContentStream({
          model: activeModel,
          contents: [{ role: 'user', parts: [{ text: systemInstruction }] }]
        });
        
        for await (const chunk of result) {
          const text = chunk.text;
          if (text) {
            fullContent += text;
            setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: fullContent, status: fullContent.includes('[FILE:') ? 'coding' : 'analyzing' } : m));
            parseAndApplyFiles(fullContent);
            if (fullContent.includes('[FILE:')) setCurrentStatus('coding');
          }
        }
      } else {
        const response = await window.puter.ai.chat(systemInstruction, { model: activeModel, stream: true });
        for await (const chunk of response) {
          const text = typeof chunk === 'string' ? chunk : (chunk.text || chunk.message?.content || "");
          if (text) {
            fullContent += text;
            setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: fullContent, status: fullContent.includes('[FILE:') ? 'coding' : 'analyzing' } : m));
            parseAndApplyFiles(fullContent);
            if (fullContent.includes('[FILE:')) setCurrentStatus('coding');
          }
        }
      }

      setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, isStreaming: false, status: 'idle' } : m));
    } catch (err: any) {
      console.error(err);
      setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: `Synthesis Error: ${err.message}`, isStreaming: false, error: err.message } : m));
    } finally {
      setIsGenerating(false);
      setCurrentStatus('idle');
      setStreamingFile(null);
    }
  };

  const cleanDisplayContent = (content: string) => {
    return content.split(/\[FILE:/)[0].trim();
  };

  return (
    <div className="flex h-screen w-full bg-[#05070a] text-slate-200 overflow-hidden font-inter selection:bg-blue-500/30">
      {/* Activity Bar */}
      <div className="w-16 flex flex-col items-center py-6 bg-[#080b10] border-r border-white/5 gap-8 z-50">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-blue-500/20 cursor-default">V</div>
        <div className="flex flex-col gap-6">
          <button 
            onClick={() => setActiveSidebarTab('chat')} 
            className={`p-2.5 rounded-xl transition-all relative ${activeSidebarTab === 'chat' ? 'text-blue-400 bg-blue-500/10' : 'text-slate-600 hover:text-slate-400'}`}
          >
            <MessageSquare size={20} />
            {activeSidebarTab === 'chat' && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-blue-500 rounded-l-full" />}
          </button>
          <button 
            onClick={() => setActiveSidebarTab('files')} 
            className={`p-2.5 rounded-xl transition-all relative ${activeSidebarTab === 'files' ? 'text-blue-400 bg-blue-500/10' : 'text-slate-600 hover:text-slate-400'}`}
          >
            <FolderTree size={20} />
            {activeSidebarTab === 'files' && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-blue-500 rounded-l-full" />}
          </button>
        </div>
        <div className="mt-auto flex flex-col gap-6 pb-4">
          <button onClick={handleDownload} className="p-2.5 rounded-xl text-slate-600 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all">
            <Download size={20} />
          </button>
          <Settings size={20} className="text-slate-600 hover:text-slate-400 cursor-pointer" />
        </div>
      </div>

      {/* Sidebar Panel */}
      <div className="w-[400px] flex flex-col bg-[#0b0e14] border-r border-white/5 overflow-hidden">
        <div className="h-16 px-6 border-b border-white/5 flex items-center justify-between bg-[#0b0e14]/50 backdrop-blur-md">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 flex items-center gap-2">
            {activeSidebarTab === 'chat' ? <BrainCircuit size={12} className="text-blue-500" /> : <Layers size={12} className="text-indigo-500" />}
            {activeSidebarTab === 'chat' ? 'Neural Link' : 'Workspace'}
          </span>
          {activeSidebarTab === 'chat' && (
            <select 
              value={activeModel} 
              onChange={(e) => setActiveModel(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-blue-400 outline-none hover:bg-white/10 transition-all cursor-pointer font-bold appearance-none text-center min-w-[100px]"
            >
              <option value={AIModel.GEMINI_FLASH}>Gemini 2.0</option>
              <option value={AIModel.GEMINI_PRO}>Gemini 3 Pro</option>
              <option value={AIModel.CLAUDE_3_5}>Claude 3.5</option>
              <option value={AIModel.GPT_4O}>GPT-4o</option>
            </select>
          )}
        </div>

        <div className="flex-1 flex flex-col overflow-hidden relative">
          {activeSidebarTab === 'chat' ? (
            <>
              <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar pb-40">
                {messages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center px-10">
                    <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
                      <Sparkles size={32} className="text-blue-500" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-300 mb-2">Neural Workspace Ready</h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">Describe your vision. The architect will determine the optimal stack and begin code synthesis.</p>
                  </div>
                )}
                {messages.map(msg => (
                  <div key={msg.id} className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start animate-in fade-in slide-in-from-bottom-2 duration-300'}`}>
                    <div className={`max-w-[92%] p-5 rounded-2xl text-[13px] border transition-all ${
                      msg.role === 'user' ? 'bg-blue-600 text-white border-blue-400/50 shadow-lg shadow-blue-500/10' : 'bg-white/[0.03] text-slate-200 border-white/5'
                    }`}>
                      <div className="whitespace-pre-wrap leading-relaxed font-medium">
                        {msg.role === 'user' ? msg.content : cleanDisplayContent(msg.content)}
                        {msg.isStreaming && !cleanDisplayContent(msg.content) && (
                          <div className="flex gap-1 items-center">
                            <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" />
                            <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce delay-75" />
                            <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce delay-150" />
                          </div>
                        )}
                      </div>
                    </div>
                    {msg.role === 'assistant' && msg.model && (
                      <span className="text-[9px] font-black uppercase text-slate-600 ml-2 tracking-widest">{msg.model}</span>
                    )}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              
              {/* Input Area */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0b0e14] via-[#0b0e14] to-transparent z-10">
                <div className="bg-[#1a1f29] border border-white/10 rounded-2xl p-4 shadow-2xl focus-within:border-blue-500/50 transition-all">
                  <textarea 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                    placeholder="E.g., Build a real-time visualization of stock data..."
                    className="w-full bg-transparent outline-none resize-none text-[13px] min-h-[40px] max-h-[120px] placeholder:text-slate-600 font-medium"
                  />
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/5">
                    <div className="flex items-center gap-2 text-[9px] text-slate-500 font-black uppercase tracking-[0.2em]">
                      <div className={`w-2 h-2 rounded-full ${isGenerating ? 'bg-blue-500 animate-pulse' : 'bg-slate-800'}`} />
                      {currentStatus}
                    </div>
                    <button 
                      onClick={handleSendMessage}
                      disabled={isGenerating || !prompt.trim()}
                      className="p-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-20 rounded-xl transition-all text-white shadow-lg shadow-blue-500/20"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="p-4 space-y-1">
              {files.map(file => (
                <button 
                  key={file.path}
                  onClick={() => setActiveFilePath(file.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs transition-all border ${
                    activeFilePath === file.path ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'border-transparent text-slate-500 hover:bg-white/5'
                  }`}
                >
                  <Code2 size={14} className={activeFilePath === file.path ? 'text-blue-400' : 'text-slate-600'} />
                  <span className="flex-1 text-left truncate font-semibold tracking-tight">{file.path}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#05070a]">
        <div className="h-16 px-8 flex items-center justify-between bg-[#0b0e14] border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/10">
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">{activeFile.language}</span>
            </div>
            <span className="text-[12px] font-bold text-slate-400 tracking-tight">{activeFile.path}</span>
          </div>
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
               <Terminal size={14} className="text-slate-600" />
               VAYU_RUNTIME_V2
             </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Editor Container */}
          <div className="flex-1 border-r border-white/5 relative bg-[#0b0e14]">
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
                readOnly: isGenerating && streamingFile === activeFile.path,
                lineNumbers: 'on',
                renderLineHighlight: 'all',
                scrollBeyondLastLine: false,
                cursorSmoothCaretAnimation: 'on',
                smoothScrolling: true,
                padding: { top: 24, bottom: 24 }
              }}
              onChange={(val) => {
                if (!isGenerating) setFiles(prev => prev.map(f => f.path === activeFile.path ? { ...f, content: val || '' } : f));
              }}
            />
            {isGenerating && streamingFile === activeFile.path && (
              <div className="absolute top-4 right-8 z-10 flex items-center gap-2 text-[10px] font-bold text-blue-500 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-full backdrop-blur-md animate-pulse">
                <Zap size={10} className="fill-current" />
                STREAMING_CODE...
              </div>
            )}
          </div>

          {/* Preview Container */}
          <div className="flex-1 bg-white">
            <Preview 
              code={debouncedBundledCode} 
              isGenerating={isGenerating} 
              activeLanguage={activeFile.path.endsWith('.py') ? 'python' : 'web'} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
