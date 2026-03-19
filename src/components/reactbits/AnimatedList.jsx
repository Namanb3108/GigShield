import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AnimatedList({ items = [], renderItem, delay = 1200, className = "" }) {
  const [displayed, setDisplayed] = useState([]);
  const indexRef = useRef(0);

  useEffect(() => {
    if (items.length === 0) return;
    setDisplayed([items[0]]);
    indexRef.current = 1;

    const interval = setInterval(() => {
      if (indexRef.current >= items.length) {
        clearInterval(interval);
        return;
      }
      setDisplayed((prev) => [items[indexRef.current], ...prev]);
      indexRef.current += 1;
    }, delay);

    return () => clearInterval(interval);
  }, [items, delay]);

  return (
    <div className={className} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <AnimatePresence>
        {displayed.map((item, i) => (
          <motion.div
            key={item.id || i}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            {renderItem(item)}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
