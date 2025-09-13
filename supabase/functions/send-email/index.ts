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
          <!DOCTYPE html>
          <html lang="ar" dir="rtl">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&display=swap" rel="stylesheet">
            <style>
              * {
                font-family: 'Tajawal', 'Cairo', 'Segoe UI', Tahoma, Arial, sans-serif;
              }
            </style>
          </head>
          <body style="margin: 0; padding: 0; background-color: #f5f5f5;">
            <div style="font-family: 'Tajawal', 'Cairo', 'Segoe UI', Tahoma, Arial, sans-serif; direction: rtl; padding: 20px; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="margin: 0; font-size: 32px; font-weight: 700; font-family: 'Tajawal', 'Cairo', 'Segoe UI', Tahoma, Arial, sans-serif;">أهلاً وسهلاً!</h1>
                <p style="margin: 10px 0 0 0; font-size: 18px; font-weight: 400; font-family: 'Tajawal', 'Cairo', 'Segoe UI', Tahoma, Arial, sans-serif;">مرحباً بك في منصة ${schoolName} التعليمية</p>
              </div>
              
              <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <h2 style="color: #333; margin-bottom: 20px; font-size: 24px; font-weight: 600; font-family: 'Tajawal', 'Cairo', 'Segoe UI', Tahoma, Arial, sans-serif;">عزيزي/عزيزتي ${studentName}،</h2>
                
                <p style="color: #555; line-height: 1.8; margin-bottom: 20px; font-size: 16px; font-weight: 400; font-family: 'Tajawal', 'Cairo', 'Segoe UI', Tahoma, Arial, sans-serif;">
                  نرحب بك في منصة <strong style="font-weight: 700; color: #667eea;">${schoolName}</strong> التعليمية! نحن سعداء لانضمامك إلى مجتمعنا التعليمي.
                </p>
                
                ${username && password ? `
                <div style="background-color: #f8f9fa; border-radius: 12px; padding: 25px; margin: 25px 0; border-right: 4px solid #667eea;">
                  <h3 style="color: #333; margin-top: 0; margin-bottom: 18px; font-size: 20px; font-weight: 600; font-family: 'Tajawal', 'Cairo', 'Segoe UI', Tahoma, Arial, sans-serif;">بيانات تسجيل الدخول:</h3>
                  <p style="margin: 8px 0; color: #555; font-size: 16px; font-weight: 400; font-family: 'Tajawal', 'Cairo', 'Segoe UI', Tahoma, Arial, sans-serif;"><strong style="font-weight: 600;">البريد الإلكتروني:</strong> ${username}</p>
                  <p style="margin: 8px 0; color: #555; font-size: 16px; font-weight: 400; font-family: 'Tajawal', 'Cairo', 'Segoe UI', Tahoma, Arial, sans-serif;"><strong style="font-weight: 600;">كلمة المرور:</strong> ${password}</p>
                </div>
                ` : ''}
                
                <p style="color: #555; line-height: 1.8; margin-top: 25px; font-size: 16px; font-weight: 400; font-family: 'Tajawal', 'Cairo', 'Segoe UI', Tahoma, Arial, sans-serif;">
                  نتمنى لك تجربة تعليمية ممتعة ومثمرة! 🌟
                </p>
                
                <div style="text-align: center; margin-top: 35px; padding-top: 20px; border-top: 1px solid #eee;">
                  <p style="color: #666; font-size: 15px; font-weight: 400; font-family: 'Tajawal', 'Cairo', 'Segoe UI', Tahoma, Arial, sans-serif; margin: 0;">
                    مع أطيب التحيات،<br>
                    <strong style="font-weight: 700; color: #667eea;">فريق ${schoolName}</strong>
                  </p>
                </div>
              </div>
            </div>
          </body>
          </html>
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