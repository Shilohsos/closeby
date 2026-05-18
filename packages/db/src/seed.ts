import { db } from './db.js';
import {
  listings,
  storefronts,
  hushEvents,
} from './schema.js';

async function seed() {
  console.log('🌱 Seeding database...');

  // Storefronts
  await db.insert(storefronts).values([
    {
      userId: 'seed-user-1',
      bio: 'UNILAG student selling gadgets',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
      phone: '08012345678',
      socialLinks: ['@seeduser1'],
    },
    {
      userId: 'seed-user-2',
      bio: 'OAU graduate — fashion and accessories',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
      phone: '08087654321',
      socialLinks: ['@seeduser2'],
    },
  ]);

  // Listings
  await db.insert(listings).values([
    {
      userId: 'seed-user-1',
      title: '2-Bedroom Flat near UNILAG',
      description: 'Furnished 2-bedroom flat in Akoka, 5min walk to UNILAG main gate. Rent: ₦150,000/year.',
      category: 'housing',
      location: 'University of Lagos',
      price: 15000000, // ₦150,000 in kobo
      imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2',
    },
    {
      userId: 'seed-user-1',
      title: 'MacBook Pro 2023 — Lightly Used',
      description: 'M2 Pro, 16GB RAM, 512GB SSD. Selling because I upgraded. Used for 6 months.',
      category: 'electronics',
      location: 'University of Lagos',
      price: 85000000, // ₦850,000
      imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8',
    },
    {
      userId: 'seed-user-2',
      title: 'Campus Fashion — Custom Aso Ebi',
      description: 'Tailor-made Aso Ebi for any occasion. 3-day turnaround. UNN campus delivery.',
      category: 'fashion',
      location: 'University of Nigeria Nsukka',
      price: 2500000, // ₦25,000
      imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5',
    },
    {
      userId: 'seed-user-1',
      title: 'Math & Physics Tutoring',
      description: '100 Level to 300 Level. Online or in-person at UNILAG. ₦2,000/hour.',
      category: 'services',
      location: 'University of Lagos',
      price: 200000, // ₦2,000
      imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173',
    },
    {
      userId: 'seed-user-2',
      title: 'Part-time Barista Needed',
      description: 'Coffee shop near OAU campus. Weekends only. ₦50,000/month.',
      category: 'jobs',
      location: 'Obafemi Awolowo University',
      price: 5000000, // ₦50,000
      imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb',
    },
  ]);

  // Hush Events
  await db.insert(hushEvents).values([
    {
      organizerId: 'seed-org-1',
      title: 'Campus Fest 2026',
      description: 'The biggest campus party of the year! Live bands, DJ sets, food vendors.',
      flyerUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30',
      paymentProofUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c',
      bankName: 'Fidelity Bank',
      accountNumber: '6312425396',
      accountName: 'Close By Events',
      ticketPrice: 500000, // ₦5,000
      eventDate: new Date('2026-06-15T18:00:00+01:00'),
      location: 'University of Lagos Sports Centre',
      status: 'approved',
      capacity: 500,
    },
    {
      organizerId: 'seed-org-2',
      title: 'Tech Meetup — AI for Undergrads',
      description: 'Workshop on AI/ML for Nigerian students. Bring your laptop.',
      flyerUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4',
      paymentProofUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c',
      bankName: 'Fidelity Bank',
      accountNumber: '6312425396',
      accountName: 'Close By Events',
      ticketPrice: 200000, // ₦2,000
      eventDate: new Date('2026-07-01T10:00:00+01:00'),
      location: 'OAU Conference Hall',
      status: 'pending',
      capacity: 200,
    },
  ]);

  console.log('✅ Seed complete — 5 listings, 2 storefronts, 2 events');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
