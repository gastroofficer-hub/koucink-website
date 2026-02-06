import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { ReactNode } from "react";
import backgroundImage from "@/assets/background.jpg";

interface PageLayoutProps {
  title: string;
  children: ReactNode;
  headerRight?: ReactNode;
}

const PageLayout = ({ title, children, headerRight }: PageLayoutProps) => {
  return (
    <div 
      className="page-bg"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="min-h-screen bg-background/70 backdrop-blur-sm">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-primary hover:text-accent transition-colors mb-8 group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Zpět na úvod</span>
            </Link>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="glass-card rounded-2xl p-8 md:p-12"
          >
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl md:text-4xl font-display font-semibold text-primary">
                {title}
              </h1>
              {headerRight && (
                <div className="hidden lg:block">
                  {headerRight}
                </div>
              )}
            </div>
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PageLayout;
