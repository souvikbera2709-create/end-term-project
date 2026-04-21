import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, ZoomIn } from 'lucide-react';

const OFF = 'off';
const PRIMARY = 'primary';
const SECONDARY = 'secondary';
const CYCLE = { [OFF]: PRIMARY, [PRIMARY]: SECONDARY, [SECONDARY]: OFF };

const COLORS = {
  base: 'rgba(60, 65, 74, 0.5)',
  stroke: 'rgba(160, 169, 189, 0.34)',
  primary: '#A020F0',
  secondary: '#06b6d4',
};

const FRONT_REGIONS = [
  { id: 'anterior-deltoid-l', muscle: 'Anterior Deltoids', d: 'M38 23 C34 24 32 29 34 35 C36 37 39 36 41 32 C42 28 41 24 38 23 Z' },
  { id: 'anterior-deltoid-r', muscle: 'Anterior Deltoids', d: 'M62 23 C66 24 68 29 66 35 C64 37 61 36 59 32 C58 28 59 24 62 23 Z' },
  { id: 'upper-pec-l', muscle: 'Upper Pectoralis Major', d: 'M50 25 C44 25 40 26 37 30 C40 33 45 34 50 33 Z' },
  { id: 'upper-pec-r', muscle: 'Upper Pectoralis Major', d: 'M50 25 C56 25 60 26 63 30 C60 33 55 34 50 33 Z' },
  { id: 'mid-pec-l', muscle: 'Sternal Pectoralis Major', d: 'M50 33 C44 33 40 34 38 39 C41 42 45 43 50 42 Z' },
  { id: 'mid-pec-r', muscle: 'Sternal Pectoralis Major', d: 'M50 33 C56 33 60 34 62 39 C59 42 55 43 50 42 Z' },
  { id: 'biceps-l', muscle: 'Biceps Brachii', d: 'M34 35 C31 39 31 45 34 49 C37 50 40 47 40 42 C40 38 38 35 34 35 Z' },
  { id: 'biceps-r', muscle: 'Biceps Brachii', d: 'M66 35 C69 39 69 45 66 49 C63 50 60 47 60 42 C60 38 62 35 66 35 Z' },
  { id: 'forearm-l', muscle: 'Forearms', d: 'M34 49 C31 54 32 62 35 67 C38 68 40 65 40 60 C39 55 37 51 34 49 Z' },
  { id: 'forearm-r', muscle: 'Forearms', d: 'M66 49 C69 54 68 62 65 67 C62 68 60 65 60 60 C61 55 63 51 66 49 Z' },
  { id: 'abs-upper', muscle: 'Rectus Abdominis', d: 'M50 42 C46 43 44 47 44 52 C46 55 48 56 50 56 C52 56 54 55 56 52 C56 47 54 43 50 42 Z' },
  { id: 'oblique-l', muscle: 'Obliques', d: 'M44 47 C40 49 38 53 38 57 C40 59 42 59 44 58 Z' },
  { id: 'oblique-r', muscle: 'Obliques', d: 'M56 47 C60 49 62 53 62 57 C60 59 58 59 56 58 Z' },
  { id: 'abs-lower', muscle: 'Lower Abs', d: 'M50 56 C47 57 46 60 46 64 C47 66 49 67 50 67 C51 67 53 66 54 64 C54 60 53 57 50 56 Z' },
  { id: 'quad-l', muscle: 'Quadriceps', d: 'M46 67 C42 70 40 78 41 87 C43 90 45 90 47 88 C48 81 48 74 46 67 Z' },
  { id: 'quad-r', muscle: 'Quadriceps', d: 'M54 67 C58 70 60 78 59 87 C57 90 55 90 53 88 C52 81 52 74 54 67 Z' },
  { id: 'calf-l', muscle: 'Calves', d: 'M41 87 C38 91 38 97 41 102 C43 103 45 102 46 99 C45 94 44 90 41 87 Z' },
  { id: 'calf-r', muscle: 'Calves', d: 'M59 87 C62 91 62 97 59 102 C57 103 55 102 54 99 C55 94 56 90 59 87 Z' }
];

const BACK_REGIONS = [
  { id: 'posterior-deltoid-l', muscle: 'Posterior Deltoids', d: 'M38 23 C34 24 32 29 34 35 C36 37 39 36 41 32 C42 28 41 24 38 23 Z' },
  { id: 'posterior-deltoid-r', muscle: 'Posterior Deltoids', d: 'M62 23 C66 24 68 29 66 35 C64 37 61 36 59 32 C58 28 59 24 62 23 Z' },
  { id: 'traps', muscle: 'Trapezius', d: 'M50 24 C44 24 40 26 37 29 C40 33 45 34 50 34 C55 34 60 33 63 29 C60 26 56 24 50 24 Z' },
  { id: 'lats-l', muscle: 'Latissimus Dorsi', d: 'M44 34 C39 36 36 42 36 54 C38 59 41 60 44 58 C45 50 45 41 44 34 Z' },
  { id: 'lats-r', muscle: 'Latissimus Dorsi', d: 'M56 34 C61 36 64 42 64 54 C62 59 59 60 56 58 C55 50 55 41 56 34 Z' },
  { id: 'triceps-l', muscle: 'Triceps Brachii', d: 'M34 35 C31 39 31 45 34 49 C37 50 40 47 40 42 C40 38 38 35 34 35 Z' },
  { id: 'triceps-r', muscle: 'Triceps Brachii', d: 'M66 35 C69 39 69 45 66 49 C63 50 60 47 60 42 C60 38 62 35 66 35 Z' },
  { id: 'rear-forearm-l', muscle: 'Forearms', d: 'M34 49 C31 54 32 62 35 67 C38 68 40 65 40 60 C39 55 37 51 34 49 Z' },
  { id: 'rear-forearm-r', muscle: 'Forearms', d: 'M66 49 C69 54 68 62 65 67 C62 68 60 65 60 60 C61 55 63 51 66 49 Z' },
  { id: 'erector', muscle: 'Erector Spinae', d: 'M50 43 C47 45 46 50 46 57 C47 59 48 60 50 60 C52 60 53 59 54 57 C54 50 53 45 50 43 Z' },
  { id: 'glutes', muscle: 'Glutes', d: 'M50 60 C44 60 40 64 40 69 C43 73 46 74 50 74 C54 74 57 73 60 69 C60 64 56 60 50 60 Z' },
  { id: 'ham-l', muscle: 'Hamstrings', d: 'M46 74 C42 77 40 84 41 91 C43 93 45 93 47 91 C48 85 48 79 46 74 Z' },
  { id: 'ham-r', muscle: 'Hamstrings', d: 'M54 74 C58 77 60 84 59 91 C57 93 55 93 53 91 C52 85 52 79 54 74 Z' },
  { id: 'calf-l', muscle: 'Calves', d: 'M41 91 C38 95 38 101 41 106 C43 107 45 106 46 103 C45 98 44 94 41 91 Z' },
  { id: 'calf-r', muscle: 'Calves', d: 'M59 91 C62 95 62 101 59 106 C57 107 55 106 54 103 C55 98 56 94 59 91 Z' }
];

const FRONT_TEXTURE = [
  { d: 'M50 20 C46 20 42 23 41 27 C42 29 44 30 46 30 C48 28 49 25 50 23 C51 25 52 28 54 30 C56 30 58 29 59 27 C58 23 54 20 50 20 Z', o: 0.2 },
  { d: 'M37 31 C35 34 35 38 36 42 C38 44 39 43 40 41 C40 37 39 34 37 31 Z', o: 0.16 },
  { d: 'M63 31 C65 34 65 38 64 42 C62 44 61 43 60 41 C60 37 61 34 63 31 Z', o: 0.16 },
  { d: 'M44 42 C43 45 43 49 44 53 C46 55 48 55 50 55 C52 55 54 55 56 53 C57 49 57 45 56 42 C54 43 52 44 50 44 C48 44 46 43 44 42 Z', o: 0.18 },
  { d: 'M45 56 C44 59 44 63 45 66 C47 67 49 68 50 68 C51 68 53 67 55 66 C56 63 56 59 55 56 C53 57 51 58 50 58 C49 58 47 57 45 56 Z', o: 0.16 },
  { d: 'M46 67 C44 71 43 76 43 82 C44 84 45 85 46 85 C47 80 47 74 46 67 Z', o: 0.15 },
  { d: 'M54 67 C56 71 57 76 57 82 C56 84 55 85 54 85 C53 80 53 74 54 67 Z', o: 0.15 }
];

const BACK_TEXTURE = [
  { d: 'M50 20 C46 20 42 23 40 27 C43 30 46 31 50 31 C54 31 57 30 60 27 C58 23 54 20 50 20 Z', o: 0.2 },
  { d: 'M44 33 C41 37 40 43 40 50 C41 55 42 57 44 58 C45 52 45 42 44 33 Z', o: 0.16 },
  { d: 'M56 33 C59 37 60 43 60 50 C59 55 58 57 56 58 C55 52 55 42 56 33 Z', o: 0.16 },
  { d: 'M47 43 C46 47 46 52 47 58 C48 59 49 60 50 60 C51 60 52 59 53 58 C54 52 54 47 53 43 C52 44 51 45 50 45 C49 45 48 44 47 43 Z', o: 0.19 },
  { d: 'M43 60 C42 63 42 68 43 73 C45 74 47 75 50 75 C53 75 55 74 57 73 C58 68 58 63 57 60 C55 62 53 63 50 63 C47 63 45 62 43 60 Z', o: 0.16 },
  { d: 'M46 74 C44 79 43 85 43 91 C44 92 45 93 46 93 C47 87 47 80 46 74 Z', o: 0.15 },
  { d: 'M54 74 C56 79 57 85 57 91 C56 92 55 93 54 93 C53 87 53 80 54 74 Z', o: 0.15 }
];

const FRONT_DETAIL = [
  { d: 'M50 19 C46 20 43 22 41 26 C43 29 46 30 50 30 C54 30 57 29 59 26 C57 22 54 20 50 19 Z', o: 0.22 },
  { d: 'M41 30 C38 33 36 39 36 46 C37 50 38 53 40 54 C41 47 41 38 41 30 Z', o: 0.18 },
  { d: 'M59 30 C62 33 64 39 64 46 C63 50 62 53 60 54 C59 47 59 38 59 30 Z', o: 0.18 },
  { d: 'M44 31 C43 34 43 39 44 43 C46 45 48 46 50 46 C52 46 54 45 56 43 C57 39 57 34 56 31 C54 32 52 33 50 33 C48 33 46 32 44 31 Z', o: 0.24 },
  { d: 'M45 46 C44 50 44 54 45 58 C47 60 48 60 50 60 C52 60 53 60 55 58 C56 54 56 50 55 46 C53 47 52 48 50 48 C48 48 47 47 45 46 Z', o: 0.2 },
  { d: 'M46 58 C45 61 45 66 46 70 C47 71 48 72 50 72 C52 72 53 71 54 70 C55 66 55 61 54 58 C53 59 52 60 50 60 C48 60 47 59 46 58 Z', o: 0.18 },
  { d: 'M41 70 C39 74 38 81 39 88 C40 90 42 91 43 90 C44 83 44 76 41 70 Z', o: 0.2 },
  { d: 'M59 70 C61 74 62 81 61 88 C60 90 58 91 57 90 C56 83 56 76 59 70 Z', o: 0.2 }
];

const BACK_DETAIL = [
  { d: 'M50 19 C46 20 42 22 39 26 C42 30 46 32 50 32 C54 32 58 30 61 26 C58 22 54 20 50 19 Z', o: 0.22 },
  { d: 'M44 32 C40 36 38 44 38 54 C39 58 41 60 43 60 C44 51 44 40 44 32 Z', o: 0.2 },
  { d: 'M56 32 C60 36 62 44 62 54 C61 58 59 60 57 60 C56 51 56 40 56 32 Z', o: 0.2 },
  { d: 'M47 41 C46 46 46 53 47 60 C48 62 49 63 50 63 C51 63 52 62 53 60 C54 53 54 46 53 41 C52 42 51 43 50 43 C49 43 48 42 47 41 Z', o: 0.2 },
  { d: 'M42 60 C41 64 41 70 42 75 C45 77 47 78 50 78 C53 78 55 77 58 75 C59 70 59 64 58 60 C55 62 53 63 50 63 C47 63 45 62 42 60 Z', o: 0.18 },
  { d: 'M43 75 C41 80 40 87 41 94 C42 95 43 96 45 95 C46 89 46 82 43 75 Z', o: 0.19 },
  { d: 'M57 75 C59 80 60 87 59 94 C58 95 57 96 55 95 C54 89 54 82 57 75 Z', o: 0.19 }
];

function buildPayload(stateMap) {
  const entries = Object.entries(stateMap).filter(([, state]) => state !== OFF);
  const primary = entries.filter(([, state]) => state === PRIMARY).map(([muscle]) => muscle);
  const secondary = entries.filter(([, state]) => state === SECONDARY).map(([muscle]) => muscle);

  return {
    primary,
    secondary,
    states: stateMap,
    selected: entries.map(([muscle, state]) => ({ muscle, state }))
  };
}

function getStateColor(state) {
  if (state === PRIMARY) return COLORS.primary;
  if (state === SECONDARY) return COLORS.secondary;
  return COLORS.base;
}

function SvgAnatomy({
  value,
  view,
  cycleMuscle,
  scale,
  pan,
  dragging,
  frameRef,
  handleWheel,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onTouchStart,
  onTouchMove,
  onTouchEnd
}) {
  const allRegions = view === 'front' ? FRONT_REGIONS : BACK_REGIONS;
  const texturePaths = view === 'front' ? FRONT_TEXTURE : BACK_TEXTURE;
  const detailPaths = view === 'front' ? FRONT_DETAIL : BACK_DETAIL;

  return (
    <div
      ref={frameRef}
      className="relative h-full w-full overflow-hidden rounded-2xl border border-cyan-300/20 bg-transparent"
      onWheel={handleWheel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{ touchAction: 'none', cursor: dragging ? 'grabbing' : scale > 1 ? 'grab' : 'default' }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_20%,rgba(0,255,255,0.12),transparent_45%),radial-gradient(circle_at_68%_80%,rgba(160,32,240,0.2),transparent_50%),linear-gradient(180deg,#07090f_0%,#090b10_100%)]" />
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'linear-gradient(rgba(0,255,255,0.09) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.09) 1px, transparent 1px)', backgroundSize: '26px 26px' }} />
      <motion.svg
        viewBox="0 0 100 110"
        className="relative z-10 h-full w-full"
        animate={{ scale, x: pan.x, y: pan.y }}
        transition={{ type: 'spring', stiffness: 120, damping: 20, mass: 0.5 }}
      >
        <defs>
          <pattern id="muscleStriations" width="2.2" height="2.2" patternUnits="userSpaceOnUse" patternTransform="rotate(-18)">
            <line x1="0" y1="0" x2="0" y2="2.2" stroke="rgba(207,214,228,0.09)" strokeWidth="0.18" />
            <line x1="1.1" y1="0" x2="1.1" y2="2.2" stroke="rgba(255,255,255,0.04)" strokeWidth="0.12" />
          </pattern>
          <linearGradient id="ecorcheDepth" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#5f6672" stopOpacity="0.5" />
            <stop offset="30%" stopColor="#3a404a" stopOpacity="0.86" />
            <stop offset="75%" stopColor="#242932" stopOpacity="0.97" />
            <stop offset="100%" stopColor="#151921" stopOpacity="1" />
          </linearGradient>
          <radialGradient id="muscleHotspot" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="22%" stopColor="#e8d5ff" stopOpacity="0.85" />
            <stop offset="56%" stopColor="#c15fff" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#a020f0" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="muscleHotspotSecondary" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="22%" stopColor="#cffafe" stopOpacity="0.85" />
            <stop offset="56%" stopColor="#06b6d4" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#0891b2" stopOpacity="0" />
          </radialGradient>
          <filter id="muscleGlowPrimary" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="5.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="muscleGlowSecondary" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="4.2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="anatomySoftShadow" x="-20%" y="-20%" width="140%" height="160%">
            <feGaussianBlur stdDeviation="1.2" />
          </filter>
        </defs>

        <g>
          <path d="M50 5 C46 5 43 7 41 11 C39 15 38 20 36 25 C34 31 34 39 35 47 C36 55 38 62 40 69 C41 75 40 82 39 89 C38 97 37 104 39 108 C42 111 45 112 50 112 C55 112 58 111 61 108 C63 104 62 97 61 89 C60 82 59 75 60 69 C62 62 64 55 65 47 C66 39 66 31 64 25 C62 20 61 15 59 11 C57 7 54 5 50 5 Z" fill="url(#ecorcheDepth)" />
          <path d="M50 5 C46 5 43 7 41 11 C39 15 38 20 36 25 C34 31 34 39 35 47 C36 55 38 62 40 69 C41 75 40 82 39 89 C38 97 37 104 39 108 C42 111 45 112 50 112 C55 112 58 111 61 108 C63 104 62 97 61 89 C60 82 59 75 60 69 C62 62 64 55 65 47 C66 39 66 31 64 25 C62 20 61 15 59 11 C57 7 54 5 50 5 Z" fill="url(#muscleStriations)" opacity="0.84" />
          <path d="M50 5 C48 5 46 7 45 10 C44 13 45 16 47 18 C48 19 49 20 50 20 C51 20 52 19 53 18 C55 16 56 13 55 10 C54 7 52 5 50 5 Z" fill="#7a7f87" opacity="0.46" />
          {texturePaths.map((p, idx) => (
            <path key={idx} d={p.d} fill="rgba(205,214,230,0.13)" opacity={p.o} />
          ))}
          {detailPaths.map((p, idx) => (
            <path key={`d-${idx}`} d={p.d} fill="rgba(226,233,246,0.16)" opacity={p.o} />
          ))}
          <path d="M50 5 C46 5 43 7 41 11 C39 15 38 20 36 25 C34 31 34 39 35 47 C36 55 38 62 40 69 C41 75 40 82 39 89 C38 97 37 104 39 108 C42 111 45 112 50 112 C55 112 58 111 61 108 C63 104 62 97 61 89 C60 82 59 75 60 69 C62 62 64 55 65 47 C66 39 66 31 64 25 C62 20 61 15 59 11 C57 7 54 5 50 5 Z" fill="none" stroke="rgba(222,230,245,0.16)" strokeWidth="0.56" filter="url(#anatomySoftShadow)" />
        </g>

        {allRegions.map((region) => {
          const state = value[region.muscle] ?? OFF;
          const fill = getStateColor(state);
          const glowFilter = state === PRIMARY
            ? 'url(#muscleGlowPrimary)'
            : state === SECONDARY
              ? 'url(#muscleGlowSecondary)'
              : 'none';
          const glowOpacity = state !== OFF ? 0.95 : 0.62;
          return (
            <g key={region.id}>
              {(state === PRIMARY || state === SECONDARY) && (
                <path
                  d={region.d}
                  fill={state === PRIMARY ? 'url(#muscleHotspot)' : 'url(#muscleHotspotSecondary)'}
                  opacity={0.95}
                  filter={glowFilter}
                  style={{ mixBlendMode: 'screen' }}
                />
              )}
              <motion.path
                d={region.d}
                onClick={() => cycleMuscle(region.muscle)}
                animate={{
                  fill,
                  opacity: glowOpacity,
                  stroke: state === OFF ? COLORS.stroke : fill,
                  strokeWidth: state === OFF ? 0.85 : 1.4
                }}
                transition={{ duration: 0.32, ease: 'easeOut' }}
                filter={glowFilter}
                className="cursor-pointer"
              />
            </g>
          );
        })}

        <text x="50" y="108" textAnchor="middle" fill="rgba(132,145,176,0.8)" fontSize="3.5" letterSpacing="0.9">
          {view === 'front' ? 'FRONT' : 'BACK'}
        </text>
        <text x="7" y="10" fill="rgba(96,255,255,0.5)" fontSize="2.5" letterSpacing="0.5">98%</text>
        <path d="M6 12 L16 12 M6 13.5 L12 13.5 M6 15 L9 15" stroke="rgba(88,234,255,0.3)" strokeWidth="0.25" />
        <text x="74" y="10" fill="rgba(194,151,255,0.55)" fontSize="2.2" letterSpacing="0.5">MUSCLE LIVE MAP</text>
      </motion.svg>

      <div className="pointer-events-none absolute bottom-3 left-3 rounded-md border border-cyan-300/20 bg-[#08101b]/70 px-2 py-1 text-[11px] text-cyan-100/90">
        Click muscle to cycle: Off -&gt; Primary -&gt; Secondary -&gt; Off
      </div>
    </div>
  );
}

export default function MuscleAnatomyMap({
  value = {},
  onChange,
  interactive = true,
  showModeToggle = true
}) {
  const [view, setView] = useState('front');
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [lastPoint, setLastPoint] = useState({ x: 0, y: 0 });
  const frameRef = useRef(null);
  const touchRef = useRef({ active: false, distance: 0, center: null });

  const cycleMuscle = (muscleName) => {
    if (!interactive) return;
    const current = value[muscleName] ?? OFF;
    const next = CYCLE[current];
    const nextState = { ...value, [muscleName]: next };
    if (next === OFF) {
      delete nextState[muscleName];
    }
    onChange?.(buildPayload(nextState));
  };

  const resetView = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  };

  const handleWheel = (event) => {
    event.preventDefault();
    const direction = event.deltaY > 0 ? -0.16 : 0.16;
    setScale((prev) => Math.max(1, Math.min(3.5, Number((prev + direction).toFixed(2)))));
  };

  const onPointerDown = (event) => {
    if (scale <= 1) return;
    setDragging(true);
    setLastPoint({ x: event.clientX, y: event.clientY });
  };

  const onPointerMove = (event) => {
    if (!dragging) return;
    const dx = event.clientX - lastPoint.x;
    const dy = event.clientY - lastPoint.y;
    setPan((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    setLastPoint({ x: event.clientX, y: event.clientY });
  };

  const onPointerUp = () => setDragging(false);

  const onTouchStart = (event) => {
    if (event.touches.length !== 2) return;
    const [a, b] = event.touches;
    const distance = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
    touchRef.current = {
      active: true,
      distance,
      center: { x: (a.clientX + b.clientX) / 2, y: (a.clientY + b.clientY) / 2 }
    };
  };

  const onTouchMove = (event) => {
    if (!touchRef.current.active || event.touches.length !== 2) return;
    const [a, b] = event.touches;
    const newDistance = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
    const delta = (newDistance - touchRef.current.distance) / 150;
    setScale((prev) => Math.max(1, Math.min(3.5, Number((prev + delta).toFixed(2)))));
    touchRef.current.distance = newDistance;
  };

  const onTouchEnd = () => {
    touchRef.current = { active: false, distance: 0, center: null };
  };

  return (
    <div className="relative w-full">
      <div className="absolute right-3 top-3 z-30 flex items-center gap-2">
        {showModeToggle && (
          <motion.div layout className="hidden items-center rounded-full border border-gray-700/70 bg-[#0a0f18]/90 p-1 sm:flex">
          <button
            type="button"
            onClick={() => setView('front')}
            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${view === 'front' ? 'bg-cyan-500/20 text-cyan-200' : 'text-gray-400 hover:text-gray-200'}`}
          >
            Front
          </button>
          <button
            type="button"
            onClick={() => setView('back')}
            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${view === 'back' ? 'bg-purple-500/20 text-purple-200' : 'text-gray-400 hover:text-gray-200'}`}
          >
            Back
          </button>
          </motion.div>
        )}
        <div className="flex items-center gap-1 rounded-full border border-cyan-400/30 bg-[#0a0f18]/85 px-3 py-1 text-xs text-cyan-200 backdrop-blur">
          <ZoomIn size={14} />
          View + Zoom
        </div>
        <button
          type="button"
          onClick={resetView}
          className="inline-flex items-center gap-1 rounded-full border border-purple-500/40 bg-[#150d1f]/85 px-3 py-1 text-xs text-purple-200 transition hover:border-purple-400 hover:text-white"
        >
          <RotateCcw size={13} />
          Reset View
        </button>
      </div>

      <div className="relative h-[26rem] w-full overflow-hidden rounded-2xl border border-cyan-300/20 bg-transparent">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_16%,rgba(0,255,255,0.1),transparent_40%),radial-gradient(circle_at_72%_74%,rgba(160,32,240,0.16),transparent_45%),linear-gradient(180deg,#05070c_0%,#0b0e14_100%)]" />
        <div className="absolute inset-0 opacity-35" style={{ backgroundImage: 'linear-gradient(rgba(0,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.08) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 14% 16%, rgba(85,225,255,0.45) 0 1px, transparent 2px), radial-gradient(circle at 84% 28%, rgba(160,32,240,0.35) 0 1px, transparent 2px), radial-gradient(circle at 64% 76%, rgba(85,225,255,0.25) 0 1px, transparent 2px)' }} />
        <svg className="absolute inset-0 h-full w-full opacity-25" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0 22 L18 22 L24 30 L46 30" stroke="rgba(102,237,255,0.45)" strokeWidth="0.28" fill="none" />
          <path d="M100 36 L82 36 L76 42 L58 42" stroke="rgba(176,128,255,0.45)" strokeWidth="0.28" fill="none" />
          <path d="M8 82 L28 82 L36 74 L50 74" stroke="rgba(102,237,255,0.34)" strokeWidth="0.24" fill="none" />
          <path d="M92 72 L72 72 L64 64 L50 64" stroke="rgba(176,128,255,0.34)" strokeWidth="0.24" fill="none" />
        </svg>
        <div className="relative z-10 h-full w-full">
            <SvgAnatomy
              value={value}
              view={view}
              cycleMuscle={cycleMuscle}
              scale={scale}
              pan={pan}
              dragging={dragging}
              frameRef={frameRef}
              handleWheel={handleWheel}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            />
        </div>

        <div className="pointer-events-none absolute bottom-3 left-3 z-20 rounded-md border border-cyan-300/20 bg-[#08101b]/70 px-2 py-1 text-[11px] text-cyan-100/90">
          {interactive ? 'Click muscle to toggle highlight' : 'Visual mode: muscle activation map'}
          {' | drag to pan while zoomed'}
        </div>
      </div>
    </div>
  );
}
