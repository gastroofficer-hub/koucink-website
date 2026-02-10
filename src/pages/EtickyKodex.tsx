import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import backgroundImage from "@/assets/background.jpg";

interface EtickyKodexSection {
  title: string;
  text?: string;
  items?: string[];
}

interface EtickyKodexContent {
  intro: string;
  sections: EtickyKodexSection[];
}

const defaultContent: EtickyKodexContent = {
  intro: "Jako kouč se řídím následujícími etickými principy, které zajišťují kvalitu a bezpečnost koučovacího procesu.",
  sections: [
    {
      title: "Důvěrnost",
      text: "Veškeré informace sdílené během koučování jsou přísně důvěrné. Bez výslovného souhlasu klienta nesdílím žádné osobní informace třetím stranám."
    },
    {
      title: "Respekt a integrita",
      text: "Přistupuji ke každému klientovi s respektem a uznávám jeho jedinečnost. Jednám čestně a transparentně ve všech aspektech koučovacího vztahu."
    },
    {
      title: "Profesionalita",
      text: "Neustále se vzdělávám a rozvíjím své koučovací dovednosti. Pracuji pouze v oblastech, kde mám odpovídající kompetence."
    },
    {
      title: "Hranice a odpovědnost",
      text: "Jasně vymezuji hranice koučovacího vztahu. Koučink není terapie ani poradenství – v případě potřeby doporučím vhodného odborníka."
    }
  ]
};

const EtickyKodex = () => {
  const [content, setContent] = useState<EtickyKodexContent>(defaultContent);

  useEffect(() => {
    const fetchContent = async () => {
      const { data } = await supabase
        .from("site_content")
        .select("content")
        .eq("key", "eticky_kodex")
        .maybeSingle();

      if (data?.content) {
        const loadedContent = data.content as unknown as EtickyKodexContent;
        if (loadedContent.sections && loadedContent.sections.length > 0) {
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
      <SEOHead title="Etický kodex" description="Etické principy koučovací praxe Ondřeje Zemana. Důvěrnost, respekt a profesionalita." path="/eticky-kodex" />
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
            <h1 className="text-3xl md:text-4xl font-display font-semibold text-primary mb-6">
              Etický kodex
            </h1>
            
            {content.intro && (
              <p className="text-foreground/80 mb-8 leading-relaxed">
                {content.intro}
              </p>
            )}
            
            <div className="space-y-6">
              {content.sections.map((section, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-card/30 rounded-xl p-6"
                >
                  <h2 className="text-xl font-display font-semibold text-primary mb-3">
                    {section.title}
                  </h2>
                  {section.text && (
                    <p className="text-foreground/80 leading-relaxed">
                      {section.text}
                    </p>
                  )}
                  {section.items && section.items.length > 0 && (
                    <ul className="mt-3 space-y-2">
                      {section.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-foreground/80">
                          <span className="text-primary mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default EtickyKodex;
