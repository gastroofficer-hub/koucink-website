import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Quote, Star, User } from "lucide-react";

interface Testimonial {
  id: string;
  text: string;
  author_name: string;
  author_role: string | null;
  photo_url: string | null;
  rating: number | null;
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

  const renderStars = (rating: number | null) => {
    if (!rating) return null;
    return (
      <div className="flex gap-0.5 mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? "fill-accent text-accent"
                : "fill-muted text-muted"
            }`}
          />
        ))}
      </div>
    );
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
                {renderStars(testimonial.rating)}
                
                <p className="text-foreground/90 italic mb-6 leading-relaxed">
                  "{testimonial.text}"
                </p>
                
                <div className="flex items-center gap-3 border-t border-primary/10 pt-4">
                  {testimonial.photo_url ? (
                    <img
                      src={testimonial.photo_url}
                      alt={testimonial.author_name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-6 h-6 text-primary/50" />
                    </div>
                  )}
                  <div>
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
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
