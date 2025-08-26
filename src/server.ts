import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import express, { Express, Request, Response } from 'express';
import connectDB from './config/dbConn';
import corsOptions from './config/corsOptions';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import errorHandler from './middleware/errorHandler';
import credentials from './middleware/credentials';
import verifyJWT from './middleware/verifyJWT';
import { logEvents, logger } from './middleware/logEvents';

dotenv.config();

const app: Express = express();
const PORT: number = parseInt(process.env.PORT || '3500', 10);

/** Trust the first proxy hop (Cloudflare Tunnel / Nginx, etc.) */
const TRUST_PROXY = process.env.TRUST_PROXY ? Number(process.env.TRUST_PROXY) : 1;
app.set('trust proxy', TRUST_PROXY);

// Connect to mongo DB
connectDB();

// ── Global middleware (order matters) ───────────────────────────────────────────
app.use(logger);

// Must run BEFORE cors(); decides if we allow credentialed requests
app.use(credentials);

// CORS (reads allowed origins from env; credentials enabled inside options)
app.use(cors(corsOptions));

// Body parsers
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Cookies (for httpOnly refresh token)
app.use(cookieParser());

// Static assets (adjust path to where your built public files live)
app.use('/', express.static(path.join(__dirname, '../public')));

// ── Public routes (no auth) ────────────────────────────────────────────────────
app.use('/', require('./routes/root'));
app.use('/auth', require('./routes/auth'));
app.use('/products', require('./routes/api/products'));
app.use('/posts', require('./routes/api/posts'));
app.use('/categories', require('./routes/api/categories'));

// ── Protected routes (JWT required) ────────────────────────────────────────────
app.use(verifyJWT);
app.use('/users', require('./routes/api/users'));
app.use('/orders', require('./routes/api/orders'));

// 404 fallback
app.all('/*', (req: Request, res: Response) => {
  res.status(404);
  if (req.accepts('html')) {
    // Ensure this file exists in the built output; copy it during build if needed
    res.sendFile(path.join(__dirname, 'views', '404.html'));
  } else if (req.accepts('json')) {
    res.json({ error: '404 Not Found' });
  } else {
    res.type('txt').send('404 Not Found');
  }
});

// Global error handler (keep LAST)
app.use(errorHandler);

// ── Startup / DB events ────────────────────────────────────────────────────────
mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
  app.listen(PORT, '0.0.0.0', () => console.log(`Server is running at http://localhost:${PORT}`));
});

mongoose.connection.on('error', (err: any) => {
  console.error(err);
  logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname ?? ''}`, 'mongoErrLog.log');
});
