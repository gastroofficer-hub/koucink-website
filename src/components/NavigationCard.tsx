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
        <div className="glass-card rounded-xl p-6 text-center cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl group min-w-[140px]">
          <Icon className="w-10 h-10 mx-auto mb-3 text-primary group-hover:text-accent transition-colors duration-300" strokeWidth={1.5} />
          <span className="text-sm font-medium text-foreground leading-tight block">{title}</span>
        </div>
      </Link>
    </motion.div>
  );
};

export default NavigationCard;
