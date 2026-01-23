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
  coachingTopic: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Received request to send-questionnaire function");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { firstName, lastName, coachingTopic }: QuestionnaireRequest = await req.json();

    console.log("Processing questionnaire from:", firstName, lastName);

    const emailResponse = await resend.emails.send({
      from: "Dotazník <onboarding@resend.dev>",
      to: ["gastro.officer@gmail.com"],
      subject: `Nový dotazník od ${firstName} ${lastName}`,
      html: `
        <h1>Nový dotazník</h1>
        <p><strong>Jméno:</strong> ${firstName}</p>
        <p><strong>Příjmení:</strong> ${lastName}</p>
        <p><strong>Čeho se bude koučink týkat:</strong></p>
        <p>${coachingTopic}</p>
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
  } catch (error: any) {
    console.error("Error in send-questionnaire function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
