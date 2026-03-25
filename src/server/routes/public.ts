import type { RouteContext } from '../types';
import rateLimit from 'express-rate-limit';
import { validateEmail, validatePhone, validateZipCode } from '../../lib/validation.js';

// Rate limiter for public form submissions (stricter than global)
const formRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 form submissions per 15 minutes
  message: { error: 'Too many submissions, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

export function registerPublicRoutes({ app, supabase, sendBookingConfirmation, sendQuoteNotification }: RouteContext) {
  app.post('/api/contact', formRateLimiter, async (req, res) => {
    try {
      const { name, phone, email, type, size, message } = req.body;

      if (!name || !phone || !email || !size) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Validate email format
      const emailValidation = validateEmail(email);
      if (!emailValidation.valid) {
        return res.status(400).json({ error: emailValidation.error });
      }

      // Validate phone format
      const phoneValidation = validatePhone(phone);
      if (!phoneValidation.valid) {
        return res.status(400).json({ error: phoneValidation.error });
      }

      const { data, error } = await supabase
        .from('contact_requests')
        .insert([{ name, phone, email, type, size, message }])
        .select('id')
        .single();

      if (error) {
        throw error;
      }

      return res.status(201).json({ success: true, id: data.id });
    } catch (error) {
      console.error('Failed to save contact request:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/check-availability', async (req, res) => {
    const { zip } = req.query as { zip: string };
    if (!zip || !/^\d{5}$/.test(zip)) {
      return res.status(400).json({ error: 'Invalid zip code' });
    }

    const { data: area } = await supabase
      .from('service_areas')
      .select('city')
      .eq('zip_code', zip)
      .eq('active', true)
      .maybeSingle();

    const isAvailable = !!area;

    supabase
      .from('availability_checks')
      .insert([{ zip_code: zip, available: isAvailable }])
      .then(({ error }) => {
        if (error) {
          console.error('Failed to log availability check:', error);
        }
      });

    if (area) {
      return res.json({ available: true, city: area.city, zip });
    }

    return res.json({ available: false, zip });
  });

  app.post('/api/bookings', formRateLimiter, async (req, res) => {
    try {
      const { name, phone, email, service, date, time_slot, zip_code } = req.body;
      if (!name || !phone || !service || !date || !time_slot) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Validate phone format
      const phoneValidation = validatePhone(phone);
      if (!phoneValidation.valid) {
        return res.status(400).json({ error: phoneValidation.error });
      }

      // Validate email format if provided
      if (email) {
        const emailValidation = validateEmail(email);
        if (!emailValidation.valid) {
          return res.status(400).json({ error: emailValidation.error });
        }
      }

      // Validate zip code if provided
      if (zip_code) {
        const zipValidation = validateZipCode(zip_code);
        if (!zipValidation.valid) {
          return res.status(400).json({ error: zipValidation.error });
        }
      }

      const { data, error } = await supabase
        .from('bookings')
        .insert([{ name, phone, email: email || null, service, date, time_slot, zip_code: zip_code || null }])
        .select('id')
        .single();

      if (error) {
        throw error;
      }

      sendBookingConfirmation({ name, phone, email, service, date, time_slot, zip_code })
        .catch((err: Error) => console.error('Email sending failed (booking still saved):', err.message));

      return res.status(201).json({ success: true, id: data.id });
    } catch (error) {
      console.error('Failed to save booking:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/bookings', async (_req, res) => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }

    return res.json(data);
  });

  // Public quote submission (saves to DB + sends email notification)
  app.post('/api/quotes', formRateLimiter, async (req, res) => {
    try {
      const { customer_name, email, phone, service, sqft, estimated_price, notes } = req.body;

      if (!customer_name || !service) {
        return res.status(400).json({ error: 'Name and service are required' });
      }

      // Validate email format if provided
      if (email) {
        const emailValidation = validateEmail(email);
        if (!emailValidation.valid) {
          return res.status(400).json({ error: emailValidation.error });
        }
      }

      // Validate phone format if provided
      if (phone) {
        const phoneValidation = validatePhone(phone);
        if (!phoneValidation.valid) {
          return res.status(400).json({ error: phoneValidation.error });
        }
      }

      const { data, error } = await supabase
        .from('quotes')
        .insert([{ customer_name, email, phone, service, sqft, estimated_price, notes }])
        .select('id')
        .single();

      if (error) {
        throw error;
      }

      // Send email notification (don't block on it)
      sendQuoteNotification({ customer_name, email, phone, service, sqft, estimated_price, notes })
        .catch((err: Error) => console.error('Email sending failed (quote still saved):', err.message));

      return res.status(201).json({ success: true, id: data.id });
    } catch (error) {
      console.error('Failed to save quote:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Public pricing rules (for quote calculator)
  app.get('/api/pricing', async (_req, res) => {
    try {
      const { data, error } = await supabase
        .from('pricing_rules')
        .select('name, base_price, per_sqft')
        .eq('status', 'active')
        .order('name');

      if (error) {
        throw error;
      }

      // Return pricing rules, or defaults if none exist
      if (data && data.length > 0) {
        return res.json(data);
      }

      // Default pricing if no rules configured
      return res.json([
        { name: 'Standard Cleaning', base_price: 100, per_sqft: 0.15 },
        { name: 'Deep Cleaning', base_price: 150, per_sqft: 0.20 },
        { name: 'Office Cleaning', base_price: 120, per_sqft: 0.12 },
        { name: 'Move In/Out Cleaning', base_price: 175, per_sqft: 0.25 }
      ]);
    } catch (error) {
      console.error('Failed to fetch pricing:', error);
      // Return defaults on error
      return res.json([
        { name: 'Standard Cleaning', base_price: 100, per_sqft: 0.15 },
        { name: 'Deep Cleaning', base_price: 150, per_sqft: 0.20 },
        { name: 'Office Cleaning', base_price: 120, per_sqft: 0.12 },
        { name: 'Move In/Out Cleaning', base_price: 175, per_sqft: 0.25 }
      ]);
    }
  });

  // Public endpoint for active service areas
  app.get('/api/public/service-areas', async (_req, res) => {
    try {
      const { data, error } = await supabase
        .from('service_areas')
        .select('zip_code, city')
        .eq('active', true)
        .order('city');

      if (error) {
        throw error;
      }

      // Filter out duplicate cities since multiple zip codes can map to the same city
      const uniqueCitiesMap = new Map();
      data?.forEach(area => {
        if (!uniqueCitiesMap.has(area.city)) {
          uniqueCitiesMap.set(area.city, area);
        }
      });
      
      const uniqueAreas = Array.from(uniqueCitiesMap.values());
      return res.json(uniqueAreas);
    } catch (error) {
      console.error('Failed to fetch public service areas:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
}
