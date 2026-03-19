import { useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";

export default function CountUp({ from = 0, to, duration = 2, separator = "", suffix = "", prefix = "", decimals = 0, className = "" }) {
  const [count, setCount] = useState(from);
  const { ref, inView } = useInView({ triggerOnce: true });
  const started = useRef(false);

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;
    const startTime = performance.now();
    const range = to - from;

    const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

    const tick = (now) => {
      const elapsed = (now - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const val = from + range * easeOutQuart(progress);
      setCount(val);
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [inView, from, to, duration]);

  const format = (n) => {
    const fixed = n.toFixed(decimals);
    if (separator) {
      const [int, dec] = fixed.split(".");
      const formatted = int.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
      return dec ? `${formatted}.${dec}` : formatted;
    }
    return fixed;
  };

  return (
    <span ref={ref} className={className}>
      {prefix}{format(count)}{suffix}
    </span>
  );
}
