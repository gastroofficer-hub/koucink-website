import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

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

const handler = async (req: Request): Promise<Response> => {
  console.log("Received request to send-questionnaire function");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    console.log("Processing questionnaire from:", escapeHtml(firstName), escapeHtml(lastName), escapeHtml(email));

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

    return new Response(JSON.stringify(emailResponse), {
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
