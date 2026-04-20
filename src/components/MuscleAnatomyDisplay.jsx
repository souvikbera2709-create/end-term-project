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

// Clean legs SVG — exactly 2 legs, proper anatomy
function LegsSVG({ activeMuscles = [] }) {
  const active = new Set(activeMuscles);
  const C = '#A020F0';
  const DIM = '#1e1830';
  const qc = active.has('Quadriceps') ? C : DIM;
  const hc = active.has('Hamstrings') ? C : DIM;
  const gc = active.has('Glutes') ? C : DIM;
  const cc = active.has('Calves') ? C : DIM;
  const glow = active.size > 0;

  return (
    <svg viewBox="0 0 220 380" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <radialGradient id="legsGradBg" cx="50%" cy="20%" r="80%">
          <stop offset="0%" stopColor="#12091e"/><stop offset="100%" stopColor="#04030a"/>
        </radialGradient>
        <filter id="legsGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="legsSoftGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      <rect width="220" height="380" fill="url(#legsGradBg)"/>
      {/* Subtle grid */}
      <g opacity="0.08" stroke="rgba(160,32,240,0.4)" strokeWidth="0.5">
        {[0,28,56,84,112,140,168,196,224].map(x=><line key={x} x1={x} y1="0" x2={x} y2="380"/>)}
        {[0,28,56,84,112,140,168,196,224,252,280,308,336,364].map(y=><line key={y} x1="0" y1={y} x2="220" y2={y}/>)}
      </g>

      {/* Hips / pelvis */}
      <ellipse cx="110" cy="46" rx="72" ry="30" fill="#1a1428" stroke="rgba(180,140,220,0.25)" strokeWidth="1"/>
      {/* Glutes highlight on pelvis back */}
      {(active.has('Glutes') || glow) && <ellipse cx="110" cy="52" rx="62" ry="22" fill={gc} opacity={active.has('Glutes')?0.55:0.05} filter="url(#legsSoftGlow)" style={{mixBlendMode:'screen'}}/>}

      {/* LEFT leg */}
      {/* Left quad body */}
      <path d="M68 62 Q50 72 44 150 Q46 172 60 178 Q76 182 86 164 Q92 140 90 90 Q84 68 68 62 Z" fill="#1a1428" stroke="rgba(160,130,210,0.3)" strokeWidth="1.2"/>
      {/* Left quad glow */}
      <path d="M68 62 Q50 72 44 150 Q46 172 60 178 Q76 182 86 164 Q92 140 90 90 Q84 68 68 62 Z" fill={qc} opacity={active.has('Quadriceps')?0.62:0.04} filter="url(#legsGlow)" style={{mixBlendMode:'screen'}}/>
      {/* Left hamstring (side stripe) */}
      <path d="M48 72 Q40 80 40 150 Q44 168 58 172" stroke={hc} strokeWidth="9" fill="none" strokeLinecap="round" opacity={active.has('Hamstrings')?0.55:0.04} filter="url(#legsSoftGlow)" style={{mixBlendMode:'screen'}}/>
      {/* Left knee */}
      <ellipse cx="66" cy="185" rx="22" ry="13" fill="#150e22" stroke="rgba(140,110,190,0.3)" strokeWidth="1"/>
      {/* Left calf */}
      <path d="M52 197 Q46 228 52 275 Q58 292 66 294 Q74 293 78 275 Q84 248 82 197 Z" fill="#150e22" stroke="rgba(120,90,170,0.2)" strokeWidth="1"/>
      <path d="M52 197 Q46 228 52 275 Q58 292 66 294 Q74 293 78 275 Q84 248 82 197 Z" fill={cc} opacity={active.has('Calves')?0.55:0.04} filter="url(#legsSoftGlow)" style={{mixBlendMode:'screen'}}/>
      {/* Left quad fiber lines */}
      {['M58 80 Q62 118 60 158','M70 70 Q72 112 70 155','M82 72 Q82 110 80 152'].map((d,i)=>(
        <path key={i} d={d} stroke="rgba(200,170,255,0.2)" strokeWidth="0.9" fill="none" strokeLinecap="round"/>
      ))}

      {/* RIGHT leg */}
      {/* Right quad body */}
      <path d="M152 62 Q170 72 176 150 Q174 172 160 178 Q144 182 134 164 Q128 140 130 90 Q136 68 152 62 Z" fill="#1a1428" stroke="rgba(160,130,210,0.3)" strokeWidth="1.2"/>
      {/* Right quad glow */}
      <path d="M152 62 Q170 72 176 150 Q174 172 160 178 Q144 182 134 164 Q128 140 130 90 Q136 68 152 62 Z" fill={qc} opacity={active.has('Quadriceps')?0.62:0.04} filter="url(#legsGlow)" style={{mixBlendMode:'screen'}}/>
      {/* Right hamstring (side stripe) */}
      <path d="M172 72 Q180 80 180 150 Q176 168 162 172" stroke={hc} strokeWidth="9" fill="none" strokeLinecap="round" opacity={active.has('Hamstrings')?0.55:0.04} filter="url(#legsSoftGlow)" style={{mixBlendMode:'screen'}}/>
      {/* Right knee */}
      <ellipse cx="154" cy="185" rx="22" ry="13" fill="#150e22" stroke="rgba(140,110,190,0.3)" strokeWidth="1"/>
      {/* Right calf */}
      <path d="M138 197 Q132 228 138 275 Q144 292 154 294 Q162 293 166 275 Q170 248 168 197 Z" fill="#150e22" stroke="rgba(120,90,170,0.2)" strokeWidth="1"/>
      <path d="M138 197 Q132 228 138 275 Q144 292 154 294 Q162 293 166 275 Q170 248 168 197 Z" fill={cc} opacity={active.has('Calves')?0.55:0.04} filter="url(#legsSoftGlow)" style={{mixBlendMode:'screen'}}/>
      {/* Right quad fiber lines */}
      {['M162 80 Q158 118 160 158','M150 70 Q148 112 150 155','M138 72 Q138 110 140 152'].map((d,i)=>(
        <path key={i} d={d} stroke="rgba(200,170,255,0.2)" strokeWidth="0.9" fill="none" strokeLinecap="round"/>
      ))}

      {/* Ankles */}
      <ellipse cx="66" cy="300" rx="14" ry="8" fill="#100a1a" stroke="rgba(120,90,160,0.2)" strokeWidth="1"/>
      <ellipse cx="154" cy="300" rx="14" ry="8" fill="#100a1a" stroke="rgba(120,90,160,0.2)" strokeWidth="1"/>

      {/* HUD */}
      <text x="14" y="24" fill="rgba(190,140,255,0.75)" fontSize="11" fontFamily="monospace">98%</text>
      <line x1="14" y1="28" x2="54" y2="28" stroke="rgba(160,80,255,0.4)" strokeWidth="1.2"/>
      <line x1="14" y1="32" x2="42" y2="32" stroke="rgba(160,80,255,0.25)" strokeWidth="1"/>
      <text x="134" y="24" fill="rgba(160,100,255,0.5)" fontSize="7.5" fontFamily="monospace" letterSpacing="1.2">MUSCLE LIVE MAP</text>
      <text x="110" y="368" textAnchor="middle" fill="rgba(140,110,190,0.4)" fontSize="9" fontFamily="monospace" letterSpacing="2">LEGS</text>
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

  const isLegs = group === 'Legs';
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
