import React from 'react';

// Maps each muscle group to a relevant SVG 3D-style illustration with purple highlights
const muscleGroupSVGs = {
  Chest: (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <radialGradient id="chest-bg" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#2d1b4e" />
          <stop offset="100%" stopColor="#0f0a1a" />
        </radialGradient>
        <radialGradient id="chest-l" cx="35%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#c084fc" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#7c3aed" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#4c1d95" stopOpacity="0.3" />
        </radialGradient>
        <radialGradient id="chest-r" cx="65%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#c084fc" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#7c3aed" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#4c1d95" stopOpacity="0.3" />
        </radialGradient>
        <filter id="chest-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id="glow-sm">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      {/* Body torso base */}
      <ellipse cx="100" cy="130" rx="52" ry="65" fill="url(#chest-bg)" />
      {/* Neck */}
      <rect x="88" y="55" width="24" height="25" rx="8" fill="#1a1030" />
      {/* Head */}
      <ellipse cx="100" cy="45" rx="22" ry="25" fill="#1e1040" stroke="#3d1f6b" strokeWidth="1" />
      {/* Shoulders */}
      <ellipse cx="55" cy="100" rx="18" ry="28" fill="#1a1035" stroke="#5b21b6" strokeWidth="0.5" />
      <ellipse cx="145" cy="100" rx="18" ry="28" fill="#1a1035" stroke="#5b21b6" strokeWidth="0.5" />
      {/* Left pec - highlighted */}
      <path d="M62 85 Q75 78 100 80 Q100 115 62 120 Z" fill="url(#chest-l)" filter="url(#chest-glow)" />
      {/* Right pec - highlighted */}
      <path d="M138 85 Q125 78 100 80 Q100 115 138 120 Z" fill="url(#chest-r)" filter="url(#chest-glow)" />
      {/* Center sternum line */}
      <line x1="100" y1="80" x2="100" y2="125" stroke="#7c3aed" strokeWidth="1.5" strokeOpacity="0.6" />
      {/* Abs area */}
      <ellipse cx="100" cy="148" rx="35" ry="28" fill="#160e2a" stroke="#3d1f6b" strokeWidth="0.5" />
      {/* Abs divisions */}
      {[135, 148, 160].map((y, i) => (
        <line key={i} x1="72" y1={y} x2="128" y2={y} stroke="#3b1f6b" strokeWidth="1" strokeOpacity="0.5" />
      ))}
      <line x1="100" y1="130" x2="100" y2="175" stroke="#3b1f6b" strokeWidth="1" strokeOpacity="0.5" />
      {/* Glow accents on pecs */}
      <ellipse cx="78" cy="98" rx="12" ry="10" fill="#a855f7" fillOpacity="0.25" filter="url(#glow-sm)" />
      <ellipse cx="122" cy="98" rx="12" ry="10" fill="#a855f7" fillOpacity="0.25" filter="url(#glow-sm)" />
      {/* Highlight lines on pec surface */}
      <path d="M68 88 Q85 85 98 87" stroke="#e9d5ff" strokeWidth="1.2" strokeOpacity="0.4" fill="none" strokeLinecap="round" />
      <path d="M132 88 Q115 85 102 87" stroke="#e9d5ff" strokeWidth="1.2" strokeOpacity="0.4" fill="none" strokeLinecap="round" />
    </svg>
  ),

  Back: (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <radialGradient id="back-bg" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#1e1535" />
          <stop offset="100%" stopColor="#0a0812" />
        </radialGradient>
        <radialGradient id="lat-l" cx="30%" cy="55%" r="60%">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.85" />
          <stop offset="70%" stopColor="#6d28d9" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#3b0764" stopOpacity="0.1" />
        </radialGradient>
        <radialGradient id="lat-r" cx="70%" cy="55%" r="60%">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.85" />
          <stop offset="70%" stopColor="#6d28d9" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#3b0764" stopOpacity="0.1" />
        </radialGradient>
        <filter id="back-glow"><feGaussianBlur stdDeviation="3.5" result="b"/><feComposite in="SourceGraphic" in2="b" operator="over"/></filter>
      </defs>
      {/* Back torso */}
      <path d="M55 80 Q100 65 145 80 L150 170 Q100 185 50 170 Z" fill="url(#back-bg)" />
      {/* Head (back view) */}
      <ellipse cx="100" cy="45" rx="22" ry="24" fill="#16102a" stroke="#3d1f6b" strokeWidth="1" />
      {/* Neck */}
      <rect x="90" y="62" width="20" height="20" rx="6" fill="#1a1030" />
      {/* Trapezius - upper */}
      <path d="M78 68 Q100 60 122 68 Q115 85 100 88 Q85 85 78 68 Z" fill="#7c3aed" fillOpacity="0.6" filter="url(#back-glow)" />
      {/* Left lat */}
      <path d="M57 90 Q78 88 95 100 Q90 140 60 155 Q45 140 50 100 Z" fill="url(#lat-l)" filter="url(#back-glow)" />
      {/* Right lat */}
      <path d="M143 90 Q122 88 105 100 Q110 140 140 155 Q155 140 150 100 Z" fill="url(#lat-r)" filter="url(#back-glow)" />
      {/* Spine */}
      <line x1="100" y1="85" x2="100" y2="172" stroke="#7c3aed" strokeWidth="1.5" strokeOpacity="0.5" />
      {/* Spine vertebrae dots */}
      {[95, 110, 125, 140, 155, 165].map((y, i) => (
        <circle key={i} cx="100" cy={y} r="2.5" fill="#6d28d9" fillOpacity="0.7" />
      ))}
      {/* Lower back / erectors */}
      <path d="M85 145 Q100 140 115 145 Q115 168 100 172 Q85 168 85 145Z" fill="#a855f7" fillOpacity="0.3" />
      {/* Highlight on lats */}
      <path d="M62 98 Q72 93 88 100" stroke="#e9d5ff" strokeWidth="1.2" strokeOpacity="0.4" fill="none" strokeLinecap="round" />
      <path d="M138 98 Q128 93 112 100" stroke="#e9d5ff" strokeWidth="1.2" strokeOpacity="0.4" fill="none" strokeLinecap="round" />
    </svg>
  ),

  Shoulders: (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <radialGradient id="shld-bg" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#1e1535" />
          <stop offset="100%" stopColor="#0a0812" />
        </radialGradient>
        <radialGradient id="delt-l" cx="25%" cy="50%" r="70%">
          <stop offset="0%" stopColor="#c084fc" stopOpacity="0.95" />
          <stop offset="60%" stopColor="#7c3aed" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#4c1d95" stopOpacity="0.1" />
        </radialGradient>
        <radialGradient id="delt-r" cx="75%" cy="50%" r="70%">
          <stop offset="0%" stopColor="#c084fc" stopOpacity="0.95" />
          <stop offset="60%" stopColor="#7c3aed" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#4c1d95" stopOpacity="0.1" />
        </radialGradient>
        <filter id="delt-glow"><feGaussianBlur stdDeviation="4" result="b"/><feComposite in="SourceGraphic" in2="b" operator="over"/></filter>
      </defs>
      {/* Torso */}
      <rect x="72" y="95" width="56" height="85" rx="8" fill="url(#shld-bg)" />
      {/* Neck */}
      <rect x="89" y="62" width="22" height="35" rx="8" fill="#1a1030" />
      {/* Head */}
      <ellipse cx="100" cy="47" rx="22" ry="24" fill="#1a1030" stroke="#3d1f6b" strokeWidth="1" />
      {/* Left Deltoid - fully lit */}
      <ellipse cx="55" cy="108" rx="24" ry="22" fill="url(#delt-l)" filter="url(#delt-glow)" />
      {/* Right Deltoid - fully lit */}
      <ellipse cx="145" cy="108" rx="24" ry="22" fill="url(#delt-r)" filter="url(#delt-glow)" />
      {/* Left arm upper */}
      <rect x="34" y="120" width="18" height="55" rx="9" fill="#1a1030" stroke="#5b21b6" strokeWidth="0.5" />
      {/* Right arm upper */}
      <rect x="148" y="120" width="18" height="55" rx="9" fill="#1a1030" stroke="#5b21b6" strokeWidth="0.5" />
      {/* Clavicle lines */}
      <path d="M78 97 Q100 90 122 97" stroke="#a855f7" strokeWidth="1.5" fill="none" strokeOpacity="0.7" />
      {/* Highlight spots on deltoids */}
      <ellipse cx="50" cy="103" rx="9" ry="7" fill="#e9d5ff" fillOpacity="0.2" />
      <ellipse cx="150" cy="103" rx="9" ry="7" fill="#e9d5ff" fillOpacity="0.2" />
      {/* Segment lines on deltoids */}
      <path d="M40 108 Q55 100 70 108" stroke="#e9d5ff" strokeWidth="1" strokeOpacity="0.3" fill="none" />
      <path d="M130 108 Q145 100 160 108" stroke="#e9d5ff" strokeWidth="1" strokeOpacity="0.3" fill="none" />
    </svg>
  ),

  Legs: (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <radialGradient id="legs-bg" cx="50%" cy="30%" r="50%">
          <stop offset="0%" stopColor="#2d1b4e" />
          <stop offset="100%" stopColor="#0a0812" />
        </radialGradient>
        <radialGradient id="quad-l" cx="35%" cy="40%" r="62%">
          <stop offset="0%" stopColor="#c084fc" stopOpacity="0.95" />
          <stop offset="55%" stopColor="#7c3aed" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#4c1d95" stopOpacity="0.1" />
        </radialGradient>
        <radialGradient id="quad-r" cx="65%" cy="40%" r="62%">
          <stop offset="0%" stopColor="#c084fc" stopOpacity="0.95" />
          <stop offset="55%" stopColor="#7c3aed" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#4c1d95" stopOpacity="0.1" />
        </radialGradient>
        <radialGradient id="calf-grad-l" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.75" />
          <stop offset="65%" stopColor="#6d28d9" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#3b0764" stopOpacity="0.05" />
        </radialGradient>
        <radialGradient id="calf-grad-r" cx="65%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.75" />
          <stop offset="65%" stopColor="#6d28d9" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#3b0764" stopOpacity="0.05" />
        </radialGradient>
        <filter id="legs-glow">
          <feGaussianBlur stdDeviation="3.5" result="b"/>
          <feComposite in="SourceGraphic" in2="b" operator="over"/>
        </filter>
        <filter id="legs-glow-sm">
          <feGaussianBlur stdDeviation="2" result="b"/>
          <feComposite in="SourceGraphic" in2="b" operator="over"/>
        </filter>
      </defs>
      {/* Pelvis / hip base */}
      <ellipse cx="100" cy="55" rx="48" ry="26" fill="url(#legs-bg)" stroke="#3d1f6b" strokeWidth="0.6" />
      <path d="M62 55 Q100 47 138 55 Q134 68 100 70 Q66 68 62 55Z" fill="#1e1040" stroke="#5b21b6" strokeWidth="0.5" />
      {/* === LEFT LEG === */}
      {/* Outer quad sweep */}
      <path d="M58 58 Q44 66 42 92 Q44 116 57 130 Q66 122 68 106 Q70 84 65 64 Z"
            fill="url(#quad-l)" filter="url(#legs-glow)" />
      {/* Inner quad sweep (rectus femoris) */}
      <path d="M65 61 Q80 58 90 66 Q92 91 82 112 Q72 120 64 112 Q61 90 65 61 Z"
            fill="#7c3aed" fillOpacity="0.58" />
      {/* VMO teardrop */}
      <ellipse cx="68" cy="120" rx="8" ry="11" fill="#c084fc" fillOpacity="0.55"
               filter="url(#legs-glow-sm)" />
      {/* Kneecap */}
      <ellipse cx="68" cy="133" rx="14" ry="10" fill="#1e1535" stroke="#5b21b6" strokeWidth="1" />
      <ellipse cx="68" cy="131" rx="8" ry="6" fill="#2d1b4e" stroke="#7c3aed" strokeWidth="0.6" />
      {/* Calf bulk */}
      <path d="M55 141 Q68 136 81 141 Q83 163 76 173 Q68 179 61 173 Q54 163 55 141Z"
            fill="url(#calf-grad-l)" filter="url(#legs-glow-sm)" />
      {/* Calf medial head */}
      <path d="M68 141 Q79 138 81 141 Q81 159 76 169 Q71 161 68 141Z"
            fill="#7c3aed" fillOpacity="0.42" />
      {/* === RIGHT LEG === */}
      {/* Outer quad sweep */}
      <path d="M142 58 Q156 66 158 92 Q156 116 143 130 Q134 122 132 106 Q130 84 135 64 Z"
            fill="url(#quad-r)" filter="url(#legs-glow)" />
      {/* Inner quad sweep */}
      <path d="M135 61 Q120 58 110 66 Q108 91 118 112 Q128 120 136 112 Q139 90 135 61 Z"
            fill="#7c3aed" fillOpacity="0.58" />
      {/* VMO teardrop */}
      <ellipse cx="132" cy="120" rx="8" ry="11" fill="#c084fc" fillOpacity="0.55"
               filter="url(#legs-glow-sm)" />
      {/* Kneecap */}
      <ellipse cx="132" cy="133" rx="14" ry="10" fill="#1e1535" stroke="#5b21b6" strokeWidth="1" />
      <ellipse cx="132" cy="131" rx="8" ry="6" fill="#2d1b4e" stroke="#7c3aed" strokeWidth="0.6" />
      {/* Calf bulk */}
      <path d="M119 141 Q132 136 145 141 Q146 163 139 173 Q132 179 125 173 Q118 163 119 141Z"
            fill="url(#calf-grad-r)" filter="url(#legs-glow-sm)" />
      {/* Calf medial head */}
      <path d="M132 141 Q121 138 119 141 Q119 159 124 169 Q129 161 132 141Z"
            fill="#7c3aed" fillOpacity="0.42" />
      {/* Glow hotspots on quad peaks */}
      <ellipse cx="54" cy="81" rx="10" ry="15" fill="#a855f7" fillOpacity="0.30" />
      <ellipse cx="146" cy="81" rx="10" ry="15" fill="#a855f7" fillOpacity="0.30" />
      {/* Highlight sheen streaks */}
      <path d="M48 68 Q59 63 63 80" stroke="#e9d5ff" strokeWidth="1.3" strokeOpacity="0.45"
            fill="none" strokeLinecap="round" />
      <path d="M152 68 Q141 63 137 80" stroke="#e9d5ff" strokeWidth="1.3" strokeOpacity="0.45"
            fill="none" strokeLinecap="round" />
      {/* Inter-head separation lines */}
      <path d="M63 67 Q67 90 65 114" stroke="#e9d5ff" strokeWidth="0.9" strokeOpacity="0.28" fill="none" />
      <path d="M137 67 Q133 90 135 114" stroke="#e9d5ff" strokeWidth="0.9" strokeOpacity="0.28" fill="none" />
    </svg>
  ),

  Arms: (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <radialGradient id="arm-bg" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#1e1535" />
          <stop offset="100%" stopColor="#0a0812" />
        </radialGradient>
        <radialGradient id="bicep-l" cx="28%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#c084fc" stopOpacity="0.95" />
          <stop offset="65%" stopColor="#7c3aed" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#3b0764" stopOpacity="0.05" />
        </radialGradient>
        <radialGradient id="bicep-r" cx="72%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#c084fc" stopOpacity="0.95" />
          <stop offset="65%" stopColor="#7c3aed" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#3b0764" stopOpacity="0.05" />
        </radialGradient>
        <filter id="bicep-glow"><feGaussianBlur stdDeviation="3" result="b"/><feComposite in="SourceGraphic" in2="b" operator="over"/></filter>
      </defs>
      {/* Torso center */}
      <rect x="82" y="50" width="36" height="110" rx="10" fill="url(#arm-bg)" />
      {/* Left upper arm - bicep highlighted */}
      <ellipse cx="48" cy="100" rx="22" ry="52" fill="#150e28" stroke="#3d1f6b" strokeWidth="0.5" />
      <ellipse cx="45" cy="88" rx="15" ry="28" fill="url(#bicep-l)" filter="url(#bicep-glow)" />
      {/* Left forearm */}
      <ellipse cx="40" cy="150" rx="14" ry="32" fill="#1a1030" stroke="#3d1f6b" strokeWidth="0.5" />
      {/* Right upper arm - bicep highlighted */}
      <ellipse cx="152" cy="100" rx="22" ry="52" fill="#150e28" stroke="#3d1f6b" strokeWidth="0.5" />
      <ellipse cx="155" cy="88" rx="15" ry="28" fill="url(#bicep-r)" filter="url(#bicep-glow)" />
      {/* Right forearm */}
      <ellipse cx="160" cy="150" rx="14" ry="32" fill="#1a1030" stroke="#3d1f6b" strokeWidth="0.5" />
      {/* Bicep peak highlights */}
      <ellipse cx="43" cy="78" rx="7" ry="10" fill="#e9d5ff" fillOpacity="0.3" />
      <ellipse cx="157" cy="78" rx="7" ry="10" fill="#e9d5ff" fillOpacity="0.3" />
      {/* Bicep separation line */}
      <path d="M34 92 Q45 85 56 92" stroke="#e9d5ff" strokeWidth="1" strokeOpacity="0.35" fill="none" />
      <path d="M144 92 Q155 85 166 92" stroke="#e9d5ff" strokeWidth="1" strokeOpacity="0.35" fill="none" />
      {/* Tricep hint */}
      <path d="M28 105 Q42 115 56 105" stroke="#7c3aed" strokeWidth="1.5" fill="none" strokeOpacity="0.5" />
      <path d="M144 105 Q158 115 172 105" stroke="#7c3aed" strokeWidth="1.5" fill="none" strokeOpacity="0.5" />
    </svg>
  ),

  Core: (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <radialGradient id="core-bg" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#1e1535" />
          <stop offset="100%" stopColor="#0a0812" />
        </radialGradient>
        <radialGradient id="abs-grad" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#c084fc" stopOpacity="0.85" />
          <stop offset="60%" stopColor="#7c3aed" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#4c1d95" stopOpacity="0.05" />
        </radialGradient>
        <filter id="core-glow"><feGaussianBlur stdDeviation="3" result="b"/><feComposite in="SourceGraphic" in2="b" operator="over"/></filter>
      </defs>
      {/* Torso */}
      <path d="M60 60 Q100 50 140 60 L148 175 Q100 185 52 175 Z" fill="url(#core-bg)" />
      {/* Pec/chest base */}
      <path d="M62 60 Q100 52 138 60 Q130 85 100 88 Q70 85 62 60Z" fill="#160e2a" stroke="#3d1f6b" strokeWidth="0.5" />
      {/* Abs overlay - full highlight */}
      <path d="M75 90 Q100 85 125 90 L128 170 Q100 178 72 170 Z" fill="url(#abs-grad)" fillOpacity="0.7" filter="url(#core-glow)" />
      {/* Ab block grid */}
      {/* Vertical center line */}
      <line x1="100" y1="88" x2="100" y2="172" stroke="#e9d5ff" strokeWidth="1.2" strokeOpacity="0.3" />
      {/* Horizontal lines */}
      {[105, 122, 139, 156].map((y, i) => (
        <line key={i} x1="77" y1={y} x2="123" y2={y} stroke="#e9d5ff" strokeWidth="1" strokeOpacity="0.25" />
      ))}
      {/* Individual ab blocks highlight */}
      {[
        { x: 82, y: 96, w: 14, h: 13 }, { x: 104, y: 96, w: 14, h: 13 },
        { x: 81, y: 113, w: 15, h: 13 }, { x: 104, y: 113, w: 15, h: 13 },
        { x: 81, y: 130, w: 15, h: 12 }, { x: 104, y: 130, w: 15, h: 12 },
        { x: 83, y: 146, w: 13, h: 12 }, { x: 104, y: 146, w: 13, h: 12 },
      ].map((b, i) => (
        <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} rx="4" fill="#a855f7" fillOpacity="0.35" />
      ))}
      {/* Obliques */}
      <path d="M60 95 Q75 100 75 155 Q55 145 52 110 Z" fill="#7c3aed" fillOpacity="0.35" />
      <path d="M140 95 Q125 100 125 155 Q145 145 148 110 Z" fill="#7c3aed" fillOpacity="0.35" />
      {/* Highlight sheen on center */}
      <path d="M96 92 Q100 90 104 92 L104 130 Q100 132 96 130 Z" fill="#e9d5ff" fillOpacity="0.08" />
    </svg>
  ),
};

// Fallback generic muscle SVG
const DefaultMuscleSVG = ({ name }) => (
  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <defs>
      <radialGradient id="def-bg" cx="50%" cy="40%" r="65%">
        <stop offset="0%" stopColor="#2d1b4e" />
        <stop offset="100%" stopColor="#0a0812" />
      </radialGradient>
      <radialGradient id="def-highlight" cx="50%" cy="45%" r="55%">
        <stop offset="0%" stopColor="#c084fc" stopOpacity="0.8" />
        <stop offset="70%" stopColor="#7c3aed" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#4c1d95" stopOpacity="0" />
      </radialGradient>
      <filter id="def-glow"><feGaussianBlur stdDeviation="4" result="b"/><feComposite in="SourceGraphic" in2="b" operator="over"/></filter>
    </defs>
    <ellipse cx="100" cy="105" rx="60" ry="75" fill="url(#def-bg)" />
    <ellipse cx="100" cy="95" rx="42" ry="50" fill="url(#def-highlight)" filter="url(#def-glow)" />
    <ellipse cx="85" cy="80" rx="18" ry="22" fill="#e9d5ff" fillOpacity="0.15" />
    <text x="100" y="178" textAnchor="middle" fill="#a855f7" fontSize="11" fontWeight="600" fontFamily="system-ui">{name}</text>
  </svg>
);

export default function MuscleGroupCard3D({ muscleGroup, size = 'md' }) {
  const sizeMap = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    full: 'w-full h-full',
  };

  const SVGComponent = muscleGroupSVGs[muscleGroup];

  return (
    <div className={`${sizeMap[size]} relative flex items-center justify-center`}>
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-900/20 to-black/40 blur-sm" />
      <div className="relative w-full h-full drop-shadow-[0_0_12px_rgba(168,85,247,0.5)]">
        {SVGComponent || <DefaultMuscleSVG name={muscleGroup} />}
      </div>
    </div>
  );
}
