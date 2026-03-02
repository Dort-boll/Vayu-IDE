import React from 'react';
import { Sparkles, ChevronDown, Share2, Play, Settings, User, Menu, History, HelpCircle, RefreshCw, Zap } from 'lucide-react';
import { AIModel, MODEL_LIST } from '../types';
import { motion } from 'framer-motion';
import { cn } from '../src/lib/utils';

interface HeaderProps {
  activeModel: AIModel;
  onModelChange: (model: AIModel) => void;
  onRun: () => void;
  isGenerating: boolean;
}

export const Header: React.FC<HeaderProps> = ({ activeModel, onModelChange, onRun, isGenerating }) => {
  const currentModel = MODEL_LIST.find(m => m.id === activeModel);

  return (
    <header className="h-14 border-b border-white/5 bg-[#0b0e14] flex items-center justify-between px-4 shrink-0 z-50">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <button className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Zap size={18} fill="currentColor" />
            </div>
            <span className="font-black text-white tracking-tighter text-xl">VAYU</span>
          </div>
        </div>
        
        <div className="h-6 w-px bg-white/5 mx-2" />
        
        <div className="relative group">
          <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/5 rounded-xl transition-all text-xs font-bold text-gray-400 hover:text-white border border-transparent hover:border-white/10">
            <div className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]" style={{ backgroundColor: currentModel?.color }} />
            {currentModel?.name}
            <ChevronDown size={14} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
          </button>
          
          <div className="absolute top-full left-0 mt-2 w-72 bg-[#0b0e14]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-2">
            {MODEL_LIST.map((model) => (
              <button
                key={model.id}
                onClick={() => onModelChange(model.id)}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-xl text-xs transition-all mb-1 last:mb-0",
                  activeModel === model.id 
                    ? "bg-white/10 text-white border border-white/10" 
                    : "hover:bg-white/5 text-gray-500 hover:text-gray-300"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold">{model.name}</span>
                  <span className={cn(
                    "text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest",
                    model.status === 'optimal' ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-gray-500"
                  )}>
                    {model.status}
                  </span>
                </div>
                <div className="text-[10px] opacity-40 leading-relaxed">{model.capability} Neural Core</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
          <button 
            onClick={onRun}
            disabled={isGenerating}
            className={cn(
              "flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-black transition-all active:scale-95",
              isGenerating 
                ? "bg-white/5 text-gray-600 cursor-not-allowed" 
                : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20"
            )}
          >
            {isGenerating ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              >
                <RefreshCw size={14} />
              </motion.div>
            ) : (
              <Play size={14} fill="currentColor" />
            )}
            DEPLOY
          </button>
        </div>
        
        <div className="h-6 w-px bg-white/5 mx-1" />
        
        <button className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-colors" title="History">
          <History size={20} />
        </button>
        
        <button className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-colors" title="Share">
          <Share2 size={20} />
        </button>
        
        <button className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-colors" title="Settings">
          <Settings size={20} />
        </button>

        <button className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-colors" title="Help">
          <HelpCircle size={20} />
        </button>
        
        <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-white hover:border-white/20 transition-all cursor-pointer">
          <User size={18} />
        </div>
      </div>
    </header>
  );
};
