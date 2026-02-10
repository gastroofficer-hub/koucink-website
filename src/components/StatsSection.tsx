import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Clock, Users, Award, Trophy, Heart, Star, Target, Briefcase, type LucideIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export interface StatItemData {
  icon: string;
  value: number;
  suffix: string;
  label: string;
}

export interface StatsContent {
  items: StatItemData[];
}

const iconMap: Record<string, LucideIcon> = {
  Clock, Users, Award, Trophy, Heart, Star, Target, Briefcase,
};

const defaultStats: StatsContent = {
  items: [
    { icon: "Clock", value: 500, suffix: "+", label: "Hodin koučinku" },
    { icon: "Users", value: 100, suffix: "+", label: "Spokojených klientů" },
    { icon: "Award", value: 5, suffix: "+", label: "Let praxe" },
  ],
};

const AnimatedCounter = ({ value, suffix, inView }: { value: number; suffix: string; inView: boolean }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 2000;
    const step = Math.max(1, Math.floor(value / (duration / 16)));
    const timer = setInterval(() => {
      start += step;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, value]);

  return (
    <span className="tabular-nums">
      {count}{suffix}
    </span>
  );
};

const StatsSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const [stats, setStats] = useState<StatItemData[]>(defaultStats.items);

  useEffect(() => {
    const fetchStats = async () => {
      const { data } = await supabase
        .from("site_content")
        .select("content")
        .eq("key", "statistiky")
        .maybeSingle();

      if (data?.content) {
        const content = data.content as unknown as StatsContent;
        if (content.items && content.items.length > 0) {
          setStats(content.items);
        }
      }
    };
    fetchStats();
  }, []);

  return (
    <section ref={ref} className="py-16 bg-primary/10 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-6">
        <div className={`grid grid-cols-2 ${stats.length >= 4 ? 'md:grid-cols-4' : `md:grid-cols-${stats.length}`} gap-8`}>
          {stats.map((stat, index) => {
            const IconComp = iconMap[stat.icon] || Award;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/15 mb-4">
                  <IconComp className="w-7 h-7 text-primary" />
                </div>
                <div className="text-3xl md:text-4xl font-display font-bold text-primary mb-1">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} inView={inView} />
                </div>
                <p className="text-sm text-foreground/70 font-medium">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
