import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CommentRequest {
  post_id: string;
  author_name: string;
  content: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP for rate limiting
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
                     req.headers.get("x-real-ip") ||
                     "unknown";

    // Parse and validate request body
    const body: CommentRequest = await req.json();
    
    // Validate post_id (UUID format)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!body.post_id || !uuidRegex.test(body.post_id)) {
      return new Response(
        JSON.stringify({ error: "Invalid post ID" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate author_name
    const authorName = (body.author_name || "").trim();
    if (authorName.length === 0) {
      return new Response(
        JSON.stringify({ error: "Author name is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (authorName.length > 100) {
      return new Response(
        JSON.stringify({ error: "Author name cannot exceed 100 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate content
    const content = (body.content || "").trim();
    if (content.length === 0) {
      return new Response(
        JSON.stringify({ error: "Comment content is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (content.length > 1000) {
      return new Response(
        JSON.stringify({ error: "Comment cannot exceed 1000 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with service role for rate limiting
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check rate limit (10 comments per hour per IP)
    const { data: rateLimitOk, error: rateLimitError } = await supabase.rpc(
      "check_blog_comment_rate_limit",
      { client_ip: clientIP }
    );

    if (rateLimitError) {
      console.error("Rate limit check error:", rateLimitError);
      return new Response(
        JSON.stringify({ error: "Rate limit check failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!rateLimitOk) {
      return new Response(
        JSON.stringify({ error: "Příliš mnoho komentářů. Zkuste to později." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the post exists
    const { data: post, error: postError } = await supabase
      .from("blog_posts")
      .select("id")
      .eq("id", body.post_id)
      .maybeSingle();

    if (postError || !post) {
      return new Response(
        JSON.stringify({ error: "Post not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert the comment (database trigger will validate)
    const { data: comment, error: insertError } = await supabase
      .from("blog_comments")
      .insert({
        post_id: body.post_id,
        author_name: authorName,
        content: content
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Nepodařilo se přidat komentář" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, comment }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
