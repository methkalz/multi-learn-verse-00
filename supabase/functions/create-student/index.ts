import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateStudentRequest {
  school_id: string;
  full_name: string;
  email?: string;
  phone?: string;
  password?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get Supabase environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error('Missing required environment variables');
    }

    // Initialize Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Parse request body
    const body: CreateStudentRequest = await req.json();
    const { school_id, full_name, email, phone, password } = body;

    console.log('Creating student with data:', { school_id, full_name, email, phone });

    let user_id = null;
    let student_id = null;
    
    // مع الحذف النهائي، الطالب يجب ألا يكون موجوداً
    // Check if student already exists in this school
    if (email) {
      const { data: existingStudent } = await supabaseAdmin
        .from('students')
        .select('id, user_id, full_name, school_id')
        .eq('email', email)
        .eq('school_id', school_id)
        .single();

      if (existingStudent) {
        console.log('Student already exists in this school:', existingStudent);
        return new Response(
          JSON.stringify({ 
            error: 'طالب بهذا البريد الإلكتروني موجود بالفعل في هذه المدرسة',
            success: false
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 409,
          }
        );
      }
    }
    }
    
    // If we reach here, create a new student (no existing student found)
    
    // If email is provided and password is provided, create a user account
    if (email && password) {
      // Check if user account already exists
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = existingUsers.users?.find(u => u.email === email);
      
      if (existingUser) {
        console.log('Using existing user account:', existingUser.id);
        user_id = existingUser.id;
        
        // Update the user's profile to include this school
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .upsert({
            user_id: user_id,
            role: 'student',
            school_id: school_id,
            full_name: full_name,
            email: email,
            phone: phone
          });

        if (profileError) {
          console.error('Error updating profile:', profileError);
        }
      } else {
        // Create new user account with complete metadata
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
          email: email,
          password: password,
          email_confirm: true,
          user_metadata: {
            full_name: full_name,
            role: 'student',
            school_id: school_id
          }
        });

        if (userError) {
          console.error('Error creating user:', userError);
          // Continue without user account if email creation fails
        } else if (userData.user) {
          user_id = userData.user.id;
          console.log('User created successfully with student profile:', user_id);
          
          // Wait a moment for trigger to complete
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    }

    // Only create new student if we don't already have one
    if (!student_id) {
      // Create student record in students table
      const { data: studentData, error: studentError } = await supabaseAdmin
        .from('students')
        .insert({
          school_id: school_id,
          full_name: full_name,
          username: email || null,
          email: email || null,
          phone: phone || null,
          user_id: user_id
        })
        .select()
        .single();

      if (studentError) {
        console.error('Error creating student:', studentError);
        throw new Error(`Failed to create student: ${studentError.message}`);
      }

      student_id = studentData.id;
      console.log('New student created successfully:', studentData);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        student_id: student_id,
        user_id: user_id,
        message: student_id ? 'تم إنشاء الطالب بنجاح' : 'تم إعادة تنشيط الطالب بنجاح'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in create-student function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred',
        success: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});