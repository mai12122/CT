import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed with Cambodian concerts...');

  // 1. Clean existing records in dependency order
  await prisma.ticket.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.reservationSession.deleteMany({});
  await prisma.ticketCategory.deleteMany({});
  await prisma.concert.deleteMany({});
  await prisma.refreshToken.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Seed Authentic Cambodian Concerts across Provinces
  const concertsData = [
    {
      title: 'Skull Tour: Born in Battambang Live',
      artist: 'VannDa (វណ្ណដា)',
      description:
        'A historic, high-energy headline show by Cambodia’s global hip-hop pioneer featuring live traditional pinpeat drums, surprise guest MCs, and thunderous sound production.',
      venue: 'Bassac Live Main Hall (Diamond Island / Koh Pich)',
      city: 'Phnom Penh',
      date: new Date('2026-11-14T19:30:00Z'),
      imageUrl: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1000&q=80',
      featured: true,
      categories: [
        {
          name: 'Fanpit',
          price: 45,
          description: 'Front stage mosh pit. Direct proximity to VannDa with exclusive Tour Lanyard.',
          color: '#ec4899', // Pink
          perks: JSON.stringify([
            'Front Row Catwalk Access',
            'Skull Tour VIP Laminate & Lanyard',
            'Priority Early Venue Entry (5:00 PM)',
            'Limited Edition Skull Tour Pin & Poster',
          ]),
          totalCapacity: 60,
          soldCount: 8,
        },
        {
          name: 'Platinum',
          price: 35,
          description: 'Lower tier center seating with direct stage line-of-sight and air-conditioned lounge access.',
          color: '#8b5cf6', // Purple
          perks: JSON.stringify([
            'Lower Tier Center Rows 1-10',
            'Private VIP Concourse & Drinks Bar',
            'Padded Premium Club Seats',
            'Dedicated Restrooms',
          ]),
          totalCapacity: 120,
          soldCount: 24,
        },
        {
          name: 'Gold',
          price: 25,
          description: 'Mid Tier elevated elevation with clear acoustic projection.',
          color: '#eab308', // Gold
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
          price: 15,
          description: 'General admission hall view with full acoustic delay towers.',
          color: '#94a3b8', // Silver
          perks: JSON.stringify([
            'General Admission Seating',
            'Panoramic Lightshow View',
            'Digital Audio Delay Towers',
          ]),
          totalCapacity: 350,
          soldCount: 60,
        },
      ],
    },
    {
      title: 'Kings of Khmer Pop & Hip-Hop Mega Live',
      artist: 'Preap Sovath & G-Devith (ព្រាប សុវត្ថិ x ជី ដេវីត)',
      description:
        'A groundbreaking crossover concert bridging three decades of legendary Khmer pop with modern trap beats and high-octane choreography.',
      venue: 'Morodok Techo National Stadium Live Arena',
      city: 'Phnom Penh',
      date: new Date('2026-12-05T19:00:00Z'),
      imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1000&q=80',
      featured: true,
      categories: [
        {
          name: 'Fanpit',
          price: 50,
          description: 'Front stage circle pit right in front of the artists.',
          color: '#ec4899',
          perks: JSON.stringify([
            'Direct Pit Access',
            'Synchronized LED Wristband Upgrade',
            'Early Entry 1 Hour Before Gates',
          ]),
          totalCapacity: 50,
          soldCount: 12,
        },
        {
          name: 'Platinum',
          price: 35,
          description: 'Prime reserved club seating with complimentary beverage.',
          color: '#8b5cf6',
          perks: JSON.stringify([
            'Level 2 Premium Concourse',
            'Complimentary Welcome Drink',
            'Padded Stadium Seats',
          ]),
          totalCapacity: 100,
          soldCount: 18,
        },
        {
          name: 'Gold',
          price: 20,
          description: 'Lower tier central sideline seating.',
          color: '#eab308',
          perks: JSON.stringify([
            'Central Sideline View',
            'Direct Line of Sight',
          ]),
          totalCapacity: 180,
          soldCount: 30,
        },
        {
          name: 'Silver',
          price: 10,
          description: 'Upper concourse seating with full stadium laser spectacle.',
          color: '#94a3b8',
          perks: JSON.stringify([
            'Upper Concourse Seating',
            'Complete Light Show View',
          ]),
          totalCapacity: 300,
          soldCount: 50,
        },
      ],
    },
    {
      title: 'Golden Era Angkor Symphony & Acoustic Night',
      artist: 'Sinn Sisamouth Legacy Orchestra ft. Meng Keo Pichenda',
      description:
        'A magical evening under the stars near the ancient temples honoring the Golden Age of 1960s Cambodian rock and classical orchestral melodies.',
      venue: 'Angkor Heritage Cultural Amphitheatre',
      city: 'Siem Reap',
      date: new Date('2026-10-25T18:30:00Z'),
      imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80',
      featured: true,
      categories: [
        {
          name: 'Fanpit',
          price: 60,
          description: 'Front row royal orchestra circle seats with banquet privileges.',
          color: '#ec4899',
          perks: JSON.stringify([
            'Royal Circle Front Row',
            'Traditional Khmer Welcome Ceremony',
            'Exclusive Commemorative Vinyl Program',
          ]),
          totalCapacity: 40,
          soldCount: 5,
        },
        {
          name: 'Platinum',
          price: 40,
          description: 'Center tiered seating with immaculate classical acoustics.',
          color: '#8b5cf6',
          perks: JSON.stringify([
            'Center Tiered Seating',
            'Lounge Access',
            'Complimentary Lotus Tea',
          ]),
          totalCapacity: 80,
          soldCount: 15,
        },
        {
          name: 'Gold',
          price: 25,
          description: 'Reserved garden terrace seating.',
          color: '#eab308',
          perks: JSON.stringify([
            'Garden Terrace View',
            'Souvenir Event Booklet',
          ]),
          totalCapacity: 150,
          soldCount: 22,
        },
        {
          name: 'Silver',
          price: 15,
          description: 'Open lawn amphitheatre seating with temple backdrop.',
          color: '#94a3b8',
          perks: JSON.stringify([
            'Open Lawn Seating',
            'Acoustic Surround Sound',
          ]),
          totalCapacity: 250,
          soldCount: 40,
        },
      ],
    },
    {
      title: 'Sunset Acoustic & R&B Riverfront Live',
      artist: 'Tena x Sophia Kao x Suly Pheng',
      description:
        'An intimate sunset concert along the Sangke river featuring soulful vocals, acoustic guitars, and modern Cambodian neo-soul favorites.',
      venue: 'Sangke Riverfront Amphitheatre',
      city: 'Battambang',
      date: new Date('2026-11-28T18:00:00Z'),
      imageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=1000&q=80',
      featured: false,
      categories: [
        {
          name: 'Fanpit',
          price: 30,
          description: 'Waterfront riverside stage pit with meet-and-greet pass.',
          color: '#ec4899',
          perks: JSON.stringify([
            'Riverside Front Row',
            'Backstage Meet & Greet Pass',
            'Signed Poster',
          ]),
          totalCapacity: 45,
          soldCount: 10,
        },
        {
          name: 'Platinum',
          price: 20,
          description: 'Reserved terrace seating with river view.',
          color: '#8b5cf6',
          perks: JSON.stringify([
            'Reserved Covered Seating',
            'Complimentary Sunset Mocktail',
          ]),
          totalCapacity: 90,
          soldCount: 20,
        },
        {
          name: 'Gold',
          price: 15,
          description: 'Open amphitheatre tiers with clear sightlines.',
          color: '#eab308',
          perks: JSON.stringify([
            'Mid Tier Clear Sightlines',
            'Standard Event Entry',
          ]),
          totalCapacity: 160,
          soldCount: 30,
        },
        {
          name: 'Silver',
          price: 8,
          description: 'Riverside general admission lawn.',
          color: '#94a3b8',
          perks: JSON.stringify([
            'Lawn Seating',
            'Live Audio Projection',
          ]),
          totalCapacity: 280,
          soldCount: 45,
        },
      ],
    },
    {
      title: 'Coastal Beats & Indie Rock Festival',
      artist: 'Sai (សាយ) & SmallWorld SmallBand (SWSB)',
      description:
        'A vibrant open-air beachside concert bringing uplifting original Khmer indie rock, ocean breeze, and charity fundraising for pediatric healthcare.',
      venue: 'Bay of Lights Ocean Arena',
      city: 'Preah Sihanouk',
      date: new Date('2026-12-20T17:30:00Z'),
      imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1000&q=80',
      featured: false,
      categories: [
        {
          name: 'Fanpit',
          price: 35,
          description: 'Beachfront pit right in front of the main stage.',
          color: '#ec4899',
          perks: JSON.stringify(['Beach Stage Front Row', 'Charity T-Shirt Included']),
          totalCapacity: 50,
          soldCount: 5,
        },
        {
          name: 'Platinum',
          price: 25,
          description: 'VIP Deck elevated lounge with beach sunset panorama.',
          color: '#8b5cf6',
          perks: JSON.stringify(['VIP Deck Access', 'Complimentary Coconut Drink']),
          totalCapacity: 100,
          soldCount: 15,
        },
        {
          name: 'Gold',
          price: 15,
          description: 'Central festival lawn seating.',
          color: '#eab308',
          perks: JSON.stringify(['Festival Lawn Access', 'Great Sound Quality']),
          totalCapacity: 150,
          soldCount: 20,
        },
        {
          name: 'Silver',
          price: 10,
          description: 'General beach admission.',
          color: '#94a3b8',
          perks: JSON.stringify(['General Beach Admission']),
          totalCapacity: 300,
          soldCount: 40,
        },
      ],
    },
    {
      title: 'Bokor Mountain Mist Jam & Hip-Hop Summit',
      artist: 'RuthKo & KlapYaHandz All-Stars',
      description:
        'A cool mountain breeze festival perched 1,000 meters above sea level on Bokor Plateau, featuring underground hip-hop, turntablism, and live beats.',
      venue: 'Bokor Plateau Mountain Amphitheatre',
      city: 'Kampot',
      date: new Date('2027-01-10T17:00:00Z'),
      imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80',
      featured: false,
      categories: [
        {
          name: 'Fanpit',
          price: 28,
          description: 'Mountain stage pit with exclusive KlapYaHandz sticker pack.',
          color: '#ec4899',
          perks: JSON.stringify(['Stage Pit Standing', 'KlapYaHandz Merch Pack']),
          totalCapacity: 40,
          soldCount: 8,
        },
        {
          name: 'Platinum',
          price: 20,
          description: 'Covered veranda seating with scenic sea-view mist.',
          color: '#8b5cf6',
          perks: JSON.stringify(['Scenic Veranda Seating', 'Campfire Lounge Access']),
          totalCapacity: 80,
          soldCount: 12,
        },
        {
          name: 'Gold',
          price: 14,
          description: 'Mid Tier amphitheatre stone bench seating.',
          color: '#eab308',
          perks: JSON.stringify(['Stone Amphitheatre Seating']),
          totalCapacity: 120,
          soldCount: 25,
        },
        {
          name: 'Silver',
          price: 8,
          description: 'Mountain ridge general admission.',
          color: '#94a3b8',
          perks: JSON.stringify(['General Ridge Admission']),
          totalCapacity: 250,
          soldCount: 30,
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

  console.log(`✅ Seeded ${concertsData.length} authentic Cambodian concerts with Silver, Gold, Platinum, and Fanpit categories!`);

  console.log('🎉 Database seeding with Cambodian artists & provinces completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
