
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { Preview } from './components/Preview';
import { AIModel, ChatMessage, FileEntry } from './types';

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
      background: #0b0e14;
      color: #f8fafc;
      font-family: 'Inter', sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
      overflow: hidden;
    }
    .hero {
      text-align: center;
      padding: 5rem;
      border-radius: 5rem;
      background: rgba(255, 255, 255, 0.01);
      backdrop-filter: blur(80px);
      border: 1px solid rgba(255, 255, 255, 0.05);
      box-shadow: 0 60px 120px -30px rgba(0, 0, 0, 0.95);
      transition: all 1s cubic-bezier(0.2, 1, 0.3, 1);
    }
    .hero:hover {
      background: rgba(255, 255, 255, 0.03);
      border-color: rgba(59, 130, 246, 0.3);
      transform: scale(1.02);
    }
    .logo {
      font-size: 9rem;
      font-weight: 950;
      background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #f472b6 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      letter-spacing: -0.09em;
      filter: drop-shadow(0 0 50px rgba(96, 165, 250, 0.4));
    }
    .neural-text {
      margin-top: 2.5rem;
      text-transform: uppercase;
      font-weight: 900;
      letter-spacing: 0.6em;
      font-size: 10px;
      color: #475569;
      animation: pulse 4s infinite ease-in-out;
    }
    @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; color: #60a5fa; } }
  </style>
</head>
<body>
  <div class="hero">
    <h1 class="logo">VAYU</h1>
    <p class="neural-text">Neural Workspace Connected</p>
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
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const filesRef = useRef<FileEntry[]>(INITIAL_FILES);

  useEffect(() => {
    filesRef.current = files;
  }, [files]);

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

    content = content.replace(/<link[^>]+rel="stylesheet"[^>]*>/gi, (m) => m.includes('http') ? m : '');
    content = content.replace(/<script[^>]+src="[^"]+"[^>]*><\/script>/gi, (m) => m.includes('http') ? m : '');

    if (content.includes('</head>')) content = content.replace('</head>', `${styles}\n</head>`);
    else content = styles + content;

    if (content.includes('</body>')) content = content.replace('</body>', `${scripts}\n</body>`);
    else content = content + scripts;

    return content;
  }, [files, activeFile]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedBundledCode(rawBundledCode);
    }, 500); 
    return () => clearTimeout(handler);
  }, [rawBundledCode]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, isGenerating]);

  const handleDownload = async () => {
    if (!window.JSZip) return;
    try {
      const zip = new window.JSZip();
      files.forEach(f => zip.file(f.path, f.content));
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `vayu-neural-pkg-${Date.now()}.zip`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) { console.error("Export failed:", err); }
  };

  const handleSearchRedirect = () => {
    window.open('https://spark.puter.com', '_blank');
  };

  const parseAndApplyFiles = useCallback((text: string) => {
    const fileRegex = /\[FILE:\s*([a-zA-Z0-9._\-/]+)\]\s*```[a-z]*\n([\s\S]*?)(?:```|$)/g;
    let match;
    let lastPath: string | null = null;
    
    setFiles(currentFiles => {
      let newFiles = [...currentFiles];
      let updated = false;
      while ((match = fileRegex.exec(text)) !== null) {
        const path = match[1].trim();
        const content = match[2].trim();
        lastPath = path;
        
        const existingIdx = newFiles.findIndex(f => f.path === path);
        if (existingIdx > -1) {
          if (newFiles[existingIdx].content !== content) {
            newFiles[existingIdx] = { ...newFiles[existingIdx], content };
            updated = true;
          }
        } else {
          newFiles.push({ 
            path, content, 
            language: path.endsWith('.py') ? 'python' : (path.endsWith('.ts') || path.endsWith('.tsx') ? 'typescript' : (path.split('.').pop() || 'plaintext'))
          });
          updated = true;
        }
      }
      return updated ? newFiles : currentFiles;
    });
    if (lastPath && lastPath !== streamingFile) {
      setStreamingFile(lastPath);
      setActiveFilePath(lastPath);
    }
  }, [streamingFile]);

  const handleSendMessage = async () => {
    if (!prompt.trim() || isGenerating) return;
    const userMessage: ChatMessage = { id: Date.now().toString(), role: 'user', content: prompt, timestamp: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    setPrompt('');
    setIsGenerating(true);
    setCurrentStatus('analyzing');
    const assistantId = (Date.now() + 1).toString();
    const assistantMessage: ChatMessage = { id: assistantId, role: 'assistant', content: '', model: activeModel, timestamp: Date.now(), isStreaming: true, status: 'analyzing' };
    setMessages(prev => [...prev, assistantMessage]);

    try {
      const systemInstruction = `Vayu IDE Neural Synthesis Engine. 
High-fidelity frontend engineering focus.
Frameworks: React 19, Tailwind CSS, Three.js, Lucide Icons, Framer Motion.
Runtimes: Browser (HTML/JS/TS), Python 3.11 (via Pyodide).

CODE PROTOCOL:
Output code blocks wrapped in: [FILE: path/to/file.ext]\n\`\`\`language\nCONTENT\n\`\`\`
Always provide complete, standalone files to ensure workspace integrity.
Prefer index.html as the primary entry point for web apps.`;

      let fullContent = '';
      
      const stream = await window.puter.ai.chat(`${systemInstruction}\n\nTask: ${userMessage.content}`, { 
        model: activeModel, 
        stream: true 
      });

      for await (const chunk of stream) {
        const textChunk = (typeof chunk === 'string' ? chunk : chunk?.text || chunk?.message?.content || "");
        fullContent += textChunk;
        setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: fullContent, status: 'coding' } : m));
        parseAndApplyFiles(fullContent);
      }
      
      setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: fullContent, isStreaming: false, status: 'idle' } : m));
    } catch (error: any) {
      console.error("AI Generation Error:", error);
      setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: "Neural synthesis interrupted. Please try again.", isStreaming: false, error: "Sync mismatch" } : m));
    } finally {
      setIsGenerating(false);
      setCurrentStatus('idle');
      setStreamingFile(null);
    }
  };

  const getConversationalText = (content: string) => {
    return content.split(/\[FILE:\s*[a-zA-Z0-9._\-/]+\]/).map((part) => {
      return part.split('```').filter((_, idx) => idx % 2 === 0).join('');
    }).join('').trim();
  };

  return (
    <div className="flex h-screen w-full bg-[#0b0e14] text-slate-200 overflow-hidden text-sm selection:bg-blue-500/30 font-inter">
      {/* Activity Bar */}
      <div className="w-16 flex flex-col items-center py-8 bg-[#05070a] border-r border-white/5 gap-10">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center font-black text-white text-xl shadow-2xl ring-1 ring-white/10 transition-all duration-500 hover:scale-110 active:scale-95">V</div>
        <div className="flex flex-col gap-8">
          <button onClick={() => setActiveSidebarTab('chat')} className={`p-3 rounded-2xl transition-all ${activeSidebarTab === 'chat' ? 'text-blue-400 bg-blue-400/10' : 'text-slate-600 hover:text-slate-300'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
          </button>
          <button onClick={() => setActiveSidebarTab('files')} className={`p-3 rounded-2xl transition-all ${activeSidebarTab === 'files' ? 'text-blue-400 bg-blue-400/10' : 'text-slate-600 hover:text-slate-300'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
          </button>
          <button onClick={handleSearchRedirect} className="p-3 rounded-2xl transition-all text-slate-600 hover:text-blue-400 hover:bg-blue-400/10" title="Go to Spark Search">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </button>
          <button onClick={handleDownload} className="p-3 rounded-2xl transition-all text-slate-600 hover:text-emerald-400 hover:bg-emerald-400/10">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          </button>
        </div>
      </div>

      {/* Sidebar Panel */}
      <div className="w-[380px] flex flex-col bg-[#0b0e14] border-r border-white/5 overflow-hidden transition-all duration-500">
        <div className="p-5 h-16 border-b border-white/5 font-black uppercase tracking-[0.2em] text-[9px] text-slate-600 flex justify-between items-center bg-[#0d1117]/50 backdrop-blur-xl">
          <span className="flex items-center gap-2.5">
            <div className={`w-1.5 h-1.5 rounded-full ${isGenerating ? 'bg-blue-500 animate-pulse' : 'bg-slate-700'}`}></div>
            {activeSidebarTab === 'chat' ? 'Neural Link' : 'Workspace Core'}
          </span>
          {activeSidebarTab === 'chat' && (
            <select value={activeModel} onChange={(e) => { setActiveModel(e.target.value); }} className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-[8px] text-blue-400 outline-none font-bold tracking-[0.1em] transition-all hover:bg-white/10">
              <option value={AIModel.GEMINI_FLASH}>Gemini 2.0 Flash</option>
              <option value={AIModel.GPT_4O}>GPT-4o</option>
              <option value={AIModel.CLAUDE_3_5}>Claude 3.5 Sonnet</option>
            </select>
          )}
        </div>

        {activeSidebarTab === 'chat' ? (
          <div className="flex-1 flex flex-col overflow-hidden relative">
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar pb-48 scroll-smooth">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-30 select-none animate-spring-in">
                  <div className="w-20 h-20 bg-blue-500/5 rounded-[2rem] flex items-center justify-center border border-blue-500/10 mb-8">
                    <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" strokeWidth="1.5"/></svg>
                  </div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400">Contextual Link Ready</h3>
                  <p className="text-[11px] mt-4 max-w-[200px] leading-relaxed text-slate-500">Puter.js Neural Framework Active.</p>
                </div>
              )}
              {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col gap-3 animate-spring-in group ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[92%] p-5 rounded-[1.8rem] text-[13px] shadow-2xl border transition-all duration-500 ${
                    msg.role === 'user' ? 'bg-blue-600 text-white border-blue-400/40 rounded-br-none' : 'bg-white/5 backdrop-blur-3xl text-slate-200 border-white/10 rounded-bl-none'
                  }`}>
                    {msg.role === 'assistant' && msg.isStreaming && streamingFile && (
                      <div className="mb-4 px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></div>
                        <span className="text-[9px] font-black uppercase text-blue-400 tracking-widest">Synthesizing {streamingFile}</span>
                      </div>
                    )}
                    <div className="whitespace-pre-wrap font-normal leading-[1.6]">
                      {msg.role === 'user' ? msg.content : getConversationalText(msg.content)}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0b0e14] via-[#0b0e14]/95 to-transparent pointer-events-none z-30">
              <div className="bg-[#1a1f29]/90 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-4 shadow-2xl ring-1 ring-white/10 focus-within:ring-blue-500/40 transition-all duration-700 pointer-events-auto group neural-glow">
                <textarea 
                  value={prompt} 
                  onChange={(e) => setPrompt(e.target.value)} 
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }} 
                  placeholder="Ask Vayu anything, modify, changes, ask vayu anything" 
                  className="w-full bg-transparent outline-none resize-none text-[13px] min-h-[44px] max-h-[160px] placeholder:text-slate-600 font-medium px-2 py-1 scrollbar-hide" 
                />
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/5">
                  <div className="flex items-center gap-3 ml-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${currentStatus === 'coding' ? 'bg-blue-400 animate-pulse' : 'bg-slate-800'}`}></div>
                    <span className="text-[8px] text-slate-500 font-bold uppercase tracking-[0.2em]">{currentStatus}</span>
                  </div>
                  <button 
                    onClick={handleSendMessage} 
                    disabled={isGenerating || !prompt.trim()} 
                    className={`px-6 py-2.5 rounded-2xl font-black text-[9px] uppercase tracking-[0.2em] transition-all transform active:scale-90 ${isGenerating || !prompt.trim() ? 'opacity-20 bg-slate-800' : 'bg-blue-600 text-white hover:bg-blue-500 shadow-xl shadow-blue-500/20'}`}
                  >
                    {isGenerating ? 'Synthesizing' : 'Transmit'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-5 space-y-2 bg-[#0b0e14] custom-scrollbar">
            {files.map(file => (
              <button key={file.path} onClick={() => setActiveFilePath(file.path)} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[12px] transition-all border transform ${activeFilePath === file.path ? 'bg-blue-600/10 text-blue-400 border-blue-400/20 shadow-inner translate-x-1' : 'hover:bg-white/5 text-slate-500 border-transparent hover:translate-x-1'}`}>
                <svg className={`w-4 h-4 ${activeFilePath === file.path ? 'text-blue-400' : 'text-slate-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" strokeWidth="2" /></svg>
                <span className="flex-1 text-left truncate font-bold uppercase tracking-widest">{file.path}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Theatre Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0b0e14] relative">
        <div className="h-16 px-8 flex items-center justify-between bg-[#0b0e14] border-b border-white/5 z-20 backdrop-blur-3xl">
          <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em]">{activeFile.path}</span>
          <div className="flex items-center gap-3 text-[8px] font-black uppercase text-green-500 bg-green-500/5 px-4 py-1.5 rounded-full border border-green-500/10">
             <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></div> Neural Workspace Connected
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden relative">
          <div className="flex-1 border-r border-white/5 bg-[#0b0e14] relative overflow-hidden group editor-container">
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
                lineNumbers: 'on', 
                automaticLayout: true, 
                cursorBlinking: 'smooth', 
                scrollBeyondLastLine: false, 
                fontLigatures: true, 
                letterSpacing: 0.8, 
                readOnly: isGenerating && streamingFile === activeFile.path 
              }} 
              onChange={(val) => { if (!isGenerating) setFiles(prev => prev.map(f => f.path === activeFile.path ? { ...f, content: val || '' } : f)); }} 
            />
          </div>
          <div className="flex-1 bg-white overflow-hidden shadow-2xl relative transition-all duration-500 group/preview">
            <Preview code={debouncedBundledCode} isGenerating={isGenerating} activeLanguage={activeFile.path.endsWith('.py') ? 'python' : 'web'} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
