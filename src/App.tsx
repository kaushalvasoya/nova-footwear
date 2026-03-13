import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from 'motion/react';
import { Menu, Search, ShoppingBag, ArrowRight, Heart, Star, Zap, Award, Palette, Wind, Feather, Shield, ChevronRight, Quote, MessageCircle, Mail, Instagram, Twitter, ArrowUp, MapPin, Truck, RotateCcw, Gift, Globe, Users, TrendingUp, Package, X } from 'lucide-react';

// --- Magnetic Button Component ---
function MagneticButton({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 20 });
  const springY = useSpring(y, { stiffness: 300, damping: 20 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * 0.15);
    y.set((e.clientY - centerY) * 0.15);
  }, [x, y]);

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.button
      ref={ref}
      style={{ x: springX, y: springY, ...style }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
    >
      {children}
    </motion.button>
  );
}

// --- 3D Tilt Card Component ---
function TiltCard({ children, className, style: cardStyle }: { children: React.ReactNode; className?: string; style?: any }) {
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springRotateX = useSpring(rotateX, { stiffness: 200, damping: 15 });
  const springRotateY = useSpring(rotateY, { stiffness: 200, damping: 15 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    rotateX.set(-y * 12);
    rotateY.set(x * 12);
  }, [rotateX, rotateY]);

  const handleMouseLeave = useCallback(() => {
    rotateX.set(0);
    rotateY.set(0);
  }, [rotateX, rotateY]);

  return (
    <motion.div
      ref={ref}
      style={{ rotateX: springRotateX, rotateY: springRotateY, transformPerspective: 800, ...cardStyle }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// --- Animated Counter Component ---
function AnimatedCounter({ target, suffix = '', duration = 2 }: { target: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const startTime = Date.now();
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / (duration * 1000), 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration, hasAnimated]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// --- Floating Particles ---
function Particles() {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    size: Math.random() * 6 + 2,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    delay: Math.random() * 8,
    duration: Math.random() * 10 + 8,
    opacity: Math.random() * 0.4 + 0.1,
  }));

  return (
    <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
      {particles.map(p => (
        <div
          key={p.id}
          className="particle absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            left: p.left,
            top: p.top,
            background: `linear-gradient(135deg, rgba(255,107,107,${p.opacity}), rgba(240,147,251,${p.opacity}))`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

// --- Split Text for Letter Animation ---
function SplitText({ text, className, style }: { text: string; className?: string; style?: React.CSSProperties }) {
  return (
    <span className={className} style={style} aria-label={text}>
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 40, rotateX: -90 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{
            delay: 1.8 + i * 0.08,
            duration: 0.6,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          style={{ display: 'inline-block' }}
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
}

// --- Edge-to-Edge Text (auto-scales to fill viewport width) ---
function EdgeToEdgeText({ children, className, style: containerStyle }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  const textRef = useRef<HTMLDivElement>(null);
  const [scaleX, setScaleX] = useState(1);

  useEffect(() => {
    const measure = () => {
      if (!textRef.current) return;
      const textWidth = textRef.current.scrollWidth;
      const viewportWidth = window.innerWidth;
      if (textWidth > 0) {
        setScaleX(viewportWidth / textWidth);
      }
    };
    const timer = setTimeout(measure, 100);
    window.addEventListener('resize', measure);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', measure);
    };
  }, []);

  return (
    <div
      ref={textRef}
      className={className}
      style={{
        ...containerStyle,
        transform: `scaleX(${scaleX})`,
        transformOrigin: 'left center',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </div>
  );
}

// --- Custom Cursor Follower ---
function CursorFollower() {
  const outerX = useMotionValue(-100);
  const outerY = useMotionValue(-100);
  const dotX = useMotionValue(-100);
  const dotY = useMotionValue(-100);
  const springOuterX = useSpring(outerX, { stiffness: 150, damping: 15 });
  const springOuterY = useSpring(outerY, { stiffness: 150, damping: 15 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show on devices with a fine pointer (desktop)
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    if (!mq.matches) return;
    setIsVisible(true);

    const handleMouseMove = (e: MouseEvent) => {
      outerX.set(e.clientX);
      outerY.set(e.clientY);
      dotX.set(e.clientX);
      dotY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a, button, input, [role="button"], .cursor-pointer')) {
        setIsHovering(true);
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a, button, input, [role="button"], .cursor-pointer')) {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, [outerX, outerY, dotX, dotY]);

  if (!isVisible) return null;

  return (
    <>
      <motion.div
        className={`custom-cursor-outer ${isHovering ? 'hovering' : ''}`}
        style={{ left: springOuterX, top: springOuterY }}
      />
      <motion.div
        className={`custom-cursor-dot ${isHovering ? 'hovering' : ''}`}
        style={{ left: dotX, top: dotY }}
      />
    </>
  );
}

// --- Scroll Progress Bar ---
function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  return (
    <motion.div
      className="scroll-progress-bar"
      style={{ scaleX, width: '100%' }}
    />
  );
}

// --- Mobile Menu ---
function MobileMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const navItems = [
    { label: 'Home', href: '#hero' },
    { label: 'Features', href: '#features' },
    { label: 'Testimonials', href: '#testimonials' },
    { label: 'Colorways', href: '#colorways' },
    { label: 'Gallery', href: '#gallery' },
    { label: 'Tech', href: '#tech' },
    { label: 'Contact', href: '#contact' },
  ];

  const handleNavClick = (href: string) => {
    onClose();
    setTimeout(() => {
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 300);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="mobile-menu-overlay"
            onClick={onClose}
          />
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="mobile-menu-drawer"
          >
            <div className="p-6 sm:p-8">
              {/* Close button */}
              <div className="flex justify-between items-center mb-10">
                <span
                  className="text-2xl font-display font-extrabold tracking-[0.2em]"
                  style={{
                    background: 'linear-gradient(135deg, #ff6b6b, #ff9a56, #f093fb)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  NOVA
                </span>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-[#1a1a2e]/5 flex items-center justify-center hover:bg-[#ff6b6b]/10 hover:scale-110 transition-all duration-300"
                >
                  <X size={20} className="text-[#1a1a2e]" />
                </button>
              </div>

              {/* Nav links */}
              <nav>
                {navItems.map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.06, duration: 0.4 }}
                  >
                    <button
                      onClick={() => handleNavClick(item.href)}
                      className="mobile-menu-link w-full text-left font-display"
                    >
                      {item.label}
                    </button>
                  </motion.div>
                ))}
              </nav>

              {/* CTA in menu */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="mt-10"
              >
                <button
                  className="w-full py-4 text-white font-display font-bold tracking-widest text-sm rounded-2xl flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #ff6b6b, #ff9a56, #f093fb)' }}
                >
                  <ShoppingBag size={18} />
                  SHOP NOW
                </button>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function App() {
  const [activeSize, setActiveSize] = useState(10);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeColor, setActiveColor] = useState('obsidian');
  const [menuOpen, setMenuOpen] = useState(false);
  const sizes = [8, 9, 10, 11, 12];

  const shoeImage = "/my-shoes.png.png";

  const containerRef = useRef<HTMLDivElement>(null);

  // Trigger load sequence
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // --- Background hue shift on scroll ---
  const bgHue = useTransform(scrollYProgress, [0, 1], [20, 340]);

  // --- ELEVATE Text (Fades out and moves up) ---
  const elevateY = useTransform(scrollYProgress, [0, 0.5], [0, -500]);
  const elevateOpacity = useTransform(scrollYProgress, [0, 0.35], [1, 0]);
  const elevateScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.85]);
  const elevateClipPath = useTransform(
    scrollYProgress,
    [0, 0.3],
    ['inset(0% 0% 0% 0%)', 'inset(0% 0% 100% 0%)']
  );

  // --- UNLEASH Text (Fades in and moves up from bottom) ---
  const unleashY = useTransform(scrollYProgress, [0.2, 0.85], [500, -80]);
  const unleashOpacity = useTransform(scrollYProgress, [0.25, 0.6], [0, 1]);

  // --- Shoe ---
  const shoeRotate = useTransform(scrollYProgress, [0, 1], [-15, 5]);
  const shoeY = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const shoeScale = useTransform(scrollYProgress, [0, 1], [1, 1.18]);

  // --- Dynamic shoe shadow based on scroll ---
  const shadowX = useTransform(scrollYProgress, [0, 1], [0, 30]);
  const shadowY = useTransform(scrollYProgress, [0, 1], [40, 20]);
  const shadowBlur = useTransform(scrollYProgress, [0, 1], [50, 70]);
  const shadowSpread = useTransform(scrollYProgress, [0, 0.5, 1], [0.25, 0.35, 0.2]);

  // --- UI State 1 (Elevate - Fades out) ---
  const ui1Opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const ui1X = useTransform(scrollYProgress, [0, 0.2], [0, -80]);
  const ui1PointerEvents = useTransform(scrollYProgress, v => v > 0.2 ? 'none' : 'auto');

  const ui2Opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const ui2X = useTransform(scrollYProgress, [0, 0.2], [0, 80]);

  // --- UI State 2 (Unleash - Fades in) ---
  const ui3Opacity = useTransform(scrollYProgress, [0.55, 0.8], [0, 1]);
  const ui3X = useTransform(scrollYProgress, [0.55, 0.8], [-60, 0]);
  const ui3PointerEvents = useTransform(scrollYProgress, v => v < 0.55 ? 'none' : 'auto');


  // --- Blob animations on scroll ---
  const blob1Scale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.3, 0.9]);
  const blob2Scale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 1.2]);
  const blob3X = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const blob3Y = useTransform(scrollYProgress, [0, 1], [0, -100]);

  // Stagger delays for entrance
  const stagger = (i: number) => ({ delay: 0.8 + i * 0.15 });

  return (
    <>
    {/* Global UI elements */}
    <CursorFollower />
    <ScrollProgressBar />
    <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

    <div id="hero" ref={containerRef} className="relative h-[300vh] font-sans grain-overlay"
      style={{ background: '#fff5ee' }}
    >
      {/* === Loading Overlay === */}
      <AnimatePresence>
        {!isLoaded && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #fff5ee, #ffddd2)' }}
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-4xl font-display font-extrabold"
              style={{
                background: 'linear-gradient(135deg, #ff6b6b, #ff9a56, #f093fb)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              NOVA
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky container */}
      <motion.div
        className="sticky top-0 h-screen w-full overflow-hidden flex flex-col"
        style={{
          background: useTransform(bgHue, h => `hsl(${h}, 85%, 96%)`),
        }}
      >

        {/* Floating Particles */}
        <Particles />

        {/* Animated gradient blobs */}
        <motion.div
          style={{ scale: blob1Scale }}
          className="blob absolute -top-20 -left-20 w-[250px] h-[250px] sm:w-[350px] sm:h-[350px] lg:w-[500px] lg:h-[500px] z-0 pointer-events-none"
          aria-hidden="true"
        >
          <div className="w-full h-full" style={{
            background: 'linear-gradient(135deg, #ffb3b3, #ffd1a3)',
            animationDuration: '12s',
          }} />
        </motion.div>

        <motion.div
          style={{ scale: blob2Scale }}
          className="blob absolute top-1/3 -right-32 w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] lg:w-[600px] lg:h-[600px] z-0 pointer-events-none"
          aria-hidden="true"
        >
          <div className="w-full h-full" style={{
            background: 'linear-gradient(135deg, #f8a4a4, #f0c27f)',
            animationDuration: '15s',
            animationDelay: '-4s',
          }} />
        </motion.div>

        <motion.div
          style={{ x: blob3X, y: blob3Y }}
          className="blob absolute bottom-10 left-1/4 w-[200px] h-[200px] sm:w-[300px] sm:h-[300px] lg:w-[400px] lg:h-[400px] z-0 pointer-events-none"
          aria-hidden="true"
        >
          <div className="w-full h-full" style={{
            background: 'linear-gradient(135deg, #ffc3a0, #ffafbd)',
            animationDuration: '18s',
            animationDelay: '-8s',
          }} />
        </motion.div>

        {/* Fourth blob for extra color pop */}
        <div
          className="blob absolute top-20 left-1/2 w-[180px] h-[180px] sm:w-[250px] sm:h-[250px] lg:w-[350px] lg:h-[350px] z-0 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, #f093fb, #f5576c)',
            animationDuration: '14s',
            animationDelay: '-6s',
            opacity: 0.3,
          }}
        />

        {/* Navbar — with entrance animation */}
        <motion.nav
          initial={{ y: -60, opacity: 0 }}
          animate={isLoaded ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.5 }}
          className="relative z-50 flex justify-between items-center px-4 py-3 sm:px-6 sm:py-4 md:px-12 md:py-3 lg:py-5"
        >
          <MagneticButton
            className="w-9 h-9 sm:w-11 sm:h-11 bg-white/60 backdrop-blur-md border border-white/60 rounded-full flex items-center justify-center hover:bg-white/80 hover:scale-105 transition-all duration-300 cursor-pointer shadow-sm"
            style={{} as React.CSSProperties}
          >
            <div onClick={() => setMenuOpen(true)}>
              <Menu size={18} className="text-[#1a1a2e]" />
            </div>
          </MagneticButton>

          <div className="hidden md:flex items-center space-x-10 absolute left-1/2 -translate-x-1/2">
            {[{ label: 'home', href: '#hero' }, { label: 'collection', href: '#colorways' }].map((item, i) => (
              <motion.a
                key={item.label}
                href={item.href}
                onClick={(e) => { e.preventDefault(); document.querySelector(item.href)?.scrollIntoView({ behavior: 'smooth' }); }}
                initial={{ opacity: 0, y: -20 }}
                animate={isLoaded ? { opacity: 1, y: 0 } : {}}
                transition={stagger(i)}
                className="text-xs font-semibold tracking-widest uppercase text-[#1a1a2e]/50 hover:text-[#ff6b6b] transition-colors duration-300"
              >
                {item.label}
              </motion.a>
            ))}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isLoaded ? { opacity: 1, scale: 1 } : {}}
              transition={{ ...stagger(2), type: 'spring', stiffness: 200 }}
              className="mx-6 flex flex-col items-center cursor-pointer group"
            >
              <span className="text-3xl font-display font-extrabold tracking-[0.2em] text-[#1a1a2e] group-hover:scale-105 transition-transform duration-300"
                style={{
                  background: 'linear-gradient(135deg, #ff6b6b, #ff9a56, #f093fb)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >NOVA</span>
              <span className="text-[8px] font-semibold tracking-[0.5em] text-[#1a1a2e]/30 -mt-1">FOOTWEAR</span>
            </motion.div>
            {[{ label: 'editions', href: '#tech' }, { label: 'contact', href: '#contact' }].map((item, i) => (
              <motion.a
                key={item.label}
                href={item.href}
                onClick={(e) => { e.preventDefault(); document.querySelector(item.href)?.scrollIntoView({ behavior: 'smooth' }); }}
                initial={{ opacity: 0, y: -20 }}
                animate={isLoaded ? { opacity: 1, y: 0 } : {}}
                transition={stagger(i + 3)}
                className="text-xs font-semibold tracking-widest uppercase text-[#1a1a2e]/50 hover:text-[#ff6b6b] transition-colors duration-300"
              >
                {item.label}
              </motion.a>
            ))}
          </div>

          <div className="flex space-x-3">
            <MagneticButton className="w-9 h-9 sm:w-11 sm:h-11 bg-white/60 backdrop-blur-md border border-white/60 rounded-full flex items-center justify-center hover:bg-white/80 hover:scale-105 transition-all duration-300 cursor-pointer shadow-sm">
              <Search size={16} className="text-[#1a1a2e] sm:w-[18px] sm:h-[18px]" />
            </MagneticButton>
            <MagneticButton
              className="w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center hover:scale-105 transition-all duration-300 cursor-pointer shadow-md"
              style={{ background: 'linear-gradient(135deg, #ff6b6b, #ff9a56)' }}
            >
              <ShoppingBag size={16} className="text-white sm:w-[18px] sm:h-[18px]" />
            </MagneticButton>
          </div>
        </motion.nav>

        {/* ELEVATE Text — edge-to-edge, outside main constraints */}
        <motion.div
          style={{ y: elevateY, opacity: elevateOpacity, scale: elevateScale, clipPath: elevateClipPath }}
          className="absolute inset-0 flex items-center z-[1] pointer-events-none"
        >
          <EdgeToEdgeText className="w-full">
            <h1 className="text-[20vw] font-display font-extrabold leading-none tracking-tight select-none">
              <SplitText
                text="ELEVATE"
                style={{
                  background: 'linear-gradient(180deg, rgba(26,26,46,0.08) 0%, rgba(255,107,107,0.12) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              />
            </h1>
          </EdgeToEdgeText>
        </motion.div>

        {/* Main Content */}
        <main className="flex-1 relative flex items-start pt-[2vh] sm:pt-[2vh] md:-mt-14 md:pt-0 lg:items-center lg:mt-0 lg:pt-0 justify-center w-full max-w-[1600px] mx-auto px-2 sm:px-4">

          {/* UNLEASH Text — vibrant gradient */}
          <motion.div
            style={{ y: unleashY, opacity: unleashOpacity }}
            className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none"
          >
            <h1 className="text-[22vw] sm:text-[20vw] md:text-[18vw] font-display font-extrabold leading-none tracking-tighter select-none whitespace-nowrap"
              style={{
                background: 'linear-gradient(135deg, #ff6b6b, #ff9a56, #f093fb, #667eea)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              UNLEASH
            </h1>
          </motion.div>

          {/* Shoe Image — with entrance + dynamic shadow */}
          <motion.div
            initial={{ y: -200, opacity: 0, rotate: -25 }}
            animate={isLoaded ? { y: 0, opacity: 1, rotate: 0 } : {}}
            transition={{ delay: 1.2, duration: 1, type: 'spring', stiffness: 80, damping: 15 }}
            className="z-20 relative w-full max-w-[75vw] sm:max-w-[60vw] md:max-w-sm md:-mt-16 lg:max-w-2xl lg:mt-0 xl:max-w-3xl px-4 sm:px-8 flex justify-center pointer-events-none"
          >
            <motion.div
              style={{ y: shoeY, rotate: shoeRotate, scale: shoeScale }}
            >
              <motion.img
                animate={{ y: [0, -15, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                src={shoeImage}
                alt="NOVA Sneaker"
                className="w-full h-auto object-contain"
                style={{
                  filter: useTransform(
                    [shadowX, shadowY, shadowBlur, shadowSpread] as any,
                    ([sx, sy, sb, ss]: number[]) =>
                      `drop-shadow(${sx}px ${sy}px ${sb}px rgba(255,107,107,${ss})) drop-shadow(0px 15px 25px rgba(0,0,0,0.15))`
                  ) as any,
                }}
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </motion.div>

          {/* Decorative floating elements */}
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
            className="absolute top-16 right-20 w-16 h-16 pointer-events-none z-5 hidden lg:block"
          >
            <Star size={64} className="text-[#ff9a56]/15" strokeWidth={1} fill="rgba(255,154,86,0.08)" />
          </motion.div>

          <motion.div
            animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            className="absolute bottom-40 right-16 pointer-events-none z-5 hidden lg:block"
          >
            <div className="w-8 h-8 rounded-lg rotate-45" style={{ background: 'linear-gradient(135deg, #ff6b6b, #ff9a56)', opacity: 0.2 }} />
          </motion.div>

          <motion.div
            animate={{ y: [0, 15, 0], x: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
            className="absolute top-32 left-16 pointer-events-none z-5 hidden lg:block"
          >
            <div className="w-6 h-6 rounded-full" style={{ background: 'linear-gradient(135deg, #f093fb, #f5576c)', opacity: 0.25 }} />
          </motion.div>

          {/* Left Card — Size Selector with 3D Tilt + entrance */}
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={isLoaded ? { x: 0, opacity: 1 } : {}}
            transition={{ delay: 2.0, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ x: ui1X, opacity: ui1Opacity, pointerEvents: ui1PointerEvents as any }}
            className="absolute bottom-20 left-3 sm:bottom-28 sm:left-4 md:bottom-44 md:left-12 lg:bottom-32 lg:left-24 z-30"
          >
            <TiltCard className="glass-card-accent rounded-2xl sm:rounded-3xl p-4 sm:p-6 w-[220px] sm:w-[260px] md:w-[280px]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-display font-bold tracking-widest uppercase text-[#1a1a2e]">Your Fit</h3>
                <button className="w-8 h-8 rounded-full flex items-center justify-center hover:scale-110 transition-transform cursor-pointer bg-red-50">
                  <Heart size={14} className="text-[#ff6b6b]" />
                </button>
              </div>
              <div className="flex space-x-1.5 sm:space-x-2 mb-3 sm:mb-5">
                {sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setActiveSize(size)}
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer ${
                      activeSize === size
                        ? 'text-white shadow-lg shadow-[#ff6b6b]/30 scale-110'
                        : 'bg-white/70 text-[#1a1a2e]/50 hover:bg-white hover:text-[#1a1a2e] hover:scale-105'
                    }`}
                    style={activeSize === size ? { background: 'linear-gradient(135deg, #ff6b6b, #ff9a56)' } : {}}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <span className="text-xl sm:text-2xl font-display font-extrabold text-[#1a1a2e]">$189</span>
                <span className="tag-rotated text-[9px] sm:text-[11px]">NEW DROP</span>
              </div>
              <MagneticButton
                className="w-full text-white font-display font-bold tracking-widest text-xs sm:text-sm py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl hover:shadow-lg hover:shadow-[#ff6b6b]/25 hover:scale-[1.02] transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #ff6b6b, #ff9a56)' }}
              >
                <ShoppingBag size={16} />
                ADD TO CART
              </MagneticButton>
            </TiltCard>
          </motion.div>

          {/* Right Card — Description with 3D Tilt + entrance */}
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={isLoaded ? { x: 0, opacity: 1 } : {}}
            transition={{ delay: 2.2, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ x: ui2X, opacity: ui2Opacity, pointerEvents: ui1PointerEvents as any }}
            className="absolute bottom-20 right-3 sm:bottom-28 sm:right-4 md:bottom-44 md:right-12 lg:bottom-32 lg:right-24 z-30 hidden md:block"
          >
            <TiltCard className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-7 w-[260px] sm:w-[280px] md:w-[320px] lg:w-[340px]">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-1 rounded-full" style={{ background: 'linear-gradient(90deg, #ff6b6b, #ff9a56)' }} />
                <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#ff6b6b]">Featured</span>
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-display font-extrabold tracking-wide mb-2 text-[#1a1a2e]">Born to Move</h3>
              <p className="text-xs sm:text-sm text-[#1a1a2e]/50 leading-relaxed mb-3 sm:mb-5 font-medium">
                Crafted with energy-return foam and adaptive flex zones. Each step fuels the next — designed for those who never stand still.
              </p>
              <div className="flex space-x-3">
                <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl overflow-hidden border-2 border-white/80 shadow-sm hover:scale-105 transition-transform cursor-pointer">
                  <img src="https://images.unsplash.com/photo-1552346154-21d32810aba3?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" alt="Detail 1" className="w-full h-full object-cover" style={{ filter: 'saturate(1.2)' }} />
                </div>
                <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl overflow-hidden border-2 border-white/80 shadow-sm hover:scale-105 transition-transform cursor-pointer">
                  <img src="https://images.unsplash.com/photo-1608231387042-66d1773070a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" alt="Detail 2" className="w-full h-full object-cover" style={{ filter: 'saturate(1.2)' }} />
                </div>
                <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center bg-gradient-to-br from-[#ff6b6b]/10 to-[#ff9a56]/10 border-2 border-dashed border-[#ff6b6b]/20 hover:scale-105 transition-transform cursor-pointer">
                  <span className="text-xs font-bold text-[#ff6b6b]">+5</span>
                </div>
              </div>
            </TiltCard>
          </motion.div>

          {/* Unleash UI Buttons (State 2) — with magnetic effect */}
          <motion.div
            style={{ x: ui3X, opacity: ui3Opacity, pointerEvents: ui3PointerEvents as any }}
            className="absolute bottom-20 left-4 sm:bottom-28 sm:left-6 md:bottom-44 md:left-16 lg:bottom-32 lg:left-24 z-30 flex flex-col space-y-2 sm:space-y-3"
          >
            <MagneticButton className="px-5 py-3 sm:px-8 sm:py-4 bg-white/60 backdrop-blur-md border border-white/60 text-[#1a1a2e] font-display font-bold tracking-widest text-sm sm:text-lg rounded-xl sm:rounded-2xl hover:bg-white/80 hover:scale-[1.02] transition-all duration-300 cursor-pointer flex items-center gap-2 sm:gap-3 shadow-sm">
              EXPLORE
              <ArrowRight size={18} />
            </MagneticButton>
            <MagneticButton
              className="px-5 py-3 sm:px-8 sm:py-4 text-white font-display font-bold tracking-widest text-sm sm:text-lg rounded-xl sm:rounded-2xl hover:shadow-xl hover:shadow-[#ff6b6b]/20 hover:scale-[1.02] transition-all duration-300 cursor-pointer flex items-center gap-2 sm:gap-3"
              style={{ background: 'linear-gradient(135deg, #ff6b6b, #ff9a56, #f093fb)' }}
            >
              <ShoppingBag size={18} />
              ADD TO CART
            </MagneticButton>
          </motion.div>


        </main>
      </motion.div>
    </div>

      {/* Post-hero sections — z-40 so they scroll OVER the sticky hero content */}
      <div className="relative z-40" style={{ background: '#fff5ee' }}>

      {/* ================================================================= */}
      {/* SECTION 2 — Infinite Marquee Ticker                              */}
      {/* ================================================================= */}
      <section className="relative py-8 sm:py-12 overflow-hidden" style={{ background: '#fff5ee' }}>
        {/* Top gradient divider */}
        <div className="gradient-line-animated h-[2px] w-full mb-8 sm:mb-12" />

        <div className="marquee-track cursor-default">
          {[...Array(2)].map((_, setIdx) => (
            <div key={setIdx} className="flex items-center shrink-0">
              {[
                { text: 'NOVA', accent: true },
                { text: 'ELEVATE YOUR GAME', accent: false },
                { text: 'ENERGY RETURN', accent: false },
                { text: 'BORN TO MOVE', accent: true },
                { text: 'FLEX ZONES', accent: false },
                { text: 'FEEL THE DROP', accent: false },
                { text: 'UNLEASH', accent: true },
                { text: 'NEXT GEN FOAM', accent: false },
              ].map((item, i) => (
                <span key={i} className="flex items-center shrink-0">
                  <span
                    className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-extrabold tracking-tight px-6 sm:px-8 md:px-10 transition-all duration-500 hover:scale-105 ${
                      item.accent ? '' : 'opacity-25'
                    }`}
                    style={
                      item.accent
                        ? {
                            background: 'linear-gradient(135deg, #ff6b6b, #ff9a56, #f093fb)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                          }
                        : { color: '#1a1a2e' }
                    }
                  >
                    {item.text}
                  </span>
                  <span className="shrink-0 mx-3 sm:mx-5">
                    <Star size={16} className="text-[#ff6b6b]/30" fill="rgba(255,107,107,0.15)" />
                  </span>
                </span>
              ))}
            </div>
          ))}
        </div>

        {/* Bottom gradient divider */}
        <div className="gradient-line-animated h-[2px] w-full mt-8 sm:mt-12" />
      </section>

      {/* ================================================================= */}
      {/* SECTION 3 — Feature Showcase                                      */}
      {/* ================================================================= */}
      <section
        id="features"
        className="relative pt-12 sm:pt-16 md:pt-20 pb-20 sm:pb-28 md:pb-36 px-4 sm:px-8 md:px-16 lg:px-24 overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #fff5ee 0%, #ffe8d6 50%, #fff5ee 100%)' }}
      >
        {/* Background decorative text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <span
            className="text-[18vw] font-display font-extrabold tracking-tighter select-none opacity-[0.03]"
            style={{ color: '#1a1a2e' }}
          >
            TECH
          </span>
        </div>

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center mb-16 sm:mb-20 md:mb-24 relative z-10"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-[2px] rounded-full" style={{ background: 'linear-gradient(90deg, transparent, #ff6b6b)' }} />
            <span className="text-[10px] sm:text-xs font-bold tracking-[0.4em] uppercase text-[#ff6b6b]">Engineered for You</span>
            <div className="w-8 h-[2px] rounded-full" style={{ background: 'linear-gradient(90deg, #ff6b6b, transparent)' }} />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-[#1a1a2e] mb-4">
            Built Different
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-[#1a1a2e]/40 max-w-xl mx-auto font-medium">
            Every detail engineered for performance. Every curve designed for style.
          </p>
        </motion.div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto relative z-10">
          {[
            {
              icon: Zap,
              title: 'Energy Return Foam',
              description: 'Proprietary cushioning that converts every impact into forward momentum. 40% more energy return than standard foam.',
              stat: '40%',
              statLabel: 'More Energy',
              gradient: 'linear-gradient(135deg, #ff6b6b, #ff9a56)',
              delay: 0,
            },
            {
              icon: Wind,
              title: 'Adaptive Flex Zones',
              description: 'Smart flex grooves respond to your foot\'s natural movement, providing support exactly where you need it.',
              stat: '360°',
              statLabel: 'Flex Range',
              gradient: 'linear-gradient(135deg, #f093fb, #f5576c)',
              delay: 0.15,
            },
            {
              icon: Feather,
              title: 'Featherweight Build',
              description: 'Aerospace-grade knit upper weighing just 198g. So light, you\'ll forget you\'re wearing them.',
              stat: '198g',
              statLabel: 'Ultra Light',
              gradient: 'linear-gradient(135deg, #667eea, #764ba2)',
              delay: 0.3,
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 60, rotateX: -10 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{
                duration: 0.8,
                delay: feature.delay,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
            >
              <div className="feature-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 group cursor-pointer h-full">
                {/* Icon */}
                <motion.div
                  whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg"
                  style={{ background: feature.gradient }}
                >
                  <feature.icon size={28} className="text-white" />
                </motion.div>

                {/* Title */}
                <h3 className="text-xl sm:text-2xl font-display font-extrabold text-[#1a1a2e] mb-3 tracking-tight group-hover:text-[#ff6b6b] transition-colors duration-300">
                  {feature.title}
                </h3>

                {/* Animated accent line */}
                <div className="w-12 h-1 rounded-full mb-4 transition-all duration-500 group-hover:w-20" style={{ background: feature.gradient }} />

                {/* Description */}
                <p className="text-sm sm:text-base text-[#1a1a2e]/45 leading-relaxed mb-6 font-medium">
                  {feature.description}
                </p>

                {/* Stat */}
                <div className="flex items-end justify-between">
                  <div>
                    <span
                      className="text-3xl sm:text-4xl font-display font-extrabold"
                      style={{
                        background: feature.gradient,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      {feature.stat}
                    </span>
                    <p className="text-[10px] sm:text-xs font-semibold tracking-widest uppercase text-[#1a1a2e]/30 mt-1">
                      {feature.statLabel}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#1a1a2e]/5 group-hover:bg-[#ff6b6b]/10 transition-all duration-300 group-hover:scale-110">
                    <ChevronRight size={18} className="text-[#1a1a2e]/30 group-hover:text-[#ff6b6b] transition-colors duration-300" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================================================================= */}
      {/* SECTION 4 — Testimonials + Gallery Strip                          */}
      {/* ================================================================= */}
      <section
        id="testimonials"
        className="relative pt-16 sm:pt-20 md:pt-28 pb-8 sm:pb-12 overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #fff5ee 0%, #ffecd2 40%, #fff5ee 100%)' }}
      >
        {/* Background watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <span
            className="text-[20vw] font-display font-extrabold tracking-tighter select-none opacity-[0.02]"
            style={{ color: '#1a1a2e' }}
          >
            VOICES
          </span>
        </div>

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center mb-14 sm:mb-18 md:mb-20 px-4 relative z-10"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-[2px] rounded-full" style={{ background: 'linear-gradient(90deg, transparent, #f093fb)' }} />
            <span className="text-[10px] sm:text-xs font-bold tracking-[0.4em] uppercase text-[#f093fb]">What They Say</span>
            <div className="w-8 h-[2px] rounded-full" style={{ background: 'linear-gradient(90deg, #f093fb, transparent)' }} />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-[#1a1a2e] mb-4">
            Loved by Thousands
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-[#1a1a2e]/40 max-w-lg mx-auto font-medium">
            Real stories from real runners, walkers, and movers.
          </p>
        </motion.div>

        {/* Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 max-w-6xl mx-auto px-4 sm:px-8 relative z-10 mb-16 sm:mb-20 md:mb-28">
          {[
            {
              name: 'Sarah K.',
              role: 'Marathon Runner',
              quote: 'The energy return is unreal. I shaved 4 minutes off my personal best. These shoes literally push you forward.',
              rating: 5,
              gradient: 'linear-gradient(135deg, #ff6b6b, #ff9a56)',
              delay: 0,
            },
            {
              name: 'Marcus T.',
              role: 'Streetwear Designer',
              quote: 'Finally a sneaker that bridges performance and style. I wear them to the gym AND to fashion week. Absolute game-changer.',
              rating: 5,
              gradient: 'linear-gradient(135deg, #f093fb, #f5576c)',
              delay: 0.15,
            },
            {
              name: 'Aiko M.',
              role: 'Fitness Coach',
              quote: 'At 198g these are the lightest shoes I\'ve ever trained in. My clients keep asking what I\'m wearing. Had to buy 3 pairs.',
              rating: 5,
              gradient: 'linear-gradient(135deg, #667eea, #764ba2)',
              delay: 0.3,
            },
          ].map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50, rotateX: -8 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{
                duration: 0.8,
                delay: testimonial.delay,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
            >
              <div className="testimonial-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 h-full cursor-pointer group">
                {/* Quote icon */}
                <div
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-5 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300"
                  style={{ background: testimonial.gradient }}
                >
                  <Quote size={20} className="text-white" />
                </div>

                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} size={14} className="text-amber-400" fill="#fbbf24" />
                  ))}
                </div>

                {/* Quote text */}
                <p className="text-sm sm:text-base text-[#1a1a2e]/60 leading-relaxed mb-6 font-medium italic">
                  "{testimonial.quote}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-display font-bold text-sm"
                    style={{ background: testimonial.gradient }}
                  >
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-display font-bold text-[#1a1a2e]">{testimonial.name}</p>
                    <p className="text-xs text-[#1a1a2e]/35 font-medium">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Gradient divider */}
        <div className="gradient-line-animated h-[2px] w-full mb-6 sm:mb-8" />

        {/* Horizontal Scrolling Gallery Strip */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 1 }}
          className="overflow-hidden"
        >
          <div className="gallery-track">
            {[...Array(2)].map((_, setIdx) => (
              <div key={setIdx} className="flex shrink-0 gap-4 sm:gap-5 px-2">
                {[
                  { src: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop', alt: 'Red Nike sneaker' },
                  { src: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=300&fit=crop', alt: 'Colorful sneaker pair' },
                  { src: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=300&fit=crop', alt: 'White sneaker close-up' },
                  { src: 'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=400&h=300&fit=crop', alt: 'Sneaker on feet' },
                  { src: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400&h=300&fit=crop', alt: 'Sneaker collection' },
                  { src: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&h=300&fit=crop', alt: 'Running shoes' },
                  { src: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=400&h=300&fit=crop', alt: 'Sneaker detail' },
                  { src: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=400&h=300&fit=crop', alt: 'Athletic footwear' },
                ].map((img, i) => (
                  <div
                    key={i}
                    className="shrink-0 w-[220px] h-[160px] sm:w-[280px] sm:h-[200px] md:w-[320px] md:h-[220px] rounded-xl sm:rounded-2xl overflow-hidden group cursor-pointer"
                  >
                    <img
                      src={img.src}
                      alt={img.alt}
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:saturate-[1.3]"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Bottom gradient divider */}
        <div className="gradient-line-animated h-[2px] w-full mt-6 sm:mt-8" />
      </section>

      {/* ================================================================= */}
      {/* SECTION 5 — Color Picker / Colorway Gallery                       */}
      {/* ================================================================= */}
      <section
        id="colorways"
        className="relative pt-16 sm:pt-24 md:pt-32 pb-16 sm:pb-24 md:pb-32 px-4 sm:px-8 overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #fff5ee 0%, #f8e8dc 50%, #fff5ee 100%)' }}
      >
        {/* Background watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <span className="text-[22vw] font-display font-extrabold tracking-tighter select-none opacity-[0.02]" style={{ color: '#1a1a2e' }}>
            COLOR
          </span>
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center mb-10 sm:mb-14 md:mb-16 relative z-10"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-[2px] rounded-full" style={{ background: 'linear-gradient(90deg, transparent, #667eea)' }} />
            <span className="text-[10px] sm:text-xs font-bold tracking-[0.4em] uppercase text-[#667eea]">Express Yourself</span>
            <div className="w-8 h-[2px] rounded-full" style={{ background: 'linear-gradient(90deg, #667eea, transparent)' }} />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-[#1a1a2e] mb-4">
            Pick Your Vibe
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-[#1a1a2e]/40 max-w-lg mx-auto font-medium">
            4 curated colorways. One iconic silhouette.
          </p>
        </motion.div>

        {/* Colorway Display */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-4xl mx-auto relative z-10"
        >
          {/* Shoe Image with crossfade */}
          <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] mb-8 sm:mb-10 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {[
                { id: 'obsidian', src: '/shoe-obsidian.png', bg: 'radial-gradient(circle, rgba(30,30,30,0.15) 0%, transparent 70%)' },
                { id: 'coral', src: '/shoe-coral.png', bg: 'radial-gradient(circle, rgba(255,107,107,0.15) 0%, transparent 70%)' },
                { id: 'arctic', src: '/shoe-arctic.png', bg: 'radial-gradient(circle, rgba(102,126,234,0.15) 0%, transparent 70%)' },
                { id: 'volt', src: '/shoe-volt.png', bg: 'radial-gradient(circle, rgba(163,230,53,0.15) 0%, transparent 70%)' },
              ]
                .filter((c) => c.id === activeColor)
                .map((colorway) => (
                  <motion.div
                    key={colorway.id}
                    initial={{ opacity: 0, scale: 0.9, rotateY: -15 }}
                    animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                    exit={{ opacity: 0, scale: 0.9, rotateY: 15 }}
                    transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ background: colorway.bg }}
                  >
                    <img
                      src={colorway.src}
                      alt={`NOVA ${colorway.id}`}
                      className="w-[60%] sm:w-[50%] md:w-[45%] object-contain drop-shadow-2xl"
                    />
                  </motion.div>
                ))}
            </AnimatePresence>
          </div>

          {/* Color Swatches */}
          <div className="flex items-center justify-center gap-4 sm:gap-6">
            {[
              { id: 'obsidian', color: '#1a1a2e', label: 'Obsidian', glow: 'rgba(26,26,46,0.4)' },
              { id: 'coral', color: '#ff6b6b', label: 'Coral Rush', glow: 'rgba(255,107,107,0.5)' },
              { id: 'arctic', color: '#a5b8f0', label: 'Arctic Ice', glow: 'rgba(165,184,240,0.5)' },
              { id: 'volt', color: '#a3e635', label: 'Volt', glow: 'rgba(163,230,53,0.5)' },
            ].map((swatch) => (
              <button
                key={swatch.id}
                onClick={() => setActiveColor(swatch.id)}
                className={`color-swatch flex flex-col items-center gap-2 ${activeColor === swatch.id ? 'active' : ''}`}
                style={{ '--swatch-glow': swatch.glow } as React.CSSProperties}
              >
                <div
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-white/60 shadow-lg"
                  style={{ background: swatch.color }}
                />
                <span className={`text-[10px] sm:text-xs font-bold tracking-wide uppercase transition-colors duration-300 ${
                  activeColor === swatch.id ? 'text-[#1a1a2e]' : 'text-[#1a1a2e]/30'
                }`}>
                  {swatch.label}
                </span>
              </button>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ================================================================= */}
      {/* SECTION 6 — Parallax Image Bento Grid                             */}
      {/* ================================================================= */}
      <section
        id="gallery"
        className="relative py-16 sm:py-24 md:py-32 px-4 sm:px-8 overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #fff5ee 0%, #ffe1cc 50%, #fff5ee 100%)' }}
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-10 sm:mb-14 md:mb-16 relative z-10"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-[2px] rounded-full" style={{ background: 'linear-gradient(90deg, transparent, #ff9a56)' }} />
            <span className="text-[10px] sm:text-xs font-bold tracking-[0.4em] uppercase text-[#ff9a56]">Lifestyle</span>
            <div className="w-8 h-[2px] rounded-full" style={{ background: 'linear-gradient(90deg, #ff9a56, transparent)' }} />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-[#1a1a2e] mb-4">
            In the Wild
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-[#1a1a2e]/40 max-w-lg mx-auto font-medium">
            From city streets to mountain trails. See NOVA everywhere.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 grid-rows-[200px_200px_200px] sm:grid-rows-[220px_220px_220px] md:grid-rows-[240px_240px] gap-3 sm:gap-4 relative z-10">
          {[
            { src: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=600&h=500&fit=crop', span: 'col-span-2 row-span-2', label: 'Street Culture' },
            { src: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop', span: 'col-span-1 row-span-1', label: 'Product' },
            { src: 'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=400&h=300&fit=crop', span: 'col-span-1 row-span-1', label: 'On Feet' },
            { src: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=300&fit=crop', span: 'col-span-1 row-span-1', label: 'Detail' },
            { src: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=300&fit=crop', span: 'col-span-1 row-span-1', label: 'Collection' },
          ].map((tile, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 + index * 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.7, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
              className={`bento-tile ${tile.span} cursor-pointer group`}
            >
              <img
                src={tile.src}
                alt={tile.label}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10">
                <span className="text-white text-xs sm:text-sm font-display font-bold tracking-wide bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full">
                  {tile.label}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================================================================= */}
      {/* SECTION 7 — Horizontal Scroll Tech Breakdown                      */}
      {/* ================================================================= */}
      <section
        id="tech"
        className="relative py-16 sm:py-24 md:py-32 overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #fff5ee 0%, #f0e4d7 50%, #fff5ee 100%)' }}
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-10 sm:mb-14 px-4 relative z-10"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-[2px] rounded-full" style={{ background: 'linear-gradient(90deg, transparent, #ff6b6b)' }} />
            <span className="text-[10px] sm:text-xs font-bold tracking-[0.4em] uppercase text-[#ff6b6b]">Under the Hood</span>
            <div className="w-8 h-[2px] rounded-full" style={{ background: 'linear-gradient(90deg, #ff6b6b, transparent)' }} />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-[#1a1a2e] mb-4">
            Tech Breakdown
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-[#1a1a2e]/40 max-w-lg mx-auto font-medium">
            Swipe through the engineering behind every step.
          </p>
        </motion.div>

        {/* Horizontal scroll strip */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-8 md:px-12"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 sm:gap-6">
            {[
              {
                title: 'Knit Upper',
                description: 'Engineered mesh with targeted support zones. Breathable, flexible, and form-fitting for a sock-like feel.',
                icon: Wind,
                gradient: 'linear-gradient(135deg, #ff6b6b, #ff9a56)',
                image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=350&fit=crop',
              },
              {
                title: 'Energy Core',
                description: 'Dual-density midsole with responsive foam pods that store and release energy with every stride.',
                icon: Zap,
                gradient: 'linear-gradient(135deg, #f093fb, #f5576c)',
                image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&h=350&fit=crop',
              },
              {
                title: 'Grip System',
                description: 'Multi-directional rubber outsole with herringbone pattern for maximum traction on any surface.',
                icon: Shield,
                gradient: 'linear-gradient(135deg, #667eea, #764ba2)',
                image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500&h=350&fit=crop',
              },
              {
                title: 'Heel Lock',
                description: 'Internal heel counter with memory foam padding. Locks your foot in place without restricting movement.',
                icon: Award,
                gradient: 'linear-gradient(135deg, #f093fb, #ff6b6b)',
                image: 'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=500&h=350&fit=crop',
              },
              {
                title: 'Arch Support',
                description: 'Contoured insole with dynamic arch cradle adapts to your foot shape for all-day comfort and stability.',
                icon: Feather,
                gradient: 'linear-gradient(135deg, #ff9a56, #ff6b6b)',
                image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500&h=350&fit=crop',
              },
            ].map((tech, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 60 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group cursor-pointer"
              >
                {/* Image */}
                <div className="relative h-[200px] sm:h-[230px] rounded-2xl overflow-hidden mb-4">
                  <img
                    src={tech.image}
                    alt={tech.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a2e]/50 to-transparent" />
                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: tech.gradient }}
                    >
                      <tech.icon size={16} className="text-white" />
                    </div>
                    <span className="text-white text-sm font-display font-bold">{tech.title}</span>
                  </div>
                </div>

                {/* Callout Card */}
                <div className="tech-callout">
                  <h4 className="text-base sm:text-lg font-display font-extrabold text-[#1a1a2e] mb-2">{tech.title}</h4>
                  <p className="text-xs sm:text-sm text-[#1a1a2e]/45 leading-relaxed font-medium">{tech.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ================================================================= */}
      {/* SECTION 8 — Stats Counter                                          */}
      {/* ================================================================= */}
      <section
        className="relative py-16 sm:py-24 md:py-32 px-4 sm:px-8 overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #fff5ee 0%, #fce4d4 50%, #fff5ee 100%)' }}
      >
        {/* Background watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <span className="text-[22vw] font-display font-extrabold tracking-tighter select-none opacity-[0.02]" style={{ color: '#1a1a2e' }}>
            STATS
          </span>
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 sm:mb-16 md:mb-20 relative z-10"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-[2px] rounded-full" style={{ background: 'linear-gradient(90deg, transparent, #f093fb)' }} />
            <span className="text-[10px] sm:text-xs font-bold tracking-[0.4em] uppercase text-[#f093fb]">The Numbers</span>
            <div className="w-8 h-[2px] rounded-full" style={{ background: 'linear-gradient(90deg, #f093fb, transparent)' }} />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-[#1a1a2e] mb-4">
            NOVA by the Numbers
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-[#1a1a2e]/40 max-w-lg mx-auto font-medium">
            The stats don't lie. See why people can't stop talking.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto relative z-10">
          {[
            { icon: Package, number: 50, suffix: 'K+', label: 'Pairs Sold', gradient: 'linear-gradient(135deg, #ff6b6b, #ff9a56)', delay: 0 },
            { icon: Globe, number: 120, suffix: '+', label: 'Countries', gradient: 'linear-gradient(135deg, #f093fb, #f5576c)', delay: 0.1 },
            { icon: Star, number: 4.9, suffix: '', label: 'Avg Rating', gradient: 'linear-gradient(135deg, #667eea, #764ba2)', delay: 0.2 },
            { icon: TrendingUp, number: 98, suffix: '%', label: 'Would Buy Again', gradient: 'linear-gradient(135deg, #ff9a56, #ff6b6b)', delay: 0.3 },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, delay: stat.delay, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <div className="stats-card rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 text-center cursor-pointer group">
                <motion.div
                  whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                  style={{ background: stat.gradient }}
                >
                  <stat.icon size={24} className="text-white" />
                </motion.div>
                <p
                  className="text-2xl sm:text-3xl md:text-4xl font-display font-extrabold mb-2"
                  style={{
                    background: stat.gradient,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {stat.number % 1 !== 0 ? (
                    <>{stat.number}{stat.suffix}</>
                  ) : (
                    <AnimatedCounter target={stat.number} suffix={stat.suffix} />
                  )}
                </p>
                <p className="text-xs sm:text-sm font-semibold tracking-widest uppercase text-[#1a1a2e]/35">
                  {stat.label}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================================================================= */}
      {/* SECTION 9 — CTA + Newsletter                                       */}
      {/* ================================================================= */}
      <section
        id="contact"
        className="relative py-20 sm:py-28 md:py-36 px-4 sm:px-8 overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #fff5ee 0%, #ffe0c8 50%, #fff5ee 100%)' }}
      >
        {/* Floating gradient orbs */}
        <div className="absolute top-10 left-10 w-[200px] h-[200px] sm:w-[300px] sm:h-[300px] rounded-full blur-[80px] opacity-30 pointer-events-none" style={{ background: 'linear-gradient(135deg, #ff6b6b, #ff9a56)' }} />
        <div className="absolute bottom-10 right-10 w-[250px] h-[250px] sm:w-[350px] sm:h-[350px] rounded-full blur-[80px] opacity-25 pointer-events-none" style={{ background: 'linear-gradient(135deg, #f093fb, #667eea)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] rounded-full blur-[100px] opacity-15 pointer-events-none" style={{ background: 'linear-gradient(135deg, #ff9a56, #f093fb)' }} />

        {/* Content */}
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-8 h-[2px] rounded-full" style={{ background: 'linear-gradient(90deg, transparent, #ff6b6b)' }} />
              <span className="text-[10px] sm:text-xs font-bold tracking-[0.4em] uppercase text-[#ff6b6b]">Be First</span>
              <div className="w-8 h-[2px] rounded-full" style={{ background: 'linear-gradient(90deg, #ff6b6b, transparent)' }} />
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-extrabold tracking-tight mb-4">
              <span style={{
                background: 'linear-gradient(135deg, #ff6b6b, #ff9a56, #f093fb)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Join the Movement
              </span>
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-[#1a1a2e]/45 max-w-md mx-auto font-medium mb-8 sm:mb-10">
              Get early access to new drops, exclusive colorways, and member-only pricing.
            </p>
          </motion.div>

          {/* Email Input Row */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-10 sm:mb-14"
          >
            <div className="flex-1 relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1a1a2e]/25 pointer-events-none" />
              <input
                type="email"
                placeholder="Enter your email"
                className="cta-input !pl-11 font-medium"
              />
            </div>
            <MagneticButton
              className="cta-btn-pulse px-8 py-3.5 sm:py-4 text-white font-display font-bold tracking-widest text-sm rounded-2xl hover:scale-[1.03] transition-transform duration-300 cursor-pointer flex items-center justify-center gap-2 shrink-0"
              style={{ background: 'linear-gradient(135deg, #ff6b6b, #ff9a56, #f093fb)' }}
            >
              <span>SUBSCRIBE</span>
              <ArrowRight size={18} />
            </MagneticButton>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-6 sm:gap-10"
          >
            {[
              { icon: Truck, label: 'Free Shipping' },
              { icon: RotateCcw, label: 'Easy Returns' },
              { icon: Gift, label: 'Exclusive Drops' },
            ].map((badge, i) => (
              <div key={i} className="flex items-center gap-2 text-[#1a1a2e]/35 group cursor-default">
                <badge.icon size={18} className="group-hover:text-[#ff6b6b] transition-colors duration-300" />
                <span className="text-xs sm:text-sm font-semibold tracking-wide group-hover:text-[#1a1a2e]/60 transition-colors duration-300">{badge.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      </div>{/* end post-hero wrapper */}

      {/* ================================================================= */}
      {/* SECTION 10 — Animated Footer                                       */}
      {/* ================================================================= */}
      <footer className="relative overflow-hidden" style={{ background: '#1a1a2e' }}>
        {/* Top gradient bar */}
        <div className="footer-gradient-bar" />

        {/* Floating background shapes */}
        <div className="absolute top-20 right-20 w-[200px] h-[200px] rounded-full blur-[100px] opacity-[0.04] pointer-events-none" style={{ background: 'linear-gradient(135deg, #ff6b6b, #ff9a56)' }} />
        <div className="absolute bottom-20 left-20 w-[250px] h-[250px] rounded-full blur-[100px] opacity-[0.03] pointer-events-none" style={{ background: 'linear-gradient(135deg, #f093fb, #667eea)' }} />

        <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8 md:px-12 pt-14 sm:pt-20 md:pt-24 pb-8 sm:pb-12">
          {/* Main Footer Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 md:gap-12 mb-12 sm:mb-16 md:mb-20"
          >
            {/* Brand Column */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex flex-col items-start">
                <span
                  className="text-2xl sm:text-3xl font-display font-extrabold tracking-[0.2em] mb-2"
                  style={{
                    background: 'linear-gradient(135deg, #ff6b6b, #ff9a56, #f093fb)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  NOVA
                </span>
                <span className="text-[8px] font-semibold tracking-[0.5em] text-white/20 mb-4">FOOTWEAR</span>
                <p className="text-sm text-white/30 leading-relaxed max-w-[200px] mb-6 font-medium">
                  Born to move. Engineered for those who never stand still.
                </p>
                {/* Social Icons */}
                <div className="flex gap-3">
                  {[
                    { icon: Instagram, label: 'Instagram' },
                    { icon: Twitter, label: 'Twitter' },
                    { icon: Globe, label: 'Website' },
                  ].map((social, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.15, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="footer-social"
                      aria-label={social.label}
                    >
                      <social.icon size={16} />
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            {/* Shop Column */}
            <div>
              <h4 className="text-xs font-display font-bold tracking-[0.3em] uppercase text-white/60 mb-5 sm:mb-6">Shop</h4>
              <ul className="space-y-3">
                {['New Arrivals', 'Best Sellers', 'Collections', 'Sale'].map((item, i) => (
                  <li key={i}>
                    <a href="#" className="footer-link text-sm font-medium">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h4 className="text-xs font-display font-bold tracking-[0.3em] uppercase text-white/60 mb-5 sm:mb-6">Company</h4>
              <ul className="space-y-3">
                {['About Us', 'Careers', 'Sustainability', 'Press'].map((item, i) => (
                  <li key={i}>
                    <a href="#" className="footer-link text-sm font-medium">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Connect Column */}
            <div>
              <h4 className="text-xs font-display font-bold tracking-[0.3em] uppercase text-white/60 mb-5 sm:mb-6">Connect</h4>
              <ul className="space-y-3">
                {['Help Center', 'Size Guide', 'Shipping', 'Returns'].map((item, i) => (
                  <li key={i}>
                    <a href="#" className="footer-link text-sm font-medium">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Divider */}
          <div className="h-[1px] w-full bg-white/[0.06] mb-6 sm:mb-8" />

          {/* Bottom Row */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <p className="text-xs text-white/20 font-medium tracking-wide">
              © 2026 NOVA Footwear. All rights reserved.
            </p>

            <div className="flex items-center gap-6">
              <a href="#" className="text-xs text-white/20 hover:text-white/50 transition-colors duration-300 font-medium">Privacy</a>
              <a href="#" className="text-xs text-white/20 hover:text-white/50 transition-colors duration-300 font-medium">Terms</a>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="back-to-top"
                aria-label="Back to top"
              >
                <ArrowUp size={18} />
              </button>
            </div>
          </motion.div>
        </div>
      </footer>
    </>
  );
}
