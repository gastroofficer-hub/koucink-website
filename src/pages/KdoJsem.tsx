import PageLayout from "@/components/PageLayout";
import { motion } from "framer-motion";

const KdoJsem = () => {
  return (
    <PageLayout title="O mně">
      <div className="space-y-12">
        {/* Sekce Kdo jsem? */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-display font-semibold text-primary mb-6">
            Kdo jsem?
          </h2>
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
        </motion.section>

        {/* Sekce Proč se mnou? */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-2xl font-display font-semibold text-primary mb-6">
            Proč se mnou?
          </h2>
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
        </motion.section>
      </div>
    </PageLayout>
  );
};

export default KdoJsem;
