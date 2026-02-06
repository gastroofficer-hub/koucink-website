import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import backgroundImage from "@/assets/background.jpg";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  author_email: string;
  created_at: string;
}

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching posts:", error);
    } else {
      setPosts(data || []);
    }
    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const truncateContent = (content: string, maxLength: number = 200) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + "...";
  };

  return (
    <div 
      className="page-bg"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="min-h-screen bg-background/70 backdrop-blur-sm">
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
          >
            <h1 className="text-3xl md:text-4xl font-display font-semibold text-primary mb-8">
              Blog
            </h1>

            {loading ? (
              <div className="glass-card rounded-2xl p-8">
                <p className="text-muted-foreground">Načítání příspěvků...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="glass-card rounded-2xl p-8 text-center">
                <p className="text-muted-foreground">Zatím nejsou žádné příspěvky.</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {posts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Link to={`/blog/${post.id}`}>
                      <div className="glass-card rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 group">
                        <div className="flex flex-col md:flex-row">
                          {post.image_url && (
                            <div className="md:w-1/3 h-48 md:h-auto">
                              <img
                                src={post.image_url}
                                alt={post.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            </div>
                          )}
                          <div className={`p-6 md:p-8 flex-1 ${post.image_url ? '' : 'w-full'}`}>
                            <h2 className="text-xl md:text-2xl font-display font-semibold text-primary mb-3 group-hover:text-accent transition-colors">
                              {post.title}
                            </h2>
                            <p className="text-foreground/80 mb-4 leading-relaxed">
                              {truncateContent(post.content)}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {formatDate(post.created_at)}
                              </span>
                              <span className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                {post.author_email}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Blog;
