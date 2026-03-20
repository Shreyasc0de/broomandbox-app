import type { RouteContext } from '../types';
import { requireAuth } from '../middleware/auth.js';

export function registerAdminRoutes({ app, supabase, upload }: RouteContext) {
  // All admin routes require authentication
  const adminRouter = app;

  // Apply auth middleware to all admin-only routes
  adminRouter.get('/api/availability-checks', requireAuth, async (_req, res) => {
    try {
      const { data, error } = await supabase
        .from('availability_checks')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        throw error;
      }

      return res.json(data);
    } catch (error) {
      console.error('Failed to get availability checks:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/service-areas', requireAuth, async (_req, res) => {
    const { data, error } = await supabase
      .from('service_areas')
      .select('*')
      .order('city')
      .order('zip_code');

    if (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }

    return res.json(data);
  });

  app.post('/api/service-areas', requireAuth, async (req, res) => {
    try {
      const { zip_code, city } = req.body;
      if (!zip_code || !city || !/^\d{5}$/.test(zip_code)) {
        return res.status(400).json({ error: 'Valid zip_code and city are required' });
      }

      const { error } = await supabase
        .from('service_areas')
        .upsert([{ zip_code: zip_code.trim(), city: city.trim(), active: true }], { onConflict: 'zip_code', ignoreDuplicates: true });

      if (error) {
        throw error;
      }

      return res.status(201).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.patch('/api/service-areas/:id', requireAuth, async (req, res) => {
    const { id } = req.params;
    const { active } = req.body;

    const { error } = await supabase
      .from('service_areas')
      .update({ active: !!active })
      .eq('id', id);

    if (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }

    return res.json({ success: true });
  });

  app.delete('/api/service-areas/:id', requireAuth, async (req, res) => {
    const { error } = await supabase
      .from('service_areas')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }

    return res.json({ success: true });
  });

  app.get('/api/gallery-images', requireAuth, async (_req, res) => {
    const { data, error } = await supabase
      .from('gallery_images')
      .select('*')
      .order('position', { ascending: true });

    if (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }

    return res.json(data);
  });

  app.post('/api/gallery-images', requireAuth, upload.single('image'), async (req, res) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: 'Image is required' });
      }

      const timestamp = Date.now();
      const storagePath = `${timestamp}-${file.originalname.replace(/\s+/g, '-')}`;

      const { error: uploadErr } = await supabase.storage
        .from('gallery')
        .upload(storagePath, file.buffer, { contentType: file.mimetype, upsert: false });
      if (uploadErr) {
        throw uploadErr;
      }

      const imageUrl = supabase.storage.from('gallery').getPublicUrl(storagePath).data.publicUrl;
      const { count } = await supabase.from('gallery_images').select('*', { count: 'exact', head: true });

      const { data, error: dbErr } = await supabase
        .from('gallery_images')
        .insert([{ image_url: imageUrl, storage_path: storagePath, label: req.body.label || null, position: count ?? 0 }])
        .select('id')
        .single();
      if (dbErr) {
        throw dbErr;
      }

      return res.status(201).json({ success: true, id: data.id });
    } catch (error) {
      console.error('Failed to upload gallery image:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.delete('/api/gallery-images/:id', requireAuth, async (req, res) => {
    const { id } = req.params;
    try {
      const { data: row, error: fetchErr } = await supabase
        .from('gallery_images')
        .select('storage_path')
        .eq('id', id)
        .single();

      if (fetchErr) {
        // Non-fatal: image may already be deleted from storage
      }

      if (row) {
        const { error: storageErr } = await supabase.storage.from('gallery').remove([row.storage_path]);
        if (storageErr) {
          console.warn('Storage removal warning:', storageErr.message);
        }
      }

      const { error: deleteErr } = await supabase.from('gallery_images').delete().eq('id', id);
      if (deleteErr) {
        throw deleteErr;
      }

      return res.json({ success: true });
    } catch (error) {
      console.error('Failed to delete gallery image:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/transformations', requireAuth, async (_req, res) => {
    const { data, error } = await supabase
      .from('transformations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }

    return res.json(data);
  });

  app.post('/api/transformations', requireAuth, upload.fields([{ name: 'before', maxCount: 1 }, { name: 'after', maxCount: 1 }]), async (req, res) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const { label } = req.body;

      if (!files?.before?.[0] || !files?.after?.[0]) {
        return res.status(400).json({ error: 'Both before and after images are required' });
      }

      const timestamp = Date.now();
      const beforeFile = files.before[0];
      const beforePath = `${timestamp}-before.${beforeFile.originalname.split('.').pop()}`;
      const { error: beforeErr } = await supabase.storage
        .from('transformations')
        .upload(beforePath, beforeFile.buffer, { contentType: beforeFile.mimetype, upsert: false });
      if (beforeErr) {
        throw beforeErr;
      }

      const afterFile = files.after[0];
      const afterPath = `${timestamp}-after.${afterFile.originalname.split('.').pop()}`;
      const { error: afterErr } = await supabase.storage
        .from('transformations')
        .upload(afterPath, afterFile.buffer, { contentType: afterFile.mimetype, upsert: false });
      if (afterErr) {
        throw afterErr;
      }

      const beforeUrl = supabase.storage.from('transformations').getPublicUrl(beforePath).data.publicUrl;
      const afterUrl = supabase.storage.from('transformations').getPublicUrl(afterPath).data.publicUrl;

      const { data, error: dbErr } = await supabase
        .from('transformations')
        .insert([{ label: label || null, before_image_url: beforeUrl, after_image_url: afterUrl, before_path: beforePath, after_path: afterPath }])
        .select('id')
        .single();

      if (dbErr) {
        throw dbErr;
      }

      return res.status(201).json({ success: true, id: data.id });
    } catch (error) {
      console.error('Failed to create transformation:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.delete('/api/transformations/:id', requireAuth, async (req, res) => {
    const { id } = req.params;
    try {
      const { data: row, error: fetchErr } = await supabase
        .from('transformations')
        .select('before_path, after_path')
        .eq('id', id)
        .single();

      if (fetchErr) {
        // Non-fatal: record may already be deleted
      }

      if (row) {
        const { error: storageErr } = await supabase.storage.from('transformations').remove([row.before_path, row.after_path]);
        if (storageErr) {
          console.warn('Storage removal warning:', storageErr.message);
        }
      }

      const { error: deleteErr } = await supabase.from('transformations').delete().eq('id', id);
      if (deleteErr) {
        throw deleteErr;
      }

      return res.json({ success: true });
    } catch (error) {
      console.error('Failed to delete transformation:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/quotes', requireAuth, async (_req, res) => {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return res.json(data);
    } catch (error) {
      console.error('Failed to fetch quotes:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.patch('/api/quotes/:id', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const { error } = await supabase
        .from('quotes')
        .update({ status })
        .eq('id', id);

      if (error) {
        throw error;
      }

      return res.json({ success: true });
    } catch (error) {
      console.error('Failed to update quote status:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/staff', requireAuth, async (_req, res) => {
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .order('name');
      if (error) {
        throw error;
      }
      return res.json(data);
    } catch (error) {
      console.error('Failed to fetch staff:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/staff', requireAuth, async (req, res) => {
    try {
      const { name, email, phone, role } = req.body;
      if (!name || !email) {
        return res.status(400).json({ error: 'Name and email are required' });
      }

      const { data, error } = await supabase
        .from('staff')
        .insert([{ name, email, phone, role: role || 'Cleaner' }])
        .select()
        .single();
      if (error) {
        throw error;
      }
      return res.status(201).json(data);
    } catch (error) {
      console.error('Failed to create staff:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.delete('/api/staff/:id', requireAuth, async (req, res) => {
    try {
      const { error } = await supabase.from('staff').delete().eq('id', req.params.id);
      if (error) {
        throw error;
      }
      return res.json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/customers', requireAuth, async (_req, res) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name');
      if (error) {
        throw error;
      }
      return res.json(data);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/customers', requireAuth, async (req, res) => {
    try {
      const { name, email, phone, type } = req.body;
      if (!name || !email) {
        return res.status(400).json({ error: 'Name and email are required' });
      }

      const { data, error } = await supabase
        .from('customers')
        .insert([{ name, email, phone, type: type || 'Residential' }])
        .select()
        .single();
      if (error) {
        throw error;
      }
      return res.status(201).json(data);
    } catch (error) {
      console.error('Failed to create customer:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.delete('/api/customers/:id', requireAuth, async (req, res) => {
    try {
      const { error } = await supabase.from('customers').delete().eq('id', req.params.id);
      if (error) {
        throw error;
      }
      return res.json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get jobs for a specific customer
  app.get('/api/customers/:id/jobs', requireAuth, async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('id, service, date, status, price')
        .eq('customer_id', req.params.id)
        .order('date', { ascending: false });
      
      if (error) throw error;
      return res.json(data || []);
    } catch (error) {
      console.error('Error fetching customer jobs:', error);
      return res.json([]);
    }
  });

  app.get('/api/inventory', requireAuth, async (_req, res) => {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('name');
      if (error) {
        throw error;
      }
      return res.json(data);
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/inventory', requireAuth, async (req, res) => {
    try {
      const { name, category, stock, unit, min_stock } = req.body;
      const { data, error } = await supabase
        .from('inventory')
        .insert([{ name, category, stock: stock || 0, unit: unit || 'Units', min_stock: min_stock || 10 }])
        .select()
        .single();
      if (error) {
        throw error;
      }
      return res.status(201).json(data);
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.delete('/api/inventory/:id', requireAuth, async (req, res) => {
    try {
      const { error } = await supabase.from('inventory').delete().eq('id', req.params.id);
      if (error) {
        throw error;
      }
      return res.json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/jobs', requireAuth, async (req, res) => {
    try {
      const { date, startDate, endDate } = req.query as { date?: string; startDate?: string; endDate?: string };
      let query = supabase.from('jobs').select('*');
      
      if (startDate && endDate) {
        // Date range query for week/month views
        query = query.gte('date', startDate).lte('date', endDate);
      } else if (date) {
        query = query.eq('date', date);
      }
      
      const { data, error } = await query.order('date', { ascending: true }).order('time', { ascending: true });
      if (error) {
        throw error;
      }
      return res.json(data);
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/jobs', requireAuth, async (req, res) => {
    try {
      const { customer_name, service, date, time, staff_name, location, price, status } = req.body;
      const { data, error } = await supabase
        .from('jobs')
        .insert([{ customer_name, service, date, time, staff_name, location, price, status: status || 'Scheduled' }])
        .select()
        .single();
      if (error) {
        console.error('Error creating job:', error);
        return res.status(500).json({ error: error.message || 'Database error' });
      }
      return res.status(201).json(data);
    } catch (error) {
      console.error('Error creating job:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Update job (for assignment, status changes, etc.)
  app.put('/api/jobs/:id', requireAuth, async (req, res) => {
    try {
      const { customer_name, service, date, time, staff_name, location, price, status } = req.body;
      const { data, error } = await supabase
        .from('jobs')
        .update({ customer_name, service, date, time, staff_name, location, price, status })
        .eq('id', req.params.id)
        .select()
        .single();
      if (error) {
        throw error;
      }
      return res.json(data);
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Assign job to staff
  app.patch('/api/jobs/:id/assign', requireAuth, async (req, res) => {
    try {
      const { staff_name } = req.body;
      const { data, error } = await supabase
        .from('jobs')
        .update({ staff_name })
        .eq('id', req.params.id)
        .select()
        .single();
      if (error) {
        throw error;
      }
      return res.json(data);
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Auto-assign jobs to staff
  app.post('/api/jobs/auto-assign', requireAuth, async (req, res) => {
    try {
      const { date } = req.body;
      
      // Get unassigned jobs for the date
      const { data: unassignedJobs, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
        .eq('date', date)
        .is('staff_name', null)
        .order('time', { ascending: true });
      
      if (jobsError) throw jobsError;
      
      // Get active staff
      const { data: staff, error: staffError } = await supabase
        .from('staff')
        .select('*')
        .order('name');
      
      if (staffError) throw staffError;
      
      if (!staff || staff.length === 0 || !unassignedJobs || unassignedJobs.length === 0) {
        return res.json({ assigned: 0, message: 'No jobs to assign or no staff available' });
      }
      
      // Simple round-robin assignment
      const assignments = [];
      for (let i = 0; i < unassignedJobs.length; i++) {
        const job = unassignedJobs[i];
        const staffMember = staff[i % staff.length];
        
        const { error } = await supabase
          .from('jobs')
          .update({ staff_name: staffMember.name })
          .eq('id', job.id);
        
        if (!error) {
          assignments.push({ jobId: job.id, staffName: staffMember.name });
        }
      }
      
      return res.json({ assigned: assignments.length, assignments });
    } catch (error) {
      console.error('Auto-assign error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.delete('/api/jobs/:id', requireAuth, async (req, res) => {
    try {
      const { error } = await supabase.from('jobs').delete().eq('id', req.params.id);
      if (error) {
        throw error;
      }
      return res.json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/stats', requireAuth, async (_req, res) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();
      
      const lastWeekStart = new Date(today);
      lastWeekStart.setDate(lastWeekStart.getDate() - 7);
      const lastWeekEnd = new Date(today);
      lastWeekEnd.setDate(lastWeekEnd.getDate() - 1);
      
      const twoWeeksAgo = new Date(lastWeekStart);
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 7);
      
      // Today's jobs
      const { count: todayJobsCount } = await supabase.from('jobs')
        .select('*', { count: 'exact', head: true })
        .gte('date', todayISO.split('T')[0]);
      
      // This week's jobs
      const { data: thisWeekJobs } = await supabase.from('jobs')
        .select('price')
        .gte('date', lastWeekStart.toISOString().split('T')[0])
        .lte('date', todayISO.split('T')[0]);
      
      // Last week's jobs
      const { data: lastWeekJobs } = await supabase.from('jobs')
        .select('price')
        .gte('date', twoWeeksAgo.toISOString().split('T')[0])
        .lt('date', lastWeekStart.toISOString().split('T')[0]);
      
      const thisWeekRevenue = (thisWeekJobs || []).reduce((sum, j) => sum + (j.price || 0), 0);
      const lastWeekRevenue = (lastWeekJobs || []).reduce((sum, j) => sum + (j.price || 0), 0);
      
      // Calculate revenue trend
      let revenueTrend = '0%';
      if (lastWeekRevenue > 0) {
        const diff = ((thisWeekRevenue - lastWeekRevenue) / lastWeekRevenue * 100).toFixed(0);
        revenueTrend = `${parseInt(diff) >= 0 ? '+' : ''}${diff}%`;
      } else if (thisWeekRevenue > 0) {
        revenueTrend = '+100%';
      }
      
      // Jobs trend
      const thisWeekJobsTotal = (thisWeekJobs || []).length;
      const lastWeekJobsTotal = (lastWeekJobs || []).length;
      let jobsTrend = '0%';
      if (lastWeekJobsTotal > 0) {
        const diff = ((thisWeekJobsTotal - lastWeekJobsTotal) / lastWeekJobsTotal * 100).toFixed(0);
        jobsTrend = `${parseInt(diff) >= 0 ? '+' : ''}${diff}%`;
      } else if (thisWeekJobsTotal > 0) {
        jobsTrend = '+100%';
      }
      
      // Active staff
      const { count: activeStaff } = await supabase.from('staff')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'On Shift');
      const { count: totalStaff } = await supabase.from('staff')
        .select('*', { count: 'exact', head: true });
      const staffTrend = totalStaff ? `${activeStaff || 0}/${totalStaff}` : '0';
      
      // Alerts - expiring compliance docs
      const thirtyDaysFromNow = new Date(today);
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      const { count: alerts } = await supabase.from('compliance_documents')
        .select('*', { count: 'exact', head: true })
        .lte('expiry_date', thirtyDaysFromNow.toISOString().split('T')[0]);

      return res.json({
        todayJobs: todayJobsCount || 0,
        revenue: thisWeekRevenue,
        activeStaff: activeStaff || 0,
        alerts: alerts || 0,
        trends: {
          jobs: jobsTrend,
          revenue: revenueTrend,
          staff: staffTrend,
          alerts: (alerts || 0) > 0 ? `${alerts}` : '0'
        }
      });
    } catch (e) {
      console.error('Stats error:', e);
      return res.json({ todayJobs: 0, revenue: 0, activeStaff: 0, alerts: 0, trends: { jobs: '0%', revenue: '0%', staff: '0', alerts: '0' } });
    }
  });

  // Analytics - Monthly revenue and customer data
  app.get('/api/analytics', requireAuth, async (req, res) => {
    try {
      const months = parseInt(req.query.months as string) || 6;
      const now = new Date();
      const monthsAgo = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);

      // Get jobs with prices for revenue calculation
      const { data: jobs } = await supabase
        .from('jobs')
        .select('price, date, created_at')
        .gte('created_at', monthsAgo.toISOString());

      // Get customers for new customer count
      const { data: customers } = await supabase
        .from('customers')
        .select('created_at')
        .gte('created_at', monthsAgo.toISOString());

      // Aggregate by month
      const monthlyData: { [key: string]: { revenue: number; customers: number } } = {};

      // Initialize all months
      for (let i = 0; i < months; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - months + 1 + i, 1);
        const key = d.toLocaleDateString('en-US', { month: 'short' });
        monthlyData[key] = { revenue: 0, customers: 0 };
      }

      // Sum revenue by month
      (jobs || []).forEach(job => {
        const date = new Date(job.created_at || job.date);
        const key = date.toLocaleDateString('en-US', { month: 'short' });
        if (monthlyData[key]) {
          monthlyData[key].revenue += job.price || 0;
        }
      });

      // Count customers by month
      (customers || []).forEach(customer => {
        const date = new Date(customer.created_at);
        const key = date.toLocaleDateString('en-US', { month: 'short' });
        if (monthlyData[key]) {
          monthlyData[key].customers += 1;
        }
      });

      // Convert to array format for charts
      const chartData = Object.entries(monthlyData).map(([name, data]) => ({
        name,
        revenue: data.revenue,
        customers: data.customers,
      }));

      // Calculate totals and trends
      const totalRevenue = chartData.reduce((sum, d) => sum + d.revenue, 0);
      const totalCustomers = chartData.reduce((sum, d) => sum + d.customers, 0);

      return res.json({
        chartData,
        totals: {
          revenue: totalRevenue,
          customers: totalCustomers,
        },
      });
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/settings/pricing', requireAuth, async (_req, res) => {
    try {
      const { data, error } = await supabase.from('pricing_rules').select('*').order('created_at', { ascending: true });
      if (error) {
        console.error('Database error fetching pricing:', error);
        throw error;
      }
      return res.json(data);
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/settings/pricing', requireAuth, async (req, res) => {
    try {
      const { name, base_price, per_sqft } = req.body;
      const { data, error } = await supabase.from('pricing_rules').insert([{ name, base_price, per_sqft }]).select().single();
      if (error) {
        console.error('Database error creating pricing rule:', error);
        throw error;
      }
      return res.status(201).json(data);
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.put('/api/settings/pricing/:id', requireAuth, async (req, res) => {
    try {
      const { name, base_price, per_sqft, status } = req.body;
      const { data, error } = await supabase
        .from('pricing_rules')
        .update({ name, base_price, per_sqft, status })
        .eq('id', req.params.id)
        .select()
        .single();
      if (error) {
        throw error;
      }
      return res.json(data);
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.delete('/api/settings/pricing/:id', requireAuth, async (req, res) => {
    try {
      const { error } = await supabase.from('pricing_rules').delete().eq('id', req.params.id);
      if (error) {
        throw error;
      }
      return res.json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/settings/system', requireAuth, async (_req, res) => {
    try {
      const { data, error } = await supabase.from('site_settings').select('*').eq('id', 'global').maybeSingle();
      if (error) {
        console.error('Database error fetching system settings:', error);
        throw error;
      }
      return res.json(data || { geofence_radius: 200 });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.patch('/api/settings/system', requireAuth, async (req, res) => {
    try {
      const { geofence_radius } = req.body;
      const { data, error } = await supabase
        .from('site_settings')
        .upsert({ id: 'global', geofence_radius, updated_at: new Date() })
        .select()
        .single();
      if (error) {
        console.error('Database error updating system settings:', error);
        throw error;
      }
      return res.json(data);
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Compliance documents endpoints
  app.get('/api/compliance/documents', requireAuth, async (_req, res) => {
    try {
      const { data, error } = await supabase
        .from('compliance_documents')
        .select('*')
        .order('expiry_date', { ascending: true });
      if (error) {
        throw error;
      }
      return res.json(data);
    } catch (error) {
      console.error('Failed to fetch compliance documents:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/compliance/stats', requireAuth, async (_req, res) => {
    try {
      const now = new Date().toISOString().split('T')[0];
      const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const { data: docs, error } = await supabase
        .from('compliance_documents')
        .select('*');

      if (error) {
        throw error;
      }

      const active = (docs || []).filter(d => d.status === 'Active' && (!d.expiry_date || d.expiry_date >= now)).length;
      const expiringSoon = (docs || []).filter(d => d.expiry_date && d.expiry_date >= now && d.expiry_date <= thirtyDaysFromNow).length;
      const expired = (docs || []).filter(d => d.expiry_date && d.expiry_date < now).length;
      const total = (docs || []).length;
      const complianceScore = total > 0 ? Math.round(((total - expired) / total) * 100) : 100;

      return res.json({
        active,
        expiringSoon,
        expired,
        complianceScore
      });
    } catch (error) {
      console.error('Failed to fetch compliance stats:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/compliance/documents', requireAuth, upload.single('file'), async (req, res) => {
    try {
      const { name, type, provider, expiry_date, notes } = req.body;

      if (!name || !type) {
        return res.status(400).json({ error: 'Name and type are required' });
      }

      let fileUrl = null;
      let storagePath = null;

      if (req.file) {
        const timestamp = Date.now();
        storagePath = `compliance/${timestamp}-${req.file.originalname.replace(/\s+/g, '-')}`;

        const { error: uploadErr } = await supabase.storage
          .from('documents')
          .upload(storagePath, req.file.buffer, { contentType: req.file.mimetype, upsert: false });

        if (uploadErr) {
          console.error('File upload failed:', uploadErr);
          // Continue without file if upload fails
        } else {
          fileUrl = supabase.storage.from('documents').getPublicUrl(storagePath).data.publicUrl;
        }
      }

      const { data, error } = await supabase
        .from('compliance_documents')
        .insert([{
          name,
          type,
          provider: provider || null,
          expiry_date: expiry_date || null,
          notes: notes || null,
          file_url: fileUrl,
          storage_path: storagePath,
          status: 'Active'
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return res.status(201).json(data);
    } catch (error) {
      console.error('Failed to create compliance document:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.patch('/api/compliance/documents/:id', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { name, type, provider, status, expiry_date, notes } = req.body;

      const { data, error } = await supabase
        .from('compliance_documents')
        .update({
          name,
          type,
          provider,
          status,
          expiry_date,
          notes,
          updated_at: new Date()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return res.json(data);
    } catch (error) {
      console.error('Failed to update compliance document:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.delete('/api/compliance/documents/:id', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;

      // Get storage path first
      const { data: doc, error: fetchErr } = await supabase
        .from('compliance_documents')
        .select('storage_path')
        .eq('id', id)
        .single();

      if (fetchErr) {
        console.error('Failed to fetch document for deletion:', fetchErr);
      }

      // Delete from storage if exists
      if (doc?.storage_path) {
        await supabase.storage.from('documents').remove([doc.storage_path]);
      }

      // Delete from DB
      const { error } = await supabase
        .from('compliance_documents')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      return res.json({ success: true });
    } catch (error) {
      console.error('Failed to delete compliance document:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SERVICE CONTENT MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  // Get all service content
  app.get('/api/service-content', requireAuth, async (_req, res) => {
    try {
      const { data, error } = await supabase
        .from('service_content')
        .select('*')
        .order('title');

      if (error) throw error;
      return res.json(data || []);
    } catch (error) {
      console.error('Failed to fetch service content:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get single service content (public - for service pages)
  app.get('/api/service-content/:id', async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('service_content')
        .select('*')
        .eq('id', req.params.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return res.json(data || null);
    } catch (error) {
      console.error('Failed to fetch service content:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Update service content (text fields)
  app.patch('/api/service-content/:id', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, checklist } = req.body;

      const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (title !== undefined) updates.title = title;
      if (description !== undefined) updates.description = description;
      if (checklist !== undefined) updates.checklist = checklist;

      const { error } = await supabase
        .from('service_content')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      return res.json({ success: true });
    } catch (error) {
      console.error('Failed to update service content:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Upload service image
  app.post('/api/service-content/:id/image', requireAuth, upload.single('image'), async (req, res) => {
    try {
      const { id } = req.params;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: 'Image is required' });
      }

      // Get existing record to delete old image if exists
      const { data: existing } = await supabase
        .from('service_content')
        .select('storage_path')
        .eq('id', id)
        .single();

      // Delete old image from storage
      if (existing?.storage_path) {
        await supabase.storage.from('services').remove([existing.storage_path]);
      }

      // Upload new image
      const timestamp = Date.now();
      const ext = file.originalname.split('.').pop();
      const storagePath = `${id}-${timestamp}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from('services')
        .upload(storagePath, file.buffer, { contentType: file.mimetype, upsert: true });

      if (uploadErr) throw uploadErr;

      const imageUrl = supabase.storage.from('services').getPublicUrl(storagePath).data.publicUrl;

      // Update service content record
      const { error: dbErr } = await supabase
        .from('service_content')
        .update({ 
          image_url: imageUrl, 
          storage_path: storagePath,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (dbErr) throw dbErr;

      return res.json({ success: true, image_url: imageUrl });
    } catch (error) {
      console.error('Failed to upload service image:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Create new service content
  app.post('/api/service-content', requireAuth, async (req, res) => {
    try {
      const { id, title, description, checklist } = req.body;

      if (!id || !title) {
        return res.status(400).json({ error: 'ID and title are required' });
      }

      const { data, error } = await supabase
        .from('service_content')
        .insert([{ 
          id, 
          title, 
          description: description || '', 
          checklist: checklist || [],
          image_url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800'
        }])
        .select()
        .single();

      if (error) throw error;
      return res.status(201).json(data);
    } catch (error) {
      console.error('Failed to create service content:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Delete service content
  app.delete('/api/service-content/:id', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;

      // Get storage path to delete image
      const { data: existing } = await supabase
        .from('service_content')
        .select('storage_path')
        .eq('id', id)
        .single();

      if (existing?.storage_path) {
        await supabase.storage.from('services').remove([existing.storage_path]);
      }

      const { error } = await supabase
        .from('service_content')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return res.json({ success: true });
    } catch (error) {
      console.error('Failed to delete service content:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
}
