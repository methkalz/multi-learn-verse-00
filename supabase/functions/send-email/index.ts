// Send email function - Force deployment v2.0
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

console.log("🚀 Send Email Edge Function is starting up...");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { studentEmail, studentName, schoolName, username, password } = await req.json();
    
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    // Send email using direct fetch to Resend API
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${schoolName} <onboarding@resend.dev>`,
        to: [studentEmail],
        subject: `مرحباً بك في ${schoolName}`,
        html: `
          <div style="font-family: Arial, sans-serif; direction: rtl; padding: 20px; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="margin: 0; font-size: 28px;">أهلاً وسهلاً!</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px;">مرحباً بك في منصة ${schoolName} التعليمية</p>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <h2 style="color: #333; margin-bottom: 20px;">عزيزي/عزيزتي ${studentName}،</h2>
              
              <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
                نرحب بك في منصة <strong>${schoolName}</strong> التعليمية! نحن سعداء لانضمامك إلى مجتمعنا التعليمي.
              </p>
              
              ${username && password ? `
              <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; border-right: 4px solid #667eea;">
                <h3 style="color: #333; margin-top: 0; margin-bottom: 15px;">بيانات تسجيل الدخول:</h3>
                <p style="margin: 5px 0; color: #555;"><strong>البريد الإلكتروني:</strong> ${username}</p>
                <p style="margin: 5px 0; color: #555;"><strong>كلمة المرور:</strong> ${password}</p>
              </div>
              ` : ''}
              
              <p style="color: #555; line-height: 1.6; margin-top: 25px;">
                نتمنى لك تجربة تعليمية ممتعة ومثمرة! 🌟
              </p>
              
              <div style="text-align: center; margin-top: 30px;">
                <p style="color: #666; font-size: 14px;">
                  مع أطيب التحيات،<br>
                  <strong>فريق ${schoolName}</strong>
                </p>
              </div>
            </div>
          </div>
        `
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      throw new Error(`Resend API error: ${emailResponse.status} - ${errorText}`);
    }

    const result = await emailResponse.json();

    return new Response(JSON.stringify({ 
      success: true, 
      emailId: result.id,
      message: 'تم إرسال الرسالة الترحيبية بنجاح' 
    }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Send Email Function Error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      message: 'فشل في إرسال الرسالة الترحيبية',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});

// Edge Function deployed manually - v3.0