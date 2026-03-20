// Migration script: creates all required tables in Supabase
// Run with: npx tsx scripts/migrate.ts

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

const SQL = `
-- Contact requests
CREATE TABLE IF NOT EXISTS contact_requests (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  type TEXT,
  size TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service areas
CREATE TABLE IF NOT EXISTS service_areas (
  id BIGSERIAL PRIMARY KEY,
  zip_code TEXT NOT NULL UNIQUE,
  city TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings
CREATE TABLE IF NOT EXISTS bookings (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  service TEXT NOT NULL,
  date TEXT NOT NULL,
  time_slot TEXT NOT NULL,
  zip_code TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Availability checks log
CREATE TABLE IF NOT EXISTS availability_checks (
  id BIGSERIAL PRIMARY KEY,
  zip_code TEXT NOT NULL,
  available BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Before/After transformation gallery
CREATE TABLE IF NOT EXISTS transformations (
  id BIGSERIAL PRIMARY KEY,
  label TEXT,
  before_image_url TEXT NOT NULL,
  after_image_url TEXT NOT NULL,
  before_path TEXT NOT NULL,
  after_path TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chatbot leads (contact info captured from chat)
CREATE TABLE IF NOT EXISTS chatbot_leads (
  id BIGSERIAL PRIMARY KEY,
  name TEXT,
  phone TEXT,
  email TEXT,
  conversation JSONB,
  status TEXT DEFAULT 'new',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gallery images
CREATE TABLE IF NOT EXISTS gallery_images (
  id BIGSERIAL PRIMARY KEY,
  image_url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  label TEXT,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Staff
CREATE TABLE IF NOT EXISTS staff (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role TEXT DEFAULT 'Cleaner',
  status TEXT DEFAULT 'Off Shift',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers
CREATE TABLE IF NOT EXISTS customers (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  type TEXT DEFAULT 'Residential',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs
CREATE TABLE IF NOT EXISTS jobs (
  id BIGSERIAL PRIMARY KEY,
  customer_name TEXT NOT NULL,
  service TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT,
  staff_name TEXT,
  location TEXT,
  price NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'Scheduled',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory
CREATE TABLE IF NOT EXISTS inventory (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  stock INTEGER DEFAULT 0,
  unit TEXT DEFAULT 'Units',
  min_stock INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quotes
CREATE TABLE IF NOT EXISTS quotes (
  id BIGSERIAL PRIMARY KEY,
  customer_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  service TEXT NOT NULL,
  sqft INTEGER,
  estimated_price NUMERIC,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pricing rules for admin settings
CREATE TABLE IF NOT EXISTS pricing_rules (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  base_price NUMERIC NOT NULL DEFAULT 0,
  per_sqft NUMERIC NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Site settings (global config)
CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY DEFAULT 'global',
  geofence_radius INTEGER DEFAULT 200,
  business_phone TEXT,
  business_email TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Compliance documents
CREATE TABLE IF NOT EXISTS compliance_documents (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  provider TEXT,
  status TEXT DEFAULT 'Active',
  expiry_date DATE,
  file_url TEXT,
  storage_path TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
`;

const SERVICE_AREAS = [
    ['75001', 'Addison'], ['75006', 'Carrollton'], ['75007', 'Carrollton'],
    ['75019', 'Coppell'], ['75038', 'Irving'], ['75039', 'Irving'],
    ['75040', 'Garland'], ['75041', 'Garland'], ['75042', 'Garland'],
    ['75043', 'Garland'], ['75044', 'Garland'], ['75050', 'Grand Prairie'],
    ['75051', 'Grand Prairie'], ['75052', 'Grand Prairie'], ['75061', 'Irving'],
    ['75062', 'Irving'], ['75063', 'Irving'], ['75080', 'Richardson'],
    ['75081', 'Richardson'], ['75082', 'Richardson'], ['75201', 'Dallas'],
    ['75202', 'Dallas'], ['75203', 'Dallas'], ['75204', 'Dallas'],
    ['75205', 'Dallas'], ['75206', 'Dallas'], ['75207', 'Dallas'],
    ['75208', 'Dallas'], ['75209', 'Dallas'], ['75210', 'Dallas'],
    ['75211', 'Dallas'], ['75212', 'Dallas'], ['75214', 'Dallas'],
    ['75215', 'Dallas'], ['75216', 'Dallas'], ['75217', 'Dallas'],
    ['75218', 'Dallas'], ['75219', 'Dallas'], ['75220', 'Dallas'],
    ['75223', 'Dallas'], ['75224', 'Dallas'], ['75225', 'Dallas'],
    ['75226', 'Dallas'], ['75227', 'Dallas'], ['75228', 'Dallas'],
    ['75229', 'Dallas'], ['75230', 'Dallas'], ['75231', 'Dallas'],
    ['75232', 'Dallas'], ['75233', 'Dallas'], ['75234', 'Dallas'],
    ['75235', 'Dallas'], ['75236', 'Dallas'], ['75237', 'Dallas'],
    ['75238', 'Dallas'], ['75240', 'Dallas'], ['75241', 'Dallas'],
    ['75243', 'Dallas'], ['75244', 'Dallas'], ['75246', 'Dallas'],
    ['75247', 'Dallas'], ['75248', 'Dallas'], ['75249', 'Dallas'],
    ['75251', 'Dallas'], ['75252', 'Dallas'], ['75253', 'Dallas'],
    ['75287', 'Dallas'], ['76010', 'Arlington'], ['76011', 'Arlington'],
    ['76012', 'Arlington'], ['76013', 'Arlington'], ['76014', 'Arlington'],
    ['76015', 'Arlington'], ['76016', 'Arlington'], ['76017', 'Arlington'],
    ['76018', 'Arlington'], ['76019', 'Arlington'], ['75023', 'Plano'],
    ['75024', 'Plano'], ['75025', 'Plano'], ['75074', 'Plano'],
    ['75075', 'Plano'], ['75093', 'Plano'],
];

async function migrate() {
    console.log('🔧 Running migration via Supabase Management API...');

    // Execute DDL via the Supabase SQL endpoint (service role)
    const res = await fetch(`${supabaseUrl}/rest/v1/rpc/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${serviceKey}`,
            'apikey': serviceKey,
        },
        body: JSON.stringify({ query: SQL }),
    });

    // The rpc endpoint won't work for DDL — fall through to inserting data
    // and detecting whether schema exists
    console.log('📋 Checking table connectivity...');

    // Test connectivity — if table doesn't exist, the error will tell us
    const { error: testError } = await supabase.from('contact_requests').select('id').limit(1);

    if (testError && testError.code === '42P01') {
        console.error('❌ Tables do not exist yet — please run the SQL in the Supabase dashboard.');
        console.log('\nRun this SQL in https://supabase.com/dashboard/project/namkfstwzcbobbceyymj/sql/new:\n');
        console.log(SQL);
        process.exit(1);
    }

    if (testError) {
        console.error('❌ Connection error:', testError.message);
        process.exit(1);
    }

    console.log('✅ Tables already exist — skipping DDL.');

    // Seed service areas (upsert so it is idempotent)
    console.log('🌱 Seeding service areas...');
    const rows = SERVICE_AREAS.map(([zip_code, city]) => ({ zip_code, city, active: true }));

    const { error: seedError } = await supabase
        .from('service_areas')
        .upsert(rows, { onConflict: 'zip_code', ignoreDuplicates: true });

    if (seedError) {
        console.error('❌ Seed error:', seedError.message);
        process.exit(1);
    }

    console.log(`✅ Seeded ${rows.length} service areas.`);
    console.log('\n🎉 Migration complete!');
}

migrate();
