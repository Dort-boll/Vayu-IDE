import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { ChatSidebar } from './components/ChatSidebar';
import { EditorPreviewContainer } from './components/EditorPreviewContainer';
import { AIModel, ChatMessage, FileEntry } from './types';

const INITIAL_FILES: FileEntry[] = [
  {
    path: 'index.html',
    language: 'html',
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap" rel="stylesheet">
  <style>
    body { 
      background: #05070a; 
      color: #f8fafc; 
      font-family: 'Inter', sans-serif; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      height: 100vh; 
      margin: 0; 
      overflow: hidden;
    }
    .vayu-container {
      position: relative;
      padding: 4rem;
      border-radius: 3rem;
      background: rgba(255, 255, 255, 0.02);
      backdrop-filter: blur(40px);
      border: 1px solid rgba(255, 255, 255, 0.05);
      text-align: center;
      box-shadow: 0 50px 100px -20px rgba(0,0,0,0.5);
    }
    h1 { 
      font-size: 5rem; 
      font-weight: 900; 
      background: linear-gradient(to right, #60a5fa, #a78bfa); 
      -webkit-background-clip: text; 
      -webkit-text-fill-color: transparent; 
      letter-spacing: -0.05em; 
      margin: 0;
    }
    .status {
      margin-top: 2rem;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      color: #64748b;
    }
    .glow {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%);
      filter: blur(60px);
      z-index: -1;
    }
  </style>
</head>
<body>
  <div class="glow"></div>
  <div class="vayu-container">
    <h1>VAYU IDE</h1>
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeModel, setActiveModel] = useState<AIModel>(AIModel.GPT_4O);
  const [bundledCode, setBundledCode] = useState('');

  // Bundling logic for the preview
  useEffect(() => {
    const htmlFile = files.find(f => f.path === 'index.html');
    let content = htmlFile ? htmlFile.content : `<!DOCTYPE html><html><body><div id="root"></div></body></html>`;
    
    const styles = files.filter(f => f.path.endsWith('.css')).map(f => `<style data-path="${f.path}">${f.content}</style>`).join('\n');
    const scripts = files.filter(f => f.path.endsWith('.js') || f.path.endsWith('.ts') || f.path.endsWith('.tsx') || f.path.endsWith('.jsx')).map(f => {
      const isReactOrTS = f.path.endsWith('.ts') || f.path.endsWith('.tsx') || f.path.endsWith('.jsx');
      return `<script type="${isReactOrTS ? 'text/babel' : 'module'}" ${isReactOrTS ? 'data-presets="react,typescript"' : ''} data-path="${f.path}">${f.content}</script>`;
    }).join('\n');
    
    if (content.includes('</head>')) content = content.replace('</head>', `${styles}\n</head>`);
    if (content.includes('</body>')) content = content.replace('</body>', `${scripts}\n</body>`);

    const handler = setTimeout(() => setBundledCode(content), 300); 
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
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
      isThinking: true
    };
    setMessages(prev => [...prev, assistantMsg]);

    try {
      const workspaceContext = files.map(f => `[FILE: ${f.path}]\n${f.content}`).join('\n\n');
      const systemPrompt = `You are Vayu IDE, a powerful neural workspace.
      
      WORKSPACE_CONTEXT:
      ${workspaceContext}

      OBJECTIVE:
      Help the user build high-performance web applications.
      
      PROTOCOLS:
      1. Provide updated code for files using [FILE: path] followed by a code block.
      2. Always output the FULL content for modified files.
      3. Use modern Tailwind CSS and clean UI patterns.
      4. Be concise but accurate.
      5. If you are creating multiple files, list them all.`;

      const response = await window.puter.ai.chat(
        `${systemPrompt}\n\nUser Request: ${input}`,
        { model: activeModel, stream: true }
      );

      let fullContent = '';
      for await (const chunk of response) {
        if (chunk?.text) {
          fullContent += chunk.text;
          setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: fullContent, isThinking: false } : m));
          
          // Real-time file application
          const fileRegex = /\[FILE:\s*([a-zA-Z0-9._\-/]+)\]\s*```[a-z]*\n([\s\S]*?)(?:```|$)/g;
          let match;
          while ((match = fileRegex.exec(fullContent)) !== null) {
            const path = match[1].trim();
            const content = match[2].trim();
            if (content.length > 10) {
              setFiles(prev => {
                const idx = prev.findIndex(f => f.path === path);
                if (idx !== -1) {
                  if (prev[idx].content === content) return prev;
                  const next = [...prev];
                  next[idx] = { ...next[idx], content };
                  return next;
                }
                return [...prev, { path, content, language: path.split('.').pop() || 'plaintext' }];
              });
            }
          }
        }
      }
      
      setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, isStreaming: false } : m));
    } catch (error: any) {
      console.error("Puter AI Error:", error);
      setMessages(prev => prev.map(m => m.id === assistantId ? { 
        ...m, 
        content: "I encountered an error while processing your request.", 
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
  }, []);

  const handleClearChat = () => {
    setMessages([]);
  };

  return (
    <div className="h-full flex flex-col bg-[#05070a] text-slate-200 overflow-hidden font-inter">
      <Header 
        activeModel={activeModel} 
        onModelChange={setActiveModel} 
        onRun={() => setBundledCode(prev => prev + ' ')} 
        isGenerating={isGenerating}
      />
      
      <main className="flex-1 flex overflow-hidden">
        <ChatSidebar 
          messages={messages} 
          onSendMessage={handleSendMessage} 
          isGenerating={isGenerating}
          onClearChat={handleClearChat}
        />
        
        <EditorPreviewContainer 
          files={files}
          activeFilePath={activeFilePath}
          onFileChange={handleFileChange}
          onActiveFileChange={setActiveFilePath}
          isGenerating={isGenerating}
          bundledCode={bundledCode}
          onDiagnosticUpdate={() => {}}
        />
      </main>
    </div>
  );
};

export default App;
