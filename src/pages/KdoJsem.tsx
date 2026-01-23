import PageLayout from "@/components/PageLayout";
import { motion } from "framer-motion";

const KdoJsem = () => {
  return (
    <PageLayout title="O mně">
      <div className="grid md:grid-cols-3 gap-8 items-start">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="md:col-span-1"
        >
          <div className="w-48 h-48 mx-auto md:mx-0 rounded-full bg-gradient-to-br from-soft-green to-primary/20 flex items-center justify-center">
            <span className="text-6xl">👤</span>
          </div>
        </motion.div>

        <div className="md:col-span-2 space-y-6 text-foreground/90">
          <p className="text-lg leading-relaxed">
            Jsem certifikovaný kouč s vášní pro osobní rozvoj a pomáhání lidem dosahovat jejich cílů. 
            Moje cesta ke koučinku začala, když jsem si uvědomil/a sílu správných otázek a aktivního naslouchání.
          </p>

          <div className="space-y-4">
            <h2 className="text-xl font-display font-semibold text-primary">Moje vzdělání a certifikace</h2>
            <ul className="list-disc list-inside space-y-2 text-foreground/80">
              <li>Certifikovaný kouč (ICF ACC)</li>
              <li>Absolvent kurzu systemického koučinku</li>
              <li>Průběžné vzdělávání v oblasti osobního rozvoje</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-display font-semibold text-primary">Moje hodnoty</h2>
            <div className="grid grid-cols-2 gap-4">
              {["Autenticita", "Empatie", "Růst", "Partnerství"].map((value) => (
                <div 
                  key={value}
                  className="bg-soft-green/50 rounded-lg p-4 text-center font-medium text-primary"
                >
                  {value}
                </div>
              ))}
            </div>
          </div>

          <p className="text-lg leading-relaxed">
            Věřím, že každý člověk má v sobě potenciál k růstu a změně. Mojí rolí jako kouče je 
            vytvořit bezpečný prostor, kde můžete objevit své silné stránky a najít cestu k vašim cílům.
          </p>
        </div>
      </div>
    </PageLayout>
  );
};

export default KdoJsem;
