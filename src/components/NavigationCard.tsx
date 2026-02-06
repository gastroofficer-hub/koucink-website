import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface NavigationCardProps {
  icon: LucideIcon;
  title: string;
  to: string;
  delay?: number;
}

const NavigationCard = ({ icon: Icon, title, to, delay = 0 }: NavigationCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Link to={to}>
        <div className="glass-card rounded-xl p-4 md:p-5 text-center cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl group w-[110px] md:w-[130px]">
          <Icon className="w-8 h-8 md:w-9 md:h-9 mx-auto mb-2 text-primary group-hover:text-accent transition-colors duration-300" strokeWidth={1.5} />
          <span className="text-xs md:text-sm font-medium text-foreground leading-tight block">{title}</span>
        </div>
      </Link>
    </motion.div>
  );
};

export default NavigationCard;
