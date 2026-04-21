import React, { useState, useRef } from 'react';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

const IMGS = {
  Chest: '/anatomy/chest.png', Back: '/anatomy/back.png',
  Shoulders: '/anatomy/shoulders.png', Arms: '/anatomy/arms.png', Core: '/anatomy/core.png',
};

// Back-facing muscles — show back-view image
const BACK_MUSCLES = new Set([
  'Posterior Deltoids','Latissimus Dorsi','Trapezius','Erector Spinae',
  'Rhomboids','Hamstrings','Glutes',
]);

const TO_GROUP = {
  'Upper Pectoralis Major':'Chest','Sternal Pectoralis Major':'Chest','Pectoralis Major':'Chest',
  'Latissimus Dorsi':'Back','Trapezius':'Back','Erector Spinae':'Back','Rhomboids':'Back',
  'Anterior Deltoids':'Shoulders','Lateral Deltoids':'Shoulders','Posterior Deltoids':'Back',
  'Deltoids':'Shoulders',
  'Biceps Brachii':'Arms','Triceps Brachii':'Arms','Forearms':'Arms','Biceps':'Arms','Triceps':'Arms',
  'Rectus Abdominis':'Core','Obliques':'Core','Lower Abs':'Core','Transverse Abdominis':'Core',
  'Quadriceps':'Legs','Hamstrings':'Legs','Glutes':'Legs','Calves':'Legs',
};

// SVG overlay paths — viewBox "0 0 100 110", matching MuscleAnatomyMap front regions
const FRONT_OVERLAYS = [
  { m:'Upper Pectoralis Major', d:'M50 25 C44 25 40 26 37 30 C40 33 45 34 50 33 Z M50 25 C56 25 60 26 63 30 C60 33 55 34 50 33 Z' },
  { m:'Sternal Pectoralis Major', d:'M50 33 C44 33 40 34 38 39 C41 42 45 43 50 42 Z M50 33 C56 33 60 34 62 39 C59 42 55 43 50 42 Z' },
  { m:'Pectoralis Major', d:'M50 25 C44 25 40 26 37 30 C41 42 45 43 50 42 Z M50 25 C56 25 60 26 63 30 C59 42 55 43 50 42 Z' },
  { m:'Anterior Deltoids', d:'M38 23 C34 24 32 29 34 35 C36 37 39 36 41 32 C42 28 41 24 38 23 Z M62 23 C66 24 68 29 66 35 C64 37 61 36 59 32 C58 28 59 24 62 23 Z' },
  { m:'Lateral Deltoids', d:'M38 23 C34 24 32 29 34 35 C36 37 39 36 41 32 C42 28 41 24 38 23 Z M62 23 C66 24 68 29 66 35 C64 37 61 36 59 32 C58 28 59 24 62 23 Z' },
  { m:'Deltoids', d:'M38 23 C34 24 32 29 34 35 C36 37 39 36 41 32 C42 28 41 24 38 23 Z M62 23 C66 24 68 29 66 35 C64 37 61 36 59 32 C58 28 59 24 62 23 Z' },
  { m:'Biceps Brachii', d:'M34 35 C31 39 31 45 34 49 C37 50 40 47 40 42 C40 38 38 35 34 35 Z M66 35 C69 39 69 45 66 49 C63 50 60 47 60 42 C60 38 62 35 66 35 Z' },
  { m:'Biceps', d:'M34 35 C31 39 31 45 34 49 C37 50 40 47 40 42 C40 38 38 35 34 35 Z M66 35 C69 39 69 45 66 49 C63 50 60 47 60 42 C60 38 62 35 66 35 Z' },
  { m:'Triceps Brachii', d:'M34 35 C31 39 31 45 34 49 C37 50 40 47 40 42 Z M66 35 C69 39 69 45 66 49 C63 50 60 47 60 42 Z' },
  { m:'Triceps', d:'M34 35 C31 39 31 45 34 49 C37 50 40 47 40 42 Z M66 35 C69 39 69 45 66 49 C63 50 60 47 60 42 Z' },
  { m:'Forearms', d:'M34 49 C31 54 32 62 35 67 C38 68 40 65 40 60 C39 55 37 51 34 49 Z M66 49 C69 54 68 62 65 67 C62 68 60 65 60 60 C61 55 63 51 66 49 Z' },
  { m:'Rectus Abdominis', d:'M50 42 C46 43 44 47 44 52 C46 55 48 56 50 56 C52 56 54 55 56 52 C56 47 54 43 50 42 Z M50 56 C47 57 46 60 46 64 C47 66 49 67 50 67 C51 67 53 66 54 64 C54 60 53 57 50 56 Z' },
  { m:'Obliques', d:'M44 47 C40 49 38 53 38 57 C40 59 42 59 44 58 Z M56 47 C60 49 62 53 62 57 C60 59 58 59 56 58 Z' },
  { m:'Lower Abs', d:'M50 56 C47 57 46 60 46 64 C47 66 49 67 50 67 C51 67 53 66 54 64 C54 60 53 57 50 56 Z' },
  { m:'Transverse Abdominis', d:'M44 42 C43 45 43 49 44 53 C46 55 48 56 50 56 C52 56 54 55 56 53 C57 49 57 45 56 42 C54 43 52 44 50 44 C48 44 46 43 44 42 Z' },
];

// Back-view overlay paths (same coordinate space, back regions)
const BACK_OVERLAYS = [
  { m:'Posterior Deltoids', d:'M38 23 C34 24 32 29 34 35 C36 37 39 36 41 32 C42 28 41 24 38 23 Z M62 23 C66 24 68 29 66 35 C64 37 61 36 59 32 C58 28 59 24 62 23 Z' },
  { m:'Latissimus Dorsi', d:'M44 34 C39 36 36 42 36 54 C38 59 41 60 44 58 C45 50 45 41 44 34 Z M56 34 C61 36 64 42 64 54 C62 59 59 60 56 58 C55 50 55 41 56 34 Z' },
  { m:'Trapezius', d:'M50 24 C44 24 40 26 37 29 C40 33 45 34 50 34 C55 34 60 33 63 29 C60 26 56 24 50 24 Z' },
  { m:'Erector Spinae', d:'M50 43 C47 45 46 50 46 57 C47 59 48 60 50 60 C52 60 53 59 54 57 C54 50 53 45 50 43 Z' },
  { m:'Rhomboids', d:'M46 32 C43 34 42 38 43 43 C46 44 48 44 50 44 C52 44 54 44 57 43 C58 38 57 34 54 32 Z' },
  { m:'Hamstrings', d:'M46 74 C42 77 40 84 41 91 C43 93 45 93 47 91 C48 85 48 79 46 74 Z M54 74 C58 77 60 84 59 91 C57 93 55 93 53 91 C52 85 52 79 54 74 Z' },
  { m:'Glutes', d:'M50 60 C44 60 40 64 40 69 C43 73 46 74 50 74 C54 74 57 73 60 69 C60 64 56 60 50 60 Z' },
];

// High-fidelity 3D muscular lower-body model
function LegsSVG({ activeMuscles = [] }) {
  const active = new Set(activeMuscles);
  const PURPLE  = '#c084fc';
  const PURPLE2 = '#7c3aed';
  const DIM     = '#1e1830';
  const qOn  = active.has('Quadriceps');
  const hOn  = active.has('Hamstrings');
  const gOn  = active.has('Glutes');
  const cOn  = active.has('Calves');

  const qFill  = qOn  ? PURPLE  : DIM;
  const q2Fill = qOn  ? PURPLE2 : DIM;
  const hFill  = hOn  ? PURPLE  : DIM;
  const gFill  = gOn  ? PURPLE  : DIM;
  const cFill  = cOn  ? PURPLE  : DIM;
  const c2Fill = cOn  ? PURPLE2 : DIM;

  const qOp  = qOn  ? 0.82 : 0.06;
  const q2Op = qOn  ? 0.55 : 0.04;
  const hOp  = hOn  ? 0.60 : 0.04;
  const gOp  = gOn  ? 0.80 : 0.05;
  const cOp  = cOn  ? 0.75 : 0.05;
  const c2Op = cOn  ? 0.50 : 0.03;

  return (
    <svg viewBox="0 0 200 340" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <radialGradient id="lg-bg" cx="50%" cy="20%" r="80%">
          <stop offset="0%" stopColor="#18102e"/>
          <stop offset="100%" stopColor="#06040e"/>
        </radialGradient>
        {/* Quad gradients */}
        <radialGradient id="lg-ql" cx="38%" cy="42%" r="60%">
          <stop offset="0%" stopColor="#c084fc" stopOpacity="1"/>
          <stop offset="55%" stopColor="#7c3aed" stopOpacity="0.7"/>
          <stop offset="100%" stopColor="#4c1d95" stopOpacity="0.1"/>
        </radialGradient>
        <radialGradient id="lg-qr" cx="62%" cy="42%" r="60%">
          <stop offset="0%" stopColor="#c084fc" stopOpacity="1"/>
          <stop offset="55%" stopColor="#7c3aed" stopOpacity="0.7"/>
          <stop offset="100%" stopColor="#4c1d95" stopOpacity="0.1"/>
        </radialGradient>
        {/* Calf gradients */}
        <radialGradient id="lg-cl" cx="38%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.9"/>
          <stop offset="65%" stopColor="#6d28d9" stopOpacity="0.5"/>
          <stop offset="100%" stopColor="#3b0764" stopOpacity="0.05"/>
        </radialGradient>
        <radialGradient id="lg-cr" cx="62%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.9"/>
          <stop offset="65%" stopColor="#6d28d9" stopOpacity="0.5"/>
          <stop offset="100%" stopColor="#3b0764" stopOpacity="0.05"/>
        </radialGradient>
        {/* Glute gradient */}
        <radialGradient id="lg-gl" cx="30%" cy="55%" r="70%">
          <stop offset="0%" stopColor="#c084fc" stopOpacity="0.95"/>
          <stop offset="60%" stopColor="#7c3aed" stopOpacity="0.55"/>
          <stop offset="100%" stopColor="#4c1d95" stopOpacity="0.05"/>
        </radialGradient>
        <radialGradient id="lg-gr" cx="70%" cy="55%" r="70%">
          <stop offset="0%" stopColor="#c084fc" stopOpacity="0.95"/>
          <stop offset="60%" stopColor="#7c3aed" stopOpacity="0.55"/>
          <stop offset="100%" stopColor="#4c1d95" stopOpacity="0.05"/>
        </radialGradient>
        {/* Hamstring gradient */}
        <radialGradient id="lg-hl" cx="35%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#c084fc" stopOpacity="0.85"/>
          <stop offset="65%" stopColor="#6d28d9" stopOpacity="0.45"/>
          <stop offset="100%" stopColor="#3b0764" stopOpacity="0.05"/>
        </radialGradient>
        <radialGradient id="lg-hr" cx="65%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#c084fc" stopOpacity="0.85"/>
          <stop offset="65%" stopColor="#6d28d9" stopOpacity="0.45"/>
          <stop offset="100%" stopColor="#3b0764" stopOpacity="0.05"/>
        </radialGradient>
        <filter id="lg-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="lg-soft" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Background */}
      <rect width="200" height="340" fill="url(#lg-bg)"/>

      {/* ── Grid ── */}
      <g opacity="0.06" stroke="rgba(160,32,240,0.5)" strokeWidth="0.4">
        {[0,25,50,75,100,125,150,175,200].map(x=><line key={x} x1={x} y1="0" x2={x} y2="340"/>)}
        {[0,25,50,75,100,125,150,175,200,225,250,275,300,325].map(y=><line key={y} x1="0" y1={y} x2="200" y2={y}/>)}
      </g>

      {/* ══ PELVIS / HIP ══ */}
      <ellipse cx="100" cy="44" rx="58" ry="24" fill="#1a1230" stroke="rgba(180,140,220,0.3)" strokeWidth="1"/>
      {/* Hip crease lines */}
      <path d="M55 38 Q78 30 100 28 Q122 30 145 38" stroke="rgba(160,100,220,0.3)" strokeWidth="1" fill="none"/>

      {/* ══ GLUTES ══ */}
      {/* Left glute */}
      <path d="M42 34 Q68 22 100 26 Q100 60 76 70 Q52 72 40 56 Z"
        fill="#180e2a" stroke="rgba(130,80,200,0.2)" strokeWidth="1"/>
      <path d="M42 34 Q68 22 100 26 Q100 60 76 70 Q52 72 40 56 Z"
        fill={gOn ? "url(#lg-gl)" : "#c084fc"} opacity={gOp}
        filter="url(#lg-glow)" style={{mixBlendMode:'screen'}}/>
      {/* Right glute */}
      <path d="M158 34 Q132 22 100 26 Q100 60 124 70 Q148 72 160 56 Z"
        fill="#180e2a" stroke="rgba(130,80,200,0.2)" strokeWidth="1"/>
      <path d="M158 34 Q132 22 100 26 Q100 60 124 70 Q148 72 160 56 Z"
        fill={gOn ? "url(#lg-gr)" : "#c084fc"} opacity={gOp}
        filter="url(#lg-glow)" style={{mixBlendMode:'screen'}}/>
      {/* Glute crease */}
      <line x1="100" y1="26" x2="100" y2="70" stroke="rgba(160,100,220,0.22)" strokeWidth="1"/>
      {/* Glute highlight sheens */}
      {gOn && <>
        <ellipse cx="72" cy="44" rx="16" ry="9" fill="#e9d5ff" fillOpacity="0.22" filter="url(#lg-soft)"/>
        <ellipse cx="128" cy="44" rx="16" ry="9" fill="#e9d5ff" fillOpacity="0.22" filter="url(#lg-soft)"/>
      </>}

      {/* ══ LEFT LEG ══ */}
      {/* --- Outer quad sweep (vastus lateralis) --- */}
      <path d="M52 58 Q38 68 36 114 Q38 138 50 150 Q60 144 62 128 Q64 100 58 68 Z"
        fill="#1a1230" stroke="rgba(140,100,200,0.25)" strokeWidth="1"/>
      <path d="M52 58 Q38 68 36 114 Q38 138 50 150 Q60 144 62 128 Q64 100 58 68 Z"
        fill={qOn ? "url(#lg-ql)" : "#c084fc"} opacity={qOp}
        filter="url(#lg-glow)" style={{mixBlendMode:'screen'}}/>
      {/* --- Rectus femoris (centre quad) --- */}
      <path d="M58 60 Q72 56 82 62 Q84 90 74 120 Q66 128 58 120 Q54 96 58 60 Z"
        fill={q2Fill} opacity={q2Op} style={{mixBlendMode:'screen'}}/>
      {/* --- VMO teardrop --- */}
      <ellipse cx="60" cy="146" rx="9" ry="13"
        fill={qOn ? "#c084fc" : "#3b0764"} opacity={qOn ? 0.65 : 0.05}
        filter="url(#lg-soft)" style={{mixBlendMode:'screen'}}/>
      {/* Quad fibre lines */}
      {qOn && ['M50 74 Q54 106 52 140','M62 66 Q64 100 62 136','M74 68 Q74 100 72 132'].map((d,i)=>(
        <path key={i} d={d} stroke="#e9d5ff" strokeWidth="0.8" strokeOpacity="0.35" fill="none" strokeLinecap="round"/>
      ))}
      {/* --- Hamstring back stripe (inner side) --- */}
      <path d="M42 68 Q34 78 34 138 Q38 152 50 156"
        stroke={hOn ? "url(#lg-hl)" : "#3b0764"} strokeWidth="11" fill="none"
        strokeLinecap="round" opacity={hOp}
        filter="url(#lg-glow)" style={{mixBlendMode:'screen'}}/>
      {hOn && <path d="M42 68 Q34 78 34 138 Q38 152 50 156"
        stroke="#e9d5ff" strokeWidth="1" fill="none" strokeOpacity="0.3" strokeLinecap="round"/>}
      {/* Kneecap */}
      <ellipse cx="58" cy="162" rx="18" ry="12" fill="#130c20" stroke="rgba(120,80,180,0.4)" strokeWidth="1.2"/>
      <ellipse cx="58" cy="160" rx="10" ry="7" fill="#1e1438" stroke="rgba(140,100,200,0.5)" strokeWidth="0.7"/>
      {/* --- Calf (gastrocnemius lateral) --- */}
      <path d="M44 173 Q38 200 44 242 Q50 260 58 262 Q66 261 70 242 Q76 218 74 173 Z"
        fill="#130c20" stroke="rgba(110,70,160,0.2)" strokeWidth="1"/>
      <path d="M44 173 Q38 200 44 242 Q50 260 58 262 Q66 261 70 242 Q76 218 74 173 Z"
        fill={cOn ? "url(#lg-cl)" : "#a855f7"} opacity={cOp}
        filter="url(#lg-soft)" style={{mixBlendMode:'screen'}}/>
      {/* Calf medial head */}
      <path d="M58 173 Q70 170 74 173 Q74 208 70 240 Q64 252 58 240 Z"
        fill={c2Fill} opacity={c2Op} style={{mixBlendMode:'screen'}}/>
      {/* Calf diamond highlight */}
      {cOn && <ellipse cx="57" cy="210" rx="8" ry="18" fill="#e9d5ff" fillOpacity="0.15" filter="url(#lg-soft)"/>}
      {/* Ankle */}
      <ellipse cx="58" cy="268" rx="12" ry="7" fill="#0e0819" stroke="rgba(100,70,140,0.25)" strokeWidth="1"/>

      {/* ══ RIGHT LEG ══ */}
      {/* --- Outer quad sweep --- */}
      <path d="M148 58 Q162 68 164 114 Q162 138 150 150 Q140 144 138 128 Q136 100 142 68 Z"
        fill="#1a1230" stroke="rgba(140,100,200,0.25)" strokeWidth="1"/>
      <path d="M148 58 Q162 68 164 114 Q162 138 150 150 Q140 144 138 128 Q136 100 142 68 Z"
        fill={qOn ? "url(#lg-qr)" : "#c084fc"} opacity={qOp}
        filter="url(#lg-glow)" style={{mixBlendMode:'screen'}}/>
      {/* --- Rectus femoris --- */}
      <path d="M142 60 Q128 56 118 62 Q116 90 126 120 Q134 128 142 120 Q146 96 142 60 Z"
        fill={q2Fill} opacity={q2Op} style={{mixBlendMode:'screen'}}/>
      {/* --- VMO teardrop --- */}
      <ellipse cx="140" cy="146" rx="9" ry="13"
        fill={qOn ? "#c084fc" : "#3b0764"} opacity={qOn ? 0.65 : 0.05}
        filter="url(#lg-soft)" style={{mixBlendMode:'screen'}}/>
      {/* Quad fibre lines */}
      {qOn && ['M150 74 Q146 106 148 140','M138 66 Q136 100 138 136','M126 68 Q126 100 128 132'].map((d,i)=>(
        <path key={i} d={d} stroke="#e9d5ff" strokeWidth="0.8" strokeOpacity="0.35" fill="none" strokeLinecap="round"/>
      ))}
      {/* --- Hamstring back stripe --- */}
      <path d="M158 68 Q166 78 166 138 Q162 152 150 156"
        stroke={hOn ? "url(#lg-hr)" : "#3b0764"} strokeWidth="11" fill="none"
        strokeLinecap="round" opacity={hOp}
        filter="url(#lg-glow)" style={{mixBlendMode:'screen'}}/>
      {hOn && <path d="M158 68 Q166 78 166 138 Q162 152 150 156"
        stroke="#e9d5ff" strokeWidth="1" fill="none" strokeOpacity="0.3" strokeLinecap="round"/>}
      {/* Kneecap */}
      <ellipse cx="142" cy="162" rx="18" ry="12" fill="#130c20" stroke="rgba(120,80,180,0.4)" strokeWidth="1.2"/>
      <ellipse cx="142" cy="160" rx="10" ry="7" fill="#1e1438" stroke="rgba(140,100,200,0.5)" strokeWidth="0.7"/>
      {/* --- Calf --- */}
      <path d="M126 173 Q120 200 126 242 Q132 260 142 262 Q150 261 154 242 Q160 218 158 173 Z"
        fill="#130c20" stroke="rgba(110,70,160,0.2)" strokeWidth="1"/>
      <path d="M126 173 Q120 200 126 242 Q132 260 142 262 Q150 261 154 242 Q160 218 158 173 Z"
        fill={cOn ? "url(#lg-cr)" : "#a855f7"} opacity={cOp}
        filter="url(#lg-soft)" style={{mixBlendMode:'screen'}}/>
      {/* Calf medial head */}
      <path d="M142 173 Q130 170 126 173 Q126 208 130 240 Q136 252 142 240 Z"
        fill={c2Fill} opacity={c2Op} style={{mixBlendMode:'screen'}}/>
      {/* Calf diamond highlight */}
      {cOn && <ellipse cx="143" cy="210" rx="8" ry="18" fill="#e9d5ff" fillOpacity="0.15" filter="url(#lg-soft)"/>}
      {/* Ankle */}
      <ellipse cx="142" cy="268" rx="12" ry="7" fill="#0e0819" stroke="rgba(100,70,140,0.25)" strokeWidth="1"/>

      {/* ══ PEAK GLOW HOTSPOTS (when active) ══ */}
      {qOn && <>
        <ellipse cx="46" cy="96" rx="10" ry="18" fill="#a855f7" fillOpacity="0.28" filter="url(#lg-soft)"/>
        <ellipse cx="154" cy="96" rx="10" ry="18" fill="#a855f7" fillOpacity="0.28" filter="url(#lg-soft)"/>
      </>}
      {cOn && <>
        <ellipse cx="58" cy="218" rx="8" ry="15" fill="#a855f7" fillOpacity="0.22" filter="url(#lg-soft)"/>
        <ellipse cx="142" cy="218" rx="8" ry="15" fill="#a855f7" fillOpacity="0.22" filter="url(#lg-soft)"/>
      </>}

      {/* ══ HIGHLIGHT SHEEN STREAKS ══ */}
      <path d="M40 72 Q52 66 56 86" stroke="#e9d5ff" strokeWidth="1.2" strokeOpacity="0.4" fill="none" strokeLinecap="round"/>
      <path d="M160 72 Q148 66 144 86" stroke="#e9d5ff" strokeWidth="1.2" strokeOpacity="0.4" fill="none" strokeLinecap="round"/>

      {/* ══ HUD ══ */}
      <text x="10" y="20" fill="rgba(190,140,255,0.7)" fontSize="9" fontFamily="monospace">98%</text>
      <line x1="10" y1="23" x2="42" y2="23" stroke="rgba(160,80,255,0.35)" strokeWidth="1"/>
      <text x="110" y="330" textAnchor="middle" fill="rgba(140,110,190,0.35)" fontSize="8" fontFamily="monospace" letterSpacing="2">LOWER BODY</text>

      {/* Corner brackets */}
      <path d="M4 14 L4 4 L14 4" stroke="rgba(180,100,255,0.6)" strokeWidth="0.7" fill="none"/>
      <path d="M186 4 L196 4 L196 14" stroke="rgba(180,100,255,0.6)" strokeWidth="0.7" fill="none"/>
      <path d="M4 326 L4 336 L14 336" stroke="rgba(180,100,255,0.4)" strokeWidth="0.7" fill="none"/>
      <path d="M186 336 L196 336 L196 326" stroke="rgba(180,100,255,0.4)" strokeWidth="0.7" fill="none"/>
    </svg>
  );
}


export default function MuscleAnatomyDisplay({ muscleGroup, anatomyStates = {} }) {
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const lastPt = useRef({ x: 0, y: 0 });

  const activeMuscles = Object.entries(anatomyStates)
    .filter(([, s]) => s === 'primary' || s === 'secondary')
    .map(([m]) => m);

  // Determine group and whether back view is needed
  const hasBackMuscle = activeMuscles.some(m => BACK_MUSCLES.has(m));
  const group = (() => {
    const fromActive = activeMuscles.map(m => TO_GROUP[m]).filter(Boolean)[0];
    return fromActive || muscleGroup || 'Chest';
  })();

  const isLegs = group === 'Legs' || muscleGroup === 'Glutes' || activeMuscles.some(m => ['Glutes','Quadriceps','Hamstrings','Calves'].includes(m));
  // Use back image if any back muscle is targeted
  const imgKey = hasBackMuscle ? 'Back' : group;
  const imgSrc = IMGS[imgKey];
  const overlayPaths = hasBackMuscle ? BACK_OVERLAYS : FRONT_OVERLAYS;
  const activeSet = new Set(activeMuscles);

  const wheel = (e) => { e.preventDefault(); setScale(p => Math.max(1, Math.min(5, +(p + (e.deltaY > 0 ? -0.18 : 0.18)).toFixed(2)))); };
  const pDown = (e) => { if (scale <= 1) return; setDragging(true); lastPt.current = { x: e.clientX, y: e.clientY }; e.currentTarget.setPointerCapture(e.pointerId); };
  const pMove = (e) => { if (!dragging) return; setPan(p => ({ x: p.x + (e.clientX - lastPt.current.x), y: p.y + (e.clientY - lastPt.current.y) })); lastPt.current = { x: e.clientX, y: e.clientY }; };
  const pUp = () => setDragging(false);
  const reset = () => { setScale(1); setPan({ x: 0, y: 0 }); };

  const tf = { transform: `scale(${scale}) translate(${pan.x / scale}px,${pan.y / scale}px)`, transition: dragging ? 'none' : 'transform 0.2s ease-out', willChange: 'transform' };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-purple-500/25 bg-[#06040f] select-none"
      style={{ aspectRatio: '3/4', touchAction: 'none', cursor: dragging ? 'grabbing' : scale > 1 ? 'grab' : 'default' }}
      onWheel={wheel} onPointerDown={pDown} onPointerMove={pMove} onPointerUp={pUp} onPointerLeave={pUp}
    >
      {/* Grid bg */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at 50% 20%,rgba(120,40,220,0.18) 0%,transparent 65%),#06040f',
        backgroundImage: 'linear-gradient(rgba(140,80,255,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(140,80,255,0.05) 1px,transparent 1px)',
        backgroundSize: '28px 28px',
      }}/>

      {/* Content (zoomable) */}
      <div className="absolute inset-0 flex items-center justify-center" style={tf}>
        {isLegs ? (
          <div className="w-full h-full"><LegsSVG activeMuscles={activeMuscles}/></div>
        ) : imgSrc ? (
          <div className="relative w-full h-full">
            <img src={imgSrc} alt={group} className="w-full h-full object-contain" draggable={false}/>
            {/* Purple SVG overlay for active muscles */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 110" preserveAspectRatio="xMidYMid meet">
              <defs>
                <filter id="ov-glow" x="-80%" y="-80%" width="260%" height="260%">
                  <feGaussianBlur stdDeviation="4" result="b"/>
                  <feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>
              {overlayPaths.filter(p => activeSet.has(p.m)).map(p => (
                <path key={p.m} d={p.d}
                  fill="#A020F0" fillOpacity="0.62"
                  stroke="#c060ff" strokeWidth="0.4" strokeOpacity="0.8"
                  filter="url(#ov-glow)"
                  style={{ mixBlendMode: 'screen' }}
                />
              ))}
            </svg>
          </div>
        ) : null}
      </div>

      {/* Zoom controls */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5">
        {[
          { icon: <ZoomIn size={14}/>, fn: () => setScale(s => Math.min(5, +(s + 0.4).toFixed(2))), t: 'Zoom In' },
          { icon: <ZoomOut size={14}/>, fn: () => setScale(s => Math.max(1, +(s - 0.4).toFixed(2))), t: 'Zoom Out' },
          { icon: <RotateCcw size={14}/>, fn: reset, t: 'Reset' },
        ].map((b, i) => (
          <button key={i} onClick={b.fn} title={b.t}
            className="p-2 rounded-xl bg-black/60 border border-purple-500/30 text-purple-300 hover:bg-purple-900/40 hover:border-purple-400/60 transition-all backdrop-blur-sm">
            {b.icon}
          </button>
        ))}
      </div>

      {/* HUD top-left */}
      <div className="pointer-events-none absolute top-3 left-3 z-20 flex items-center gap-2">
        <span className="text-[11px] font-mono text-purple-300/80 bg-black/50 px-2 py-0.5 rounded-md border border-purple-500/20 backdrop-blur-sm">
          {scale > 1 ? `${Math.round(scale * 100)}%` : '98%'}
        </span>
        <span className="text-[10px] font-mono text-purple-400/50 tracking-widest hidden sm:block">MUSCLE LIVE MAP</span>
      </div>

      {/* Bottom hint */}
      <div className="pointer-events-none absolute bottom-2 left-2 right-2 z-20">
        <div className="rounded-lg border border-purple-400/20 bg-black/65 px-3 py-1.5 text-[10px] text-purple-100/70 backdrop-blur-sm text-center">
          Visual mode: muscle activation map | drag to pan while zoomed
        </div>
      </div>

      {/* Corner brackets */}
      <svg className="pointer-events-none absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ opacity: 0.5 }}>
        <path d="M2 10 L2 2 L10 2" stroke="rgba(180,100,255,0.7)" strokeWidth="0.6" fill="none"/>
        <path d="M90 2 L98 2 L98 10" stroke="rgba(180,100,255,0.7)" strokeWidth="0.6" fill="none"/>
        <path d="M2 90 L2 98 L10 98" stroke="rgba(180,100,255,0.5)" strokeWidth="0.6" fill="none"/>
        <path d="M90 98 L98 98 L98 90" stroke="rgba(180,100,255,0.5)" strokeWidth="0.6" fill="none"/>
      </svg>
    </div>
  );
}
