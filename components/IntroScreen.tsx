import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Shield, Cpu, Activity, Database, Terminal, Loader2, Network, Globe } from 'lucide-react';
import { cn } from '../src/lib/utils';

export const IntroScreen: React.FC = () => {
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('Initializing Vayu Core...');

    const logs = [
        'Establishing Secure Neural Link...',
        'Syncing with Puter.js Storage Engine...',
        'Loading NVIDIA Nemotron Weights...',
        'Booting Multi-Agent System...',
        'Calibrating IDE Workspace...',
        'Interface Ready.'
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                const next = prev + Math.random() * 6;
                setStatus(logs[Math.floor((next / 100) * (logs.length - 1))]);
                return Math.min(next, 100);
            });
        }, 200);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 z-[200] bg-[#05070a] flex flex-col items-center justify-center overflow-hidden font-inter">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-[#05070a]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(30,58,138,0.15)_0%,transparent_70%)] opacity-50" />
            
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />

            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative flex flex-col items-center gap-16 w-full max-w-xl px-12"
            >
                {/* Central Orb Core */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-blue-500/20 blur-[60px] rounded-full scale-150 animate-pulse" />
                    <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        className="relative w-40 h-40 rounded-[2.5rem] bg-white/[0.03] border border-white/10 flex items-center justify-center backdrop-blur-3xl shadow-3xl"
                    >
                        <div className="absolute inset-4 rounded-3xl border border-blue-500/20 animate-pulse" />
                        <Zap size={56} className="text-blue-500 relative z-10" fill="currentColor" />
                        
                        {/* Orbiting Elements */}
                        {[...Array(4)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-2 h-2 bg-blue-400 rounded-full"
                                animate={{ 
                                    rotate: [0, 360],
                                    scale: [1, 1.2, 1]
                                }}
                                transition={{ 
                                    rotate: { duration: 4, repeat: Infinity, ease: "linear", delay: i * 1 },
                                    scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                                }}
                                style={{
                                    originY: '80px',
                                    top: '50%',
                                    left: '50%',
                                    marginTop: '-4px',
                                    marginLeft: '-4px'
                                }}
                            />
                        ))}
                    </motion.div>
                </div>

                <div className="w-full space-y-10">
                    <div className="space-y-4 text-center">
                        <div className="flex items-center justify-center gap-3 text-blue-400">
                           <Activity size={16} className="animate-pulse" />
                           <span className="text-[11px] font-black tracking-[0.6em] uppercase">VAYU AGI SYNTHESIS</span>
                        </div>
                        <div className="text-white/30 font-mono text-[9px] tracking-widest uppercase">
                            Linked to AUTONOMOUS_AGI_CORE_V4
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="h-2 w-full bg-white/[0.03] rounded-full overflow-hidden border border-white/5 p-0.5 shadow-inner">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ type: 'spring', damping: 20 }}
                                className="h-full bg-gradient-to-r from-blue-700 via-blue-500 to-purple-600 shadow-[0_0_30px_rgba(59,130,246,0.6)] rounded-full relative"
                            >
                                <div className="absolute top-0 right-0 h-full w-20 bg-gradient-to-l from-white/20 to-transparent animate-shimmer" />
                            </motion.div>
                        </div>
                        
                        <div className="flex justify-between items-center text-[10px] font-black text-white/50 tracking-[0.2em] uppercase">
                            <span>Initializing Filesystem</span>
                            <span className="text-blue-400">{Math.floor(progress)}%</span>
                        </div>
                    </div>

                    <div className="flex justify-center items-center gap-10 opacity-30">
                         <div className="flex items-center gap-2 group">
                            <Database size={14} className="group-hover:text-blue-500 transition-colors" />
                            <span className="text-[8px] font-black tracking-widest group-hover:text-white">Cloud FS</span>
                         </div>
                         <div className="w-px h-3 bg-white/10" />
                         <div className="flex items-center gap-2 group">
                            <Network size={14} className="group-hover:text-purple-500 transition-colors" />
                            <span className="text-[8px] font-black tracking-widest group-hover:text-white">Neural Net</span>
                         </div>
                         <div className="w-px h-3 bg-white/10" />
                         <div className="flex items-center gap-2 group">
                            <Globe size={14} className="group-hover:text-emerald-500 transition-colors" />
                            <span className="text-[8px] font-black tracking-widest group-hover:text-white">Global Sync</span>
                         </div>
                    </div>
                </div>

                {/* Bottom Detail */}
                <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent rounded-full blur-sm" />
            </motion.div>

            {/* Noise Overlay */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none mix-blend-overlay" />
            
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes shimmer {
                    from { transform: translateX(-100%); }
                    to { transform: translateX(100%); }
                }
                .animate-shimmer {
                    animation: shimmer 2s linear infinite;
                }
            `}} />
        </div>
    );
};
