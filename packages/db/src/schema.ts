import {
  pgTable,
  text,
  integer,
  timestamp,
  uuid,
  jsonb,
} from 'drizzle-orm/pg-core';

/* ─── Listings ─────────────────────────────────── */

export const listings = pgTable('listings', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  category: text('category', {
    enum: ['housing', 'jobs', 'services', 'food_restaurants', 'electronics', 'fashion', 'events'],
  }).notNull(),
  location: text('location').notNull(),
  price: integer('price').notNull(), // kobo (₦ × 100)
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/* ─── Storefronts ──────────────────────────────── */

export const storefronts = pgTable('storefronts', {
  userId: text('user_id').primaryKey(), // upsert pattern
  bio: text('bio'),
  avatarUrl: text('avatar_url'),
  phone: text('phone'),
  socialLinks: jsonb('social_links').default([]),
});

/* ─── Hush Events ──────────────────────────────── */

export const hushEvents = pgTable('hush_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizerId: text('organizer_id').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  flyerUrl: text('flyer_url'),
  paymentProofUrl: text('payment_proof_url'),
  bankName: text('bank_name').notNull(),
  accountNumber: text('account_number').notNull(),
  accountName: text('account_name').notNull(),
  ticketPrice: integer('ticket_price').notNull(), // kobo
  eventDate: timestamp('event_date').notNull(),
  location: text('location').notNull(),
  status: text('status', { enum: ['pending', 'approved'] }).default('pending').notNull(),
  adminToken: uuid('admin_token').defaultRandom().notNull(),
  capacity: integer('capacity').notNull(),
});

/* ─── Hush Tickets ─────────────────────────────── */

export const hushTickets = pgTable('hush_tickets', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventId: uuid('event_id').references(() => hushEvents.id).notNull(),
  buyerId: text('buyer_id').notNull(),
  buyerName: text('buyer_name').notNull(),
  referenceCode: text('reference_code').unique().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/* ─── Hush Fees ────────────────────────────────── */

export const hushFees = pgTable('hush_fees', {
  id: uuid('id').defaultRandom().primaryKey(),
  ticketId: uuid('ticket_id').references(() => hushTickets.id).notNull(),
  amount: integer('amount').notNull(), // kobo
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
