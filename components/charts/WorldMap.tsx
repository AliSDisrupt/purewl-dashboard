"use client";

interface WorldMapProps {
  data?: Array<{ country: string; users: number }>;
}

export function WorldMap({ data }: WorldMapProps) {
  // Simplified but more detailed world map paths
  return (
    <div className="relative w-full h-full">
      <svg
        viewBox="0 0 1000 500"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
        style={{ maxHeight: '120px' }}
      >
        <defs>
          <linearGradient id="oceanGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0.5" />
          </linearGradient>
        </defs>
        
        {/* Ocean background */}
        <rect width="1000" height="500" fill="url(#oceanGradient)" />
        
        {/* Continents with more detail */}
        <g fill="#334155" stroke="#64748B" strokeWidth="1" opacity="0.7">
          {/* North America */}
          <path d="M120,80 Q150,60 200,70 T300,85 L320,120 L310,160 L280,180 L240,190 L200,180 L160,160 L130,130 Z" />
          <path d="M280,180 L300,200 L320,240 L300,280 L260,290 L220,280 L200,250 L210,210 Z" />
          
          {/* South America */}
          <path d="M250,240 L280,250 L300,300 L290,360 L260,400 L230,410 L200,380 L190,340 L210,280 Z" />
          
          {/* Europe */}
          <path d="M450,60 L520,55 L550,80 L540,120 L500,140 L460,130 L440,100 Z" />
          <path d="M500,140 L530,150 L550,180 L520,200 L480,190 L460,170 Z" />
          
          {/* Africa */}
          <path d="M480,140 L550,130 L580,180 L570,240 L540,300 L500,340 L460,320 L440,280 L450,220 L460,180 Z" />
          
          {/* Asia */}
          <path d="M550,50 L700,40 L750,70 L740,120 L680,160 L620,150 L580,120 L560,80 Z" />
          <path d="M680,160 L750,170 L780,220 L760,280 L700,300 L640,280 L600,240 L610,200 Z" />
          <path d="M750,170 L820,180 L850,240 L830,300 L780,320 L730,300 L700,260 Z" />
          
          {/* Middle East */}
          <path d="M520,140 L580,130 L600,170 L580,200 L540,210 L510,190 Z" />
          
          {/* India */}
          <path d="M620,180 L680,170 L700,220 L680,260 L640,270 L610,240 Z" />
          
          {/* Southeast Asia */}
          <path d="M700,220 L780,210 L800,260 L780,300 L740,310 L710,280 Z" />
          
          {/* Australia */}
          <path d="M750,320 L830,310 L850,360 L820,400 L780,410 L750,380 Z" />
          
          {/* Japan */}
          <path d="M800,140 L820,130 L830,150 L820,170 L800,160 Z" />
          
          {/* British Isles */}
          <path d="M440,80 L460,75 L465,90 L455,100 L440,95 Z" />
          
          {/* Greenland */}
          <path d="M380,20 L450,15 L460,50 L440,80 L400,75 L380,50 Z" />
          
          {/* Madagascar */}
          <path d="M580,280 L600,270 L610,300 L600,330 L580,340 L570,310 Z" />
          
          {/* Indonesia */}
          <path d="M720,260 L750,250 L760,280 L750,310 L730,320 L720,290 Z" />
        </g>
        
        {/* Grid lines for globe effect */}
        <g stroke="#64748B" strokeWidth="0.5" opacity="0.2" fill="none">
          {/* Latitude lines */}
          <line x1="0" y1="125" x2="1000" y2="125" />
          <line x1="0" y1="250" x2="1000" y2="250" />
          <line x1="0" y1="375" x2="1000" y2="375" />
          {/* Longitude lines */}
          <line x1="250" y1="0" x2="250" y2="500" />
          <line x1="500" y1="0" x2="500" y2="500" />
          <line x1="750" y1="0" x2="750" y2="500" />
        </g>
        
        {/* Highlight points for major regions (can be enhanced with actual data) */}
        <g>
          {/* North America */}
          <circle cx="220" cy="140" r="4" fill="#0066FF" opacity="0.8" />
          {/* Europe */}
          <circle cx="500" cy="100" r="3" fill="#10B981" opacity="0.8" />
          {/* Asia */}
          <circle cx="700" cy="140" r="4" fill="#F59E0B" opacity="0.8" />
          {/* Africa */}
          <circle cx="520" cy="240" r="3" fill="#EF4444" opacity="0.8" />
          {/* South America */}
          <circle cx="250" cy="320" r="3" fill="#A855F7" opacity="0.8" />
        </g>
      </svg>
    </div>
  );
}
