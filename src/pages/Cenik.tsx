import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import backgroundImage from "@/assets/background.jpg";

interface CenikItem {
  title: string;
  description: string;
  price: string;
  note?: string;
  isFree?: boolean;
}

interface CenikContent {
  items: CenikItem[];
  footer: string;
}

const defaultContent: CenikContent = {
  items: [
    {
      title: "Individuální koučink",
      description: "60 minut intenzivní práce na vašem rozvoji.",
      price: "1 500 Kč"
    },
    {
      title: "Úvodní konzultace",
      description: "15 minut telefonického rozhovoru pro vzájemné seznámení.",
      price: "Zdarma",
      isFree: true
    },
    {
      title: "Balíček 5 sezení",
      description: "Zvýhodněný balíček pro dlouhodobější spolupráci.",
      price: "6 500 Kč",
      note: "(úspora 1 000 Kč)"
    }
  ],
  footer: "Ceny jsou uvedeny včetně DPH. Platba je možná převodem na účet nebo v hotovosti. Pro více informací mě neváhejte kontaktovat."
};

const Cenik = () => {
  const [content, setContent] = useState<CenikContent>(defaultContent);

  useEffect(() => {
    const fetchContent = async () => {
      const { data } = await supabase
        .from("site_content")
        .select("content")
        .eq("key", "cenik")
        .maybeSingle();

      if (data?.content) {
        const loadedContent = data.content as unknown as CenikContent;
        if (loadedContent.items && loadedContent.items.length > 0) {
          setContent(loadedContent);
        }
      }
    };
    fetchContent();
  }, []);

  return (
    <div 
      className="page-bg"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="min-h-screen bg-background/70 backdrop-blur-sm pt-16">
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
              {content.items.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-card/30 rounded-xl p-6"
                >
                  <h2 className="text-xl font-display font-semibold text-primary mb-2">
                    {item.title}
                  </h2>
                  <p className="text-foreground/80 mb-4">
                    {item.description}
                  </p>
                  <p className={`text-2xl font-semibold ${item.isFree ? 'text-accent' : 'text-primary'}`}>
                    {item.price}
                  </p>
                  {item.note && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.note}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>

            {content.footer && (
              <div className="mt-8 p-6 bg-primary/10 rounded-xl">
                <p className="text-foreground/80 text-sm">
                  {content.footer}
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Cenik;
