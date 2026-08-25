import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminUser() {
  const email = 'admin@pdrworld.com';
  const password = 'Autopdr123';

  console.log(`Checking if user ${email} exists...`);
  
  // We cannot easily check by email directly using admin.createUser without it throwing an error if exists, 
  // so we'll just try to create it.
  
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    if (error.message.includes('User already registered')) {
      console.log(`User ${email} already exists. Updating password...`);
      
      // Need to find user id to update
      const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
      if (listError) {
        console.error("Failed to list users:", listError);
        return;
      }
      
      const user = listData.users.find(u => u.email === email);
      if (user) {
        const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
          user.id,
          { password: password }
        );
        if (updateError) {
             console.error("Failed to update password:", updateError);
        } else {
             console.log(`Password updated successfully for ${email}`);
        }
      }
    } else {
      console.error("Failed to create admin user:", error);
    }
  } else {
    console.log(`Successfully created admin user: ${data.user.email} (ID: ${data.user.id})`);
  }
}

createAdminUser();
