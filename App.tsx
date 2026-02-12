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
  Terminal, 
  Zap, 
  Layout, 
  FolderTree,
  Send,
  Cpu
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
    body { background: #05070a; color: #f8fafc; font-family: system-ui, sans-serif; height: 100vh; display: flex; align-items: center; justify-content: center; margin: 0; }
    .vayu-card { padding: 4rem; border-radius: 2rem; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(20px); text-align: center; }
    h1 { font-size: 4rem; font-weight: 900; background: linear-gradient(to right, #3b82f6, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0; }
  </style>
</head>
<body>
  <div class="vayu-card"><h1>VAYU CODE</h1><p style="color: #64748b; margin-top: 1rem;">Neural IDE Workspace Ready</p></div>
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
      const systemInstruction = `You are Vayu Architect, a professional IDE core.
      USER INTENT ANALYSIS: 
      - If user asks for a website: Use HTML/Tailwind/React/Three.js.
      - If user asks for logic/data: Use Python.
      - NEVER include unnecessary frameworks.
      
      OUTPUT PROTOCOL:
      You must respond with conversational text followed by code blocks using this EXACT format:
      [FILE: path/to/file.ext]
      \`\`\`language
      CODE_CONTENT
      \`\`\`
      
      Current Workspace Context:
      ${files.map(f => `[FILE: ${f.path}]\n\`\`\`${f.language}\n${f.content}\n\`\`\``).join('\n')}`;

      let fullContent = '';

      if (activeModel.startsWith('gemini')) {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const result = await ai.models.generateContentStream({
          model: activeModel,
          contents: [{ role: 'user', parts: [{ text: `${systemInstruction}\n\nUser Request: ${userMsg.content}` }] }]
        });
        
        for await (const chunk of result) {
          const text = chunk.text;
          if (text) {
            fullContent += text;
            setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: fullContent, status: 'coding' } : m));
            parseAndApplyFiles(fullContent);
          }
        }
      } else {
        // Use Puter for Claude and GPT-4o
        const response = await window.puter.ai.chat(`${systemInstruction}\n\nUser: ${userMsg.content}`, { model: activeModel, stream: true });
        for await (const chunk of response) {
          const text = typeof chunk === 'string' ? chunk : (chunk.text || chunk.message?.content || "");
          if (text) {
            fullContent += text;
            setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: fullContent, status: 'coding' } : m));
            parseAndApplyFiles(fullContent);
          }
        }
      }

      setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, isStreaming: false, status: 'idle' } : m));
    } catch (err: any) {
      console.error(err);
      setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: `Error: ${err.message}`, isStreaming: false } : m));
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
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-blue-500/20">V</div>
        <div className="flex flex-col gap-6">
          <button onClick={() => setActiveSidebarTab('chat')} className={`p-2.5 rounded-xl transition-all ${activeSidebarTab === 'chat' ? 'text-blue-400 bg-blue-500/10' : 'text-slate-600 hover:text-slate-400'}`}>
            <MessageSquare size={20} />
          </button>
          <button onClick={() => setActiveSidebarTab('files')} className={`p-2.5 rounded-xl transition-all ${activeSidebarTab === 'files' ? 'text-blue-400 bg-blue-500/10' : 'text-slate-600 hover:text-slate-400'}`}>
            <FolderTree size={20} />
          </button>
          <div className="h-px w-6 bg-white/5 mx-auto" />
          <button onClick={handleDownload} className="p-2.5 rounded-xl text-slate-600 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all">
            <Download size={20} />
          </button>
        </div>
        <div className="mt-auto flex flex-col gap-6 pb-4">
          <Settings size={20} className="text-slate-600 hover:text-slate-400 cursor-pointer" />
        </div>
      </div>

      {/* Sidebar Panel */}
      <div className="w-[380px] flex flex-col bg-[#0b0e14] border-r border-white/5 overflow-hidden">
        <div className="h-16 px-6 border-b border-white/5 flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
            {activeSidebarTab === 'chat' ? 'Neural Link' : 'Workspace'}
          </span>
          {activeSidebarTab === 'chat' && (
            <select 
              value={activeModel} 
              onChange={(e) => setActiveModel(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-blue-400 outline-none hover:bg-white/10 transition-all cursor-pointer font-bold"
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
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-30 px-10">
                    <Cpu size={48} className="text-blue-500 mb-6" />
                    <p className="text-xs font-medium leading-relaxed">System ready for architectural synthesis. Describe your application to begin.</p>
                  </div>
                )}
                {messages.map(msg => (
                  <div key={msg.id} className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[90%] p-5 rounded-2xl text-[13px] border transition-all ${
                      msg.role === 'user' ? 'bg-blue-600 text-white border-blue-400' : 'bg-white/[0.03] text-slate-200 border-white/10'
                    }`}>
                      <div className="whitespace-pre-wrap leading-relaxed">
                        {msg.role === 'user' ? msg.content : cleanDisplayContent(msg.content)}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              
              {/* Input Area */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0b0e14] via-[#0b0e14] to-transparent">
                <div className="bg-[#1a1f29] border border-white/10 rounded-2xl p-4 shadow-2xl">
                  <textarea 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                    placeholder="Describe your app..."
                    className="w-full bg-transparent outline-none resize-none text-[13px] min-h-[40px] max-h-[120px] placeholder:text-slate-600"
                  />
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/5">
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                      <div className={`w-2 h-2 rounded-full ${isGenerating ? 'bg-blue-500 animate-pulse' : 'bg-slate-700'}`} />
                      {currentStatus}
                    </div>
                    <button 
                      onClick={handleSendMessage}
                      disabled={isGenerating || !prompt.trim()}
                      className="p-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-20 rounded-xl transition-all text-white"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="p-4 space-y-2">
              {files.map(file => (
                <button 
                  key={file.path}
                  onClick={() => setActiveFilePath(file.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs transition-all border ${
                    activeFilePath === file.path ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'border-transparent text-slate-500 hover:bg-white/5'
                  }`}
                >
                  <Code2 size={14} />
                  <span className="flex-1 text-left truncate font-medium">{file.path}</span>
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
            <span className="text-[11px] font-black text-blue-500 uppercase tracking-[0.4em]">{activeFile.path}</span>
          </div>
          <div className="flex items-center gap-4">
            <Zap size={14} className="text-blue-500 animate-pulse" />
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Editor Container */}
          <div className="flex-1 border-r border-white/5 relative">
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
                padding: { top: 20 },
                automaticLayout: true,
                readOnly: isGenerating && streamingFile === activeFile.path,
                lineNumbers: 'on',
                glyphMargin: false,
                folding: true,
                lineDecorationsWidth: 10,
                lineNumbersMinChars: 3
              }}
              onChange={(val) => {
                if (!isGenerating) setFiles(prev => prev.map(f => f.path === activeFile.path ? { ...f, content: val || '' } : f));
              }}
            />
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