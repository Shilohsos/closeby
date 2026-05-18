import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import listingsRouter from './routers/listings.js';
import storefrontsRouter from './routers/storefronts.js';
import hushRouter from './routers/hush.js';
import { errorHandler } from './middleware/errorHandler.js';

const app: Express = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Health
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routers
app.use('/api/listings', listingsRouter);
app.use('/api/storefronts', storefrontsRouter);
app.use('/api/hush', hushRouter);

// Error handler (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`📍 Close By API running on :${PORT}`);
});

export default app;
