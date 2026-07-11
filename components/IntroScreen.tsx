import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Zap, Shield, Cpu, Activity, Database, Terminal, Network, Globe, Server, Check, KeyRound, Unlock, ArrowRight, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '../src/lib/utils';

interface IntroScreenProps {
  user: any;
  onLogin: () => void;
  onComplete: () => void;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({ user, onLogin, onComplete }) => {
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('Initializing Core Network...');
    const [activeLogs, setActiveLogs] = useState<string[]>([]);
    const terminalEndRef = useRef<HTMLDivElement>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [systemMetrics, setSystemMetrics] = useState({
        integrity: 98.4,
        latency: 12,
        load: 42,
    });

    const rawLogs = [
        'Establishing quantum-encrypted tunneling layer...',
        'Connecting to federated synthesis grid nodes...',
        'Loading Vayu AGI v4.2 attention weight maps...',
        'Model weights decrypted in safe memory segment...',
        'Compiling high-performance code-generation AST layers...',
        'Booting distributed Multi-Agent swarm protocols...',
        'Initializing workspace sandbox filesystem virtual disk...',
        'Mounting persistent decentralized workspace volume...',
        'Conducting structural syntax audits on local indexes...',
        'Syncing neural parameters with distributed cache...',
        'Stabilizing core interfaces and hot patching pipeline...',
        'Secure connection established. Decrypted session ready.'
    ];

    // Mouse parallax tracking for optical depth
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };
        const handleTouchMove = (e: TouchEvent) => {
            if (e.touches && e.touches[0]) {
                setMousePos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
            }
        };
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('touchmove', handleTouchMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchmove', handleTouchMove);
        };
    }, []);

    // Scroll terminal log stream to bottom
    useEffect(() => {
        if (terminalEndRef.current) {
            terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [activeLogs]);

    // Live changing system metrics for immersive cyber realism
    useEffect(() => {
        const metricInterval = setInterval(() => {
            setSystemMetrics(prev => ({
                integrity: Math.min(100, Math.max(95, prev.integrity + (Math.random() - 0.5) * 0.2)),
                latency: Math.max(4, Math.min(45, Math.floor(prev.latency + (Math.random() - 0.5) * 4))),
                load: Math.max(10, Math.min(95, Math.floor(prev.load + (Math.random() - 0.5) * 6))),
            }));
        }, 1200);
        return () => clearInterval(metricInterval);
    }, []);

    // Automatic session entry upon successful login
    useEffect(() => {
        if (user && progress >= 100) {
            const timer = setTimeout(() => {
                onComplete();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [user, progress, onComplete]);

    // Fast and progressive loading logic
    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                
                // Adaptive progressive jumps for real system feel
                const increment = Math.random() * 14 + 6;
                const next = Math.min(prev + increment, 100);

                const logIndex = Math.floor((next / 100) * rawLogs.length);
                const uniqueLogs = rawLogs.slice(0, logIndex + 1);
                
                const formattedLogs = uniqueLogs.map((log, idx) => {
                    const sec = String(Math.floor(idx * 0.2)).padStart(2, '0');
                    const ms = String(Math.floor((idx * 289) % 999)).padStart(3, '0');
                    return `[00:00:${sec}.${ms}] CORE_SYS_DAEMON // ${log}`;
                });
                
                setActiveLogs(formattedLogs);
                
                if (rawLogs[logIndex]) {
                    setStatus(rawLogs[logIndex]);
                }

                return next;
            });
        }, 140);
        
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 z-[200] bg-[#030508] flex flex-col justify-between p-4 sm:p-6 md:p-10 lg:p-12 overflow-y-auto scrollbar-none font-inter select-none">
            {/* Hypnotic Rotating Illusion & Moiré Canvas Background */}
            <IllusionBackground mousePos={mousePos} />

            {/* Dark Refraction Vignette & Noise overlays */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_10%,rgba(3,5,8,0.96)_100%)] pointer-events-none z-[1]" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] pointer-events-none mix-blend-overlay z-[2]" />

            {/* --- TOP SECTION: NEURAL STATS & HEADER --- */}
            <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col sm:flex-row gap-4 justify-between items-center opacity-85 border-b border-white/5 pb-4 sm:pb-6">
                <div className="flex items-center gap-3">
                    <div className="relative flex items-center justify-center">
                        <span className="absolute inline-flex h-2.5 w-2.5 rounded-full bg-blue-500 animate-ping opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                    </div>
                    <div>
                        <span className="text-[10px] font-black tracking-[0.4em] uppercase text-blue-400">Vayu AGI Synthesis</span>
                        <div className="text-[8px] text-gray-500 tracking-widest font-mono uppercase mt-0.5">Secure Swarm Nodes Active</div>
                    </div>
                </div>

                {/* Cyber HUD Widgets */}
                <div className="flex gap-4 sm:gap-6 font-mono text-[9px] text-gray-400">
                    <div className="flex items-center gap-1.5 bg-white/[0.02] border border-white/5 rounded-md px-2.5 py-1">
                        <Activity size={10} className="text-blue-400" />
                        <span className="text-gray-500">INTEGRITY:</span>
                        <span className="text-white font-bold">{systemMetrics.integrity.toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white/[0.02] border border-white/5 rounded-md px-2.5 py-1">
                        <Cpu size={10} className="text-purple-400" />
                        <span className="text-gray-500">LATENCY:</span>
                        <span className="text-white font-bold">{systemMetrics.latency}ms</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white/[0.02] border border-white/5 rounded-md px-2.5 py-1">
                        <Server size={10} className="text-emerald-400" />
                        <span className="text-gray-500">LOAD:</span>
                        <span className="text-white font-bold">{systemMetrics.load}%</span>
                    </div>
                </div>
            </div>

            {/* --- MIDDLE SECTION: HOLOGRAPHIC PORTAL & INTERACTIVE CONTROLS --- */}
            <div className="relative z-10 w-full max-w-lg mx-auto flex flex-col items-center justify-center my-auto py-8 px-2">
                <AnimatePresence mode="wait">
                    {progress < 100 ? (
                        <motion.div 
                            key="booting"
                            initial={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, y: -20 }}
                            transition={{ duration: 0.4 }}
                            className="flex flex-col items-center gap-8 w-full"
                        >
                            {/* Dial Portal */}
                            <div className="relative w-40 h-40 sm:w-48 sm:h-48 flex items-center justify-center">
                                {/* Intense glowing aura */}
                                <div className="absolute inset-0 bg-blue-500/15 blur-[65px] rounded-full animate-pulse" />
                                
                                {/* Dial Loader */}
                                <svg className="absolute inset-0 w-full h-full -rotate-90">
                                    <circle 
                                        cx="50%" 
                                        cy="50%" 
                                        r="45%" 
                                        className="stroke-white/5 fill-none" 
                                        strokeWidth="2.5"
                                    />
                                    <motion.circle 
                                        cx="50%" 
                                        cy="50%" 
                                        r="45%" 
                                        className="stroke-blue-500 fill-none" 
                                        strokeWidth="3.5"
                                        strokeDasharray={2 * Math.PI * 76} // approximate radius
                                        animate={{ strokeDashoffset: 2 * Math.PI * 76 * (1 - progress / 100) }}
                                        transition={{ type: "spring", damping: 14 }}
                                    />
                                </svg>

                                {/* Fine detailed vector rings */}
                                <motion.div 
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-3 rounded-full border border-dashed border-blue-500/15"
                                />
                                <motion.div 
                                    animate={{ rotate: -360 }}
                                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-6 rounded-full border border-dotted border-purple-500/25"
                                />

                                {/* Glassmorphism Hub Card */}
                                <motion.div 
                                    className="absolute w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white/[0.02] border border-white/10 backdrop-blur-3xl flex flex-col items-center justify-center shadow-2xl overflow-hidden"
                                    animate={{ scale: [1, 1.05, 1] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                >
                                    <div className="absolute -inset-8 bg-gradient-to-tr from-blue-500/10 via-purple-500/10 to-transparent animate-pulse" />
                                    <Zap size={24} className="text-blue-400 relative z-10 animate-bounce" fill="currentColor" />
                                    <div className="text-base sm:text-lg font-black font-mono text-white tracking-tighter relative z-10 mt-1">
                                        {Math.floor(progress)}%
                                    </div>
                                    <div className="text-[7px] text-gray-500 font-mono tracking-widest uppercase relative z-10">BOOT_SYS</div>
                                </motion.div>
                            </div>

                            <div className="text-center space-y-2.5 max-w-xs">
                                <div className="text-white font-black text-[10px] sm:text-xs uppercase tracking-[0.35em] animate-pulse">{status}</div>
                                <div className="text-[8px] text-gray-500 font-mono tracking-widest uppercase">TUNNELING_SAFE_MEMORY_BUFFER</div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="authenticated-swipe"
                            initial={{ opacity: 0, scale: 0.94, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ type: "spring", stiffness: 120, damping: 16 }}
                            className="flex flex-col items-center gap-7 sm:gap-9 w-full"
                        >
                            {/* Glass Refractive Dial Card */}
                            <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center">
                                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/25 to-purple-500/25 blur-[45px] rounded-full animate-pulse" />
                                <div className="absolute inset-0 rounded-full border border-white/10 bg-black/45 backdrop-blur-3xl flex items-center justify-center shadow-3xl">
                                    <motion.div
                                        animate={{ scale: [1, 1.08, 1], rotate: [0, 8, -8, 0] }}
                                        transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
                                    >
                                        {user ? (
                                            <Unlock size={38} className="text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.35)]" />
                                        ) : (
                                            <KeyRound size={38} className="text-purple-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.35)]" />
                                        )}
                                    </motion.div>
                                </div>
                            </div>

                            <div className="text-center space-y-2">
                                <span className="text-[9px] font-black tracking-[0.4em] uppercase text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1">
                                    {user ? "SYSTEM UNLOCKED" : "CLOUD COOPERATION DEPLOYED"}
                                </span>
                                <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider mt-2">
                                    {user ? "Secure Session Initialized" : "Cloud Sandbox Handshake"}
                                </h2>
                                <p className="text-[10px] text-gray-400 max-w-xs font-mono tracking-wide leading-relaxed">
                                    {user 
                                        ? `Logged in as ${user.username || 'Admin'}. Drag the slider to load workspace parameters.` 
                                        : "Swipe below to establish cloud identity and mount workspace files."
                                    }
                                </p>
                            </div>

                            {/* Swipe slider button */}
                            <SwipeToEnterButton 
                                isLogin={!user}
                                label={user ? "Swipe to Enter Session" : "Swipe to Authenticate Core"} 
                                successLabel={user ? "ENTERING SESSION" : "AUTHORIZED"} 
                                onSuccess={user ? onComplete : onLogin} 
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* --- BOTTOM SECTION: CYBER LOG TERMINAL & DYNAMIC SYSTEM SPECS --- */}
            <div className="relative z-10 w-full max-w-4xl mx-auto space-y-6">
                {/* Advanced Multi-state Terminal Logs Panel */}
                <div className="rounded-2xl bg-black/50 border border-white/5 backdrop-blur-2xl p-4 sm:p-5 shadow-3xl">
                    <div className="flex flex-col sm:flex-row gap-2 justify-between items-start sm:items-center border-b border-white/5 pb-2.5 mb-3">
                        <div className="flex items-center gap-2 text-blue-400">
                            <Terminal size={12} className="animate-pulse" />
                            <span className="font-mono text-[9px] font-bold tracking-widest uppercase">Decryption Console Pipeline</span>
                        </div>
                        <div className="font-mono text-[8px] text-gray-500 flex gap-3">
                            <span>GRID_ZONE: AS-S1</span>
                            <span>AUTH_STREAM: SECURE</span>
                        </div>
                    </div>

                    <div className="h-24 overflow-y-auto font-mono text-[9px] text-gray-500 space-y-2 scrollbar-thin scrollbar-thumb-white/5 pr-2">
                        {activeLogs.map((log, idx) => (
                            <motion.div 
                                key={idx}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.2 }}
                                className="flex items-start gap-2.5 text-gray-400 leading-relaxed"
                            >
                                <span className="text-blue-500/80 font-bold shrink-0">{`>`}</span>
                                <span className="text-[8.5px] text-blue-400/50 shrink-0 font-bold">[READY]</span>
                                <span className="break-all font-medium text-gray-300">{log}</span>
                            </motion.div>
                        ))}
                        <div ref={terminalEndRef} />
                    </div>
                </div>

                {/* Secure network architecture badges */}
                <div className="flex flex-wrap justify-center items-center gap-x-6 sm:gap-x-10 gap-y-3 opacity-50 hover:opacity-85 transition-opacity duration-300 text-[8.5px] font-black uppercase tracking-[0.25em] text-gray-400 pt-2 border-t border-white/5">
                    <div className="flex items-center gap-2">
                        <Server size={10} className="text-blue-400" />
                        <span>QUANTUM_TUNNEL_ONLINE</span>
                    </div>
                    <div className="hidden sm:block w-px h-2.5 bg-white/10" />
                    <div className="flex items-center gap-2">
                        <Network size={10} className="text-purple-400" />
                        <span>SYNTHESIS_MESH_ACTIVE</span>
                    </div>
                    <div className="hidden sm:block w-px h-2.5 bg-white/10" />
                    <div className="flex items-center gap-2">
                        <Globe size={10} className="text-emerald-400" />
                        <span>FEDERATED_PERSIST_OK</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* --- Refined Cosmic Illusion & Moiré Interference Background --- */
const IllusionBackground: React.FC<{ mousePos: { x: number; y: number } }> = ({ mousePos }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        let animationFrameId: number;
        
        const resize = () => {
            if (!canvasRef.current) return;
            canvasRef.current.width = window.innerWidth;
            canvasRef.current.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize();
        
        const animate = () => {
            const currentCtx = canvasRef.current?.getContext('2d');
            if (!currentCtx || !canvasRef.current) return;
            const w = canvasRef.current.width;
            const h = canvasRef.current.height;
            
            // Refined dark background trails effect for maximum illusion latency
            currentCtx.fillStyle = 'rgba(3, 5, 8, 0.15)';
            currentCtx.fillRect(0, 0, w, h);
            
            const time = Date.now() * 0.0005;
            const cx = w / 2;
            const cy = h / 2;
            
            // --- OPTICAL ILLUSION 1: HELICAL VECTOR SPIRAL ---
            currentCtx.lineWidth = 1;
            const ringCount = 26;
            
            // Adjust coordinates based on soft mouse parallax
            const targetX = cx + (mousePos.x - cx) * 0.12;
            const targetY = cy + (mousePos.y - cy) * 0.12;
            
            for (let i = 1; i <= ringCount; i++) {
                const r = (i * 18 + time * 50) % (Math.max(w, h) * 0.7);
                const opacity = Math.max(0, 0.14 * (1 - r / (Math.max(w, h) * 0.7)));
                
                currentCtx.beginPath();
                const totalPoints = 64;
                for (let j = 0; j <= totalPoints; j++) {
                    const angle = (j / totalPoints) * Math.PI * 2;
                    
                    // Twist factor creates complex hypnotic rotation depth
                    const twist = Math.sin(time + i * 0.12) * 0.45;
                    const dynamicR = r * (1 + 0.035 * Math.sin(angle * 7 + time * 2.5));
                    
                    const drawX = targetX + Math.cos(angle + twist) * dynamicR;
                    const drawY = targetY + Math.sin(angle + twist) * dynamicR;
                    
                    if (j === 0) currentCtx.moveTo(drawX, drawY);
                    else currentCtx.lineTo(drawX, drawY);
                }
                currentCtx.strokeStyle = i % 2 === 0 ? `rgba(59, 130, 246, ${opacity})` : `rgba(168, 85, 247, ${opacity})`;
                currentCtx.stroke();
            }
            
            // --- OPTICAL ILLUSION 2: PERFECT MOIRÉ LINE GRID INTERFERENCE ---
            currentCtx.strokeStyle = 'rgba(139, 92, 246, 0.02)';
            currentCtx.lineWidth = 0.5;
            for (let xOffset = 0; xOffset < w; xOffset += 16) {
                currentCtx.beginPath();
                currentCtx.moveTo(xOffset, 0);
                currentCtx.lineTo(xOffset, h);
                currentCtx.stroke();
            }
            
            // Intersecting rays emanating from mouse position
            currentCtx.strokeStyle = 'rgba(59, 130, 246, 0.025)';
            const linesCount = 72;
            const diagonal = Math.sqrt(w*w + h*h);
            for (let i = 0; i < linesCount; i++) {
                const angle = (i / linesCount) * Math.PI * 2 + time * 0.04;
                currentCtx.beginPath();
                currentCtx.moveTo(mousePos.x, mousePos.y);
                currentCtx.lineTo(
                    mousePos.x + Math.cos(angle) * diagonal,
                    mousePos.y + Math.sin(angle) * diagonal
                );
                currentCtx.stroke();
            }
            
            // --- OPTICAL ILLUSION 3: INTERLOCKING GYROSCOPIC CORE ---
            currentCtx.save();
            currentCtx.translate(cx, cy);
            currentCtx.rotate(-time * 0.18);
            const petals = 10;
            for (let k = 0; k < petals; k++) {
                currentCtx.rotate((Math.PI * 2) / petals);
                currentCtx.beginPath();
                const major = 130 + Math.sin(time * 1.8 + k) * 12;
                const minor = 38 + Math.cos(time * 1.8 + k) * 6;
                currentCtx.ellipse(0, 0, major, minor, Math.PI / 4, 0, Math.PI * 2);
                currentCtx.strokeStyle = k % 2 === 0 ? 'rgba(59, 130, 246, 0.05)' : 'rgba(168, 85, 247, 0.05)';
                currentCtx.lineWidth = 0.75;
                currentCtx.stroke();
            }
            currentCtx.restore();
            
            animationFrameId = requestAnimationFrame(animate);
        };
        animate();
        
        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [mousePos]);
    
    return <canvas ref={canvasRef} className="absolute inset-0 z-0 opacity-80 pointer-events-none" />;
};

/* --- Responsive & Intuitive Swipe slider component --- */
interface SwipeToEnterButtonProps {
  onSuccess: () => void;
  label: string;
  successLabel: string;
  isLogin?: boolean;
}

const SwipeToEnterButton: React.FC<SwipeToEnterButtonProps> = ({ onSuccess, label, successLabel, isLogin = false }) => {
  const [isSwiping, setIsSwiping] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragWidth, setDragWidth] = useState(250);

  useEffect(() => {
    const updateWidth = () => {
      if (trackRef.current) {
        const trackW = trackRef.current.getBoundingClientRect().width;
        // The handle width is 48px. Subtract handle size + horizontal padding (p-1.5 is 6px left/right = 12px)
        const handleSize = 48;
        setDragWidth(Math.max(100, trackW - handleSize - 12)); 
      }
    };
    updateWidth();
    // Use timeout to allow rendering to complete
    const timer = setTimeout(updateWidth, 120);
    window.addEventListener('resize', updateWidth);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateWidth);
    };
  }, []);

  const x = useMotionValue(0);
  
  const backgroundWidth = useTransform(x, [0, dragWidth], ["0%", "100%"]);
  const glowOpacity = useTransform(x, [0, dragWidth], [0.15, 0.95]);
  const textOpacity = useTransform(x, [0, dragWidth * 0.65], [1, 0]);
  const iconRotate = useTransform(x, [0, dragWidth], [0, 180]);

  const handleDragStart = () => {
    setIsSwiping(true);
  };

  const handleDragEnd = () => {
    setIsSwiping(false);
    const currentX = x.get();
    
    // Auth completes once slider reaches 85% of track width
    if (currentX >= dragWidth * 0.85) {
      setIsSuccess(true);
      onSuccess();
      
      // Auto reset to starting point
      setTimeout(() => {
        setIsSuccess(false);
        x.set(0);
      }, 2200);
    } else {
      // Return handle to start
      x.set(0);
    }
  };

  return (
    <div 
      ref={trackRef}
      className={cn(
        "relative h-14 w-full bg-white/[0.02] border border-white/10 rounded-full p-1.5 flex items-center overflow-hidden backdrop-blur-3xl shadow-3xl transition-all duration-500 select-none",
        isSwiping ? "border-blue-500/35 shadow-[0_0_35px_rgba(59,130,246,0.18)]" : "",
        isSuccess ? "border-emerald-500/40 bg-emerald-950/15" : ""
      )}
    >
      {/* Dynamic colored slider track glow background */}
      <motion.div 
        style={{ width: backgroundWidth, opacity: glowOpacity }}
        className={cn(
          "absolute left-1.5 top-1.5 bottom-1.5 rounded-full bg-gradient-to-r transition-colors duration-300",
          isSuccess 
            ? "from-emerald-600/30 to-emerald-500/40" 
            : isLogin ? "from-purple-600/20 via-purple-500/30 to-pink-600/30" : "from-blue-600/20 via-blue-500/30 to-purple-600/30"
        )}
      />

      {/* Background guide instructions */}
      <motion.div 
        style={{ opacity: textOpacity }}
        className="absolute inset-y-0 left-0 right-0 flex items-center justify-center pointer-events-none select-none px-12"
      >
        <span className={cn(
            "text-[9px] sm:text-[10px] font-black tracking-[0.35em] uppercase transition-colors flex items-center gap-2",
            isLogin ? "text-purple-300" : "text-blue-300"
        )}>
          {label}
          <motion.span 
            animate={{ x: [0, 4, 0] }} 
            transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
            className={isLogin ? "text-purple-400" : "text-blue-400"}
          >
            »
          </motion.span>
        </span>
      </motion.div>

      {/* Draggable Slider handle */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: dragWidth }}
        dragElastic={0.12}
        dragMomentum={false}
        style={{ x }}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        className={cn(
          "relative z-10 w-11 h-11 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing text-white transition-all duration-300 shadow-xl",
          isSuccess 
            ? "bg-emerald-500 border border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)]" 
            : isLogin 
              ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 border border-purple-400/30" 
              : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 border border-blue-400/30"
        )}
      >
        {isSuccess ? (
          <Check size={16} className="text-white" />
        ) : (
          <motion.div style={{ rotate: iconRotate }}>
            {isLogin ? (
              <Shield size={15} className="text-white" />
            ) : (
              <Zap size={15} className="text-white" fill="white" />
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
