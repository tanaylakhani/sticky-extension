import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useMotionValue } from 'motion/react';
import { BsSticky } from 'react-icons/bs';
import { playBubbleSound } from '../utils/soundUtils';

type CreateNoteFn = (
  text: string,
  position: { x: number; y: number }
) => Promise<boolean>;

type Position = { x: string | number; y: string | number };

// Nine snapping hotspots and helpers (inspired by toolbar sdk)
const HOTSPOTS: Array<{ x: string | number; y: string | number }> = [
  { x: 40, y: 40 },
  { x: '47%', y: 40 },
  { x: '98%', y: 40 },
  { x: 40, y: '45%' },
  { x: '47%', y: '50%' },
  { x: '98%', y: '45%' },
  { x: 40, y: '96%' },
  { x: '47%', y: '92%' },
  { x: '98%', y: '96%' },
];

const getNumeric = (pos: string | number, viewport: number): number => {
  if (typeof pos === 'number') return pos;
  if (pos.includes('%')) return (parseFloat(pos) / 100) * viewport;
  return parseFloat(pos);
};

const toPercent = (value: number, viewport: number): string => `${(value / viewport) * 100}%`;

const STORAGE_KEY = 'sticky_button_position_v2';

interface NewStickyButtonProps {
  onCreate: CreateNoteFn;
}


const NewStickyButton: React.FC<NewStickyButtonProps> = ({ onCreate }) => {
  const hasStoredPosition = (() => {
    try { return !!localStorage.getItem(STORAGE_KEY); } catch { return false; }
  })();

  const [position, setPosition] = useState<Position>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    // Start near top-right; will correct for width after mount
    return { x: '98%', y: 40 };
  });

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const didAutoAnchorRef = useRef(false);
  const [isReady, setIsReady] = useState(hasStoredPosition);
  const [isDragging, setIsDragging] = useState(false);
  const cooldown = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Set current XY from stored percentage on mount and when position changes
  useEffect(() => {
    const vw = document.documentElement.clientWidth;
    const vh = document.documentElement.clientHeight;
    x.set(getNumeric(position.x, vw));
    y.set(getNumeric(position.y, vh));
  }, [position, x, y]);

  // After mount, if no stored position, snap precisely to top-right hotspot accounting for button size
  useEffect(() => {
    if (didAutoAnchorRef.current) return;
    if (!buttonRef.current) return;
    if (hasStoredPosition) return;
    const vw = document.documentElement.clientWidth;
    const vh = document.documentElement.clientHeight;
    const width = buttonRef.current.offsetWidth;
    const height = buttonRef.current.offsetHeight;
    const hotspotX = getNumeric('98%', vw);
    const hotspotY = 40;
    const anchoredX = hotspotX - width; // align right edge to hotspot
    const anchoredY = hotspotY; // align top edge
    const next: Position = { x: toPercent(anchoredX, vw), y: toPercent(anchoredY, vh) };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
    setPosition(next);
    didAutoAnchorRef.current = true;
    setIsReady(true);
  }, [hasStoredPosition]);

  // Constrain drag area slightly within viewport
  const dragConstraints = useMemo(() => ({
    top: 40,
    left: 40,
    right: document.documentElement.clientWidth - 40,
    bottom: document.documentElement.clientHeight - 40,
  }), []);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: { point: { x: number; y: number } }
  ) => {
    const vw = document.documentElement.clientWidth;
    const vh = document.documentElement.clientHeight;

    // Clamp within padding
    const padding = 20;
    const px = Math.max(padding, Math.min(info.point.x, vw - padding));
    const py = Math.max(padding, Math.min(info.point.y - window.scrollY, vh - padding));

    // Find closest hotspot (weight edges slightly closer)
    const closest = HOTSPOTS.reduce((acc, h) => {
      const hx = getNumeric(h.x, vw);
      const hy = getNumeric(h.y, vh);
      const dx = px - hx;
      const dy = py - hy;
      const base = Math.sqrt(dx * dx + dy * dy);
      const isEdge = hx <= padding * 2 || hx >= vw - padding * 2 || hy <= padding * 2 || hy >= vh - padding * 2;
      const dist = isEdge ? base * 0.8 : base;
      return dist < acc.d ? { h, d: dist } : acc;
    }, { h: HOTSPOTS[0], d: Infinity as number }).h;

    // Anchor to edges for right/bottom/center hotspots so the button hugs screen bounds
    const hx = getNumeric(closest.x, vw);
    const hy = getNumeric(closest.y, vh);
    const width = buttonRef.current?.offsetWidth ?? 0;
    const height = buttonRef.current?.offsetHeight ?? 40;
    const nearRight = hx > vw * 0.7;
    const nearBottom = hy > vh * 0.7;
    // Only adjust for right/bottom so center hotspots stay exactly centered
    const anchoredX = hx - (nearRight ? width : 0);
    const anchoredY = hy - (nearBottom ? height : 0);

    const stored: Position = {
      x: toPercent(anchoredX, vw),
      y: toPercent(anchoredY, vh),
    };

    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(stored)); } catch {}
    setPosition(stored);
    setIsDragging(false);

    // brief cooldown to prevent accidental click right after drag
    if (cooldown.current) clearTimeout(cooldown.current);
    cooldown.current = setTimeout(() => { cooldown.current = null; }, 250);
  };

  const handleClick = async (e: React.MouseEvent) => {
    if (isDragging || cooldown.current) return; // ignore when busy
    e.preventDefault();
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2 + window.scrollY;
    
    // Play sound immediately since note will appear instantly (optimistic)
    playBubbleSound();
    
    // Optimistic update - note appears immediately
    await onCreate('', { x: cx, y: cy });
  };

  // Visual sizing
  const heightPx = 40; // button height

  return (
    <motion.div
      style={{ x, y, position: 'fixed', top: 0, left: 0, zIndex: 2147483647, visibility: isReady ? 'visible' : 'hidden' }}
      drag
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={dragConstraints}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <motion.button
        ref={buttonRef}
        onClick={handleClick}
        style={{
          height: `${heightPx}px`,
          borderRadius: `${heightPx / 2}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '2px 14px',
          cursor: 'pointer',
          border: '1px solid rgba(220, 215, 240, 0.9)',
         background: 'linear-gradient(135deg, rgba(255,255,255,0.85), rgba(233,225,255,0.85))',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          boxShadow: '0 3px 6px rgba(0, 0, 0, 0.09)',
        }}
        whileTap={{ scale: 0.95 }}
      >
        <BsSticky size={18} color="#8886FB" />
        <span style={{
          fontSize: '14px',
          fontWeight: 600,
          lineHeight: 1,
          userSelect: 'none',
          color: 'oklch(37.1% 0 0)',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>New Sticky</span>
      </motion.button>
    </motion.div>
  );
};

export default NewStickyButton;


