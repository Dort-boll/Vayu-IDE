import React from 'react';
import { Sparkles, ChevronDown, ChevronRight, Share2, Play, Settings, User, Menu, History, HelpCircle, RefreshCw, Zap, Command, MonitorPlay, Activity, FolderOpen, Box, Database, LogOut } from 'lucide-react';
import { AIModel, MODEL_LIST } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../src/lib/utils';

interface HeaderProps {
  activeModel: AIModel;
  onModelChange: (model: AIModel) => void;
  onRun: () => void;
  isGenerating: boolean;
  isSaving?: boolean;
  onSave?: () => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  isMobile: boolean;
  activeMobileTab: 'chat' | 'code' | 'preview';
  onMobileTabChange: (tab: 'chat' | 'code' | 'preview') => void;
  user: any;
  onLogout: () => void;
  onOpenSettings?: () => void;
  onShareWorkspace?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  activeModel, 
  onModelChange, 
  onRun, 
  isGenerating,
  onToggleSidebar,
  isSidebarOpen,
  isMobile,
  activeMobileTab,
  onMobileTabChange,
  user,
  onLogout,
  isSaving,
  onSave,
  onOpenSettings,
  onShareWorkspace
}) => {
  const currentModel = MODEL_LIST.find(m => m.id === activeModel);
  const [showWorkspaceMenu, setShowWorkspaceMenu] = React.useState(false);

  return (
    <header className="h-20 border-b border-white/5 bg-[#0b0f19]/40 backdrop-blur-[100px] flex items-center justify-between px-6 shrink-0 z-[60] relative overflow-hidden group select-none">
      {/* Decorative Prism Border */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent shadow-[0_0_15px_rgba(59,130,246,0.3)]" />
      
      <div className="flex items-center gap-6 relative z-10">
        <button 
            onClick={onToggleSidebar}
            className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 hover:border-blue-500/20 transition-all shadow-2xl active:scale-95 group/menu"
        >
            <Menu size={20} className={cn("transition-all duration-500", isSidebarOpen ? "rotate-90 text-blue-400" : "group-hover/menu:scale-110")} />
        </button>

        <div className="flex items-center gap-4 cursor-pointer group/logo" onClick={() => window.location.reload()}>
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-700 to-blue-500 rounded-2xl flex items-center justify-center text-white shadow-[0_0_20px_rgba(59,130,246,0.2)] overflow-hidden relative">
              <Zap size={18} fill="currentColor" className="relative z-10" />
              <motion.div 
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12" 
              />
            </div>
            <div className={cn("hidden lg:block transition-all duration-300", isMobile ? "hidden" : "block")}>
              <div className="text-lg font-black tracking-tighter text-white leading-none">VAYU AI</div>
              <div className="text-[9px] font-black tracking-[0.4em] text-blue-500/60 uppercase leading-relaxed">Neural Core v4.2</div>
            </div>
        </div>

        {!isMobile && (
            <div className="relative">
              <button 
                onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
                className="hidden xl:flex items-center gap-3 px-5 h-12 bg-white/5 rounded-2xl border border-white/5 text-gray-400 hover:bg-white/10 transition-all cursor-pointer group/path"
              >
                  <FolderOpen size={16} className="text-blue-500/50 group-hover/path:scale-110 transition-transform" />
                  <span className="text-[11px] font-black tracking-widest uppercase truncate max-w-[140px]">vayu_workspace</span>
                  <ChevronDown size={14} className={cn("opacity-20 transition-transform duration-300", showWorkspaceMenu && "rotate-180")} />
              </button>
              
              <AnimatePresence>
                {showWorkspaceMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full left-0 mt-3 w-72 bg-[#080b12]/98 backdrop-blur-3xl border border-white/10 rounded-3xl p-2 shadow-3xl z-[100]"
                  >
                    <div className="p-4 border-b border-white/5">
                      <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Active Synthesis Environment</p>
                    </div>
                    <div className="p-2 space-y-1">
                      <WorkspaceMenuItem icon={<Activity size={14} />} label="Performance Monitor" />
                      <WorkspaceMenuItem icon={<History size={14} />} label="Version History" />
                      <WorkspaceMenuItem icon={<HelpCircle size={14} />} label="Core Documentation" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
        )}
      </div>

      {isMobile && (
          <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/10 shadow-inner">
              {[
                { id: 'chat', label: 'AGI' },
                { id: 'code', label: 'CORE' },
                { id: 'preview', label: 'LIVE' }
              ].map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onMobileTabChange(tab.id as any)}
                    className={cn(
                        "px-5 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all duration-500 relative",
                        activeMobileTab === tab.id ? "text-white" : "text-gray-500"
                    )}
                >
                    {tab.label}
                    {activeMobileTab === tab.id && (
                        <motion.div layoutId="headerTabGlow" className="absolute inset-0 bg-white/10 rounded-xl -z-10 shadow-lg" />
                    )}
                </button>
              ))}
          </div>
      )}

      <div className="flex items-center gap-6 relative z-10">
        {user && !isMobile && (
            <div className="flex items-center gap-3">
                <button 
                    onClick={onSave}
                    disabled={isSaving}
                    className={cn(
                        "flex items-center gap-4 px-6 h-12 rounded-2xl text-[11px] font-black tracking-widest transition-all uppercase group/save border",
                        isSaving 
                          ? "bg-blue-600/20 border-blue-500/40 text-blue-400" 
                          : "bg-white/5 border-white/5 text-gray-500 hover:text-white hover:bg-white/10 hover:border-white/20 active:scale-95 shadow-xl"
                    )}
                >
                    <Database size={16} className={cn("transition-all duration-500", isSaving ? "animate-spin text-blue-400" : "group-hover/save:scale-125 group-hover:text-blue-400")} />
                    <span className="hidden sm:inline tracking-[0.2em]">{isSaving ? "SYNCING..." : "COMMIT WORK"}</span>
                </button>

                <button 
                    onClick={onShareWorkspace}
                    className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/5 border border-white/5 text-gray-500 hover:text-purple-400 hover:bg-white/10 hover:border-purple-500/20 transition-all shadow-xl active:scale-95 group/share"
                    title="Share Workspace"
                >
                    <Share2 size={18} className="group-hover/share:rotate-12 transition-transform" />
                </button>

                <button 
                    onClick={onLogout}
                    className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/5 border border-white/5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all shadow-xl active:scale-95 group/logout"
                    title="Disconnect AGI Core"
                >
                    <LogOut size={18} className="group-hover/logout:-translate-x-1 transition-transform" />
                </button>
            </div>
        )}

        {/* Neural Model Switcher */}
        {!isMobile && (
            <div className="relative group">
                <button className="flex items-center gap-4 h-12 px-6 hover:bg-white/5 rounded-2xl transition-all text-[11px] font-black tracking-widest text-gray-400 hover:text-white border border-white/5 bg-black/40 hover:border-white/20 shadow-2xl">
                  <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_15px_currentColor]" style={{ color: currentModel?.color, backgroundColor: currentModel?.color }} />
                  {currentModel?.name?.toUpperCase()}
                  <ChevronDown size={14} className="opacity-20 group-hover:rotate-180 transition-transform duration-700" />
                </button>
                <div className="absolute top-full right-0 mt-3 w-80 bg-[#080b12]/98 backdrop-blur-[60px] border border-white/10 rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.8)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] p-4 scale-95 group-hover:scale-100 origin-top-right duration-700">
                  <div className="px-5 py-4 border-b border-white/5 mb-3">
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em]">Integrated AGI Cores</span>
                  </div>
                  <div className="space-y-1.5">
                    {MODEL_LIST.map((model) => (
                        <button
                          key={model.id}
                          onClick={() => onModelChange(model.id)}
                          className={cn(
                              "w-full text-left px-5 py-4 rounded-2xl transition-all flex items-center justify-between group/model border",
                              activeModel === model.id 
                                ? "bg-blue-600 border-blue-400 text-white shadow-2xl scale-[1.02]" 
                                : "hover:bg-white/5 border-transparent text-gray-400 hover:text-white hover:border-white/10"
                          )}
                        >
                            <div className="space-y-1">
                              <div className="font-black text-[11px] tracking-widest uppercase">{model.name}</div>
                              <div className={cn("text-[9px] uppercase tracking-[0.2em]", activeModel === model.id ? "text-white/70" : "opacity-40 font-bold")}>{model.capability}</div>
                            </div>
                            {activeModel === model.id && (
                              <motion.div layoutId="activeModelIcon">
                                <Zap size={14} fill="white" className="drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                              </motion.div>
                            )}
                        </button>
                    ))}
                  </div>
                </div>
            </div>
        )}

        <button 
          onClick={onRun}
          disabled={isGenerating}
          className={cn(
            "flex items-center gap-4 px-10 h-12 rounded-2xl text-[11px] font-black tracking-[0.2em] transition-all duration-700 active:scale-95 group relative overflow-hidden uppercase shadow-3xl",
            isGenerating 
              ? "bg-blue-600/20 text-blue-400 cursor-not-allowed" 
              : "bg-blue-600 text-white hover:bg-blue-500 hover:shadow-[0_0_60px_rgba(59,130,246,0.4)] border border-blue-400/20"
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          {isGenerating ? <RefreshCw size={18} className="animate-spin" /> : <Play size={18} fill="currentColor" />}
          <span className="hidden sm:inline">DEPLOY AGI</span>
        </button>
        
        <div className="relative group">
            <button className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center text-gray-500 hover:text-white transition-all shadow-3xl hover:bg-white/10 border border-white/10 overflow-hidden active:scale-90",
                user ? "border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.1)]" : "border-white/5"
            )}>
               {user?.avatar ? (
                   <img src={user.avatar} alt="User" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
               ) : (
                   <User size={20} className="group-hover:text-blue-400 transition-colors" />
               )}
            </button>
            <div className="absolute top-full right-0 mt-3 w-80 bg-[#080b12]/98 backdrop-blur-[60px] border border-white/10 rounded-[2.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.8)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] p-3 scale-95 group-hover:scale-100 origin-top-right duration-700">
                <div className="p-8 text-center border-b border-white/5 mb-3 bg-white/[0.02] rounded-t-[2.2rem]">
                    <div className="relative w-20 h-20 mx-auto mb-6">
                        <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full scale-125" />
                        <div className="relative w-20 h-20 rounded-[2rem] mx-auto border-2 border-blue-500/40 p-1.5 backdrop-blur-3xl overflow-hidden">
                            {user?.avatar ? (
                                <img src={user.avatar} className="w-full h-full rounded-[1.5rem] object-cover" />
                            ) : (
                                <div className="w-full h-full bg-white/5 rounded-[1.5rem] flex items-center justify-center"><User size={28} /></div>
                            )}
                        </div>
                    </div>
                    <p className="text-lg font-black text-white truncate px-2 tracking-tight">{user?.username || 'SYSTEM_GUEST'}</p>
                    <div className="flex items-center justify-center gap-3 mt-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,1)]" />
                        <span className="text-[10px] text-emerald-400 font-black uppercase tracking-[0.2em]">{user ? 'Core Linked' : 'Standalone'}</span>
                    </div>
                </div>
                <div className="p-2 space-y-1.5">
                    <button 
                        onClick={onOpenSettings}
                        className="w-full text-left px-6 py-4 rounded-2xl text-[10px] font-black text-gray-500 hover:text-white hover:bg-white/5 transition-all flex items-center justify-between uppercase tracking-widest group/item border border-transparent hover:border-white/10"
                    >
                        <div className="flex items-center gap-4">
                            <Settings size={16} />
                            <span>System Settings</span>
                        </div>
                        <ChevronRight size={14} className="opacity-0 group-hover/item:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                    </button>
                    {user && (
                        <button 
                            onClick={onLogout}
                            className="w-full text-center px-6 py-5 rounded-2xl text-[10px] font-black text-red-500 hover:bg-red-500/10 transition-all uppercase tracking-[0.3em] border border-transparent hover:border-red-500/30 mt-4"
                        >
                            DISCONNECT_AGI_CORE
                        </button>
                    )}
                </div>
            </div>
        </div>
      </div>
    </header>
  );
};

const WorkspaceMenuItem: React.FC<{ icon: React.ReactNode, label: string }> = ({ icon, label }) => (
    <button className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[10px] font-black text-gray-500 hover:text-white hover:bg-white/5 transition-all uppercase tracking-widest group border border-transparent hover:border-white/10">
        <div className="text-gray-600 group-hover:text-blue-400 transition-colors">{icon}</div>
        <span>{label}</span>
    </button>
);
