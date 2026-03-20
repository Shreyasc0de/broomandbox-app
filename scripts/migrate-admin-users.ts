import { createClient } from '@supabase/supabase-js';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
  console.log('Creating admin_users table...');
  console.log('Run this SQL in Supabase SQL Editor:\n');
  
  console.log(`
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username);
`);

  // Get initial credentials from env
  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  
  console.log('\nSeeding initial admin user...');
  
  // Hash the password
  const saltRounds = 12;
  const passwordHash = await bcrypt.hash(password, saltRounds);
  
  const { error } = await supabase
    .from('admin_users')
    .upsert({
      username,
      password_hash: passwordHash,
      display_name: 'Admin User',
      role: 'super_admin'
    }, { onConflict: 'username' });
  
  if (error) {
    console.error('Failed to seed admin user:', error.message);
    console.log('\nMake sure to create the table first using the SQL above.');
  } else {
    console.log(`Created admin user: ${username}`);
    console.log('\nYou can now log in with your existing credentials.');
    console.log('Change your password in Admin > Settings after logging in.');
  }
}

migrate();
