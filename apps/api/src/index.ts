import 'dotenv/config';
import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import { count, sql } from 'drizzle-orm';
import { db } from './lib/db.js';
import { listings } from '@closeby/db';
import listingsRouter from './routers/listings.js';
import storefrontsRouter from './routers/storefronts.js';
import hushRouter from './routers/hush.js';
import { errorHandler } from './middleware/errorHandler.js';

const app: Express = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/stats', async (_req, res) => {
  const [listingsResult, sellersResult, locationsResult] = await Promise.all([
    db.select({ total: count() }).from(listings),
    db.select({ total: sql<number>`count(distinct ${listings.userId})` }).from(listings),
    db.select({ total: sql<number>`count(distinct ${listings.location})` }).from(listings),
  ]);
  res.json({
    totalListings: Number(listingsResult[0].total),
    activeSellers: Number(sellersResult[0].total),
    supportedLocations: Number(locationsResult[0].total),
  });
});

app.use('/api/listings', listingsRouter);
app.use('/api/storefronts', storefrontsRouter);
app.use('/api/hush', hushRouter);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webDist = path.resolve(__dirname, '../../web/dist');
app.use(express.static(webDist));

app.get('*', (_req, res) => {
  res.sendFile(path.join(webDist, 'index.html'));
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`📍 Close By API running on :${PORT}`);
});

export default app;
