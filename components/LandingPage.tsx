import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, useSpring } from 'framer-motion';
import { Sparkles, Code2, Zap, Rocket, Cpu, Shield, Globe, ArrowRight, Layers, Layout, Terminal, Monitor, Smartphone, Database, Activity, Command, MonitorPlay, ChevronRight, FileCode, CheckCircle2, Search, Settings, User, LogOut } from 'lucide-react';
import { cn } from '../src/lib/utils';

interface LandingPageProps {
  onStart: () => void;
  user: any;
  onLogin: () => void;
  isMobile: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, user, onLogin, isMobile }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const cursorX = useSpring(0, { damping: 50, stiffness: 400 });
  const cursorY = useSpring(0, { damping: 50, stiffness: 400 });

  useEffect(() => {
    const moveMouse = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', moveMouse);
    return () => window.removeEventListener('mousemove', moveMouse);
  }, []);

  const heroOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.1], [1, 0.98]);
  const studioY = useTransform(scrollYProgress, [0.05, 0.2], [100, 0]);
  const studioOpacity = useTransform(scrollYProgress, [0.05, 0.15], [0, 1]);

  return (
    <div ref={containerRef} className="relative min-h-[100dvh] bg-[#05070a] text-white selection:bg-blue-500/30 font-inter no-scrollbar flex flex-col overflow-y-auto">
      {/* Liquid Neural Matrix */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <NeuralBackground mousePos={mousePos} />
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(59, 130, 246, 0.15) 0%, transparent 50%)`,
            transition: 'background-image 0.2s ease-out'
          }}
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay" />
      </div>

      {/* Glass Navigation */}
      <nav className="fixed top-0 left-0 right-0 h-20 md:h-24 flex items-center justify-between px-4 md:px-12 z-[100] backdrop-blur-3xl border-b border-white/5 bg-black/40">
        <div className="flex items-center gap-3 md:gap-5 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.3)] group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 relative">
              <Zap size={20} className="md:w-6 md:h-6" fill="white" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-black text-lg md:text-xl tracking-[0.2em] md:tracking-[0.25em] text-white leading-none">VAYU AGI</span>
            <span className="hidden sm:block text-[8px] md:text-[9px] font-black tracking-[0.4em] md:tracking-[0.6em] text-blue-500/80 mt-1 sm:mt-1.5 uppercase">Self-Evolving</span>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-6">
           <AnimatePresence mode="wait">
             {!user ? (
               <motion.button 
                  key="login"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onClick={onLogin} 
                  className="hidden md:flex items-center gap-3 px-7 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all duration-500 shadow-xl font-black text-[10px] uppercase tracking-[0.3em] group active:scale-95"
               >
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 group-hover:animate-ping" />
                  <span className="relative z-10">Neural Sync</span>
               </motion.button>
             ) : (
               <div className="hidden sm:flex items-center gap-3 md:gap-4">
               <div className="flex items-center gap-3 md:gap-4 px-3 md:px-5 py-2 md:py-3 bg-white/[0.03] rounded-xl md:rounded-2xl border border-white/10 group cursor-pointer hover:bg-white/[0.06] transition-all">
                  <div className="relative shrink-0">
                    <img src={user.avatar} className="w-7 h-7 md:w-9 md:h-9 rounded-lg md:rounded-xl border-2 border-blue-500/30 group-hover:rotate-12 transition-transform duration-500" />
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 md:w-3.5 md:h-3.5 bg-emerald-500 rounded-full border-2 border-[#05070a] shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
                  </div>
                  <div className="hidden md:flex flex-col">
                      <span className="text-[10px] md:text-[11px] font-black text-white leading-none tracking-tight">{user.username}</span>
                      <span className="text-[7px] md:text-[8px] text-blue-400 font-bold uppercase tracking-widest mt-0.5 md:mt-1">Authorized</span>
                  </div>
               </div>
               <button 
                 onClick={() => window.dispatchEvent(new CustomEvent('vayu-logout'))}
                 className="p-3 md:p-3.5 rounded-xl border border-white/5 hover:bg-red-500/10 hover:border-red-500/20 text-gray-500 hover:text-red-500 transition-all active:scale-90"
                 title="Disconnect Core"
               >
                 <LogOut size={18} />
               </button>
             </div>
             )}
           </AnimatePresence>
           <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onStart}
            className="flex items-center gap-3 md:gap-5 px-6 md:px-12 py-3 md:py-4 bg-blue-600 text-white rounded-xl md:rounded-2xl hover:bg-blue-500 transition-all duration-700 shadow-[0_0_60px_rgba(59,130,246,0.35)] font-black text-[9px] md:text-[11px] uppercase tracking-[0.15em] md:tracking-[0.2em] group border border-blue-400/30 active:scale-95 whitespace-nowrap"
          >
            <span className="hidden xs:inline">Access Core</span>
            <span className="xs:hidden">Enter</span>
            <ArrowRight size={16} className="md:w-5 md:h-5 group-hover:translate-x-2 transition-transform duration-700" />
          </motion.button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[100dvh] flex flex-col items-center justify-center px-6 text-center pt-24 pb-12 shrink-0 md:pt-32">
        <motion.div 
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="relative z-10 w-full max-w-7xl"
        >
          <motion.div
             initial={{ opacity: 0, y: 30 }}
             animate={{ opacity: 1, y: 0 }}
             className="px-6 md:px-8 py-2.5 md:py-3 bg-white/[0.03] border border-white/10 rounded-full inline-flex items-center gap-3 md:gap-5 mb-12 md:mb-20 backdrop-blur-3xl shadow-[0_0_40px_rgba(0,0,0,0.5)]"
          >
             <div className="relative flex items-center justify-center">
               <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,1)]" />
               <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-30" />
             </div>
             <span className="text-[9px] md:text-[11px] font-black tracking-[0.3em] md:tracking-[0.5em] text-blue-100 uppercase italic">VAYU AGI PROTOCOL ACTIVE</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 100, rotateX: 20 }}
            animate={isLoaded ? { opacity: 1, y: 0, rotateX: 0 } : {}}
            transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
            className="text-[14vw] md:text-[13vw] font-black tracking-[-0.07em] leading-[0.8] mb-12 md:mb-24 select-none relative"
          >
            <span className="block text-white mb-2 drop-shadow-[0_40px_80px_rgba(0,0,0,0.8)]">VAYU_AGI</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-blue-500 to-purple-600 drop-shadow-[0_0_120px_rgba(59,130,246,0.3)] inline-block pb-4 md:pb-8">INFINITE_CODE</span>
            
            {/* Float Detail */}
            <motion.div 
              animate={{ 
                y: [0, -20, 0],
                rotate: [0, 5, 0]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-12 -right-12 hidden lg:flex flex-col items-end gap-2"
            >
              <div className="px-5 py-2 bg-blue-600/20 border border-blue-500/30 backdrop-blur-xl rounded-xl font-mono text-[9px] font-black tracking-[0.4em] text-blue-400 shadow-2xl uppercase">System_Stable: v4.2</div>
              <div className="h-px w-48 bg-gradient-to-l from-blue-500/50 to-transparent" />
            </motion.div>
          </motion.h1>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col items-center gap-24"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 w-full max-w-2xl px-6">
               {!user ? (
                  <button 
                  onClick={onLogin}
                  className="group relative h-16 sm:h-24 bg-white/5 border border-white/10 rounded-[1.5rem] sm:rounded-[2.5rem] backdrop-blur-[50px] hover:bg-white/[0.08] transition-all duration-700 shadow-3xl hover:shadow-blue-500/10 overflow-hidden active:scale-95 flex items-center justify-center gap-4 sm:gap-5 px-8 sm:px-10"
                >
                  <Monitor className="text-blue-500 group-hover:scale-125 transition-transform duration-700" size={20} />
                  <span className="font-black tracking-[0.3em] text-[10px] sm:text-[11px] text-white/70 uppercase">Initialize Sync</span>
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-blue-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left" />
                </button>
               ) : (
                  <div className="flex items-center gap-4 sm:gap-6 h-16 sm:h-24 bg-white/5 border border-white/10 rounded-[1.5rem] sm:rounded-[2.5rem] px-8 sm:px-10 backdrop-blur-3xl">
                     <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                        <CheckCircle2 size={20} />
                     </div>
                     <div className="text-left">
                        <div className="text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none">Workspace Core</div>
                        <div className="text-xs sm:text-sm font-black text-white uppercase tracking-tighter mt-1">Authorized</div>
                     </div>
                  </div>
               )}

              <button 
                onClick={onStart}
                className="group relative h-16 sm:h-24 bg-blue-600 text-white font-black rounded-[1.5rem] sm:rounded-[2.5rem] hover:bg-blue-500 transition-all duration-700 shadow-[0_20px_80px_rgba(59,130,246,0.3)] overflow-hidden active:scale-95 flex items-center justify-center gap-4 sm:gap-6 px-8 sm:px-10 border border-blue-400/40"
              >
                <span className="relative z-10 text-[10px] sm:text-[11px] tracking-[0.3em] sm:tracking-[0.4em] uppercase">Enter Session</span>
                <ArrowRight size={20} className="group-hover:translate-x-3 transition-transform duration-700 relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              </button>
            </div>

            <div className="flex flex-wrap justify-center gap-6 max-w-6xl mx-auto px-4 opacity-70 hover:opacity-100 transition-opacity duration-700">
                <PromptPill text="Generate AGI Visualizer" delay={0.8} color="blue" />
                <PromptPill text="Architect Infinite UI" delay={0.9} color="purple" />
                <PromptPill text="Vayu Cloud Persistent FS" delay={1.0} color="emerald" />
                <PromptPill text="AGI Synthesis API" delay={1.1} color="pink" />
            </div>
          </motion.div>
        </motion.div>
        
        {/* Decorative Scroll Hint */}
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-5 opacity-30 group">
          <div className="relative">
            <div className="w-px h-24 bg-gradient-to-b from-blue-500 via-purple-500 to-transparent scale-y-1 group-hover:scale-y-125 transition-transform duration-1000 origin-top" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,1)] animate-bounce" />
          </div>
          <span className="text-[10px] font-black tracking-[0.8em] uppercase text-gray-500 rotate-180 group-hover:text-blue-400 transition-colors" style={{ writingMode: 'vertical-rl' }}>Protocol</span>
        </div>
      </section>

      {/* Live Synthesis Preview Section */}
      <section className="relative py-64 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
             <div className="space-y-10 text-center lg:text-left">
                <div className="inline-flex items-center gap-4 px-6 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full">
                   <Activity size={16} className="text-blue-500 animate-pulse" />
                   <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em]">Live Agent Monitoring</span>
                </div>
                <h2 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] text-white">
                  NEURAL <br />
                  SYTHESIS <br />
                  LOOP. <br />
                  <span className="text-blue-500">REALTIME.</span>
                </h2>
                <p className="text-gray-500 text-xl md:text-2xl font-light leading-relaxed max-w-xl mx-auto lg:mx-0">
                  Witness the architecture evolve as Vayu's multi-agent core negotiates every line of code across the Vayu AGI reasoning grid.
                </p>
                <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                  <div className="flex items-center gap-4 px-6 py-3 bg-white/5 rounded-2xl border border-white/10">
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                     <span className="text-[10px] font-black uppercase tracking-widest">Agent Link Stable</span>
                  </div>
                   <div className="flex items-center gap-4 px-6 py-3 bg-white/5 rounded-2xl border border-white/10">
                     <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                     <span className="text-[10px] font-black uppercase tracking-widest">FS Persisted</span>
                  </div>
                </div>
             </div>
             
             <motion.div 
               whileHover={{ scale: 1.02 }}
               className="relative group h-[400px] sm:h-[500px] md:h-[600px]"
             >
                <div className="absolute -inset-4 bg-blue-500/20 blur-[100px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                <div className="relative h-full bg-[#080b12] rounded-[3rem] border border-white/10 overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.8)] backdrop-blur-3xl flex flex-col">
                   <div className="h-12 border-b border-white/5 flex items-center justify-between px-8 bg-white/5">
                      <div className="flex items-center gap-3">
                         <div className="flex gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-red-500/50" />
                            <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                            <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
                         </div>
                         <div className="w-px h-3 bg-white/10 ml-2" />
                         <span className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em]">Core_Terminal_v4.2</span>
                      </div>
                      <div className="flex items-center gap-4">
                         <Search size={14} className="text-gray-600" />
                         <Settings size={14} className="text-gray-600" />
                      </div>
                   </div>
                   
                   <div className="flex-1 p-4 sm:p-8 font-mono text-[9px] sm:text-[11px] space-y-4 sm:space-y-6 overflow-hidden">
                      <div className="flex gap-4">
                         <span className="text-blue-500 shrink-0">~ VAYU:</span>
                         <span className="text-gray-400">Initializing evolution-sync-protocol...</span>
                      </div>
                      <div className="flex gap-4">
                         <span className="text-purple-500 shrink-0">~ GRID:</span>
                         <span className="text-blue-100 italic transition-all group-hover:text-cyan-400">"Autonomous mesh grid stabilized. Purging legacy buffers..."</span>
                      </div>
                      <div className="flex flex-col gap-2 mt-4 px-4 py-3 bg-black/40 border border-white/5 rounded-xl font-mono text-[9px] text-gray-500">
                          <div className="flex justify-between"><span>[06:02:41] LINTING_NODES</span><span className="text-emerald-500 uppercase">Success</span></div>
                          <div className="flex justify-between"><span>[06:02:45] SYNCING_REFS</span><span className="text-blue-500 uppercase">Active</span></div>
                          <div className="flex justify-between"><span>[06:02:48] CHUNK_ID_V42</span><span className="text-purple-500 uppercase">Cached</span></div>
                      </div>
                      <div className="flex gap-4">
                         <span className="text-emerald-500 shrink-0">~ DEVELOPER:</span>
                         <span className="text-emerald-400/80">
                           <pre className="mt-2 text-[10px]">
{`const MeshGrid = () => {
  return (
    <motion.div 
      animate={{ rotateY: 360 }}
      className="grid-4x4" 
    />
  );
};`}
                           </pre>
                         </span>
                      </div>
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="h-px bg-blue-500/40" 
                      />
                      <div className="flex gap-4 text-blue-300">
                         <Loader2 size={14} className="animate-spin" />
                         <span className="font-black uppercase tracking-widest text-[9px]">Analyzing structural integrity...</span>
                      </div>
                   </div>
                   
                   <div className="h-16 sm:h-20 border-t border-white/5 bg-black/40 px-6 sm:px-10 flex items-center justify-between">
                      <div className="flex items-center gap-4 sm:gap-6">
                         <div className="flex items-center gap-2">
                            <Database size={12} className="sm:w-[14px] sm:h-[14px] text-blue-500" />
                            <span className="text-[8px] sm:text-[9px] font-black text-gray-500 tracking-widest uppercase">System_Sync</span>
                         </div>
                          <div className="flex items-center gap-2">
                            <Layers size={12} className="sm:w-[14px] sm:h-[14px] text-purple-500" />
                            <span className="text-[8px] sm:text-[9px] font-black text-gray-500 tracking-widest uppercase">Mesh_Active</span>
                         </div>
                      </div>
                      <div className="hidden xs:block text-[8px] sm:text-[9px] font-black text-gray-700 tracking-[0.2em]">02:34:51.002MS</div>
                   </div>
                </div>
             </motion.div>
          </div>
        </div>
      </section>

      {/* Interactive Prototypes Section */}
      <section className="relative py-48 px-6 bg-[#030508] border-t border-white/5 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-purple-500/5 blur-[120px] rounded-full" />
           <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-32 space-y-4">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-3 px-5 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full"
              >
                <Sparkles size={14} className="text-purple-400" />
                <span className="text-[10px] font-black text-purple-400 uppercase tracking-[0.4em]">Active Prototypes</span>
              </motion.div>
              <h3 className="text-5xl md:text-8xl font-black tracking-tighter leading-none text-white">THE SYNTH REGISTRY</h3>
              <p className="text-gray-500 text-lg md:text-xl font-light uppercase tracking-[0.2em] mt-6">4 Modules Ready for Instant Deployment</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
             <PrototypeModule 
                title="Neural Canvas" 
                icon={<Smartphone size={32} />} 
                color="blue"
                status="Calibrated"
                tags={["React", "Motion", "Canvas"]}
             />
             <PrototypeModule 
                title="Ghost DB" 
                icon={<Database size={32} />} 
                color="purple"
                status="Online"
                tags={["Vector", "Sync", "NoSQL"]}
             />
             <PrototypeModule 
                title="Prism Auth" 
                icon={<Shield size={32} />} 
                color="emerald"
                status="Secured"
                tags={["Web3", "OAuth", "JWT"]}
             />
             <PrototypeModule 
                title="Pulse Edge" 
                icon={<Activity size={32} />} 
                color="pink"
                status="Streaming"
                tags={["WS", "Realtime", "D3"]}
             />
          </div>
        </div>
      </section>

      {/* Feature Architecture Matrix */}
      <section className="relative py-48 px-6 md:px-12 z-10 bg-[#020408] border-t border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.08),transparent_70%)] pointer-events-none" />
         <motion.div 
            style={{ opacity: studioOpacity, y: studioY }}
            className="max-w-7xl mx-auto"
         >
            <div className="text-center mb-32 space-y-4">
                <h2 className="text-[11px] font-black text-blue-500 tracking-[0.6em] uppercase">Architecture</h2>
                <h3 className="text-5xl md:text-8xl font-black tracking-tighter leading-none">THE HYPER CORE</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
               <FeatureCard 
                  icon={<Cpu className="text-blue-500" size={32} />} 
                  title="AGI CORE MODULE" 
                  desc="Leverage the massive reasoning capabilities of Vayu's autonomous self-evolving neural architecture for production code synthesis." 
               />
               <FeatureCard 
                  icon={<Database className="text-purple-500" size={32} />} 
                  title="VAYU CLOUD FS" 
                  desc="Full desktop-grade filesystem persistence and cloud sync. Your workspace travels with you, powered by integrated AGI edge storage." 
               />
               <FeatureCard 
                  icon={<MonitorPlay className="text-emerald-500" size={32} />} 
                  title="LIQUID WORKSPACE" 
                  desc="A multi-agent orchestrated environment that bridges human creativity with hyperspeed neural execution loops." 
               />
            </div>
         </motion.div>
      </section>

      {/* Neural Showcase Grid */}
      <section className="py-24 sm:py-40 border-t border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 mb-16 sm:mb-32 text-center md:text-left flex flex-col md:flex-row items-center md:items-end justify-between gap-8">
            <div className="space-y-4">
                <h2 className="text-[9px] sm:text-[11px] font-black text-purple-500 tracking-[0.6em] uppercase">Templates</h2>
                <h3 className="text-4xl sm:text-5xl md:text-8xl font-black tracking-tighter leading-none">PRE-SYNTH RECIPIES</h3>
            </div>
            <p className="max-w-md text-gray-500 text-base sm:text-lg font-light leading-relaxed">
              Standardized blueprints for high-performance frontend interfaces, ready for neural expansion.
            </p>
        </div>
        
        <div className="flex gap-4 sm:gap-10 px-6 sm:px-12 animate-scroll-left hover:[animation-play-state:paused]">
            {[...Array(2)].map((_, i) => (
                <div key={i} className="flex gap-4 sm:gap-10 shrink-0">
                    <ProjectCard title="Neumorphic Hub" prompt="Glassmorphic admin panel with depth" color="blue" icon={<Layout size={24} />} isMobile={isMobile} />
                    <ProjectCard title="Vayu Terminal" prompt="Integrated neurallog stream interface" color="purple" icon={<Terminal size={24} />} isMobile={isMobile} />
                    <ProjectCard title="World Mesh" prompt="Global 3D node orchestration UI" color="pink" icon={<Globe size={24} />} isMobile={isMobile} />
                    <ProjectCard title="Auth Core" prompt="Vayu identity provider template" color="emerald" icon={<Shield size={24} />} isMobile={isMobile} />
                </div>
            ))}
        </div>
      </section>

      {/* Final Launch Sequence */}
      <footer className="relative h-[90dvh] flex flex-col items-center justify-center overflow-hidden border-t border-white/5 bg-gradient-to-t from-blue-950/20 to-transparent">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent shadow-[0_0_100px_rgba(59,130,246,0.8)]" />
        
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-center space-y-20 relative z-10 w-full max-w-5xl px-6"
        >
            <div className="space-y-8">
                <div className="inline-flex items-center gap-3 px-5 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-[9px] font-black text-blue-400 uppercase tracking-[0.4em]">Ready for Expansion</span>
                </div>
                <h2 className="text-7xl md:text-[11rem] font-black tracking-tighter leading-none mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">INITIALIZE <br/> SYNTHESIS</h2>
                <p className="text-gray-500 text-lg md:text-xl font-light uppercase tracking-[0.25em] max-w-2xl mx-auto">Vayu AGI v4.2 Stable • Neural Grid Asian Matrix • Latency: 12ms</p>
            </div>

            <button 
                onClick={onStart}
                className="group relative px-10 md:px-24 py-6 md:py-12 bg-white text-black font-black rounded-[2.5rem] md:rounded-[4rem] hover:bg-blue-600 hover:text-white transition-all duration-700 active:scale-95 shadow-[0_50px_100px_rgba(0,0,0,0.5)] hover:shadow-[0_0_150px_rgba(59,130,246,0.5)] text-lg md:text-2xl tracking-[0.2em] md:tracking-[0.3em] overflow-hidden"
            >
                <span className="relative z-10">INITIALIZE CORE</span>
                <div className="absolute inset-0 bg-blue-500 translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
            </button>
            
            <div className="pt-20 md:pt-32 flex flex-wrap justify-center items-center gap-10 md:gap-24 text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] md:tracking-[0.5em]">
                <div className="group cursor-default">
                    <p className="group-hover:text-blue-400 transition-colors">LATENCY</p>
                    <p className="text-white mt-1.5 md:text-white md:mt-2">12ms avg</p>
                </div>
                <div className="group cursor-default">
                    <p className="group-hover:text-purple-400 transition-colors">NODES</p>
                    <p className="text-white mt-1.5 md:text-white md:mt-2">1.2k Active</p>
                </div>
                <div className="group cursor-default">
                    <p className="group-hover:text-emerald-400 transition-colors">UPTIME</p>
                    <p className="text-white mt-1.5 md:text-white md:mt-2">100.0%</p>
                </div>
            </div>
        </motion.div>

        {/* Liquid Sphere Detail */}
        <div className="absolute -bottom-1/2 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] bg-blue-600/5 blur-[180px] rounded-full -z-0" />
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scroll-left {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
        }
        .animate-scroll-left {
            animation: scroll-left 50s linear infinite;
        }
        @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
            animation: spin-slow 12s linear infinite;
        }
      `}} />
    </div>
  );
};

// --- Subcomponents ---

const NeuralBackground = ({ mousePos }: { mousePos: { x: number, y: number } }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        let animationFrameId: number;
        let particles: any[] = [];
        const particleCount = 60;
        
        const resize = () => {
            if (!canvasRef.current) return;
            canvasRef.current.width = window.innerWidth;
            canvasRef.current.height = window.innerHeight;
        };
        
        window.addEventListener('resize', resize);
        resize();
        
        class Particle {
            x: number; y: number; vx: number; vy: number; size: number;
            constructor() {
                const w = canvasRef.current?.width || window.innerWidth;
                const h = canvasRef.current?.height || window.innerHeight;
                this.x = Math.random() * w;
                this.y = Math.random() * h;
                this.vx = (Math.random() - 0.5) * 0.4;
                this.vy = (Math.random() - 0.5) * 0.4;
                this.size = Math.random() * 1.5 + 0.5;
            }
            update() {
                const w = canvasRef.current?.width || window.innerWidth;
                const h = canvasRef.current?.height || window.innerHeight;
                this.x += this.vx;
                this.y += this.vy;
                if (this.x < 0 || this.x > w) this.vx *= -1;
                if (this.y < 0 || this.y > h) this.vy *= -1;
            }
            draw(ctx: CanvasRenderingContext2D) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(59, 130, 246, 0.4)';
                ctx.fill();
            }
        }
        
        for (let i = 0; i < particleCount; i++) particles.push(new Particle());
        
        const animate = () => {
            const currentCtx = canvasRef.current?.getContext('2d');
            if (!currentCtx || !canvasRef.current) return;
            
            currentCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            
            particles.forEach((p, i) => {
                p.update();
                p.draw(currentCtx);
                
                // Mouse interaction
                const dx = mousePos.x - p.x;
                const dy = mousePos.y - p.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < 200) {
                    currentCtx.beginPath();
                    currentCtx.moveTo(p.x, p.y);
                    currentCtx.lineTo(mousePos.x, mousePos.y);
                    currentCtx.strokeStyle = `rgba(59, 130, 246, ${0.15 * (1 - dist/200)})`;
                    currentCtx.stroke();
                }

                // Inter-particle connections
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx2 = p.x - p2.x;
                    const dy2 = p.y - p2.y;
                    const dist2 = Math.sqrt(dx2*dx2 + dy2*dy2);
                    if (dist2 < 150) {
                        currentCtx.beginPath();
                        currentCtx.moveTo(p.x, p.y);
                        currentCtx.lineTo(p2.x, p2.y);
                        currentCtx.strokeStyle = `rgba(59, 130, 246, ${0.1 * (1 - dist2/150)})`;
                        currentCtx.stroke();
                    }
                }
            });
            
            animationFrameId = requestAnimationFrame(animate);
        };
        
        animate();
        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [mousePos]);

    return (
        <canvas 
            ref={canvasRef} 
            className="absolute inset-0 z-0 opacity-40 pointer-events-none"
        />
    );
};

const PromptPill: React.FC<{ text: string, delay: number, color: string }> = ({ text, delay, color }) => {
    const colorClasses: Record<string, string> = {
        blue: "text-blue-400 group-hover:text-blue-300 border-blue-500/20",
        purple: "text-purple-400 group-hover:text-purple-300 border-purple-500/20",
        pink: "text-pink-400 group-hover:text-pink-300 border-pink-500/20",
        emerald: "text-emerald-400 group-hover:text-emerald-300 border-emerald-500/20"
    };

    return (
        <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="group"
        >
            <div className={cn(
                "px-7 py-3 rounded-2xl bg-white/[0.03] border text-[10px] font-black tracking-[0.2em] cursor-pointer transition-all duration-500 backdrop-blur-3xl uppercase flex items-center gap-3",
                colorClasses[color]
            )}>
                <div className="w-1 h-1 rounded-full bg-current animate-pulse" />
                {text}
                <ChevronRight size={12} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500" />
            </div>
        </motion.div>
    );
};

const FeatureCard: React.FC<{ icon: React.ReactNode, title: string, desc: string }> = ({ icon, title, desc }) => (
    <motion.div 
        whileHover={{ y: -15 }}
        className="p-12 rounded-[3.5rem] bg-white/[0.02] border border-white/5 backdrop-blur-3xl space-y-10 group hover:bg-white/[0.05] transition-all duration-700 shadow-2xl relative overflow-hidden flex flex-col"
    >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        <div className="w-20 h-20 rounded-3xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center shadow-inner relative z-10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
            {icon}
        </div>
        <div className="space-y-6 flex-1">
            <h4 className="text-2xl font-black tracking-tight text-white relative z-10 flex items-baseline gap-3">
                {title}
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            </h4>
            <p className="text-gray-500 text-base leading-relaxed font-medium relative z-10 group-hover:text-gray-300 transition-colors duration-500">
                {desc}
            </p>
        </div>
        <div className="relative z-10 flex items-center gap-3 text-[10px] font-black text-blue-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-700 transform translate-y-4 group-hover:translate-y-0">
            Read Specs <ChevronRight size={14} />
        </div>
    </motion.div>
);

const PrototypeModule: React.FC<{ title: string, icon: React.ReactNode, color: string, status: string, tags: string[] }> = ({ title, icon, color, status, tags }) => {
    const accents: Record<string, string> = {
        blue: "text-blue-500 bg-blue-500/10 border-blue-500/30",
        purple: "text-purple-500 bg-purple-500/10 border-purple-500/30",
        emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30",
        pink: "text-pink-500 bg-pink-500/10 border-pink-500/30",
    };

    return (
        <motion.div 
            whileHover={{ y: -10, scale: 1.02 }}
            className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/10 flex flex-col group transition-all duration-500 hover:bg-white/[0.06] hover:border-white/20 shadow-2xl relative overflow-hidden"
        >
            {/* Orbital Aura */}
            <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            
            <div className="flex justify-between items-start mb-10">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-700", accents[color])}>
                    {icon}
                </div>
                <div className="flex flex-col items-end gap-1.5 px-3 py-1 bg-black/40 rounded-full border border-white/5">
                    <div className="flex items-center gap-1.5">
                        <div className={cn("w-1 h-1 rounded-full animate-pulse", color === 'blue' ? 'bg-blue-500' : color === 'purple' ? 'bg-purple-500' : color === 'emerald' ? 'bg-emerald-500' : 'bg-pink-500')} />
                        <span className="text-[8px] font-black text-white/50 uppercase tracking-widest">{status}</span>
                    </div>
                </div>
            </div>
            
            <h4 className="text-xl font-black tracking-tight text-white mb-6 group-hover:text-blue-400 transition-colors uppercase">{title}</h4>
            
            <div className="flex flex-wrap gap-2 mb-10">
                {tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-white/5 rounded-lg text-[8px] font-black text-gray-500 uppercase tracking-widest border border-white/5">{tag}</span>
                ))}
            </div>

            <button 
                className="w-full py-4 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-[0.3em] text-gray-500 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-400 transition-all duration-700"
            >
                Initialize Synth
            </button>
            
            {/* Visual Context Effect */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/5 blur-3xl rounded-full group-hover:bg-blue-500/10 transition-colors" />
        </motion.div>
    );
};

const ProjectCard: React.FC<{ title: string, prompt: string, color: string, icon: React.ReactNode, isMobile: boolean }> = ({ title, prompt, color, icon, isMobile }) => {
    const colors: Record<string, string> = {
        blue: "from-blue-600/20 shadow-blue-500/10",
        purple: "from-purple-600/20 shadow-purple-500/10",
        pink: "from-pink-600/20 shadow-pink-500/10",
        emerald: "from-emerald-600/20 shadow-emerald-500/10"
    };

    return (
        <div className="w-72 sm:w-96 group cursor-pointer shrink-0">
            <div className={cn(
                "aspect-[4/3] rounded-[2.5rem] sm:rounded-[4rem] bg-[#020408] border border-white/10 p-6 sm:p-10 flex flex-col justify-between transition-all duration-1000 group-hover:scale-[1.03] group-hover:-translate-y-6 shadow-3xl overflow-hidden relative mb-4 sm:mb-8",
                "before:absolute before:inset-0 before:bg-gradient-to-br before:opacity-20 before:transition-opacity before:duration-700 hover:before:opacity-100",
                colors[color]
            )}>
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 mix-blend-overlay" />
                <div className="flex justify-between items-start relative z-10">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 group-hover:text-white transition-all duration-700 group-hover:bg-blue-600/20 group-hover:border-blue-500/40">
                        {React.cloneElement(icon as React.ReactElement, { size: isMobile ? 18 : 24 } as any)}
                    </div>
                    <div className="px-3 sm:px-4 py-1 sm:py-1.5 bg-white/5 border border-white/10 rounded-full text-[7px] sm:text-[8px] font-black text-gray-400 tracking-[0.25em] sm:tracking-[0.3em] uppercase backdrop-blur-xl shrink-0">Template_v4</div>
                </div>
                <div className="relative z-10">
                    <h4 className="text-xl sm:text-3xl font-black tracking-tighter mb-2 sm:mb-5 text-white/90 group-hover:text-white transition-all duration-700 leading-none">{title}</h4>
                    <p className="text-[8px] sm:text-[10px] text-gray-500 line-clamp-2 leading-relaxed font-black tracking-[0.15em] sm:tracking-[0.2em] uppercase group-hover:text-gray-400 transition-colors">{prompt}</p>
                </div>
            </div>
        </div>
    );
};

const Loader2 = ({ size, className }: { size: number, className?: string }) => (
    <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className={className}
    >
        <RefreshCw size={size} />
    </motion.div>
);

const RefreshCw = ({ size, className }: { size: number, className?: string }) => (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
    </svg>
)
