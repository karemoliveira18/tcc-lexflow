import React from "react";

export default function Logo({ compact = false, size = "md", className = "" }) {
  const sizeClass = `logo-size-${size}`;

  return (
    <div className={`brand-logo ${compact ? "brand-logo-compact" : ""} ${sizeClass} ${className}`.trim()}>
      <svg className="brand-mark" viewBox="0 0 96 96" role="img" aria-label="Símbolo LexFlow">
        <path className="mark-shield" d="M48 10 75 20v24c0 18-10.5 31-27 41C31.5 75 21 62 21 44V20L48 10Z" />
        <path className="mark-shield-inner" d="M48 17 68 24v19c0 14-7.5 24.5-20 32-12.5-7.5-20-18-20-32V24l20-7Z" />
        <path className="mark-line" d="M17 29h62M48 20v49M34 27l-8 17M62 27l8 17" />
        <path className="mark-pan" d="M19 44h14M63 44h14M24 44c0 6 3 9 8 9s8-3 8-9M56 44c0 6 3 9 8 9s8-3 8-9" />
        <path className="mark-base" d="M35 69h26M29 76h38" />
        <text className="mark-letter" x="48" y="60" textAnchor="middle">L</text>
      </svg>
      {!compact && <span className="brand-wordmark">LexFlow</span>}
    </div>
  );
}
