import { useState, useEffect } from "react";
import PageLayout from "@/components/PageLayout";
import { supabase } from "@/integrations/supabase/client";
import { Award } from "lucide-react";
import { motion } from "framer-motion";

interface Diploma {
  id: string;
  title: string;
  file_url: string;
  created_at: string;
}

const Diplomy = () => {
  const [diplomas, setDiplomas] = useState<Diploma[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDiplomas();
  }, []);

  const fetchDiplomas = async () => {
    const { data, error } = await supabase
      .from("diplomas")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching diplomas:", error);
    } else {
      setDiplomas(data || []);
    }
    setLoading(false);
  };

  return (
    <PageLayout title="Moje diplomy a certifikáty">
      <div className="space-y-8">
        <p className="text-lg text-foreground/90 leading-relaxed">
          Zde naleznete přehled mých certifikátů a diplomů, které dokládají moji kvalifikaci 
          v oblasti koučinku a osobního rozvoje.
        </p>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            Načítání diplomů...
          </div>
        ) : diplomas.length === 0 ? (
          <div className="text-center py-12">
            <Award className="w-16 h-16 mx-auto text-primary/30 mb-4" />
            <p className="text-muted-foreground">
              Diplomy budou brzy k dispozici.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {diplomas.map((diploma, index) => (
              <motion.a
                key={diploma.id}
                href={diploma.file_url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="group block"
              >
                <div className="bg-white/50 rounded-xl overflow-hidden border border-primary/10 hover:border-primary/30 transition-all hover:shadow-lg">
                  <div className="aspect-[3/4] bg-soft-green/30 flex items-center justify-center">
                    <img
                      src={diploma.file_url}
                      alt={diploma.title}
                      className="w-full h-full object-contain p-4"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <Award className="w-16 h-16 text-primary/40 hidden" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-primary group-hover:text-accent transition-colors">
                      {diploma.title}
                    </h3>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default Diplomy;
