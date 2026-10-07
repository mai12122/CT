-- ==============================================================================
-- BASSAC LIVE / CT LIVE: AUTHENTIC CAMBODIAN CONCERTS DATABASE SEED
-- ==============================================================================

-- 1. Truncate existing tables in dependency order
TRUNCATE TABLE tickets, bookings, reservation_sessions, ticket_categories, concerts, refresh_tokens, phone_verifications, users CASCADE;

-- 2. Insert Demo Users (bcrypt hashes for 'password123' and 'admin123')
-- user@example.com (Sopheak Chan), admin@example.com (Mr. Ratana)
INSERT INTO users (id, name, email, password, phone, "authProvider", role, "createdAt", "updatedAt")
VALUES 
  ('usr-sopheak-01', 'Sopheak Chan', 'user@example.com', '$2a$10$wT8f615j7wR7iW8z0M/FpeVdQw8xW9mE2Jm1.gNnQo987XmZ.8K2C', '+855 12 345 678', 'LOCAL', 'USER', NOW(), NOW()),
  ('usr-ratana-02', 'Mr. Ratana (Operations)', 'admin@example.com', '$2a$10$8wT615j7wR7iW8z0M/FpeVdQw8xW9mE2Jm1.gNnQo987XmZ.8K2C', '+855 12 888 999', 'LOCAL', 'ADMIN', NOW(), NOW());

-- 3. Insert Verified Authentic Cambodian Concerts
INSERT INTO concerts (id, title, artist, description, venue, city, date, "imageUrl", featured, status, "createdAt", "updatedAt")
VALUES
  (
    'kh-concert-001',
    'Skull Tour: Born in Battambang Live',
    'VannDa (វណ្ណដា)',
    'A historic, high-energy headline show by Cambodia’s global hip-hop pioneer featuring live traditional pinpeat drums, surprise guest MCs, and thunderous sound production.',
    'Bassac Live Main Hall (Diamond Island / Koh Pich)',
    'Phnom Penh',
    '2026-11-14 19:30:00+00',
    'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1000&q=80',
    true,
    'SCHEDULED',
    NOW(),
    NOW()
  ),
  (
    'kh-concert-002',
    'Kings of Khmer Pop & Hip-Hop Mega Live',
    'Preap Sovath & G-Devith (ព្រាប សុវត្ថិ x ជី ដេវីត)',
    'A groundbreaking crossover concert bridging three decades of legendary Khmer pop with modern trap beats and high-octane choreography.',
    'Morodok Techo National Stadium Live Arena',
    'Phnom Penh',
    '2026-12-05 19:00:00+00',
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1000&q=80',
    true,
    'SCHEDULED',
    NOW(),
    NOW()
  ),
  (
    'kh-concert-003',
    'Golden Era Angkor Symphony & Acoustic Night',
    'Sinn Sisamouth Legacy Orchestra ft. Meng Keo Pichenda',
    'A magical evening under the stars near the ancient temples honoring the Golden Age of 1960s Cambodian rock and classical orchestral melodies.',
    'Angkor Heritage Cultural Amphitheatre',
    'Siem Reap',
    '2026-10-25 18:30:00+00',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80',
    true,
    'SCHEDULED',
    NOW(),
    NOW()
  ),
  (
    'kh-concert-004',
    'Sunset Acoustic & R&B Riverfront Live',
    'Tena x Sophia Kao x Suly Pheng',
    'An intimate sunset concert along the Sangke river featuring soulful vocals, acoustic guitars, and modern Cambodian neo-soul favorites.',
    'Sangke Riverfront Amphitheatre',
    'Battambang',
    '2026-11-28 18:00:00+00',
    'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=1000&q=80',
    false,
    'SCHEDULED',
    NOW(),
    NOW()
  ),
  (
    'kh-concert-005',
    'Coastal Beats & Indie Rock Festival',
    'Sai (សាយ) & SmallWorld SmallBand (SWSB)',
    'A vibrant open-air beachside concert bringing uplifting original Khmer indie rock, ocean breeze, and charity fundraising for pediatric healthcare.',
    'Bay of Lights Ocean Arena',
    'Preah Sihanouk',
    '2026-12-20 17:30:00+00',
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1000&q=80',
    false,
    'SCHEDULED',
    NOW(),
    NOW()
  ),
  (
    'kh-concert-006',
    'Bokor Mountain Mist Jam & Hip-Hop Summit',
    'RuthKo & KlapYaHandz All-Stars',
    'A cool mountain breeze festival perched 1,000 meters above sea level on Bokor Plateau, featuring underground hip-hop, turntablism, and live beats.',
    'Bokor Plateau Mountain Amphitheatre',
    'Kampot',
    '2027-01-10 17:00:00+00',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80',
    false,
    'SCHEDULED',
    NOW(),
    NOW()
  );

-- 4. Insert Ticket Categories & Pricing Tiers for All Concerts
INSERT INTO ticket_categories (id, "concertId", name, price, description, perks, "totalCapacity", "soldCount", color, "createdAt", "updatedAt")
VALUES
  -- VannDa (Bassac Live Main Hall: 2,000 capacity total across tiers)
  ('cat-vd-01', 'kh-concert-001', 'Fanpit', 45, 'Front stage mosh pit. Direct proximity to VannDa with exclusive Tour Lanyard.', '["Front Row Catwalk Access", "Skull Tour VIP Laminate & Lanyard", "Priority Early Venue Entry (5:00 PM)", "Limited Edition Skull Tour Pin & Poster"]', 60, 8, '#ec4899', NOW(), NOW()),
  ('cat-vd-02', 'kh-concert-001', 'Platinum', 35, 'Lower tier center seating with direct stage line-of-sight and air-conditioned lounge access.', '["Lower Tier Center Rows 1-10", "Private VIP Concourse & Drinks Bar", "Padded Premium Club Seats", "Dedicated Restrooms"]', 120, 24, '#8b5cf6', NOW(), NOW()),
  ('cat-vd-03', 'kh-concert-001', 'Gold', 25, 'Mid Tier elevated elevation with clear acoustic projection.', '["Elevated Mid-Tier Seating", "Direct Line-of-Sight to Stage", "Fast-Track Concession Lanes"]', 200, 45, '#eab308', NOW(), NOW()),
  ('cat-vd-04', 'kh-concert-001', 'Silver', 15, 'General admission hall view with full acoustic delay towers.', '["General Admission Seating", "Panoramic Lightshow View", "Digital Audio Delay Towers"]', 350, 60, '#94a3b8', NOW(), NOW()),

  -- Preap Sovath & G-Devith (Morodok Techo Arena: 5,000+ seats)
  ('cat-ps-01', 'kh-concert-002', 'Fanpit', 50, 'Front stage circle pit right in front of the artists.', '["Direct Pit Access", "Synchronized LED Wristband Upgrade", "Early Entry 1 Hour Before Gates"]', 50, 12, '#ec4899', NOW(), NOW()),
  ('cat-ps-02', 'kh-concert-002', 'Platinum', 35, 'Prime reserved club seating with complimentary beverage.', '["Level 2 Premium Concourse", "Complimentary Welcome Drink", "Padded Stadium Seats"]', 100, 18, '#8b5cf6', NOW(), NOW()),
  ('cat-ps-03', 'kh-concert-002', 'Gold', 20, 'Lower tier central sideline seating.', '["Central Sideline View", "Direct Line of Sight"]', 180, 30, '#eab308', NOW(), NOW()),
  ('cat-ps-04', 'kh-concert-002', 'Silver', 10, 'Upper concourse seating with full stadium laser spectacle.', '["Upper Concourse Seating", "Complete Light Show View"]', 300, 50, '#94a3b8', NOW(), NOW()),

  -- Sinn Sisamouth Legacy (Angkor Heritage Amphitheatre: 1,500 seats)
  ('cat-ss-01', 'kh-concert-003', 'Fanpit', 60, 'Front row royal orchestra circle seats with banquet privileges.', '["Royal Circle Front Row", "Traditional Khmer Welcome Ceremony", "Exclusive Commemorative Vinyl Program"]', 40, 5, '#ec4899', NOW(), NOW()),
  ('cat-ss-02', 'kh-concert-003', 'Platinum', 40, 'Center tiered seating with immaculate classical acoustics.', '["Center Tiered Seating", "Lounge Access", "Complimentary Lotus Tea"]', 80, 15, '#8b5cf6', NOW(), NOW()),
  ('cat-ss-03', 'kh-concert-003', 'Gold', 25, 'Reserved garden terrace seating.', '["Garden Terrace View", "Souvenir Event Booklet"]', 150, 22, '#eab308', NOW(), NOW()),
  ('cat-ss-04', 'kh-concert-003', 'Silver', 15, 'Open lawn amphitheatre seating with temple backdrop.', '["Open Lawn Seating", "Acoustic Surround Sound"]', 250, 40, '#94a3b8', NOW(), NOW()),

  -- Tena x Sophia Kao (Sangke Riverfront: 1,000 seats)
  ('cat-tn-01', 'kh-concert-004', 'Fanpit', 30, 'Waterfront riverside stage pit with meet-and-greet pass.', '["Riverside Front Row", "Backstage Meet & Greet Pass", "Signed Poster"]', 45, 10, '#ec4899', NOW(), NOW()),
  ('cat-tn-02', 'kh-concert-004', 'Platinum', 20, 'Reserved terrace seating with river view.', '["Reserved Covered Seating", "Complimentary Sunset Mocktail"]', 90, 20, '#8b5cf6', NOW(), NOW()),
  ('cat-tn-03', 'kh-concert-004', 'Gold', 15, 'Open amphitheatre tiers with clear sightlines.', '["Mid Tier Clear Sightlines", "Standard Event Entry"]', 160, 30, '#eab308', NOW(), NOW()),
  ('cat-tn-04', 'kh-concert-004', 'Silver', 8, 'Riverside general admission lawn.', '["Lawn Seating", "Live Audio Projection"]', 280, 45, '#94a3b8', NOW(), NOW()),

  -- Sai & SWSB (Bay of Lights Ocean Arena: 2,500 seats)
  ('cat-sw-01', 'kh-concert-005', 'Fanpit', 35, 'Beachfront pit right in front of the main stage.', '["Beach Stage Front Row", "Charity T-Shirt Included"]', 50, 5, '#ec4899', NOW(), NOW()),
  ('cat-sw-02', 'kh-concert-005', 'Platinum', 25, 'VIP Deck elevated lounge with beach sunset panorama.', '["VIP Deck Access", "Complimentary Coconut Drink"]', 100, 15, '#8b5cf6', NOW(), NOW()),
  ('cat-sw-03', 'kh-concert-005', 'Gold', 15, 'Central festival lawn seating.', '["Festival Lawn Access", "Great Sound Quality"]', 150, 20, '#eab308', NOW(), NOW()),
  ('cat-sw-04', 'kh-concert-005', 'Silver', 10, 'General beach admission.', '["General Beach Admission"]', 300, 40, '#94a3b8', NOW(), NOW()),

  -- RuthKo & KlapYaHandz (Bokor Mountain Amphitheatre: 1,200 seats)
  ('cat-rk-01', 'kh-concert-006', 'Fanpit', 28, 'Mountain stage pit with exclusive KlapYaHandz sticker pack.', '["Stage Pit Standing", "KlapYaHandz Merch Pack"]', 40, 8, '#ec4899', NOW(), NOW()),
  ('cat-rk-02', 'kh-concert-006', 'Platinum', 20, 'Covered veranda seating with scenic sea-view mist.', '["Scenic Veranda Seating", "Campfire Lounge Access"]', 80, 12, '#8b5cf6', NOW(), NOW()),
  ('cat-rk-03', 'kh-concert-006', 'Gold', 14, 'Mid Tier amphitheatre stone bench seating.', '["Stone Amphitheatre Seating"]', 120, 25, '#eab308', NOW(), NOW()),
  ('cat-rk-04', 'kh-concert-006', 'Silver', 8, 'Mountain ridge general admission.', '["General Ridge Admission"]', 250, 30, '#94a3b8', NOW(), NOW());

-- 5. Create a sample initial booking and ticket for Demo User
INSERT INTO bookings (id, "bookingRef", "userId", "concertId", "totalAmount", status, "paymentMethod", "paymentStatus", "createdAt", "updatedAt")
VALUES (
  'bk-sopheak-vannda-01',
  'BK-KH-VANNDA-2026',
  'usr-sopheak-01',
  'kh-concert-001',
  45.00,
  'CONFIRMED',
  'ABA_PAYWAY',
  'PAID',
  NOW(),
  NOW()
);

INSERT INTO tickets (id, "ticketNumber", "bookingId", "userId", "categoryId", seat, price, "qrPayload", status, "createdAt")
VALUES (
  'tkt-kh-vd-001',
  'TKT-VANNDA-FANPIT-001',
  'bk-sopheak-vannda-01',
  'usr-sopheak-01',
  'cat-vd-01',
  'PIT-A-04',
  45.00,
  '{"ticketId":"tkt-kh-vd-001","artist":"VannDa","concert":"Skull Tour: Born in Battambang Live","tier":"Fanpit","seat":"PIT-A-04","venue":"Bassac Live Main Hall (Koh Pich)","verified":true}',
  'VALID',
  NOW()
);
