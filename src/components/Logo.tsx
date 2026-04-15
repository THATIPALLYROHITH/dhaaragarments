const Logo = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-300 hover:scale-110"
        >
          {/* D */}
          <path
            d="M8 8 V32 H16 Q24 32 24 20 Q24 8 16 8 Z"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinecap="square"
          />
          {/* & */}
          <text
            x="26"
            y="26"
            fontSize="14"
            fontWeight="300"
            fill="currentColor"
            fontFamily="Inter, sans-serif"
          >
            &
          </text>
          {/* H */}
          <path
            d="M32 8 V32 M32 20 H38 M38 8 V32"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="square"
          />
        </svg>
      </div>
      <div className="flex flex-col leading-none">
        <span className="text-xl font-bold tracking-tighter">DHAARA</span>
        <span className="text-xs tracking-widest text-muted-foreground">GARMENTS</span>
      </div>
    </div>
  );
};

export default Logo;
