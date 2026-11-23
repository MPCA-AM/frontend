export default function MadagascarMap() {
  const aeroports = [
    { cx: 160, cy: 110, label: 'TNR' },
    { cx: 210, cy: 160, label: 'TMM' },
    { cx: 130, cy: 200, label: 'MOQ' },
    { cx: 190, cy: 240, label: 'FTU' },
    { cx: 155, cy: 310, label: 'TLE' },
  ];

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg
        viewBox="0 0 320 450"
        className="w-full max-w-xs md:max-w-sm opacity-90"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Lignes de grille */}
        {Array.from({ length: 8 }).map((_, i) => (
          <line
            key={`h${i}`}
            x1="10"
            y1={i * 55 + 10}
            x2="310"
            y2={i * 55 + 10}
            stroke="#2a3f6e"
            strokeWidth="0.5"
          />
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <line
            key={`v${i}`}
            x1={i * 60 + 10}
            y1="10"
            x2={i * 60 + 10}
            y2="440"
            stroke="#2a3f6e"
            strokeWidth="0.5"
          />
        ))}

        {/* Silhouette de Madagascar */}
        <path
          d="M180,30 L200,50 L215,80 L220,120 L230,160 L235,200 L225,240 L215,280 L200,320 L185,360 L170,400 L155,420 L140,400 L130,360 L125,320 L120,280 L115,240 L118,200 L122,160 L128,120 L135,80 L148,50 Z"
          fill="#1e3060"
          stroke="#059669"
          strokeWidth="2"
          opacity="0.85"
        />

        {/* Lignes régionales */}
        <line x1="130" y1="160" x2="225" y2="165" stroke="#2a4a8a" strokeWidth="1" strokeDasharray="4,3" />
        <line x1="125" y1="240" x2="228" y2="245" stroke="#2a4a8a" strokeWidth="1" strokeDasharray="4,3" />
        <line x1="122" y1="320" x2="210" y2="322" stroke="#2a4a8a" strokeWidth="1" strokeDasharray="4,3" />

        {/* Points des aéronefs / aérodromes */}
        {aeroports.map((ac) => (
          <g key={ac.label} transform={`translate(${ac.cx}, ${ac.cy})`}>
            <circle r="10" fill="#059669" opacity="0.2" className="animate-ping" />
            <circle r="6" fill="#059669" opacity="0.9" />
            <text
              x="10"
              y="4"
              fill="#ffffff"
              fontSize="9"
              fontFamily="monospace"
              fontWeight="bold"
            >
              {ac.label}
            </text>
            <path
              d="M-3,0 L3,0 M0,-3 L0,3 M-2,-1 L2,-1"
              stroke="white"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </g>
        ))}

        {/* Point Antananarivo */}
        <g transform="translate(160, 110)">
          <circle r="5" fill="#ffffff" opacity="0.9" />
          <text x="8" y="4" fill="#ffffff" fontSize="8" fontWeight="bold">
            Antananarivo ✦
          </text>
        </g>
      </svg>

      {/* Légende en bas à gauche */}
      <div className="absolute bottom-4 left-4 bg-[#0d1b3e]/80 border border-[#2a3f6e] rounded-lg p-3 text-xs text-white space-y-1 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#059669] inline-block" /> Aérodromes actifs
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-white inline-block" /> Capitale
        </div>
      </div>
    </div>
  );
}
