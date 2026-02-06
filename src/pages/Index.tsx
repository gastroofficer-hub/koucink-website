import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle, CalendarCheck, Mail, Award, ChevronDown, User, Heart, ListOrdered, BookOpen, Coins, Scale } from "lucide-react";
import { Link } from "react-router-dom";
import NavigationCard from "@/components/NavigationCard";
import ScrollNavigationCard from "@/components/ScrollNavigationCard";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import backgroundImage from "@/assets/background.jpg";

interface CoachingStep {
  title: string;
  text: string;
  tags?: string[];
}

interface OMneContent {
  kdoJsem: string;
  procSeMnou: string;
}

interface JakProbihaContent {
  steps: CoachingStep[];
}

const scrollNavigationItems = [
  { icon: User, title: "Kdo jsem?", targetId: "kdo-jsem" },
  { icon: Heart, title: "Proč se mnou?", targetId: "proc-se-mnou" },
  { icon: ListOrdered, title: "Jak probíhá koučink?", targetId: "jak-probiha" },
];

const navigationItems = [
  { icon: Scale, title: "Etický kodex", to: "/eticky-kodex" },
  { icon: Award, title: "Diplomy", to: "/diplomy" },
  { icon: Mail, title: "Kontakt", to: "/kontakt" },
  { icon: BookOpen, title: "Blog", to: "/blog" },
  { icon: CalendarCheck, title: "Rezervace", to: "/dotaznik" },
  { icon: Coins, title: "Ceník", to: "/cenik" },
  { icon: CheckCircle, title: "Informovaný souhlas", to: "/informovany-souhlas" },
];

const defaultOMne: OMneContent = {
  kdoJsem: `Jsem kouč, který pracuje s člověkem tak, aby v sobě objevil to, co je v něm skryté a dlouho nevyužité. Můj přístup stojí na lidskosti, autenticitě a schopnosti udržet klid i v náročných situacích. Více než dvacet let služby u Policie ČR a vedení týmu přes dvacet lidí mi dalo zkušenosti s tlakem, odpovědností a prostředím, které se neustále mění. Tyto zkušenosti dnes přenáším do své práce s lidmi – jednoduše, srozumitelně a tak, aby vše, co spolu objevíme, bylo použitelné v běžném životě.

Moje hodnoty jsou jasné: říkám věci tak, jak jsou, bez zbytečných frází; ke každému přistupuji jako k člověku se svým příběhem; a v situacích, které jsou vypjaté, jsem tím, kdo drží klid a nadhled. Posláním mé práce je pomoci lidem najít a využít jejich vlastní sílu a schopnosti – to, co v nich je, ale někdy zůstává ukryto pod stresem, povinnostmi nebo životní zátěží.`,
  procSeMnou: `Vzděláním jsem Bc. v oboru bezpečnostně právních činností ve veřejné správě a Mgr. v sociálních studiích. Několik let se věnuji také podpoře kolegů v náročných životních i pracovních situacích. Můj koučovací styl je kombinací účinných nástrojů, zkušeností z praxe a citlivého přístupu k jedinečnosti každého člověka. Klienti ke mně přicházejí z různých prostředí – ať už řeší osobní téma, vztah, práci, stres nebo hledání směru. Vždy pracujeme tak, aby výsledek byl jasný, lidský a skutečný.`
};

const defaultJakProbiha: JakProbihaContent = {
  steps: [
    {
      title: "Kontakt & objednávka",
      text: "Napiš mi email nebo vyplň formulář na webu. Popiš, s čím potřebuješ pomoct (stres, kariéra, vztahy...). Zaručeně odpovídám do 24 hodin s návrhem volných termínů."
    },
    {
      title: "Předchozí volný rozhovor",
      text: "15 minutová zdarma telefonická volba. Zjistíme, jestli si sedíme, probereme tvé cíle a domluvíme první sezení."
    },
    {
      title: "Sjednání termínu & platba",
      text: "Vybereme si první sezení (online/osobně). Pošlu ti fakturu a informovaný souhlas k podpisu. Zaplatíš zálohu a podepíšeš."
    },
    {
      title: "Příprava na sezení",
      text: "Pošlu ti krátký přehled: co očekávat, jak se připravit (co si přinést, na co se zamyslet). Dostaneš i link na Zoom (online) nebo adresu (osobní schůzka)."
    },
    {
      title: "První sezení",
      text: "60 minut intenzivní práce. Zaměříme se na tvůj hlavní cíl, najdeme první akční kroky. Po sezení dostaneš shrnutí + \"domácí úkol\".",
      tags: ["Online: Zoom, Skype", "Osobně: Lanškroun", "Délka: 60 minut", "Frekvence: 1–2× měsíčně"]
    }
  ]
};

const Index = () => {
  const [oMne, setOMne] = useState<OMneContent>(defaultOMne);
  const [jakProbiha, setJakProbiha] = useState<JakProbihaContent>(defaultJakProbiha);

  useEffect(() => {
    const fetchContent = async () => {
      const { data } = await supabase
        .from("site_content")
        .select("key, content")
        .in("key", ["o_mne", "jak_probiha"]);

      if (data) {
        data.forEach((item) => {
          if (item.key === "o_mne") {
            const content = item.content as unknown as OMneContent;
            if (content.kdoJsem || content.procSeMnou) {
              setOMne(content);
            }
          } else if (item.key === "jak_probiha") {
            const content = item.content as unknown as JakProbihaContent;
            if (content.steps && content.steps.length > 0) {
              setJakProbiha(content);
            }
          }
        });
      }
    };
    fetchContent();
  }, []);

  return (
    <div 
      className="bg-cover bg-center bg-no-repeat bg-fixed relative"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      
      {/* First Screen - Hero + Navigation */}
      <div className="min-h-screen flex flex-col">
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

        {/* O mně Scroll Navigation Cards - first row */}
        <div className="px-4 md:px-8 lg:px-12 pb-6 md:pb-10">
          <div className="flex justify-center gap-3 md:gap-4">
            {scrollNavigationItems.map((item, index) => (
              <ScrollNavigationCard
                key={item.targetId}
                icon={item.icon}
                title={item.title}
                targetId={item.targetId}
                delay={0.2 + index * 0.05}
              />
            ))}
          </div>
        </div>

        {/* Navigation Cards - second row */}
        <div className="px-4 md:px-8 lg:px-12 pb-10 md:pb-14 overflow-x-auto">
          <div className="flex justify-center gap-3 md:gap-4 min-w-max mx-auto">
            {navigationItems.map((item, index) => (
              <NavigationCard
                key={item.to}
                icon={item.icon}
                title={item.title}
                to={item.to}
                delay={0.4 + index * 0.05}
              />
            ))}
          </div>
        </div>

        {/* Animated Scroll Down Arrow */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="flex flex-col items-center cursor-pointer"
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <ChevronDown className="w-8 h-8 text-primary/70" />
            </motion.div>
          </motion.div>
        </div>
      </div>


      {/* O mně Section - appears on scroll */}
      <div className="min-h-screen flex items-center px-6 md:px-12 lg:px-20 py-12 md:py-20">
        <div className="max-w-4xl mx-auto w-full space-y-8">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-display font-semibold text-primary text-center"
          >
            O mně
          </motion.h2>
          
          {/* Kdo jsem */}
          <motion.div
            id="kdo-jsem"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="bg-white/70 backdrop-blur-md rounded-2xl p-8 md:p-12 shadow-lg scroll-mt-8"
          >
            <h3 className="text-xl font-display font-semibold text-primary mb-4">
              Kdo jsem?
            </h3>
            <div className="space-y-4 text-foreground/90 leading-relaxed">
              {oMne.kdoJsem.split('\n\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </motion.div>

          {/* Proč se mnou */}
          <motion.div
            id="proc-se-mnou"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="bg-white/70 backdrop-blur-md rounded-2xl p-8 md:p-12 shadow-lg scroll-mt-8"
          >
            <h3 className="text-xl font-display font-semibold text-primary mb-4">
              Proč se mnou?
            </h3>
            <div className="space-y-4 text-foreground/90 leading-relaxed">
              {oMne.procSeMnou.split('\n\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </motion.div>

          {/* Jak probíhá koučink */}
          <motion.div
            id="jak-probiha"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="bg-white/70 backdrop-blur-md rounded-2xl p-8 md:p-12 shadow-lg scroll-mt-8"
          >
            <h3 className="text-xl font-display font-semibold text-primary mb-4">
              Jak probíhá koučink?
            </h3>
            <div className="space-y-6 text-foreground/90 leading-relaxed">
              {jakProbiha.steps.map((step, index) => (
                <motion.div
                  key={index}
                  className="flex gap-4"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <motion.div 
                    className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
                  >
                    {index + 1}
                  </motion.div>
                  <div>
                    <h4 className="font-semibold text-primary mb-1">{step.title}</h4>
                    <p>{step.text}</p>
                    {step.tags && (
                      <div className="mt-3 flex flex-wrap gap-3 text-sm">
                        {step.tags.map((tag) => (
                          <span key={tag} className="px-3 py-1 bg-primary/10 rounded-full">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
