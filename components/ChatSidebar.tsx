import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Sparkles, Loader2, AlertCircle, Trash2 } from 'lucide-react';
import { ChatMessage } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../src/lib/utils';

interface ChatSidebarProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isGenerating: boolean;
  onClearChat: () => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({ 
  messages, 
  onSendMessage, 
  isGenerating,
  onClearChat
}) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isGenerating]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isGenerating) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="w-[400px] flex flex-col border-r border-white/5 bg-[#0b0e14] shrink-0 relative">
      <div className="h-12 border-b border-white/5 flex items-center justify-between px-4 bg-white/5 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Neural Link</span>
        </div>
        <button 
          onClick={onClearChat}
          className="p-1.5 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-colors"
          title="Clear Chat"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar no-scrollbar"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-20">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 flex items-center justify-center border border-white/5">
              <Sparkles size={40} className="text-blue-400" />
            </div>
            <div className="space-y-2">
              <p className="font-black text-white tracking-widest uppercase text-xs">Initialize Session</p>
              <p className="text-[10px] text-gray-500 max-w-[200px] leading-relaxed">Command the neural core to synthesize your vision into reality.</p>
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex gap-4",
                msg.role === 'user' ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border transition-all",
                msg.role === 'user' 
                  ? "bg-white/5 border-white/5 text-gray-400" 
                  : "bg-blue-600/10 border-blue-500/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]"
              )}>
                {msg.role === 'user' ? <User size={16} /> : <Sparkles size={16} />}
              </div>
              
              <div className={cn(
                "max-w-[85%] space-y-2",
                msg.role === 'user' ? "items-end" : "items-start"
              )}>
                {msg.thought && (
                  <div className="text-[10px] text-blue-400/60 font-mono bg-blue-500/5 p-3 rounded-xl border border-blue-500/10 mb-2 leading-relaxed">
                    <span className="font-bold mr-2">THOUGHT:</span>
                    {msg.thought}
                  </div>
                )}
                
                <div className={cn(
                  "px-4 py-3 rounded-2xl text-sm leading-relaxed border transition-all",
                  msg.role === 'user' 
                    ? "bg-white/5 border-white/5 text-gray-300 rounded-tr-none" 
                    : "bg-[#161b22] border-white/5 text-gray-200 rounded-tl-none shadow-xl"
                )}>
                  {msg.error ? (
                    <div className="flex items-center gap-2 text-red-400 font-mono text-xs">
                      <AlertCircle size={14} />
                      <span>{msg.error}</span>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-4"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
              <Sparkles size={16} className="animate-pulse" />
            </div>
            <div className="flex items-center gap-3 text-xs text-blue-400/60 font-mono italic">
              <Loader2 size={14} className="animate-spin" />
              Synthesizing...
            </div>
          </motion.div>
        )}
      </div>

      <div className="p-4 border-t border-white/5 bg-[#0b0e14] shrink-0">
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Command neural core..."
            className="w-full pl-4 pr-12 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all resize-none min-h-[56px] max-h-32 custom-scrollbar no-scrollbar"
            rows={1}
          />
          <button
            type="submit"
            disabled={!input.trim() || isGenerating}
            className={cn(
              "absolute right-2 bottom-2 p-2.5 rounded-xl transition-all active:scale-90",
              input.trim() && !isGenerating 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
                : "bg-white/5 text-gray-600"
            )}
          >
            <Send size={18} />
          </button>
        </form>
        <div className="mt-3 flex items-center justify-center gap-4 text-[9px] text-gray-600 font-bold uppercase tracking-widest">
          <div className="flex items-center gap-1.5">
            <div className="w-1 h-1 rounded-full bg-emerald-500" />
            Neural Core v4.0
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1 h-1 rounded-full bg-blue-500" />
            Encrypted
          </div>
        </div>
      </div>
    </div>
  );
};
