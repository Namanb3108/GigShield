import { useRef, useEffect, useState } from "react";
import { motion, useInView, useAnimation } from "framer-motion";

export default function BlurText({
  text = "",
  delay = 200,
  className = "",
  animateBy = "words",
  direction = "top",
  onAnimationComplete,
  variant,
}) {
  const elements = animateBy === "words" ? text.split(" ") : text.split("");
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  const defaultVariants = {
    hidden: {
      filter: "blur(10px)",
      opacity: 0,
      y: direction === "top" ? -20 : direction === "bottom" ? 20 : 0,
      x: direction === "left" ? -20 : direction === "right" ? 20 : 0,
    },
    visible: { filter: "blur(0px)", opacity: 1, y: 0, x: 0 },
  };

  const usedVariant = variant || defaultVariants;

  return (
    <p ref={ref} className={className} style={{ display: "flex", flexWrap: "wrap", gap: animateBy === "words" ? "0.3em" : "0" }}>
      {elements.map((el, i) => (
        <motion.span
          key={i}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={usedVariant}
          transition={{
            delay: i * (delay / 1000),
            duration: 0.6,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          onAnimationComplete={i === elements.length - 1 ? onAnimationComplete : undefined}
          style={{ display: "inline-block" }}
        >
          {el}{animateBy === "words" ? "" : ""}
        </motion.span>
      ))}
    </p>
  );
}
