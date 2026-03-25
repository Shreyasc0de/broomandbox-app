import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

import supabase from './src/db/index.js';
import { sendBookingConfirmation, sendQuoteNotification } from './src/services/emailService.js';
import { registerAdminRoutes } from './src/server/routes/admin.js';
import { registerAuthRoutes } from './src/server/routes/auth.js';
import { registerChatRoutes } from './src/server/routes/chat.js';
import { registerPublicRoutes } from './src/server/routes/public.js';
import rateLimit from 'express-rate-limit';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json());

// CORS configuration - restrict to allowed origins
const envOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim().replace(/^"|"$/g, '')) || [];
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? envOrigins 
  : [...envOrigins, 'http://localhost:3000', 'http://127.0.0.1:3000', 'https://brooomandbox.com'];
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (direct navigation, static assets, server-to-server)
    if (!origin) {
      return callback(null, true);
    }
    // Allow any Vercel preview environments temporarily if scaling, otherwise strict
    if (origin.includes('vercel.app') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Global rate limiting - 100 requests per 15 minutes per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

const routeContext = {
  app,
  supabase,
  upload,
  sendBookingConfirmation,
  sendQuoteNotification,
};

// Register routes in order: auth first, then public, then admin
registerAuthRoutes(app);
registerPublicRoutes(routeContext);
registerAdminRoutes(routeContext);
registerChatRoutes(routeContext);

// Export for Vercel Serverless Functions
export default app;

// Local Development Server & Manual Production Server (Skipped on Vercel)
if (!process.env.VERCEL) {
  if (process.env.NODE_ENV !== 'production') {
    (async () => {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
      app.listen(port, '0.0.0.0', () => {
        console.log(`Local Dev Server running on http://localhost:${port}`);
      });
    })();
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
    app.listen(port, '0.0.0.0', () => {
      console.log(`Production Build Server running on http://localhost:${port}`);
    });
  }
}
