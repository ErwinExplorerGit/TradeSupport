export function Logo() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 210 44"
      className="nav-logo"
      aria-label="TradeSupport – Powered by AI"
    >
      {/* Brand name */}
      <text
        x="0"
        y="28"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        fontWeight="700"
        fontSize="22"
        fill="#ffffff"
        letterSpacing="0.2"
      >
        TradeSupport
      </text>

      {/* Tagline */}
      <text
        x="2"
        y="42"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        fontWeight="500"
        fontSize="8.5"
        fill="#e07070"
        letterSpacing="2.8"
      >
        POWERED BY AI
      </text>
    </svg>
  );
}
