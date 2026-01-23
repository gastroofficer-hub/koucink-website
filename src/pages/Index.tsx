import { motion } from "framer-motion";
import { CheckCircle, ClipboardList, Mail, Award } from "lucide-react";
import { Link } from "react-router-dom";
import NavigationCard from "@/components/NavigationCard";
import Footer from "@/components/Footer";
import backgroundImage from "@/assets/background.jpg";

const navigationItems = [
  { icon: CheckCircle, title: "Informační souhlas", to: "/informovany-souhlas" },
  { icon: ClipboardList, title: "Dotazník", to: "/dotaznik" },
  { icon: Award, title: "Diplomy", to: "/diplomy" },
  { icon: Mail, title: "Kontakt", to: "/kontakt" },
];

const Index = () => {
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

        {/* Navigation Cards */}
        <div className="px-6 md:px-12 lg:px-20 pb-12 md:pb-16">
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
      </div>

      {/* O mně Section - appears on scroll */}
      <div className="min-h-screen flex items-center px-6 md:px-12 lg:px-20 py-12 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto bg-white/70 backdrop-blur-md rounded-2xl p-8 md:p-12 shadow-lg w-full"
        >
          <h2 className="text-3xl font-display font-semibold text-primary mb-8 text-center">
            O mně
          </h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-display font-semibold text-primary mb-4">
                Kdo jsem?
              </h3>
              <div className="space-y-4 text-foreground/90 leading-relaxed">
                <p>
                  Jsem kouč, který pracuje s člověkem tak, aby v sobě objevil to, co je v něm skryté 
                  a dlouho nevyužité. Můj přístup stojí na lidskosti, autenticitě a schopnosti udržet 
                  klid i v náročných situacích. Více než dvacet let služby u Policie ČR a vedení týmu 
                  přes dvacet lidí mi dalo zkušenosti s tlakem, odpovědností a prostředím, které se 
                  neustále mění. Tyto zkušenosti dnes přenáším do své práce s lidmi – jednoduše, 
                  srozumitelně a tak, aby vše, co spolu objevíme, bylo použitelné v běžném životě.
                </p>
                <p>
                  Moje hodnoty jsou jasné: říkám věci tak, jak jsou, bez zbytečných frází; ke každému 
                  přistupuji jako k člověku se svým příběhem; a v situacích, které jsou vypjaté, jsem tím, 
                  kdo drží klid a nadhled. Posláním mé práce je pomoci lidem najít a využít jejich vlastní 
                  sílu a schopnosti – to, co v nich je, ale někdy zůstává ukryto pod stresem, povinnostmi 
                  nebo životní zátěží.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-display font-semibold text-primary mb-4">
                Proč se mnou?
              </h3>
              <div className="space-y-4 text-foreground/90 leading-relaxed">
                <p>
                  Vzděláním jsem Bc. v oboru bezpečnostně právních činností ve veřejné správě a Mgr. 
                  v sociálních studiích. Několik let se věnuji také podpoře kolegů v náročných životních 
                  i pracovních situacích. Můj koučovací styl je kombinací účinných nástrojů, zkušeností 
                  z praxe a citlivého přístupu k jedinečnosti každého člověka. Klienti ke mně přicházejí 
                  z různých prostředí – ať už řeší osobní téma, vztah, práci, stres nebo hledání směru. 
                  Vždy pracujeme tak, aby výsledek byl jasný, lidský a skutečný.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
