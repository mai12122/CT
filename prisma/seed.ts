import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Clean existing records in dependency order
  await prisma.ticket.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.reservationSession.deleteMany({});
  await prisma.ticketCategory.deleteMany({});
  await prisma.concert.deleteMany({});
  await prisma.refreshToken.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Create Demo Users
  const salt = await bcrypt.genSalt(10);
  const userPassword = await bcrypt.hash('password123', salt);
  const adminPassword = await bcrypt.hash('admin123', salt);

  const demoUser = await prisma.user.create({
    data: {
      name: 'Alex Rivera',
      email: 'user@example.com',
      password: userPassword,
      phone: '+1 555 234 5678',
      role: Role.USER,
    },
  });

  await prisma.user.create({
    data: {
      name: 'Admin ConcertOps',
      email: 'admin@example.com',
      password: adminPassword,
      phone: '+1 555 987 6543',
      role: Role.ADMIN,
    },
  });

  console.log('✅ Created demo users: user@example.com / admin@example.com');

  // 3. Seed Concerts with Categories
  const concertsData = [
    {
      title: 'The Eras Stadium Experience',
      artist: 'Taylor Swift',
      description:
        'A once-in-a-generation 3-hour journey through all musical eras with breathtaking stages, pyrotechnics, and surprise acoustic performances.',
      venue: 'SoFi Stadium',
      city: 'Los Angeles, CA',
      date: new Date('2026-11-14T19:30:00Z'),
      imageUrl: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1000&q=80',
      featured: true,
      categories: [
        {
          name: 'Fanpit',
          price: 450,
          description: 'Right in front of diamond stage catwalk. Unmatched view & energy.',
          color: '#ec4899', // Pink
          perks: JSON.stringify([
            'Front Row Catwalk Access',
            'Commemorative VIP Tour Laminate',
            'Priority Early Venue Entry (4:30 PM)',
            'Exclusive Merch Bag & Collector Pin',
          ]),
          totalCapacity: 60,
          soldCount: 8,
        },
        {
          name: 'Platinum',
          price: 320,
          description: 'Lower Bowl Level 1 premium center stage seating with lounge privileges.',
          color: '#8b5cf6', // Purple
          perks: JSON.stringify([
            'Lower Bowl Center Rows 1-12',
            'Private VIP Concourse & Bar',
            'Padded Premium Club Seats',
            'Dedicated Restrooms',
          ]),
          totalCapacity: 120,
          soldCount: 24,
        },
        {
          name: 'Gold',
          price: 195,
          description: 'Mid Bowl unobstructed elevation with pristine acoustics.',
          color: '#eab308', // Gold/Amber
          perks: JSON.stringify([
            'Elevated Mid-Tier Seating',
            'Direct Line-of-Sight to Stage',
            'Fast-Track Concession Lanes',
          ]),
          totalCapacity: 200,
          soldCount: 45,
        },
        {
          name: 'Silver',
          price: 95,
          description: 'Full panoramic stadium view with crystal clear acoustic projection.',
          color: '#94a3b8', // Silver
          perks: JSON.stringify([
            'Upper Stadium Tier Seating',
            'Panoramic Lightshow View',
            'Full Digital Audio Delay Towers',
          ]),
          totalCapacity: 350,
          soldCount: 60,
        },
      ],
    },
    {
      title: 'Music of the Spheres Tour',
      artist: 'Coldplay',
      description:
        'A kinetic, eco-powered stadium spectacle featuring LED wristbands, kinetic dance floors, cosmic visuals, and greatest hits.',
      venue: 'Wembley Stadium',
      city: 'London, UK',
      date: new Date('2026-10-25T18:00:00Z'),
      imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1000&q=80',
      featured: true,
      categories: [
        {
          name: 'Fanpit',
          price: 380,
          description: 'Circular main stage pit standing directly next to Chris Martin & band.',
          color: '#ec4899',
          perks: JSON.stringify([
            'Direct Circular Pit Access',
            'Interactive Sync Wristband Upgrade',
            'Early Entry 1 Hour Before Gates',
            'Eco-friendly Tour Bag',
          ]),
          totalCapacity: 50,
          soldCount: 12,
        },
        {
          name: 'Platinum',
          price: 275,
          description: 'Club Wembley prime seating with access to premium dining & bars.',
          color: '#8b5cf6',
          perks: JSON.stringify([
            'Club Wembley Level 2 Access',
            'Complimentary Welcome Drink',
            'Padded Stadium Seats',
          ]),
          totalCapacity: 100,
          soldCount: 18,
        },
        {
          name: 'Gold',
          price: 170,
          description: 'Tier 1 sideline seating facing stage center.',
          color: '#eab308',
          perks: JSON.stringify([
            'Tier 1 Central Sideline',
            'Synchronized Wristband Included',
            'Great Direct View',
          ]),
          totalCapacity: 180,
          soldCount: 30,
        },
        {
          name: 'Silver',
          price: 85,
          description: 'Upper tier seating with immersive stadium light canopy perspective.',
          color: '#94a3b8',
          perks: JSON.stringify([
            'Upper Concourse Seating',
            'Complete Arena Light Show View',
          ]),
          totalCapacity: 300,
          soldCount: 50,
        },
      ],
    },
    {
      title: 'Hit Me Hard and Soft Tour',
      artist: 'Billie Eilish',
      description:
        'An intimate yet thunderous 360-degree in-the-round arena experience showcasing raw vocals and heavy bass.',
      venue: 'Madison Square Garden',
      city: 'New York, NY',
      date: new Date('2026-12-05T20:00:00Z'),
      imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80',
      featured: true,
      categories: [
        {
          name: 'Fanpit',
          price: 420,
          description: 'Floor standing 360° ring around the central rotating stage.',
          color: '#ec4899',
          perks: JSON.stringify([
            '360-Degree Stage Surround',
            'Exclusive Tour Hoodie',
            'First Admittance Floor Priority',
          ]),
          totalCapacity: 40,
          soldCount: 5,
        },
        {
          name: 'Platinum',
          price: 295,
          description: 'MSG Lower Bowl 100-Level centerline seats.',
          color: '#8b5cf6',
          perks: JSON.stringify([
            '100-Level Club Seats',
            'Chase Bridge Lounge Access',
            'In-seat Ordering Service',
          ]),
          totalCapacity: 80,
          soldCount: 15,
        },
        {
          name: 'Gold',
          price: 180,
          description: '200-Level prime angle reserved seating.',
          color: '#eab308',
          perks: JSON.stringify([
            '200-Level Center View',
            'Souvenir Event Ticket',
          ]),
          totalCapacity: 150,
          soldCount: 22,
        },
        {
          name: 'Silver',
          price: 90,
          description: 'Upper arena seating with full stage production view.',
          color: '#94a3b8',
          perks: JSON.stringify([
            'Upper Level Standard Seating',
            'Acoustic Surround Sound',
          ]),
          totalCapacity: 250,
          soldCount: 40,
        },
      ],
    },
    {
      title: 'After Hours Til Dawn Stadium Tour',
      artist: 'The Weeknd',
      description:
        'A cinematic cyberpunk post-apocalyptic stage production with giant moon prop, futuristic skyline, and synth-wave anthems.',
      venue: 'Mercedes-Benz Stadium',
      city: 'Atlanta, GA',
      date: new Date('2026-11-28T19:00:00Z'),
      imageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=1000&q=80',
      featured: false,
      categories: [
        {
          name: 'Fanpit',
          price: 390,
          description: 'City Skyline Runway Floor standing right under the crimson moon.',
          color: '#ec4899',
          perks: JSON.stringify([
            'Runway Floor Standing',
            'Chrome Mask Collector Item',
            'Priority Fast Lane Entry',
          ]),
          totalCapacity: 45,
          soldCount: 10,
        },
        {
          name: 'Platinum',
          price: 280,
          description: 'Lower Bowl 100 level seating with prime sightlines to moon installation.',
          color: '#8b5cf6',
          perks: JSON.stringify([
            'Club Lounge Access',
            '100-Level Premium Seats',
            'Private Restrooms & Bar',
          ]),
          totalCapacity: 90,
          soldCount: 20,
        },
        {
          name: 'Gold',
          price: 165,
          description: 'Mid Tier seating with full visibility of laser and pyro systems.',
          color: '#eab308',
          perks: JSON.stringify([
            'Mid Tier Clear Sightlines',
            'Standard Stadium Concessions',
          ]),
          totalCapacity: 160,
          soldCount: 30,
        },
        {
          name: 'Silver',
          price: 80,
          description: 'Upper tier view of the entire futuristic cityscape spectacle.',
          color: '#94a3b8',
          perks: JSON.stringify([
            'Upper Tier Seating',
            'Complete Laser Show Panorama',
          ]),
          totalCapacity: 280,
          soldCount: 45,
        },
      ],
    },
  ];

  for (const c of concertsData) {
    const { categories, ...concertDetails } = c;
    const concert = await prisma.concert.create({
      data: concertDetails,
    });

    for (const cat of categories) {
      await prisma.ticketCategory.create({
        data: {
          ...cat,
          concertId: concert.id,
        },
      });
    }
  }

  console.log(`✅ Seeded ${concertsData.length} concerts with Silver, Gold, Platinum, and Fanpit categories!`);

  // 4. Create an initial sample booking for the demo user so Profile & My Tickets immediately shows rich content
  const firstConcert = await prisma.concert.findFirst({
    include: { categories: true },
  });

  if (firstConcert) {
    const fanpitCategory = firstConcert.categories.find((cat) => cat.name === 'Fanpit') || firstConcert.categories[0];
    const bookingRef = `BK-DEMO-${Date.now().toString(36).toUpperCase()}`;

    const sampleBooking = await prisma.booking.create({
      data: {
        bookingRef,
        userId: demoUser.id,
        concertId: firstConcert.id,
        totalAmount: fanpitCategory.price,
        status: 'CONFIRMED',
        paymentMethod: 'CREDIT_CARD',
        paymentStatus: 'PAID',
      },
    });

    const ticketId = 'demo-tkt-uuid-001';
    const ticketNumber = `TKT-FANP-DEMO99`;
    const qrPayload = JSON.stringify({
      ticketId,
      ticketNumber,
      bookingRef,
      concertId: firstConcert.id,
      concertTitle: firstConcert.title,
      category: fanpitCategory.name,
      seat: 'Fanpit Standing #001',
      holderId: demoUser.id,
      issuedAt: new Date().toISOString(),
      signature: 'demo_verified_sig_9921',
    });

    await prisma.ticket.create({
      data: {
        id: ticketId,
        ticketNumber,
        bookingId: sampleBooking.id,
        userId: demoUser.id,
        categoryId: fanpitCategory.id,
        seat: 'Fanpit Standing #001',
        price: fanpitCategory.price,
        qrPayload,
        status: 'VALID',
      },
    });

    console.log('✅ Created sample booking & ticket for demo user');
  }

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
