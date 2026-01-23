import { motion } from "framer-motion";
import { useMemo } from "react";

interface Leaf {
  id: number;
  x: number;
  delay: number;
  duration: number;
  size: number;
  rotation: number;
  swayAmount: number;
}

const FallingLeaves = () => {
  const leaves = useMemo<Leaf[]>(() => {
    return Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 10,
      duration: 12 + Math.random() * 8,
      size: 16 + Math.random() * 12,
      rotation: Math.random() * 360,
      swayAmount: 30 + Math.random() * 40,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
      {leaves.map((leaf) => (
        <motion.div
          key={leaf.id}
          className="absolute text-primary/40"
          style={{
            left: `${leaf.x}%`,
            top: -50,
            fontSize: leaf.size,
          }}
          initial={{ y: -50, rotate: leaf.rotation, opacity: 0 }}
          animate={{
            y: ["0vh", "110vh"],
            x: [0, leaf.swayAmount, -leaf.swayAmount / 2, leaf.swayAmount / 2, 0],
            rotate: [leaf.rotation, leaf.rotation + 180, leaf.rotation + 360],
            opacity: [0, 0.7, 0.7, 0.5, 0],
          }}
          transition={{
            duration: leaf.duration,
            delay: leaf.delay,
            repeat: Infinity,
            ease: "linear",
            times: [0, 0.1, 0.5, 0.9, 1],
          }}
        >
          🍂
        </motion.div>
      ))}
    </div>
  );
};

export default FallingLeaves;
