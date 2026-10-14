import React from "react";
import lexflowLogo from "../assets/lexflow-logo.png";

export default function Logo({ compact = false, size = "md", className = "" }) {
  const sizeClass = `logo-size-${size}`;

  return (
    <div className={`brand-logo ${compact ? "brand-logo-compact" : ""} ${sizeClass} ${className}`.trim()}>
      <img
        src={lexflowLogo}
        alt="LexFlow"
        className="brand-mark object-contain"
      />
    </div>
  );
}
