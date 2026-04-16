import { useRef } from "react";
import { motion, useInView } from "framer-motion";

export default function SplitText({ text = "", className = "", delay = 0.03, duration = 0.5, ease = "easeOut", stagger = true }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const chars = text.split("");

  return (
    <span ref={ref} className={className} aria-label={text} style={{ display: "inline-flex", flexWrap: "wrap" }}>
      {chars.map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 30, rotateX: -90 }}
          animate={inView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
          transition={{
            delay: stagger ? i * delay : delay,
            duration,
            ease,
          }}
          style={{ display: "inline-block", whiteSpace: char === " " ? "pre" : "normal" }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </span>
  );
}
