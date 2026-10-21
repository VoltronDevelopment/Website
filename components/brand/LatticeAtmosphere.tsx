export function LatticeAtmosphere() {
  return <div className="lattice-atmosphere" aria-hidden="true">
    <div className="atmosphere-motion">
      <span className="atmosphere-deep"/>
      <span className="atmosphere-wash"/>
      <span className="atmosphere-cyan"/>
      <svg className="atmosphere-lattice" viewBox="0 0 980 760">
        <g stroke="currentColor" strokeWidth="3.5" strokeLinejoin="round">
          <polygon className="atmosphere-top" points="80,210 250,120 420,210 250,300"/>
          <polygon className="atmosphere-side" points="80,210 250,300 250,520 80,430"/>
          <polygon className="atmosphere-front" points="420,210 250,300 250,520 420,430"/>
          <polygon className="atmosphere-top" points="300,150 470,60 640,150 470,240"/>
          <polygon className="atmosphere-side" points="300,150 470,240 470,460 300,370"/>
          <polygon className="atmosphere-front" points="640,150 470,240 470,460 640,370"/>
          <polygon className="atmosphere-top" points="520,250 690,160 860,250 690,340"/>
          <polygon className="atmosphere-side" points="520,250 690,340 690,560 520,470"/>
          <polygon className="atmosphere-front" points="860,250 690,340 690,560 860,470"/>
          <polygon className="atmosphere-top" points="180,390 350,300 520,390 350,480"/>
          <polygon className="atmosphere-side" points="180,390 350,480 350,700 180,610"/>
          <polygon className="atmosphere-front" points="520,390 350,480 350,700 520,610"/>
        </g>
      </svg>
      <span className="atmosphere-reflection"/>
    </div>
  </div>;
}
