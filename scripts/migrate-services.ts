// Migration script: creates service_content table and seeds default data
// Run with: npx tsx scripts/migrate-services.ts

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

const CREATE_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS service_content (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT,
  storage_path TEXT,
  description TEXT,
  checklist JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
`;

const DEFAULT_SERVICES = [
    {
        id: 'residential-cleaning',
        title: 'Residential Cleaning',
        image_url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800',
        description: 'Our residential cleaning service transforms your home into a spotless sanctuary. We pay attention to every detail, from baseboards to ceiling fans.',
        checklist: ['Full kitchen cleaning including appliances', 'Bathroom sanitization and disinfection', 'Bedroom and living area dusting', 'Floor vacuuming and mopping throughout', 'Window sill and ledge cleaning']
    },
    {
        id: 'commercial-cleaning',
        title: 'Commercial Cleaning',
        image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
        description: 'Keep your business looking professional with our commercial cleaning services. We work around your schedule to minimize disruption.',
        checklist: ['Office workspace and desk sanitization', 'Break room and kitchen deep clean', 'Restroom disinfection and restocking', 'Lobby and common area maintenance', 'Trash removal and recycling management']
    },
    {
        id: 'deep-cleaning',
        title: 'Deep Cleaning',
        image_url: 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=800',
        description: 'Our deep cleaning service tackles the dirt and grime that regular cleaning misses. Perfect for seasonal refreshes or moving preparation.',
        checklist: ['Inside oven and refrigerator cleaning', 'Baseboard and crown molding detailing', 'Light fixture and ceiling fan dusting', 'Inside cabinet and drawer wipe-down', 'Grout and tile scrubbing']
    },
    {
        id: 'move-in-out-cleaning',
        title: 'Move In/Out Cleaning',
        image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
        description: 'Moving is stressful enough. Let us handle the cleaning so you can focus on settling into your new space or leaving your old one spotless.',
        checklist: ['Complete interior wall spot cleaning', 'All closets and storage spaces cleaned', 'Kitchen appliances inside and out', 'Bathroom fixtures deep sanitized', 'Garage and laundry room sweep-out']
    },
    {
        id: 'office-cleaning',
        title: 'Office Cleaning',
        image_url: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800',
        description: 'A clean office boosts productivity and impresses clients. Our office cleaning services keep your workplace pristine and healthy.',
        checklist: ['Workstation and desk sanitization', 'Conference room and meeting space prep', 'Kitchen and break area deep clean', 'Restroom sanitization and supply check', 'Reception and waiting area maintenance']
    },
    {
        id: 'janitorial-services',
        title: 'Janitorial Services',
        image_url: 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=800',
        description: 'Comprehensive janitorial services to keep your facility clean and well-maintained day after day. Reliable, thorough, and professional.',
        checklist: ['Daily floor care and maintenance', 'Restroom cleaning and sanitization', 'Trash and recycling removal', 'Common area upkeep', 'Supply monitoring and restocking']
    },
    {
        id: 'after-hours-cleaning',
        title: 'After-Hours Cleaning',
        image_url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
        description: 'We clean when you are closed so your business is spotless when you open. Flexible scheduling that works around your operations.',
        checklist: ['Evening and overnight availability', 'Minimal disruption to operations', 'Secure and bonded cleaning crew', 'Complete facility cleaning', 'Ready-for-business morning condition']
    },
    {
        id: 'facility-maintenance',
        title: 'Facility Maintenance',
        image_url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800',
        description: 'Keep your entire facility in top condition with our comprehensive maintenance services. From lobbies to loading docks, we cover it all.',
        checklist: ['Building exterior pressure washing', 'Parking lot and sidewalk cleaning', 'Common area deep cleaning', 'HVAC vent and duct cleaning', 'Emergency cleanup services']
    },
    {
        id: 'floor-cleaning',
        title: 'Floor Cleaning',
        image_url: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800',
        description: 'Professional floor cleaning for all surface types. We restore the shine and extend the life of your floors with expert care.',
        checklist: ['Hardwood sweeping and mopping', 'Tile and grout cleaning', 'Vinyl and linoleum care', 'Concrete floor cleaning', 'Anti-slip treatment application']
    },
    {
        id: 'floor-refinishing',
        title: 'Floor Refinishing',
        image_url: 'https://images.unsplash.com/photo-1594844532765-0c3c0d937987?w=800',
        description: 'Restore your floors to their original beauty with our refinishing services. We strip, seal, and polish to perfection.',
        checklist: ['Old finish stripping and removal', 'Surface sanding and preparation', 'Multiple coat sealant application', 'High-gloss or matte finishing', 'Cure time and maintenance guidance']
    },
    {
        id: 'carpet-cleaning',
        title: 'Carpet Cleaning',
        image_url: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800',
        description: 'Deep carpet cleaning that removes stains, allergens, and odors. We use professional-grade equipment for superior results.',
        checklist: ['Pre-treatment of stains and spots', 'Hot water extraction cleaning', 'Deodorizing treatment', 'Fast-dry technology', 'Carpet protection application']
    },
    {
        id: 'window-cleaning',
        title: 'Window Cleaning',
        image_url: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=800',
        description: 'Crystal-clear windows inside and out. Our professional window cleaning lets the light in and makes your space shine.',
        checklist: ['Interior window glass cleaning', 'Exterior window washing', 'Window frame and sill wiping', 'Screen cleaning and dusting', 'Hard water stain removal']
    },
    {
        id: 'restroom-sanitation',
        title: 'Restroom Sanitation',
        image_url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800',
        description: 'Our restroom sanitation service ensures your bathrooms are hygienic, fresh, and welcoming for employees and visitors alike.',
        checklist: ['Toilet and urinal deep disinfection', 'Sink and countertop sanitization', 'Mirror and fixture polishing', 'Floor mopping with antibacterial solution', 'Supply restocking (soap, towels, tissue)']
    },
    {
        id: 'trash-removal',
        title: 'Trash Removal',
        image_url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800',
        description: 'Regular trash removal keeps your space clean and odor-free. We handle all waste responsibly with proper recycling practices.',
        checklist: ['All trash bins emptied and relined', 'Recycling sorted and removed', 'Large item disposal coordination', 'Dumpster area cleaning', 'Odor control treatment']
    },
    {
        id: 'surface-disinfection',
        title: 'Surface Disinfection',
        image_url: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=800',
        description: 'Hospital-grade disinfection for high-touch surfaces. Protect your employees and customers with our thorough sanitization service.',
        checklist: ['Door handles and light switches', 'Desks, keyboards, and phones', 'Elevator buttons and railings', 'Break room appliances', 'EPA-approved disinfectants used']
    },
    {
        id: 'supply-restocking',
        title: 'Supply Restocking',
        image_url: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=800',
        description: 'Never run out of essential supplies. We monitor and restock soap, paper products, and cleaning supplies so you do not have to.',
        checklist: ['Restroom supply monitoring', 'Paper towel and tissue restocking', 'Soap and sanitizer refilling', 'Break room supply management', 'Inventory tracking and reporting']
    }
];

async function migrate() {
    console.log('Creating service_content table...');
    
    const { error: tableError } = await supabase.rpc('exec_sql', { sql: CREATE_TABLE_SQL });
    
    if (tableError) {
        // Table might already exist or we need to create it via SQL editor
        console.log('Note: You may need to run this SQL in Supabase SQL Editor:');
        console.log(CREATE_TABLE_SQL);
    }

    console.log('Seeding default service content...');
    
    for (const service of DEFAULT_SERVICES) {
        const { error } = await supabase
            .from('service_content')
            .upsert(service, { onConflict: 'id' });
        
        if (error) {
            console.error(`Failed to insert ${service.id}:`, error.message);
        } else {
            console.log(`✓ ${service.title}`);
        }
    }

    console.log('Done!');
}

migrate().catch(console.error);
