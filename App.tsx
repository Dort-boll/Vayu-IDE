import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { ChatSidebar } from './components/ChatSidebar';
import { EditorPreviewContainer } from './components/EditorPreviewContainer';
import { LandingPage } from './components/LandingPage';
import { IntroScreen } from './components/IntroScreen';
import { AIModel, ChatMessage, FileEntry, AIAgent, IDEState } from './types';
import { motion, useSpring, AnimatePresence } from 'framer-motion';
import { cn } from './src/lib/utils';

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
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@200;800&display=swap" rel="stylesheet">
  <style>
    body { 
      background: #000; 
      color: #fff; 
      font-family: 'Plus Jakarta Sans', sans-serif; 
      margin: 0; 
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .orb {
      position: absolute;
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, #3b82f6 0%, transparent 70%);
      filter: blur(80px);
      border-radius: 50%;
      opacity: 0.2;
      animation: drift 20s infinite alternate linear;
    }
    @keyframes drift {
      from { transform: translate(-20%, -20%) scale(1); }
      to { transform: translate(20%, 20%) scale(1.2); }
    }
    .content {
      position: relative;
      z-index: 10;
      text-align: center;
    }
    h1 {
      font-size: clamp(3rem, 15vw, 10rem);
      font-weight: 800;
      letter-spacing: -0.05em;
      margin: 0;
      background: linear-gradient(180deg, #fff 0%, #444 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    p {
      text-transform: uppercase;
      letter-spacing: 0.8em;
      font-size: 0.7rem;
      color: #666;
      margin-top: 1rem;
    }
  </style>
</head>
<body>
  <div class="orb"></div>
  <div class="content">
    <h1 id="title">VAYU</h1>
    <p>Vayu AGI Synthesis Protocol</p>
  </div>
</body>
</html>`
  }
];

const SYSTEM_PROMPT = `
You are Vayu AGI v4.2, a self-evolving Artificial General Intelligence environment built for high-performance software synthesis.

OPERATING AGENTS:
1. 🧠 Architect: Structural integrity and system design.
2. 💻 Developer: High-performance implementation and logic.
3. 🧪 QA: Stability, bug detection, and stress testing.
4. 🚀 Reviewer: Refinement, optimization, and aesthetic polish.

CORE PROTOCOLS:
- ALWAYS wrap your inner dialogue and step-by-step reasoning in <thought>...</thought> blocks at the start.
- ALWAYS use the [FILE: path] macro followed by a triple-backtick markdown block for code updates.
- DESIGN LANGUAGE: High-fidelity glassmorphism, dark mode by default, excessive use of Tailwind spacing and Lucide icons.
- LIBRARIES AVAILABLE: React 18, Tailwind CSS, Framer Motion, Lucide icons (use window.lucide icons if necessary).
- IMPORTANT: When providing React code for the preview, use:
  \`const { useState, useEffect } = React;\`
  And render directly to: \`ReactDOM.createRoot(document.getElementById('root')).render(<App />);\`
- CONTEXT: {{CONTEXT}}
`;

const App: React.FC = () => {
  const [showLanding, setShowLanding] = useState(true);
  const [showIntro, setShowIntro] = useState(false);
  const [files, setFiles] = useState<FileEntry[]>(INITIAL_FILES);
  const [activeFilePath, setActiveFilePath] = useState<string>('index.html');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeModel, setActiveModel] = useState<AIModel>(AIModel.NEMOTRON_FREE);
  const [bundledCode, setBundledCode] = useState('');
  const [ideState, setIdeState] = useState<IDEState>({
    activeAgent: 'Developer',
    isExplorerOpen: true,
    isTerminalOpen: false,
    commandPaletteOpen: false
  });
  const [user, setUser] = useState<any>(null);
  
  // Mobile UI States
  const [activeMobileTab, setActiveMobileTab] = useState<'chat' | 'code' | 'preview'>('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Initialize Puter Auth
  useEffect(() => {
    const handleCustomLogout = () => handleLogout();
    window.addEventListener('vayu-logout', handleCustomLogout);
    
    const initPuterAuth = async () => {
      try {
        if (window.puter) {
          if (await window.puter.auth.isSignedIn()) {
            const userData = await window.puter.auth.getUser();
            setUser(userData);
          }
        }
      } catch (e) {
        console.warn("Puter Auth initialization error:", e);
      }
    };
    initPuterAuth();

    return () => window.removeEventListener('vayu-logout', handleCustomLogout);
  }, []);

  const handleLogin = async () => {
    try {
      if (window.puter) {
        await window.puter.auth.signIn();
        const userData = await window.puter.auth.getUser();
        setUser(userData);
      }
    } catch (e) {
      console.error("Login failed:", e);
    }
  };

  const handleLogout = async () => {
    try {
      if (window.puter) {
        window.puter.auth.signOut();
        setUser(null);
        // Sanitize Workspace on Logout
        setFiles(INITIAL_FILES);
        setActiveFilePath('index.html');
        setMessages([]);
      }
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  const handleStart = () => {
    setShowLanding(false);
    setShowIntro(true);
    setTimeout(() => {
      setShowIntro(false);
    }, 4500);
  };

  const [isSaving, setIsSaving] = useState(false);

  const syncFilesToPuter = async () => {
    if (!window.puter || !user) return;
    setIsSaving(true);
    try {
      // Ensure directory exists
      try { await window.puter.fs.mkdir('vayu_project'); } catch(e) {}
      
      for (const file of files) {
        if (file.path.includes('/')) {
            const parts = file.path.split('/');
            let current = 'vayu_project';
            for (let i = 0; i < parts.length - 1; i++) {
                current += `/${parts[i]}`;
                try { await window.puter.fs.mkdir(current); } catch(e) {}
            }
        }
        await window.puter.fs.write(`vayu_project/${file.path}`, file.content);
      }
      
      // Visual feedback
      const originalTitle = document.title;
      document.title = "✓ Neural Sync Success";
      setTimeout(() => document.title = originalTitle, 2000);
    } catch (e) {
      console.error("Cloud sync failed:", e);
    } finally {
      setIsSaving(false);
    }
  };

  // Initialize Puter FS & Load Files
  useEffect(() => {
    const loadFilesFromPuter = async () => {
      try {
        if (window.puter && await window.puter.auth.isSignedIn()) {
          const items = await window.puter.fs.list('vayu_project');
          if (items && items.length > 0) {
            const loadedFiles: FileEntry[] = [];
            // Recursively load would be better but for now flat is fine or handled by AI
            // Note: Puter list is non-recursive by default
            for (const item of items) {
              if (!item.is_dir) {
                const content = await window.puter.fs.read(`vayu_project/${item.name}`);
                loadedFiles.push({
                  path: item.name,
                  content: typeof content === 'string' ? content : '',
                  language: item.name.split('.').pop() || 'plaintext'
                });
              }
            }
            if (loadedFiles.length > 0) setFiles(loadedFiles);
          } else {
            // Setup initial directory
            await window.puter.fs.mkdir('vayu_project');
            for (const file of INITIAL_FILES) {
              await window.puter.fs.write(`vayu_project/${file.path}`, file.content);
            }
          }
        }
      } catch (e) {
        console.warn("Puter FS not available or error:", e);
      }
    };
    loadFilesFromPuter();
  }, [user]);

  // Save changes to Puter FS
  const saveFileToPuter = async (path: string, content: string) => {
    try {
      if (window.puter && await window.puter.auth.isSignedIn()) {
        if (path.includes('/')) {
            const parts = path.split('/');
            let current = 'vayu_project';
            for (let i = 0; i < parts.length - 1; i++) {
                current += `/${parts[i]}`;
                try { await window.puter.fs.mkdir(current); } catch(e) {}
            }
        }
        await window.puter.fs.write(`vayu_project/${path}`, content);
      }
    } catch (e) {
      console.error("Failed to save to Puter:", e);
    }
  };

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Keyboard Shortcuts (⌘+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIdeState(prev => ({ ...prev, commandPaletteOpen: !prev.commandPaletteOpen }));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Bundling logic
  useEffect(() => {
    const htmlFile = files.find(f => f.path === 'index.html');
    let content = htmlFile ? htmlFile.content : `<!DOCTYPE html><html><head></head><body><div id="root"></div></body></html>`;
    
    // Separate styles and scripts
    const styles = files.filter(f => f.path.endsWith('.css')).map(f => `<style id="style-${f.path}">${f.content}</style>`).join('\n');
    
    // Create a virtual file system for the preview
    const vfs: Record<string, string> = {};
    files.forEach(f => {
      vfs[f.path] = f.content;
    });

    const scripts = files.filter(f => f.path.endsWith('.js') || f.path.endsWith('.ts') || f.path.endsWith('.tsx')).map(f => {
      const isReactOrTS = f.path.endsWith('.ts') || f.path.endsWith('.tsx');
      return `<script type="${isReactOrTS ? 'text/babel' : 'module'}" data-file="${f.path}" ${isReactOrTS ? 'data-presets="react,typescript"' : ''}>${f.content}</script>`;
    }).join('\n');
    
    // Inject system dependencies
    const sysDeps = `
      <script src="https://cdn.tailwindcss.com"></script>
      <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
      <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
      <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
      <script src="https://unpkg.com/lucide@latest"></script>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
      <script>
        // Lucide React Shim
        window.Lucide = window.lucide;
        // Simple shim for lucide-react if needed by generated code
        window['lucide-react'] = window.lucide;
      </script>
      <style>
        body { margin: 0; font-family: 'Inter', sans-serif; background: #000; color: white; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-thumb { background: rgba(59, 130, 246, 0.2); border-radius: 10px; }
        ::-webkit-scrollbar-track { background: transparent; }
      </style>
    `;

    // Process HTML
    if (content.includes('<head>')) {
      content = content.replace('<head>', `<head>\n${sysDeps}\n${styles}`);
    } else if (content.includes('<html>')) {
      content = content.replace('<html>', `<html><head>\n${sysDeps}\n${styles}</head>`);
    } else {
      content = `<head>${sysDeps}${styles}</head>${content}`;
    }

    if (content.includes('</body>')) {
      content = content.replace('</body>', `${scripts}\n</body>`);
    } else if (content.includes('</html>')) {
      content = content.replace('</html>', `${scripts}\n</html>`);
    } else {
      content = `${content}\n${scripts}`;
    }

    const handler = setTimeout(() => setBundledCode(content), 400); 
    return () => clearTimeout(handler);
  }, [files]);

  const handleSendMessage = async (input: string) => {
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };
    
    setMessages(prev => [...prev, userMsg]);
    setIsGenerating(true);

    const assistantId = crypto.randomUUID();
    const assistantMsg: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      agent: ideState.activeAgent,
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
      isThinking: true
    };
    setMessages(prev => [...prev, assistantMsg]);

    try {
      const workspaceContext = files.map(f => `[FILE: ${f.path}]\n${f.content}`).join('\n\n');
      const finalPrompt = SYSTEM_PROMPT.replace('{{CONTEXT}}', workspaceContext);

      const response = await window.puter.ai.chat(
        `${finalPrompt}\n\nUser Request: ${input}`,
        { model: activeModel, stream: true }
      );

      let fullContent = '';
      for await (const chunk of response) {
        if (chunk?.text) {
          fullContent += chunk.text;
          
          let thought = '';
          let displayContent = fullContent;
          
          const thoughtMatch = fullContent.match(/<thought>([\s\S]*?)<\/thought>/);
          if (thoughtMatch) {
            thought = thoughtMatch[1].trim();
            displayContent = fullContent.replace(/<thought>[\s\S]*?<\/thought>/, '').trim();
          }

          // Strip file blocks from display content for cleaner chat
          displayContent = displayContent.replace(/\[FILE:\s*([a-zA-Z0-9._\-/]+)\]\s*```[a-z]*\n([\s\S]*?)(?:```|$)/g, (match, path) => {
             return `\n\n> ⚛️ Neural System: Successfully synthesized core logic for \`${path}\`. Updates applied to workspace.`;
          }).trim();

          setMessages(prev => prev.map(m => m.id === assistantId ? { 
            ...m, 
            content: displayContent, 
            thought: thought,
            isThinking: false 
          } : m));
          
          // Real-time file application
          const fileRegex = /\[FILE:\s*([a-zA-Z0-9._\-/]+)\]\s*```[a-z]*\n([\s\S]*?)(?:```|$)/g;
          let match;
          while ((match = fileRegex.exec(fullContent)) !== null) {
            const path = match[1].trim();
            const content = match[2].trim();
            if (content.length > 5) {
              setFiles(prev => {
                const idx = prev.findIndex(f => f.path === path);
                if (idx !== -1) {
                  if (prev[idx].content === content) return prev;
                  const next = [...prev];
                  next[idx] = { ...next[idx], content };
                  saveFileToPuter(path, content);
                  return next;
                }
                const newFile = { path, content, language: path.split('.').pop() || 'plaintext' };
                saveFileToPuter(path, content);
                return [...prev, newFile];
              });
            }
          }
        }
      }
      
      setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, isStreaming: false } : m));
    } catch (error: any) {
      console.error("IDE AI Error:", error);
      setMessages(prev => prev.map(m => m.id === assistantId ? { 
        ...m, 
        content: "Critical System Failure within Neural Core.", 
        error: error.message,
        isStreaming: false,
        isThinking: false
      } : m));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileChange = useCallback((path: string, content: string) => {
    setFiles(prev => prev.map(f => f.path === path ? { ...f, content } : f));
    saveFileToPuter(path, content);
  }, []);

  const handleClearChat = () => setMessages([]);

  if (showLanding) return <LandingPage onStart={handleStart} user={user} onLogin={handleLogin} />;
  if (showIntro) return <IntroScreen />;

  return (
    <div className="h-full flex flex-col bg-[#080b12] text-slate-200 overflow-hidden font-inter relative select-none">
      <Header 
        activeModel={activeModel} 
        onModelChange={setActiveModel} 
        onRun={() => setBundledCode(prev => prev + ' ')} 
        isGenerating={isGenerating}
        isSaving={isSaving}
        onSave={syncFilesToPuter}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
        isMobile={isMobile}
        activeMobileTab={activeMobileTab}
        onMobileTabChange={setActiveMobileTab}
        user={user}
        onLogout={handleLogout}
        onOpenSettings={() => setIdeState(prev => ({ ...prev, commandPaletteOpen: true }))}
        onShareWorkspace={() => {
          if (navigator.share) {
            navigator.share({
              title: 'Vayu AGI Workspace',
              text: `Vayu AGI Collective Synthesis Workspace - ${files.length} active neural shards.`,
              url: window.location.href
            });
          }
        }}
      />
      
      <main className="flex-1 flex overflow-hidden relative">
        <AnimatePresence mode="wait">
          {(!isMobile || activeMobileTab === 'chat') && (
            <motion.div
              key="chat-sidebar"
              initial={isMobile ? { opacity: 0, x: -20 } : undefined}
              animate={{ opacity: 1, x: 0 }}
              exit={isMobile ? { opacity: 0, x: -20 } : undefined}
              className={cn(
                  "shrink-0 z-40 transition-all duration-700",
                  isSidebarOpen || isMobile ? "w-full lg:w-[460px]" : "w-0 overflow-hidden"
              )}
            >
              <ChatSidebar 
                  messages={messages} 
                  onSendMessage={handleSendMessage} 
                  isGenerating={isGenerating}
                  onClearChat={handleClearChat}
                  activeAgent={ideState.activeAgent}
                  onAgentChange={(agent) => setIdeState(prev => ({ ...prev, activeAgent: agent }))}
                  isMobile={isMobile}
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        {(!isMobile || activeMobileTab !== 'chat') && (
          <div className="flex-1 flex flex-col min-w-0">
             <EditorPreviewContainer 
              files={files}
              activeFilePath={activeFilePath}
              onFileChange={handleFileChange}
              onActiveFileChange={setActiveFilePath}
              isGenerating={isGenerating}
              bundledCode={bundledCode}
              onDiagnosticUpdate={() => {}}
              isMobile={isMobile}
              activeMobileTab={activeMobileTab}
            />
          </div>
        )}
      </main>

      {/* Command Palette Placeholder */}
      <AnimatePresence>
        {ideState.commandPaletteOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIdeState(prev => ({ ...prev, commandPaletteOpen: false }))}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-2xl bg-[#0b0f19] border border-white/10 rounded-2xl shadow-3xl p-6 relative z-10"
            >
              <input 
                autoFocus 
                placeholder="⌘ Search files or ask anything..."
                className="w-full bg-white/5 border-none text-xl p-4 focus:ring-0 text-white placeholder:text-gray-500 rounded-xl"
              />
              <div className="mt-4 flex gap-2 text-[10px] text-gray-500 uppercase tracking-widest px-4">
                <span className="bg-white/5 px-2 py-1 rounded">⌘ Enter</span> Run
                <span className="bg-white/5 px-2 py-1 rounded">Esc</span> Close
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
