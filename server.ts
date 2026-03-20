import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
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

async function startServer() {
  const app = express();
  const port = 3000;

  app.use(express.json());

  // CORS configuration - restrict to allowed origins
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.) in development
      if (!origin && process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      if (!origin || allowedOrigins.includes(origin)) {
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

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

startServer();
