import { motion } from "framer-motion";
import { CheckCircle, ClipboardList, User, Users, Mail, Award } from "lucide-react";
import { Link } from "react-router-dom";
import NavigationCard from "@/components/NavigationCard";
import backgroundImage from "@/assets/background.jpg";

const navigationItems = [
  { icon: CheckCircle, title: "Informovaný souhlas", to: "/informovany-souhlas" },
  { icon: ClipboardList, title: "Dotazník", to: "/dotaznik" },
  { icon: User, title: "O mně", to: "/kdo-jsem" },
  { icon: Users, title: "Proč koučink se mnou", to: "/proc-koucink" },
  { icon: Award, title: "Diplomy", to: "/diplomy" },
  { icon: Mail, title: "Kontakt", to: "/kontakt" },
];

const Index = () => {
  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat relative flex flex-col"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {/* Hero Section */}
      <div className="flex-1 flex flex-col justify-center px-6 md:px-12 lg:px-20 pt-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-semibold text-primary mb-4 leading-tight">
            Koučink je cesta
          </h1>
          <p className="text-lg md:text-xl text-foreground/80 mb-6">
            Objevujte nové cesty rozvoje a vedení.
          </p>
          <motion.div 
            className="w-16 h-0.5 bg-primary/40"
            initial={{ width: 0 }}
            animate={{ width: 64 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          />
        </motion.div>
      </div>

      {/* Navigation Cards */}
      <div className="px-6 md:px-12 lg:px-20 pb-12 md:pb-20">
        <div className="flex flex-wrap justify-center gap-4 md:gap-6">
          {navigationItems.map((item, index) => (
            <NavigationCard
              key={item.to}
              icon={item.icon}
              title={item.title}
              to={item.to}
              delay={0.2 + index * 0.1}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="px-6 py-4 text-center">
        <Link 
          to="/admin" 
          className="text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          Administrace
        </Link>
      </footer>
    </div>
  );
};

export default Index;
