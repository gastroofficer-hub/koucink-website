import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MINUTES = 60;
const MAX_REQUESTS_PER_WINDOW = 5;

interface QuestionnaireRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  maritalStatus: string;
  maritalStatusOther: string;
  sessionType: string;
  coachingTopic: string;
}

// HTML escape function to prevent XSS
const escapeHtml = (str: string): string => {
  if (!str) return "";
  return str.replace(/[&<>"']/g, (match) => {
    const escapeMap: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return escapeMap[match] || match;
  });
};

// Validation functions
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
};

const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[0-9\s\-\(\)]+$/;
  return phoneRegex.test(phone) && phone.length <= 30;
};

const isValidString = (str: string, maxLength: number): boolean => {
  return typeof str === "string" && str.trim().length > 0 && str.length <= maxLength;
};

const isValidSessionType = (type: string): boolean => {
  return type === "osobní" || type === "online";
};

const validateRequest = (data: QuestionnaireRequest): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!isValidString(data.firstName, 100)) {
    errors.push("Jméno je povinné a musí mít max. 100 znaků");
  }
  // lastName is optional, but if provided must be <= 100 chars
  if (data.lastName && data.lastName.length > 100) {
    errors.push("Příjmení musí mít max. 100 znaků");
  }
  if (!data.email || !isValidEmail(data.email)) {
    errors.push("Neplatný formát e-mailu");
  }
  if (!data.phone || !isValidPhone(data.phone)) {
    errors.push("Neplatný formát telefonu");
  }
  if (!isValidSessionType(data.sessionType)) {
    errors.push("Typ sezení musí být 'osobní' nebo 'online'");
  }
  if (!isValidString(data.coachingTopic, 5000)) {
    errors.push("Téma koučinku je povinné a musí mít max. 5000 znaků");
  }
  if (data.maritalStatus && data.maritalStatus.length > 50) {
    errors.push("Rodinný stav musí mít max. 50 znaků");
  }
  if (data.maritalStatusOther && data.maritalStatusOther.length > 100) {
    errors.push("Upřesnění rodinného stavu musí mít max. 100 znaků");
  }

  return { valid: errors.length === 0, errors };
};

// Get client IP from request headers
const getClientIP = (req: Request): string => {
  // Check various headers for client IP (Cloudflare, X-Forwarded-For, etc.)
  const cfConnectingIP = req.headers.get("cf-connecting-ip");
  if (cfConnectingIP) return cfConnectingIP;

  const xForwardedFor = req.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    // Take the first IP in the chain (original client)
    return xForwardedFor.split(",")[0].trim();
  }

  const xRealIP = req.headers.get("x-real-ip");
  if (xRealIP) return xRealIP;

  // Fallback to a hash of user-agent + timestamp if no IP available
  return "unknown-" + Date.now();
};

// Check rate limit using database
const checkRateLimit = async (supabase: ReturnType<typeof createClient>, ipAddress: string): Promise<{ allowed: boolean; remaining: number }> => {
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000).toISOString();

  // Count recent submissions from this IP
  const { count, error } = await supabase
    .from("rate_limit_submissions")
    .select("*", { count: "exact", head: true })
    .eq("ip_address", ipAddress)
    .gte("created_at", windowStart);

  if (error) {
    console.error("Error checking rate limit:", error);
    // On error, allow the request but log it
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW };
  }

  const currentCount = count || 0;
  const remaining = Math.max(0, MAX_REQUESTS_PER_WINDOW - currentCount);
  
  return { 
    allowed: currentCount < MAX_REQUESTS_PER_WINDOW, 
    remaining 
  };
};

// Record a submission for rate limiting
const recordSubmission = async (supabase: ReturnType<typeof createClient>, ipAddress: string): Promise<void> => {
  const { error } = await supabase
    .from("rate_limit_submissions")
    .insert({ ip_address: ipAddress });

  if (error) {
    console.error("Error recording submission:", error);
  }

  // Cleanup old entries occasionally (1% chance per request)
  if (Math.random() < 0.01) {
    await supabase.rpc("cleanup_old_rate_limits");
  }
};

const handler = async (req: Request): Promise<Response> => {
  console.log("Received request to send-questionnaire function");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role for rate limiting
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase configuration");
      return new Response(
        JSON.stringify({ error: "Chyba konfigurace serveru" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get client IP for rate limiting
    const clientIP = getClientIP(req);
    console.log("Client IP:", clientIP);

    // Check rate limit
    const rateLimitResult = await checkRateLimit(supabase, clientIP);
    
    if (!rateLimitResult.allowed) {
      console.warn("Rate limit exceeded for IP:", clientIP);
      return new Response(
        JSON.stringify({ 
          error: "Příliš mnoho požadavků. Zkuste to prosím za hodinu.", 
          retryAfter: RATE_LIMIT_WINDOW_MINUTES * 60 
        }),
        {
          status: 429,
          headers: { 
            "Content-Type": "application/json", 
            "Retry-After": String(RATE_LIMIT_WINDOW_MINUTES * 60),
            ...corsHeaders 
          },
        }
      );
    }

    let requestData: QuestionnaireRequest;
    
    try {
      requestData = await req.json();
    } catch {
      console.error("Invalid JSON in request body");
      return new Response(
        JSON.stringify({ error: "Neplatný formát požadavku" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Validate input
    const validation = validateRequest(requestData);
    if (!validation.valid) {
      console.error("Validation failed:", validation.errors);
      return new Response(
        JSON.stringify({ error: "Validace selhala", details: validation.errors }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const { firstName, lastName, email, phone, maritalStatus, maritalStatusOther, sessionType, coachingTopic } = requestData;

    console.log("Processing questionnaire from:", escapeHtml(firstName), escapeHtml(lastName));

    // Format marital status - if "jiné" is selected, use the custom value
    const formattedMaritalStatus = maritalStatus === "jiné" && maritalStatusOther 
      ? `Jiné: ${escapeHtml(maritalStatusOther)}` 
      : escapeHtml(maritalStatus) || "Nevyplněno";

    const emailResponse = await resend.emails.send({
      from: "Dotazník <onboarding@resend.dev>",
      to: ["koucondra@gmail.com"],
      subject: `Nový dotazník od ${escapeHtml(firstName)} ${escapeHtml(lastName)}`,
      html: `
        <h1>Nový dotazník</h1>
        <p><strong>Jméno:</strong> ${escapeHtml(firstName)}</p>
        <p><strong>Příjmení:</strong> ${escapeHtml(lastName)}</p>
        <p><strong>E-mail:</strong> ${escapeHtml(email)}</p>
        <p><strong>Telefon:</strong> ${escapeHtml(phone)}</p>
        <p><strong>Rodinný stav:</strong> ${formattedMaritalStatus}</p>
        <p><strong>Forma sezení:</strong> ${sessionType === "osobní" ? "Osobní sezení" : "Online sezení"}</p>
        <p><strong>Čeho se bude koučink týkat:</strong></p>
        <p>${escapeHtml(coachingTopic)}</p>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    // Record successful submission for rate limiting
    await recordSubmission(supabase, clientIP);

    return new Response(JSON.stringify({ 
      ...emailResponse,
      rateLimitRemaining: rateLimitResult.remaining - 1
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error in send-questionnaire function:", err.message);
    return new Response(
      JSON.stringify({ error: "Nastala chyba při odesílání dotazníku" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
