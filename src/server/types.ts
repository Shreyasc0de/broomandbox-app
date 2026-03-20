import type { Express } from 'express';
import type { Multer } from 'multer';
import type { SupabaseClient } from '@supabase/supabase-js';

import type { BookingDetails, QuoteDetails } from '../services/emailService';

export interface RouteContext {
  app: Express;
  supabase: SupabaseClient;
  upload: Multer;
  sendBookingConfirmation: (booking: BookingDetails) => Promise<void>;
  sendQuoteNotification: (quote: QuoteDetails) => Promise<boolean>;
}
