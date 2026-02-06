import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Quote } from "lucide-react";

interface Testimonial {
  id: string;
  text: string;
  author_name: string;
  author_role: string | null;
  order_index: number;
}

const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .order("order_index", { ascending: true });

    if (error) {
      console.error("Error fetching testimonials:", error);
    } else {
      setTestimonials(data || []);
    }
    setLoading(false);
  };

  if (loading) {
    return null;
  }

  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section id="reference" className="py-20 bg-soft-green/30">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-display font-semibold text-primary mb-4">
            Reference
          </h2>
          <p className="text-foreground/70 max-w-2xl mx-auto">
            Co říkají moji klienti o naší spolupráci
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card rounded-2xl p-6 relative"
            >
              <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/20" />
              
              <div className="relative z-10">
                <p className="text-foreground/90 italic mb-6 leading-relaxed">
                  "{testimonial.text}"
                </p>
                
                <div className="border-t border-primary/10 pt-4">
                  <p className="font-display font-medium text-primary">
                    {testimonial.author_name}
                  </p>
                  {testimonial.author_role && (
                    <p className="text-sm text-muted-foreground">
                      {testimonial.author_role}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
