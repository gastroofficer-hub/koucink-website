import PageLayout from "@/components/PageLayout";
import { motion } from "framer-motion";
import { Target, Heart, Lightbulb, Shield } from "lucide-react";

const benefits = [
  {
    icon: Target,
    title: "Individuální přístup",
    description: "Každé sezení je přizpůsobeno vašim jedinečným potřebám a cílům.",
  },
  {
    icon: Heart,
    title: "Bezpečné prostředí",
    description: "Vytvářím prostor důvěry, kde se můžete otevřít bez obav.",
  },
  {
    icon: Lightbulb,
    title: "Nové perspektivy",
    description: "Pomohu vám nahlédnout na situace z jiných úhlů a najít nová řešení.",
  },
  {
    icon: Shield,
    title: "Etický přístup",
    description: "Pracuji v souladu s etickým kodexem ICF a respektuji vaše hranice.",
  },
];

const ProcKoucink = () => {
  return (
    <PageLayout title="Proč koučink se mnou">
      <div className="space-y-10">
        <p className="text-lg text-foreground/90 leading-relaxed">
          Koučink je mocný nástroj pro osobní a profesní rozvoj. Zde jsou důvody, 
          proč by spolupráce se mnou mohla být přínosná právě pro vás.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white/50 rounded-xl p-6 border border-primary/10"
            >
              <benefit.icon className="w-10 h-10 text-accent mb-4" strokeWidth={1.5} />
              <h3 className="text-lg font-display font-semibold text-primary mb-2">
                {benefit.title}
              </h3>
              <p className="text-foreground/80">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="bg-soft-green/30 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-display font-semibold text-primary mb-4">
            Jak probíhá koučovací sezení?
          </h2>
          <div className="grid md:grid-cols-3 gap-6 mt-6">
            <div className="space-y-2">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto font-display text-xl">
                1
              </div>
              <h4 className="font-medium text-primary">Úvodní rozhovor</h4>
              <p className="text-sm text-foreground/70">Seznámení a definování vašich cílů</p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto font-display text-xl">
                2
              </div>
              <h4 className="font-medium text-primary">Pravidelná sezení</h4>
              <p className="text-sm text-foreground/70">Práce na vašich tématech a pokroku</p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto font-display text-xl">
                3
              </div>
              <h4 className="font-medium text-primary">Reflexe a závěr</h4>
              <p className="text-sm text-foreground/70">Zhodnocení dosažených výsledků</p>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default ProcKoucink;
