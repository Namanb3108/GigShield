import { useEffect } from "react";

const css = `
@property --angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}
@keyframes star-border-rotate {
  to { --angle: 360deg; }
}
.star-border-wrap {
  position: relative;
  padding: 1.5px;
  border-radius: 14px;
  background: conic-gradient(from var(--angle), transparent 75%, #F26522 85%, #ff9a6c 90%, #F26522 95%, transparent);
  animation: star-border-rotate 4s linear infinite;
  transition: box-shadow 0.3s;
}
.star-border-wrap:hover {
  box-shadow: 0 0 40px rgba(242,101,34,0.2);
}
.star-border-inner {
  background: #111;
  border-radius: 13px;
  width: 100%;
  height: 100%;
}
`;

let injected = false;

export default function StarBorder({ children, style = {}, className = "", speed = "4s" }) {
  useEffect(() => {
    if (!injected) {
      const el = document.createElement("style");
      el.textContent = css;
      document.head.appendChild(el);
      injected = true;
    }
  }, []);

  return (
    <div className={`star-border-wrap ${className}`} style={{ animationDuration: speed, ...style }}>
      <div className="star-border-inner">{children}</div>
    </div>
  );
}
