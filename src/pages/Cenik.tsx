import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import backgroundImage from "@/assets/background.jpg";

const Cenik = () => {
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
            <h1 className="text-3xl md:text-4xl font-display font-semibold text-primary mb-8">
              Ceník
            </h1>
            
            <div className="space-y-6">
              <div className="bg-white/30 rounded-xl p-6">
                <h2 className="text-xl font-display font-semibold text-primary mb-2">
                  Individuální koučink
                </h2>
                <p className="text-foreground/80 mb-4">
                  60 minut intenzivní práce na vašem rozvoji.
                </p>
                <p className="text-2xl font-semibold text-primary">
                  1 500 Kč
                </p>
              </div>

              <div className="bg-white/30 rounded-xl p-6">
                <h2 className="text-xl font-display font-semibold text-primary mb-2">
                  Úvodní konzultace
                </h2>
                <p className="text-foreground/80 mb-4">
                  15 minut telefonického rozhovoru pro vzájemné seznámení.
                </p>
                <p className="text-2xl font-semibold text-accent">
                  Zdarma
                </p>
              </div>

              <div className="bg-white/30 rounded-xl p-6">
                <h2 className="text-xl font-display font-semibold text-primary mb-2">
                  Balíček 5 sezení
                </h2>
                <p className="text-foreground/80 mb-4">
                  Zvýhodněný balíček pro dlouhodobější spolupráci.
                </p>
                <p className="text-2xl font-semibold text-primary">
                  6 500 Kč
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  (úspora 1 000 Kč)
                </p>
              </div>
            </div>

            <div className="mt-8 p-6 bg-primary/10 rounded-xl">
              <p className="text-foreground/80 text-sm">
                Ceny jsou uvedeny včetně DPH. Platba je možná převodem na účet nebo v hotovosti.
                Pro více informací mě neváhejte kontaktovat.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Cenik;
