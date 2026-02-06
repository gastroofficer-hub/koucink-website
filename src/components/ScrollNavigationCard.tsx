import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface ScrollNavigationCardProps {
  icon: LucideIcon;
  title: string;
  targetId: string;
  delay?: number;
}

const ScrollNavigationCard = ({ icon: Icon, title, targetId, delay = 0 }: ScrollNavigationCardProps) => {
  const handleClick = () => {
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <button onClick={handleClick} className="w-full">
        <div className="glass-card rounded-xl p-4 md:p-5 text-center cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl group w-[120px] h-[100px] md:w-[140px] md:h-[115px] flex flex-col items-center justify-center">
          <Icon className="w-8 h-8 md:w-9 md:h-9 mb-2 text-primary group-hover:text-accent transition-colors duration-300" strokeWidth={1.5} />
          <span className="text-xs md:text-sm font-medium text-foreground leading-tight block">{title}</span>
        </div>
      </button>
    </motion.div>
  );
};

export default ScrollNavigationCard;
