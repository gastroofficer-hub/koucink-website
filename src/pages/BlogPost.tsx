import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, User, Send, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import backgroundImage from "@/assets/background.jpg";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  author_email: string;
  created_at: string;
}

interface Comment {
  id: string;
  author_name: string;
  content: string;
  created_at: string;
}

const BlogPostPage = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [commentForm, setCommentForm] = useState({
    author_name: "",
    content: ""
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPost();
      fetchComments();
      checkAdminStatus();
    }
  }, [id]);

  const checkAdminStatus = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data } = await supabase
        .from("admin_users")
        .select("id")
        .eq("user_id", session.user.id)
        .maybeSingle();
      setIsAdmin(!!data);
    }
  };

  const fetchPost = async () => {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching post:", error);
    } else {
      setPost(data);
    }
    setLoading(false);
  };

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from("blog_comments")
      .select("*")
      .eq("post_id", id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching comments:", error);
    } else {
      setComments(data || []);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentForm.author_name.trim() || !commentForm.content.trim()) {
      toast.error("Vyplňte prosím všechna pole.");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("blog_comments").insert({
      post_id: id,
      author_name: commentForm.author_name.trim(),
      content: commentForm.content.trim()
    });

    if (error) {
      toast.error("Nepodařilo se přidat komentář.");
      console.error(error);
    } else {
      toast.success("Komentář byl přidán!");
      setCommentForm({ author_name: "", content: "" });
      fetchComments();
    }
    setSubmitting(false);
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Opravdu chcete smazat tento komentář?")) return;

    const { error } = await supabase
      .from("blog_comments")
      .delete()
      .eq("id", commentId);

    if (error) {
      toast.error("Nepodařilo se smazat komentář.");
    } else {
      toast.success("Komentář byl smazán.");
      fetchComments();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div 
        className="page-bg"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="min-h-screen bg-background/70 backdrop-blur-sm flex items-center justify-center">
          <p className="text-muted-foreground">Načítání...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div 
        className="page-bg"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="min-h-screen bg-background/70 backdrop-blur-sm">
          <div className="section-container">
            <Link 
              to="/blog" 
              className="inline-flex items-center gap-2 text-primary hover:text-accent transition-colors mb-8 group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Zpět na blog</span>
            </Link>
            <div className="glass-card rounded-2xl p-8 text-center">
              <p className="text-muted-foreground">Příspěvek nebyl nalezen.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              to="/blog" 
              className="inline-flex items-center gap-2 text-primary hover:text-accent transition-colors mb-8 group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Zpět na blog</span>
            </Link>
          </motion.div>

          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="glass-card rounded-2xl overflow-hidden mb-8"
          >
            {post.image_url && (
              <div className="w-full h-64 md:h-96">
                <img
                  src={post.image_url}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-8 md:p-12">
              <h1 className="text-2xl md:text-4xl font-display font-semibold text-primary mb-4">
                {post.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(post.created_at)}
                </span>
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {post.author_email}
                </span>
              </div>
              <div className="prose prose-lg max-w-none text-foreground/90 whitespace-pre-wrap">
                {post.content}
              </div>
            </div>
          </motion.article>

          {/* Comments Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-card rounded-2xl p-8"
          >
            <h2 className="text-xl font-display font-semibold text-primary mb-6">
              Komentáře ({comments.length})
            </h2>

            {/* Comment Form */}
            <form onSubmit={handleSubmitComment} className="mb-8 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="author_name" className="text-foreground">Vaše jméno</Label>
                <Input
                  id="author_name"
                  value={commentForm.author_name}
                  onChange={(e) => setCommentForm(prev => ({ ...prev, author_name: e.target.value }))}
                  className="bg-white/50 border-primary/20 focus:border-primary"
                  placeholder="Jan Novák"
                  maxLength={100}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content" className="text-foreground">Váš komentář</Label>
                <Textarea
                  id="content"
                  value={commentForm.content}
                  onChange={(e) => setCommentForm(prev => ({ ...prev, content: e.target.value }))}
                  className="bg-white/50 border-primary/20 focus:border-primary min-h-[100px]"
                  placeholder="Napište svůj komentář..."
                  maxLength={1000}
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={submitting}
                className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Send className="w-4 h-4" />
                {submitting ? "Odesílání..." : "Odeslat komentář"}
              </Button>
            </form>

            {/* Comments List */}
            {comments.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Zatím žádné komentáře. Buďte první!
              </p>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="bg-white/30 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-foreground">{comment.author_name}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-foreground/80 whitespace-pre-wrap">{comment.content}</p>
                      </div>
                      {isAdmin && (
                        <Button
                          onClick={() => handleDeleteComment(comment.id)}
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10 flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BlogPostPage;
