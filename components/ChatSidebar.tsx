import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Sparkles, Loader2, AlertCircle, Trash2, Zap, Cpu, Activity, Layout, Code, ShieldCheck, Search, Copy, Share2, Info, Settings, LogOut, Check, CheckCircle2 } from 'lucide-react';
import { ChatMessage, AIAgent } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../src/lib/utils';
import Markdown from 'react-markdown';

interface ChatSidebarProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isGenerating: boolean;
  onClearChat: () => void;
  activeAgent: AIAgent;
  onAgentChange: (agent: AIAgent) => void;
  isMobile?: boolean;
}

const AGENTS: { id: AIAgent; icon: any; color: string; desc: string }[] = [
  { id: 'Architect', icon: Layout, color: 'text-purple-400', desc: 'System Design & Structure' },
  { id: 'Developer', icon: Code, color: 'text-blue-400', desc: 'Code Performance & Implementation' },
  { id: 'Security', icon: ShieldCheck, color: 'text-red-400', desc: 'Neural Security & Integrity' },
  { id: 'QA', icon: CheckCircle2, color: 'text-emerald-400', desc: 'Stability & Bug Prevention' },
  { id: 'Reviewer', icon: Search, color: 'text-amber-400', desc: 'Optimization & Best Practices' },
];

export const ChatSidebar: React.FC<ChatSidebarProps> = ({ 
  messages, 
  onSendMessage, 
  isGenerating,
  onClearChat,
  activeAgent,
  onAgentChange,
  isMobile
}) => {
  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleLogoutClick = () => {
    // This is a bit of a hack since we don't have onLogout here
    // But we can trigger a custom event or rely on Header
    // Ideally we pass onLogout to ChatSidebar too
    window.dispatchEvent(new CustomEvent('vayu-logout'));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const shareMessage = (msg: ChatMessage) => {
    if (navigator.share) {
      navigator.share({
        title: 'Vayu AGI Synthesis',
        text: msg.content,
        url: window.location.href
      }).catch(console.error);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
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
    <div className="h-full flex flex-col bg-[#05070a] relative overflow-hidden group">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-blue-500/5 to-transparent" />
      </div>

      {/* Agent Selector Bar */}
      <div className="p-4 border-b border-white/5 flex gap-2 overflow-x-auto no-scrollbar shrink-0 bg-black/60 relative z-30">
        {AGENTS.map((agent) => {
          const Icon = agent.icon;
          const isActive = activeAgent === agent.id;
          return (
            <button
              key={agent.id}
              onClick={() => onAgentChange(agent.id)}
              className={cn(
                "flex items-center gap-2.5 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] transition-all duration-500 border shrink-0 relative overflow-hidden group/agent",
                isActive 
                  ? "bg-white/10 border-white/20 text-white shadow-2xl scale-105" 
                  : "bg-transparent border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5"
              )}
              title={agent.desc}
            >
              {isActive && (
                <motion.div 
                  layoutId="activeAgentGlow" 
                  className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-500/10 blur-xl -z-10" 
                />
              )}
              <Icon size={14} className={cn("transition-transform duration-500 group-hover/agent:scale-110", isActive ? agent.color : "text-gray-600")} />
              {agent.id}
            </button>
          );
        })}
      </div>
      
      {/* Header Info */}
      <div className="h-14 px-8 flex items-center justify-between border-b border-white/5 relative z-20 shrink-0 bg-black/20 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,1)] animate-pulse" />
            <div className="absolute inset-0 w-2 h-2 rounded-full bg-blue-500 animate-ping opacity-40" />
          </div>
          <span className="text-[10px] font-black tracking-[0.4em] text-blue-400 uppercase">Vayu AGI Stream v4</span>
        </div>
        
        <div className="flex items-center gap-2">
            <button 
              onClick={onClearChat}
              className="p-2.5 hover:bg-white/5 rounded-xl text-gray-500 hover:text-red-400 transition-all active:scale-90"
              title="Purge Neural Stream"
            >
              <Trash2 size={16} />
            </button>
            {isMobile && (
              <button 
                onClick={handleLogoutClick}
                className="p-2.5 hover:bg-white/5 rounded-xl text-gray-500 hover:text-orange-400 transition-all active:scale-90"
                title="Disconnect Core"
              >
                <LogOut size={16} />
              </button>
            )}
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar no-scrollbar relative z-10"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-10 py-20 px-10">
            <div className="relative group">
              <div className="absolute inset-0 bg-blue-500/20 blur-[60px] rounded-full scale-150 animate-pulse" />
              <motion.div 
                animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 0.95, 1] }}
                transition={{ duration: 15, repeat: Infinity }}
                className="relative w-24 h-24 rounded-[2.5rem] bg-white/5 flex items-center justify-center border border-white/10 shadow-3xl backdrop-blur-[50px] group-hover:border-blue-500/40 transition-all duration-700"
              >
                <Sparkles size={40} className="text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.6)]" />
              </motion.div>
            </div>
            <div className="space-y-4">
              <p className="font-black text-white tracking-[0.5em] uppercase text-sm">Vayu AGI Interface</p>
              <div className="h-px w-12 bg-blue-500/40 mx-auto" />
              <p className="text-[11px] text-gray-500 leading-relaxed font-bold uppercase tracking-[0.2em] max-w-[240px]">
                Intelligence standing by. <br/>
                Awaiting AGI directive.
              </p>
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', damping: 20, stiffness: 100 }}
              className={cn(
                "flex gap-6",
                msg.role === 'user' ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div className={cn(
                "w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border transition-all duration-700 relative overflow-hidden group/avatar",
                msg.role === 'user' 
                  ? "bg-white/5 border-white/10 text-gray-500 hover:border-white/20" 
                  : "bg-blue-600/10 border-blue-500/20 text-blue-400 hover:border-blue-500/40"
              )}>
                {msg.role === 'user' ? <User size={20} /> : <Cpu size={20} className="relative z-10" />}
                {msg.role === 'assistant' && (
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-transparent opacity-40" 
                  />
                )}
              </div>
              
              <div className={cn(
                "max-w-[85%] space-y-4",
                msg.role === 'user' ? "items-end text-right" : "items-start text-left"
              )}>
                {msg.agent && (
                  <div className="flex items-center gap-3 mb-1 px-1">
                    <div className="w-1 h-3 bg-blue-500/40 rounded-full" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 group-hover:text-blue-300 transition-colors">{msg.agent}</span>
                  </div>
                )}

                {msg.thought && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="w-full text-[11px] text-blue-200/80 font-medium bg-blue-500/[0.03] p-6 rounded-[2rem] border border-blue-500/10 mb-4 leading-relaxed backdrop-blur-3xl shadow-inner italic relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/30" />
                    <div className="flex items-center gap-3 mb-3 text-blue-400/60">
                        <Activity size={12} className="animate-pulse" />
                        <span className="font-black tracking-[0.4em] uppercase text-[9px]">AGI Synthesis Loop</span>
                    </div>
                    {msg.thought}
                  </motion.div>
                )}
                
                <div className={cn(
                  "px-7 py-5 rounded-[2.2rem] text-[14px] leading-relaxed border transition-all duration-700 relative overflow-hidden",
                  msg.role === 'user' 
                    ? "bg-white text-black border-white shadow-[0_20px_40px_rgba(255,255,255,0.05)] font-medium" 
                    : "bg-white/[0.03] text-gray-200 border-white/5 shadow-2xl backdrop-blur-3xl"
                )}>
                  {msg.role === 'user' ? (
                    <span className="tracking-tight whitespace-pre-wrap">{msg.content}</span>
                  ) : (
                    <div className="markdown-body prose prose-invert prose-sm max-w-none">
                      <Markdown>{msg.content}</Markdown>
                    </div>
                  )}
                </div>
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button 
                      onClick={() => copyToClipboard(msg.content, msg.id)}
                      className="p-2 hover:bg-white/5 rounded-xl text-gray-500 hover:text-blue-400 transition-all flex items-center gap-2"
                    >
                      {copiedId === msg.id ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                      <span className="text-[10px] font-black uppercase tracking-widest">Copy</span>
                    </button>
                    <button 
                      onClick={() => shareMessage(msg)}
                      className="p-2 hover:bg-white/5 rounded-xl text-gray-500 hover:text-purple-400 transition-all flex items-center gap-2"
                    >
                      <Share2 size={12} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Share</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isGenerating && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex gap-6">
            <div className="relative w-11 h-11">
              <div className="absolute inset-0 bg-blue-500/20 blur-xl animate-pulse" />
              <div className="relative w-11 h-11 rounded-2xl bg-blue-600/10 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
                <Loader2 size={20} className="animate-spin" />
              </div>
            </div>
            <div className="flex flex-col justify-center gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-blue-400/80 tracking-[0.4em] uppercase animate-pulse">AGI Synthesizing...</span>
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                      <motion.div 
                        key={i}
                        animate={{ opacity: [0.2, 1, 0.2] }}
                        transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                        className="w-1 h-1 rounded-full bg-blue-500"
                      />
                    ))}
                  </div>
                </div>
                <div className="h-1.5 w-32 bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-inner">
                    <motion.div 
                        animate={{ x: ['-100%', '300%'] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        className="w-1/3 h-full bg-gradient-to-r from-transparent via-blue-500 to-transparent"
                    />
                </div>
            </div>
          </motion.div>
        )}
      </div>

      <div className="p-4 sm:p-8 pb-8 sm:pb-12 border-t border-white/5 bg-black/60 backdrop-blur-[50px] relative z-30 shrink-0 shadow-[0_-20px_50px_rgba(0,0,0,0.4)]">
        <form onSubmit={handleSubmit} className="relative group/input">
           <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 rounded-[2rem] opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-1000 blur-xl pointer-events-none" />
           <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !isMobile) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Ask Vayu anything..."
            className="w-full bg-white/[0.03] border border-white/10 rounded-[1.5rem] sm:rounded-[2rem] px-5 sm:px-7 py-4 sm:py-6 pr-14 sm:pr-16 text-[13px] sm:text-[14px] text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-blue-500/40 focus:bg-white/[0.06] transition-all duration-700 resize-none h-16 sm:h-20 md:h-28 custom-scrollbar no-scrollbar shadow-3xl font-medium tracking-tight"
          />
          <button
            type="submit"
            disabled={!input.trim() || isGenerating}
            className={cn(
              "absolute right-2.5 sm:right-4 bottom-2.5 sm:bottom-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl transition-all duration-500 active:scale-90 border",
              input.trim() && !isGenerating
                ? "bg-blue-600 border-blue-400 text-white shadow-[0_10px_20px_rgba(59,130,246,0.3)] hover:scale-105"
                : "bg-white/5 border-transparent text-gray-700"
            )}
          >
            {isGenerating ? <Loader2 size={16} className="animate-spin text-blue-500" /> : <Send size={16} fill="currentColor" />}
          </button>
        </form>
        <div className="mt-4 sm:mt-6 flex items-center justify-between px-2 sm:px-4">
            <div className="flex items-center gap-2 sm:gap-3 opacity-20 hover:opacity-50 transition-opacity cursor-default">
              <Zap size={8} className="text-blue-500" />
              <span className="text-[8px] sm:text-[9px] font-black text-white tracking-[0.4em] sm:tracking-[0.5em] uppercase">Vayu Sync</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Activity size={8} className="text-emerald-500 animate-pulse" />
              <span className="text-[8px] sm:text-[9px] font-bold text-gray-600 uppercase tracking-widest leading-none">Hot-Linked</span>
            </div>
        </div>
      </div>
    </div>

  );
};
