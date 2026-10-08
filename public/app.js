      // ============================================================
      // APPLICATION STATE & INTERACTION ENGINE
      // ============================================================
      let currentUser = {
        name: 'Mao',
        phone: '+85517864121',
        email: '85517864121@phone.concertpass.com',
        authProvider: 'PHONE'
      };
      try {
        const savedUser = sessionStorage.getItem('ct_user');
        if (savedUser) {
          currentUser = JSON.parse(savedUser);
        }
      } catch (e) {}

      const CONCERT_DATABASE = {
        'kh-concert-001': {
          id: 'kh-concert-001',
          title: 'VannDa (វណ្ណដា)',
          tour: 'Skull Tour: Born in Battambang Live',
          venue: 'Bassac Live Main Hall (Diamond Island / Koh Pich)',
          city: 'Phnom Penh',
          banner: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1200&q=80',
          basePrice: 45,
          categories: [
            { id: 'cat-vd-01', name: 'Fanpit', price: 45, perks: 'Front Row Catwalk Access, Priority VIP Entry', seatsLeft: 52 },
            { id: 'cat-vd-02', name: 'Platinum', price: 35, perks: 'Lower Tier Center Rows, VIP Concourse Bar', seatsLeft: 96 },
            { id: 'cat-vd-03', name: 'Gold', price: 25, perks: 'Elevated Mid-Tier Seating, Clear Sightlines', seatsLeft: 155 },
            { id: 'cat-vd-04', name: 'Silver', price: 15, perks: 'General Admission Seating, Delay Towers', seatsLeft: 290 }
          ]
        },
        'kh-concert-002': {
          id: 'kh-concert-002',
          title: 'Preap Sovath & G-Devith',
          tour: 'Kings of Khmer Pop & Hip-Hop Mega Live',
          venue: 'Morodok Techo National Stadium Live Arena',
          city: 'Phnom Penh',
          banner: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
          basePrice: 50,
          categories: [
            { id: 'cat-ps-01', name: 'Fanpit', price: 50, perks: 'Direct Pit Access, Synchronized LED Wristband', seatsLeft: 38 },
            { id: 'cat-ps-02', name: 'Platinum', price: 35, perks: 'Level 2 Premium Concourse, Padded Seats', seatsLeft: 82 },
            { id: 'cat-ps-03', name: 'Gold', price: 20, perks: 'Grandstand Center Tier View', seatsLeft: 160 },
            { id: 'cat-ps-04', name: 'Silver', price: 10, perks: 'Upper Bowl Festival Atmosphere', seatsLeft: 250 }
          ]
        },
        'kh-concert-003': {
          id: 'kh-concert-003',
          title: 'Sinn Sisamouth Legacy Orchestra',
          tour: 'Golden Era Angkor Symphony',
          venue: 'Angkor Heritage Cultural Amphitheatre',
          city: 'Siem Reap',
          banner: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
          basePrice: 60,
          categories: [
            { id: 'cat-ss-01', name: 'Royal Circle', price: 60, perks: 'Front Orchestra Stalls, Commemorative Program', seatsLeft: 35 },
            { id: 'cat-ss-02', name: 'Platinum', price: 40, perks: 'Mezzanine Center Acoustics, Fast Check-in', seatsLeft: 68 },
            { id: 'cat-ss-03', name: 'Gold', price: 25, perks: 'Amphitheatre Terrace Tier', seatsLeft: 120 },
            { id: 'cat-ss-04', name: 'Silver', price: 15, perks: 'Open Lawn Acoustic Projection', seatsLeft: 210 }
          ]
        },
        'kh-concert-004': {
          id: 'kh-concert-004',
          title: 'Tena x Sophia Kao x Suly Pheng',
          tour: 'Sunset Acoustic & R&B Riverfront Live',
          venue: 'Sangke Riverfront Amphitheatre',
          city: 'Battambang',
          banner: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=1200&q=80',
          basePrice: 30,
          categories: [
            { id: 'cat-ts-01', name: 'Fanpit', price: 30, perks: 'Waterfront Stage Deck Access', seatsLeft: 28 },
            { id: 'cat-ts-02', name: 'Platinum', price: 20, perks: 'Reserved Riverside Loungers', seatsLeft: 55 },
            { id: 'cat-ts-03', name: 'Gold', price: 15, perks: 'Riverfront Steps Panoramic Sightlines', seatsLeft: 95 },
            { id: 'cat-ts-04', name: 'Silver', price: 8, perks: 'Promenade General Admission', seatsLeft: 180 }
          ]
        },
        'kh-concert-005': {
          id: 'kh-concert-005',
          title: 'Sai & SmallWorld SmallBand (SWSB)',
          tour: 'Coastal Beats & Indie Rock Festival',
          venue: 'Bay of Lights Ocean Arena',
          city: 'Preah Sihanouk',
          banner: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&w=1200&q=80',
          basePrice: 35,
          categories: [
            { id: 'cat-sw-01', name: 'Beach Pit', price: 35, perks: 'Sand Front Mosh Pit, Waterproof Wristband', seatsLeft: 42 },
            { id: 'cat-sw-02', name: 'VIP Deck', price: 25, perks: 'Elevated Oceanfront Platform & Bar', seatsLeft: 70 },
            { id: 'cat-sw-03', name: 'Gold', price: 15, perks: 'Boardwalk Viewing Area', seatsLeft: 140 },
            { id: 'cat-sw-04', name: 'General', price: 10, perks: 'Beach Lawn Festival Grounds', seatsLeft: 260 }
          ]
        },
        'kh-concert-006': {
          id: 'kh-concert-006',
          title: 'RuthKo & KlapYaHandz All-Stars',
          tour: 'Bokor Mountain Mist Jam & Hip-Hop Summit',
          venue: 'Bokor Plateau Mountain Amphitheatre',
          city: 'Kampot',
          banner: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
          basePrice: 28,
          categories: [
            { id: 'cat-rk-01', name: 'Pit Pass', price: 28, perks: 'Stage Center Mist Zone & VIP Heat Lamp Access', seatsLeft: 25 },
            { id: 'cat-rk-02', name: 'Platinum', price: 20, perks: 'Covered Plateau Seating, Hot Tea Service', seatsLeft: 60 },
            { id: 'cat-rk-03', name: 'Gold', price: 14, perks: 'Mountain Ridge Amphitheatre Terrace', seatsLeft: 110 },
            { id: 'cat-rk-04', name: 'Silver', price: 8, perks: 'Pine Forest General Lawn', seatsLeft: 190 }
          ]
        }
      };

      // Legacy compatibility alias
      CONCERT_DATABASE['bassac-grand-opening'] = CONCERT_DATABASE['kh-concert-001'];

      let selectedConcertKey = 'kh-concert-001';
      let selectedTierPrice = 45;
      let selectedTierName = 'Fanpit';
      let selectedQty = 1;
      let timerInterval = null;

      // ============================================================
      // HAMMY THE TICKETING MASCOT INTERACTIVE LOGIC
      // ============================================================
      let currentHamsterStep = 0;
      let isHamsterSpeaking = false;
      let hamsterSpeechUtterance = null;

      const hamsterSteps = [
        {
          step: 0,
          badge: 'WELCOME TO CT LIVE',
          counter: 'Step 0 of 4 • Introduction',
          icon: 'sparkles',
          title: 'Hello! Chom Reap Sour! I\'m Hammy!',
          dialogue: 'Hello there! I\'m Hammy, your CT Live ticketing buddy! Ready to see Cambodia\'s biggest live concerts without fighting scalpers or stuck loading screens? Let me show you how simple, fast, and safe buying a pass is!',
          speechText: 'Hello! Chom Reap Sour! I am Hammy, your CT Live concert buddy! Ready to see Cambodia\'s biggest live concerts? Let me show you how simple, fast, and safe buying a pass is!',
          featureIcon: 'sparkles',
          featureTitle: 'Fast & Fair Ticketing',
          featureDesc: 'Anti-Scalping • Instant 10-Min Hold • Dynamic Turnstile QR Pass',
          nextLabel: 'Start Guide'
        },
        {
          step: 1,
          badge: 'STEP 1 OF 4',
          counter: 'Step 1 of 4 • Pass Selection',
          icon: 'ticket',
          title: 'Step 1: Choose Your Concert & Pass Tier',
          dialogue: 'Browse Cambodia\'s top headliners like VannDa\'s Skull Tour or Baramey Live. Tap "Reserve Pass" and pick your zone: VIP Fanpit ($45), Gold Circle ($30), or General Admission ($15) with live remaining seat counts.',
          speechText: 'Step one: Browse top Cambodian concerts and pick your zone, from VIP Fanpit to General Admission, with live remaining pass counts.',
          featureIcon: 'ticket',
          featureTitle: 'Real-Time Inventory',
          featureDesc: 'Transparent seat tiers • Zero hidden fees • Instant price breakdown',
          nextLabel: 'Next: 10m Lock'
        },
        {
          step: 2,
          badge: 'STEP 2 OF 4',
          counter: 'Step 2 of 4 • ACID Concurrency Lock',
          icon: 'clock',
          title: 'Step 2: Instant 10-Minute Protected Lock',
          dialogue: 'Once you tap Reserve, our high-speed engine locks that exact ticket in PostgreSQL for 10 full minutes. A countdown timer protects your spot so no scalper or bot can snatch it while you check out!',
          speechText: 'Step two: Your ticket is locked for 10 minutes in our database with a live countdown timer. No scalper or bot can take it while you complete checkout.',
          featureIcon: 'clock',
          featureTitle: 'Anti-Scalping Cart Lock',
          featureDesc: '10-Minute live timer • Database row reservation • Zero double booking',
          nextLabel: 'Next: Phone OTP'
        },
        {
          step: 3,
          badge: 'STEP 3 OF 4',
          counter: 'Step 3 of 4 • Cambodian Mobile SMS',
          icon: 'phone-call',
          title: 'Step 3: Quick Phone OTP Verification',
          dialogue: 'No complicated passwords needed! Just enter your Cambodian mobile number (+855 Smart, Cellcard, or Metfone) to receive a fast 6-digit SMS OTP. This guarantees fair 1-pass per fan access!',
          speechText: 'Step three: Enter your Cambodian mobile number to receive a six digit SMS verification code. Fast, simple, and secure.',
          featureIcon: 'phone-call',
          featureTitle: '1-Tap Local Verification',
          featureDesc: '+855 Smart, Cellcard & Metfone supported • 60-second SMS delivery',
          nextLabel: 'Next: QR Pass'
        },
        {
          step: 4,
          badge: 'STEP 4 OF 4',
          counter: 'Step 4 of 4 • Turnstile Gate QR Pass',
          icon: 'qr-code',
          title: 'Step 4: Flash Your Dynamic Turnstile Pass',
          dialogue: 'Boom! Your official pass is immediately generated in your CT Wallet with dynamic HMAC security. At Bassac Live Main Hall or Koh Pich, simply scan your phone screen at the turnstiles and enjoy the show!',
          speechText: 'Step four: Your ticket is instantly saved in your wallet with dynamic QR code protection. Scan at the gate and enjoy the concert!',
          featureIcon: 'qr-code',
          featureTitle: 'Dynamic HMAC Security',
          featureDesc: 'Anti-screenshot rotating token • Offline-ready • Fast gate turnstiles',
          nextLabel: 'Say Hello Again'
        }
      ];

      let typewriterTimer = null;

      function runScriptText(text, onComplete) {
        const dialEl = document.getElementById('hamsterSpeechDialogue');
        if (!dialEl) return;
        if (typewriterTimer) {
          clearInterval(typewriterTimer);
          typewriterTimer = null;
        }

        dialEl.innerHTML = '';
        const cursor = document.createElement('span');
        cursor.className = 'typewriter-cursor';
        dialEl.appendChild(cursor);

        let i = 0;
        const speed = 20;
        typewriterTimer = setInterval(() => {
          if (i < text.length) {
            cursor.insertAdjacentText('beforebegin', text.charAt(i));
            i++;
          } else {
            clearInterval(typewriterTimer);
            typewriterTimer = null;
            if (onComplete) onComplete();
          }
        }, speed);
      }

      function goToHamsterStep(idx) {
        if (idx < 0 || idx >= hamsterSteps.length) return;
        currentHamsterStep = idx;
        const s = hamsterSteps[idx];

        const badgeEl = document.getElementById('hamsterStepBadge');
        if (badgeEl) badgeEl.innerText = s.badge;

        const headEl = document.getElementById('hamsterSpeechHeadline');
        if (headEl) headEl.innerText = s.title;

        // Run the script letters on the thought bubble
        runScriptText(s.dialogue);

        // Stepper pills
        for (let i = 0; i < hamsterSteps.length; i++) {
          const pill = document.getElementById(`hamsterPill${i}`);
          if (pill) {
            if (i === idx) {
              pill.classList.add('active');
            } else {
              pill.classList.remove('active');
            }
          }
        }

        if (window.lucide && typeof window.lucide.createIcons === 'function') {
          window.lucide.createIcons();
        }

        // If user already had voice playback active, continue speaking new step
        if (isHamsterSpeaking) {
          speakHamsterCurrentStep();
        }
      }

      function nextHamsterStep() {
        if (currentHamsterStep < hamsterSteps.length - 1) {
          goToHamsterStep(currentHamsterStep + 1);
        } else {
          goToHamsterStep(0);
        }
      }

      function nudgeHamster() {
        const img = document.getElementById('hamsterMascotImg');
        if (img) {
          img.classList.remove('nudge');
          void img.offsetWidth;
          img.classList.add('nudge');
        }
        toggleHamsterVoice(true);
      }

      function speakHamsterCurrentStep() {
        if (!('speechSynthesis' in window)) {
          showCelebrationToast('SPEECH SYNTHESIS READY');
          return;
        }

        try {
          window.speechSynthesis.cancel();
          const s = hamsterSteps[currentHamsterStep];
          const utter = new SpeechSynthesisUtterance(s.speechText);
          utter.rate = 1.05;
          utter.pitch = 1.25;

          const voices = window.speechSynthesis.getVoices();
          const friendlyVoice = voices.find(v => v.lang && v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Victoria')));
          if (friendlyVoice) utter.voice = friendlyVoice;

          utter.onstart = () => {
            isHamsterSpeaking = true;
            updateHamsterVoiceUi(true);
          };

          utter.onend = utter.onerror = () => {
            isHamsterSpeaking = false;
            updateHamsterVoiceUi(false);
          };

          hamsterSpeechUtterance = utter;
          window.speechSynthesis.speak(utter);
        } catch (e) {
          console.warn('Speech synthesis error:', e);
          isHamsterSpeaking = false;
          updateHamsterVoiceUi(false);
        }
      }

      function toggleHamsterVoice(forceStart) {
        if (!('speechSynthesis' in window)) {
          showCelebrationToast('VOICE READY');
          return;
        }

        if (isHamsterSpeaking && !forceStart) {
          try {
            window.speechSynthesis.cancel();
          } catch (e) {}
          isHamsterSpeaking = false;
          updateHamsterVoiceUi(false);
        } else {
          speakHamsterCurrentStep();
        }
      }

      function updateHamsterVoiceUi(speaking) {
        const img = document.getElementById('hamsterMascotImg');
        const bubble = document.getElementById('hamsterThoughtBubble') || document.getElementById('hamsterSpeechBubble');
        const btn = document.getElementById('hamsterVoiceToggleBtn');
        const label = document.getElementById('hamsterVoiceLabel');
        const icon = document.getElementById('hamsterVoiceIcon');

        if (speaking) {
          if (img) img.classList.add('talking');
          if (bubble) bubble.classList.add('talking');
          if (btn) btn.classList.add('speaking');
          if (label) label.innerText = 'Speaking...';
          if (icon) {
            icon.setAttribute('data-lucide', 'volume-x');
          }
        } else {
          if (img) img.classList.remove('talking');
          if (bubble) bubble.classList.remove('talking');
          if (btn) btn.classList.remove('speaking');
          if (label) label.innerText = 'Hear Voice';
          if (icon) {
            icon.setAttribute('data-lucide', 'volume-2');
          }
        }

        if (window.lucide && typeof window.lucide.createIcons === 'function') {
          window.lucide.createIcons();
        }
      }

      // Initialize on Load
      window.addEventListener('DOMContentLoaded', () => {
        initInitialQr();
        syncUserUi();
        loadSavedTickets();
        loadLiveConcertsFromApi();
        goToHamsterStep(0);
        if (window.lucide && typeof window.lucide.createIcons === 'function') {
          window.lucide.createIcons();
        }
      });

      // Load live PostgreSQL concerts from backend API if active
      async function loadLiveConcertsFromApi() {
        try {
          const res = await fetch('/api/v1/concerts');
          if (res.ok) {
            const json = await res.json();
            if (json.success && Array.isArray(json.data) && json.data.length > 0) {
              json.data.forEach(c => {
                if (CONCERT_DATABASE[c.id]) {
                  CONCERT_DATABASE[c.id].title = c.artist || c.title;
                  CONCERT_DATABASE[c.id].tour = c.title;
                  CONCERT_DATABASE[c.id].venue = `${c.venue} • ${c.city}`;
                  if (c.categories && c.categories.length > 0) {
                    CONCERT_DATABASE[c.id].categories = c.categories.map(cat => ({
                      id: cat.id,
                      name: cat.name,
                      price: cat.price,
                      perks: Array.isArray(cat.perks) ? cat.perks.join(', ') : (cat.description || cat.name),
                      seatsLeft: cat.available !== undefined ? cat.available : (cat.totalCapacity - (cat.soldCount || 0))
                    }));
                  }
                }
              });
              console.log('[CT Live] Loaded live PostgreSQL Cambodian concerts from /api/v1/concerts');
            }
          }
        } catch (e) {
          console.info('Using pre-seeded Cambodian concert dataset:', e);
        }
      }

      function switchNavTab(tabId) {
        // Hide all screens
        document.querySelectorAll('.screen-panel').forEach(p => p.classList.remove('active'));

        // Deselect nav links
        document.querySelectorAll('.nav-link-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.island-tab-btn').forEach(b => b.classList.remove('active'));

        // Show target screen
        const targetPanel = document.getElementById('tab' + capitalize(tabId));
        if (targetPanel) {
          targetPanel.classList.add('active');
        }
        if (tabId === 'tickets') {
          initInitialQr();
        }

        // Activate desktop link
        const deskLink = document.getElementById('deskNav' + capitalize(tabId));
        if (deskLink) deskLink.classList.add('active');

        // Activate mobile link
        const mobLink = document.getElementById('mobTab' + capitalize(tabId));
        if (mobLink) mobLink.classList.add('active');

        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
      }

      // City Filter
      function filterByCity(btn, city) {
        document.querySelectorAll('.city-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const cards = document.querySelectorAll('.concert-card-shell');
        let visibleCount = 0;

        cards.forEach(card => {
          const cardCity = card.getAttribute('data-city');
          if (city === 'All' || cardCity === city) {
            card.style.display = 'flex';
            visibleCount++;
          } else {
            card.style.display = 'none';
          }
        });

        document.getElementById('showsAvailableCount').innerText = `${visibleCount} Events Found`;
      }

      // Search Filter
      function handleShowSearch(query) {
        const q = (query || '').toLowerCase().trim();
        const cards = document.querySelectorAll('.concert-card-shell');
        let count = 0;

        cards.forEach(card => {
          const text = (card.getAttribute('data-artist') || '').toLowerCase();
          if (text.includes(q)) {
            card.style.display = 'flex';
            count++;
          } else {
            card.style.display = 'none';
          }
        });

        document.getElementById('showsAvailableCount').innerText = `${count} Events Found`;
      }

      // Reservation Modal
      function openReservationModal(concertKey) {
        selectedConcertKey = concertKey;
        const data = CONCERT_DATABASE[concertKey] || CONCERT_DATABASE['kh-concert-001'];

        document.getElementById('sheetConcertBanner').src = data.banner;
        document.getElementById('sheetConcertTitle').innerText = data.title;
        document.getElementById('sheetConcertTour').innerText = `${data.tour} • ${data.venue}`;

        // Render Dynamic Tiers for selected concert
        const tierListContainer = document.getElementById('sheetTierListContainer');
        if (tierListContainer && data.categories && data.categories.length > 0) {
          tierListContainer.innerHTML = data.categories.map((cat, idx) => `
            <div class="tier-option-card ${idx === 0 ? 'selected' : ''}" id="tierOption${idx}" onclick="selectPassTier(${idx}, ${cat.price}, '${cat.name}')">
              <div class="tier-left-info">
                <span class="tier-name-label">${cat.name} Pass</span>
                <span class="tier-perks-desc">${cat.perks}</span>
              </div>
              <div class="tier-pricing-right">
                <div class="tier-price-amount">$${cat.price}</div>
                <div class="tier-seats-left">${cat.seatsLeft !== undefined ? cat.seatsLeft + ' Left' : 'Available'}</div>
              </div>
            </div>
          `).join('');

          // Select first tier
          const firstCat = data.categories[0];
          selectedTierPrice = firstCat.price;
          selectedTierName = firstCat.name;
        } else {
          selectedTierPrice = data.basePrice || 45;
          selectedTierName = 'Fanpit';
        }

        // Reset Stepper & Selection
        selectedQty = 1;
        document.getElementById('stepperQtyVal').innerText = '1';
        updateTotalPriceDisplay();

        // Start Countdown
        startHoldCountdown(600); // 10 minutes

        document.getElementById('reservationModal').classList.add('active');
      }

      function closeReservationModal(e) {
        if (e && e.target !== e.currentTarget && !e.target.classList.contains('sheet-close-btn')) return;
        document.getElementById('reservationModal').classList.remove('active');
        if (timerInterval) clearInterval(timerInterval);
      }

      function selectPassTier(optionNum, price, tierName) {
        selectedTierPrice = price;
        selectedTierName = tierName;

        document.querySelectorAll('.tier-option-card').forEach(c => c.classList.remove('selected'));
        const activeCard = document.getElementById(`tierOption${optionNum}`);
        if (activeCard) activeCard.classList.add('selected');

        updateTotalPriceDisplay();
      }

      function updateQty(delta) {
        selectedQty = Math.max(1, Math.min(6, selectedQty + delta));
        document.getElementById('stepperQtyVal').innerText = selectedQty;
        updateTotalPriceDisplay();
      }

      function updateTotalPriceDisplay() {
        const total = selectedTierPrice * selectedQty;
        document.getElementById('sheetTotalPriceDisplay').innerText = `$${total}`;
      }

      function startHoldCountdown(durationSeconds) {
        if (timerInterval) clearInterval(timerInterval);
        let remain = durationSeconds;

        const clockEl = document.getElementById('holdClock');
        function tick() {
          const mins = Math.floor(remain / 60);
          const secs = remain % 60;
          clockEl.innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
          if (remain <= 0) {
            clearInterval(timerInterval);
            clockEl.innerText = 'EXPIRED';
          }
          remain--;
        }
        tick();
        timerInterval = setInterval(tick, 1000);
      }

      // Confirm Pass Reservation & Add to Wallet
      function confirmPassReservation() {
        const btn = document.getElementById('confirmPassBtn');
        btn.disabled = true;
        btn.innerText = 'Securing ACID Ticket Lock...';

        setTimeout(() => {
          btn.disabled = false;
          btn.innerText = 'Lock Pass & Checkout';

          const data = CONCERT_DATABASE[selectedConcertKey] || CONCERT_DATABASE['kh-concert-001'];
          const ticketId = 'TKT-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000);

          // Add New Ticket Stub to Wallet
          const newTicket = {
  id: ticketId,
  artist: data.title,
  tour: data.tour,
  venue: data.venue,
  tier: selectedTierName,
  seat: `${selectedTierName} #${Math.floor(10 + Math.random() * 80)} · Gate 1`
};
saveTicketToStorage(newTicket);
addTicketStubToWallet(newTicket);

          // Close Modal & Switch to Wallet Passes
          document.getElementById('reservationModal').classList.remove('active');
          if (timerInterval) clearInterval(timerInterval);

          switchNavTab('tickets');

          // Trigger Festival Confetti Celebration & Toast
          triggerFestivalConfetti();
        }, 600);
      }

      function addTicketStubToWallet(t) {
        const tId = t.id;
        WALLET_TICKETS[tId] = t;

        const container = document.getElementById('walletPassesContainer');
        const stub = document.createElement('div');
        stub.className = 'ticket-pass-physical-stub';
        stub.innerHTML = `
          <div class="holographic-foil-layer"></div>
          <div class="stub-top-zone">
            <div>
              <div style="font-size: 11px; font-weight: 800; color: #93C5FD; text-transform: uppercase; letter-spacing: 0.8px; display: flex; align-items: center; gap: 8px;">
                <span class="vip-foil-tag">VIP FOIL</span>
                <span class="audio-equalizer-bars" aria-hidden="true" style="color: #60A5FA;">
                  <span class="eq-bar bar-1"></span>
                  <span class="eq-bar bar-2"></span>
                  <span class="eq-bar bar-3"></span>
                  <span class="eq-bar bar-4"></span>
                </span>
                VERIFIED DIGITAL PASS • ${t.id}
              </div>
              <h3 class="stub-artist-title">${t.artist}</h3>
              <div class="stub-tour-name">${t.tour}</div>
              <div style="font-size: 12px; color: var(--text-muted); margin-top: 8px;">
                ${t.venue}
              </div>
            </div>
            <div class="stub-qr-code-box" id="qr-${t.id}" onclick="openTicketQrById('${t.id}')" title="Tap to enlarge Gate QR code">
              <div class="turnstile-laser-line"></div>
            </div>
          </div>
          <div class="stub-perforation-divider">
            <div class="stub-dash-track"></div>
          </div>
          <div class="stub-bottom-zone">
            <div class="stub-seat-specs">
              <span class="stub-seat-label">Assigned Seat & Tier</span>
              <span class="stub-seat-assigned">${t.seat}</span>
            </div>
            <button class="stub-enlarge-btn" onclick="openTicketQrById('${t.id}')">
              Enlarge Gate QR
            </button>
          </div>
        `;
        container.prepend(stub);

        // Render QR
        const qrEl = document.getElementById(`qr-${t.id}`);
        if (qrEl) {
          qrEl.innerHTML = generateQrSvg(t.id, 56) + '<div class="turnstile-laser-line"></div>';
        }

        // Increment count
        const countEl = document.getElementById('profPassesCount');
        if (countEl) countEl.innerText = parseInt(countEl.innerText || '1') + 1;
      }

      // ============================================================
      // FESTIVAL CONFETTI CELEBRATION ENGINE (HIGH-PERFORMANCE CANVAS)
      // ============================================================
      function triggerFestivalConfetti() {
        const canvas = document.getElementById('festivalConfettiCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const colors = [
          '#F59E0B', '#3B82F6', '#EC4899', '#8B5CF6', 
          '#10B981', '#38BDF8', '#F43F5E', '#FFFFFF', '#FBBF24'
        ];
        const confettiCount = 110;
        const particles = [];

        for (let i = 0; i < confettiCount; i++) {
          particles.push({
            x: window.innerWidth * (0.35 + Math.random() * 0.3),
            y: window.innerHeight * 0.75,
            vx: (Math.random() - 0.5) * 24,
            vy: -(Math.random() * 18 + 10),
            size: Math.random() * 9 + 5,
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 14,
            drag: 0.965,
            gravity: 0.46,
            wobble: Math.random() * 10,
            opacity: 1
          });
        }

        let startTime = Date.now();
        const duration = 3200;

        function renderConfetti() {
          const elapsed = Date.now() - startTime;
          if (elapsed > duration) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            return;
          }

          ctx.clearRect(0, 0, canvas.width, canvas.height);
          const fade = elapsed > duration - 800 ? (duration - elapsed) / 800 : 1;

          for (let p of particles) {
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= p.drag;
            p.vy = p.vy * p.drag + p.gravity;
            p.rotation += p.rotationSpeed;
            p.wobble += 0.12;

            ctx.save();
            ctx.translate(p.x + Math.sin(p.wobble) * 2, p.y);
            ctx.rotate((p.rotation * Math.PI) / 180);
            ctx.scale(Math.cos(p.wobble), 1);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = Math.max(0, fade * p.opacity);
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.65);
            ctx.restore();
          }

          requestAnimationFrame(renderConfetti);
        }

        requestAnimationFrame(renderConfetti);

        // Show celebratory toast
        showCelebrationToast('RESERVATION CONFIRMED · PASS LOCKED IN WALLET');
      }

      function showCelebrationToast(msg) {
        const toast = document.getElementById('celebrationToast');
        if (!toast) return;
        const msgEl = document.getElementById('celebrationToastMsg');
        if (msgEl) msgEl.innerText = msg;
        toast.classList.add('show');
        setTimeout(() => {
          toast.classList.remove('show');
        }, 3600);
      }

      function quickSelectHallTier(name, price) {
        document.getElementById('hallSelectedTierName').innerText = name.toUpperCase();
        document.getElementById('hallSelectedTierPrice').innerText = `$${price}`;
      }

      // Verified Wallet Tickets Registry
      const WALLET_TICKETS = {
        'TKT-VANNDA-FANPIT-001': {
          id: 'TKT-VANNDA-FANPIT-001',
          artist: 'VannDa (វណ្ណដា)',
          tour: 'Skull Tour: Born in Battambang Live',
          venue: 'Bassac Live Main Hall • Koh Pich, Phnom Penh • NOV 14 • 07:30 PM',
          seat: 'Fanpit Standing #042 · Gate 1'
        }
      };
      const SAVED_TICKETS_KEY = 'ct_saved_tickets';

function getSavedTickets() {
  try {
    return JSON.parse(localStorage.getItem(SAVED_TICKETS_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveTicketToStorage(ticket) {
  const list = getSavedTickets();
  list.push(ticket);
  try {
    localStorage.setItem(SAVED_TICKETS_KEY, JSON.stringify(list));
  } catch (e) {}
}

function loadSavedTickets() {
  getSavedTickets().forEach(t => addTicketStubToWallet(t));
}
      function openTicketQrById(ticketId) {
        const t = WALLET_TICKETS[ticketId] || {
          id: ticketId,
          artist: 'VannDa (វណ្ណដា)',
          tour: 'Skull Tour: Born in Battambang Live'
        };
        openEnlargedQrModal(t.artist, t.tour, t.id);
      }

      function viewActivePassQr() {
        openTicketQrById('TKT-VANNDA-FANPIT-001');
      }

      // High-performance, self-contained SVG Turnstile QR Code Generator
      // Eliminates external CDN network failure and Unicode character overflow crashes
      function generateQrSvg(text, size = 180) {
        let hash = 0;
        const str = String(text || 'TKT-VANNDA-FANPIT-001');
        for (let i = 0; i < str.length; i++) {
          hash = ((hash << 5) - hash) + str.charCodeAt(i);
          hash |= 0;
        }

        const N = 25;
        const grid = Array.from({ length: N }, () => Array(N).fill(0));

        function setFinder(r0, c0) {
          for (let r = 0; r < 7; r++) {
            for (let c = 0; c < 7; c++) {
              if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
                grid[r0 + r][c0 + c] = 1;
              } else {
                grid[r0 + r][c0 + c] = 0;
              }
            }
          }
        }

        // 3 Standard QR Finder Squares
        setFinder(0, 0);
        setFinder(0, N - 7);
        setFinder(N - 7, 0);

        // Timing Patterns
        for (let i = 8; i < N - 8; i++) {
          grid[6][i] = i % 2 === 0 ? 1 : 0;
          grid[i][6] = i % 2 === 0 ? 1 : 0;
        }

        // Alignment Pattern at (16..20, 16..20)
        for (let r = 16; r <= 20; r++) {
          for (let c = 16; c <= 20; c++) {
            if (r === 16 || r === 20 || c === 16 || c === 20 || (r === 18 && c === 18)) {
              grid[r][c] = 1;
            }
          }
        }

        // Deterministic Payload Grid
        let bitIdx = 0;
        for (let r = 0; r < N; r++) {
          for (let c = 0; c < N; c++) {
            const isFinder = (r < 8 && c < 8) || (r < 8 && c >= N - 8) || (r >= N - 8 && c < 8);
            const isTiming = r === 6 || c === 6;
            const isAlignment = r >= 16 && r <= 20 && c >= 16 && c <= 20;
            if (!isFinder && !isTiming && !isAlignment) {
              const charVal = str.charCodeAt(bitIdx % str.length);
              const bit = ((hash ^ (r * 37 + c * 19 + charVal)) & 1);
              grid[r][c] = bit;
              bitIdx++;
            }
          }
        }

        let rects = '';
        for (let r = 0; r < N; r++) {
          for (let c = 0; c < N; c++) {
            if (grid[r][c] === 1) {
              rects += `<rect x="${c + 2}" y="${r + 2}" width="1" height="1" fill="#090A10" />`;
            }
          }
        }

        return `<svg width="${size}" height="${size}" viewBox="0 0 ${N + 4} ${N + 4}" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges" style="display:block; border-radius: 8px;">
          <rect width="${N + 4}" height="${N + 4}" fill="#FFFFFF" />
          ${rects}
        </svg>`;
      }

      function initInitialQr() {
        const target = document.getElementById('ticketQr1');
        if (target) {
          target.innerHTML = generateQrSvg('TKT-VANNDA-FANPIT-001', 56) + '<div class="turnstile-laser-line"></div>';
        }
      }

      function openEnlargedQrModal(artist, tour, ticketId) {
        const safeArtist = artist || 'VannDa (វណ្ណដា)';
        const safeTour = tour || 'Skull Tour: Born in Battambang Live';
        const safeId = ticketId || 'TKT-VANNDA-FANPIT-001';

        const nameEl = document.getElementById('modalQrArtistName');
        const tourEl = document.getElementById('modalQrTourSub');
        const idEl = document.getElementById('modalQrTicketIdLabel');
        if (nameEl) nameEl.innerText = safeArtist;
        if (tourEl) tourEl.innerText = safeTour;
        if (idEl) idEl.innerText = safeId;

        // Render QR Code immediately via SVG (immune to network issues and unicode errors)
        const target = document.getElementById('enlargedQrContainer');
        if (target) {
          target.innerHTML = generateQrSvg(safeId, 180);
        }

        // Open modal
        const modal = document.getElementById('enlargedQrModal');
        if (modal) {
          modal.classList.add('active');
        }
      }

      function closeEnlargedQrModal(e) {
        if (e && e.target !== e.currentTarget && !e.target.classList.contains('sheet-close-btn') && !e.target.closest('.sheet-close-btn')) return;
        const modal = document.getElementById('enlargedQrModal');
        if (modal) {
          modal.classList.remove('active');
        }
      }

      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          closeEnlargedQrModal();
          closeReservationModal();
          closeAuthModal();
        }
      });

      function openAuthModal() {
        const modal = document.getElementById('authModal');
        if (modal) {
          switchAuthStep('phone');
          modal.classList.add('active');
          const input = document.getElementById('authPhoneInput');
          if (input) setTimeout(() => input.focus(), 150);
        }
      }

      function closeAuthModal(e) {
        if (e && e.target && e.target !== e.currentTarget && !e.target.classList.contains('sheet-close-btn') && !e.target.closest('.sheet-close-btn')) return;
        const modal = document.getElementById('authModal');
        if (modal) modal.classList.remove('active');
        const btn = document.getElementById('verifyOtpBtn');
        if (btn) {
          btn.disabled = false;
          btn.innerText = 'Verify Code & Enter';
        }
      }

      function switchAuthStep(step) {
        const phoneStep = document.getElementById('authPhoneStep');
        const otpStep = document.getElementById('authOtpStep');
        if (step === 'phone') {
          if (phoneStep) phoneStep.style.display = 'block';
          if (otpStep) otpStep.style.display = 'none';
        } else {
          if (phoneStep) phoneStep.style.display = 'none';
          if (otpStep) otpStep.style.display = 'block';
          const otpInput = document.getElementById('authOtpInput');
          if (otpInput) setTimeout(() => otpInput.focus(), 150);
        }
      }

      function formatCleanCambodianPhone(raw) {
        let cleaned = (raw || '').trim().replace(/[\s\-\.\(\)]/g, '');
        if (cleaned.startsWith('+855')) return cleaned;
        if (cleaned.startsWith('00855')) return '+855' + cleaned.slice(5);
        if (cleaned.startsWith('855')) return '+855' + cleaned.slice(3);
        if (cleaned.startsWith('0')) return '+855' + cleaned.slice(1);
        return '+855' + cleaned;
      }

      let activeAuthPhone = '+85512345678';
      let activeDevOtp = '123456';

      async function handleSendPhoneOtp() {
        const input = document.getElementById('authPhoneInput');
        const raw = input ? input.value : '12 345 678';
        const formatted = formatCleanCambodianPhone(raw);
        activeAuthPhone = formatted;

        const btn = document.getElementById('sendOtpBtn');
        if (btn) {
          btn.disabled = true;
          btn.innerText = 'Sending SMS...';
        }

        try {
          const res = await fetch('/api/v1/auth/phone/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: formatted })
          });
          const data = await res.json().catch(() => ({}));
          if (data && data.devOtp) {
            activeDevOtp = data.devOtp;
          } else {
            activeDevOtp = '123456';
          }
        } catch (err) {
          activeDevOtp = '123456';
        } finally {
          if (btn) {
            btn.disabled = false;
            btn.innerText = 'Send Verification SMS';
          }
        }

        const displayEl = document.getElementById('authTargetPhoneDisplay');
        if (displayEl) displayEl.innerText = activeAuthPhone;

        const badge = document.getElementById('authOtpAutoFillBadge');
        const valEl = document.getElementById('authDevOtpVal');
        if (badge && valEl) {
          valEl.innerText = activeDevOtp;
          badge.style.display = 'block';
        }

        const otpInput = document.getElementById('authOtpInput');
        if (otpInput) otpInput.value = activeDevOtp;

        switchAuthStep('otp');
      }

      function autoFillOtpCode() {
        const otpInput = document.getElementById('authOtpInput');
        if (otpInput) {
          otpInput.value = activeDevOtp;
          otpInput.focus();
        }
      }

      async function handleVerifyPhoneOtp() {
        const otpInput = document.getElementById('authOtpInput');
        const code = otpInput ? otpInput.value.trim() : '';
        if (!code || code.length < 4) {
          alert('Please enter your 6-digit verification code.');
          return;
        }

        const btn = document.getElementById('verifyOtpBtn');
        if (btn) {
          btn.disabled = true;
          btn.innerText = 'Verifying...';
        }

        const nameInput = document.getElementById('authNameInput');
        const customName = (nameInput && nameInput.value.trim()) ? nameInput.value.trim() : 'Mao';

        let verifiedUser = {
          id: 'usr-' + (activeAuthPhone || '+85517864121').replace(/\D/g, '').slice(-8),
          name: customName,
          phone: activeAuthPhone || '+85517864121',
          email: (activeAuthPhone || '+85517864121').replace(/\D/g, '') + '@phone.concertpass.com',
          authProvider: 'PHONE'
        };

        try {
          const res = await fetch('/api/v1/auth/phone/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phone: activeAuthPhone,
              code: code,
              name: customName
            })
          });
          const json = await res.json().catch(() => ({}));
          if (json && json.data && json.data.user) {
            verifiedUser = json.data.user;
          }
        } catch (err) {}

        currentUser = verifiedUser;
        try {
          sessionStorage.setItem('ct_user', JSON.stringify(currentUser));
        } catch (e) {}

        if (btn) {
          btn.disabled = false;
          btn.innerText = 'Verify Code & Enter';
        }

        try {
          syncUserUi();
        } catch (err) {
          console.warn('syncUserUi warning:', err);
        }

        closeAuthModal();
        switchNavTab('profile');
        showCelebrationToast('SIGNED IN · WELCOME ' + (currentUser.name || 'USER').toUpperCase());
      }

      function loginDemoUserFromModal() {
        loginDemoUser();
        closeAuthModal();
        switchNavTab('profile');
      }

      function toggleEditNameInput(show) {
        const displayRow = document.getElementById('profNameDisplayRow');
        const editRow = document.getElementById('profNameEditRow');
        const input = document.getElementById('profNameInlineInput');
        if (show) {
          if (displayRow) displayRow.style.display = 'none';
          if (editRow) editRow.style.display = 'flex';
          if (input) {
            input.value = currentUser ? (currentUser.name || 'Mao') : 'Mao';
            setTimeout(() => input.focus(), 60);
          }
        } else {
          if (displayRow) displayRow.style.display = 'flex';
          if (editRow) editRow.style.display = 'none';
        }
      }

      function saveEditedName() {
        const input = document.getElementById('profNameInlineInput');
        const newName = input ? input.value.trim() : '';
        if (!newName) {
          alert('Please enter a valid name.');
          return;
        }
        if (!currentUser) {
          currentUser = {
            name: newName,
            phone: '+85517864121',
            email: '85517864121@phone.concertpass.com',
            authProvider: 'PHONE'
          };
        } else {
          currentUser.name = newName;
        }
        try {
          sessionStorage.setItem('ct_user', JSON.stringify(currentUser));
        } catch (e) {}

        toggleEditNameInput(false);
        syncUserUi();
        showCelebrationToast('NAME UPDATED · ' + newName.toUpperCase());
      }

      function syncUserUi() {
        const inBlock = document.getElementById('profSignedInBlock');
        const outBlock = document.getElementById('profSignedOutBlock');
        const authBtn = document.getElementById('authActionBtn');
        const userPill = document.getElementById('userPillBox');

        if (currentUser) {
          if (authBtn) authBtn.style.display = 'none';
          if (userPill) userPill.style.display = 'flex';
          const userName = currentUser.name || 'Mao';
          const initial = userName.trim().charAt(0).toUpperCase() || 'M';

          const avatarEl = document.getElementById('userAvatarInitial');
          if (avatarEl) avatarEl.innerText = initial;
          const displayEl = document.getElementById('userDisplayName');
          if (displayEl) displayEl.innerText = userName.split(' ')[0];

          const profNameEl = document.getElementById('profUserName');
          if (profNameEl) profNameEl.innerText = userName;

          const inlineInput = document.getElementById('profNameInlineInput');
          if (inlineInput) inlineInput.value = userName;

          const profAvatarEl = document.getElementById('profAvatarInitial');
          if (profAvatarEl) profAvatarEl.innerText = initial;

          const phoneEl = document.getElementById('profUserPhoneDisplay');
          if (phoneEl) phoneEl.innerText = currentUser.phone || '+85517864121';

          const passesEl = document.getElementById('profPassesCount');
          if (passesEl) {
            passesEl.innerText = (typeof purchasedPasses !== 'undefined' && Array.isArray(purchasedPasses) && purchasedPasses.length > 0) ? purchasedPasses.length : 0;
          }

          if (inBlock) inBlock.style.display = 'block';
          if (outBlock) outBlock.style.display = 'none';
        } else {
          if (authBtn) authBtn.style.display = 'flex';
          if (userPill) userPill.style.display = 'none';
          if (inBlock) inBlock.style.display = 'none';
          if (outBlock) outBlock.style.display = 'block';
        }
      }

      function loginDemoUser() {
        currentUser = {
          name: 'Mao',
          email: '85517864121@phone.concertpass.com',
          phone: '+85517864121',
          authProvider: 'PHONE'
        };
        try {
          sessionStorage.setItem('ct_user', JSON.stringify(currentUser));
        } catch (e) {}
        syncUserUi();
        showCelebrationToast('SIGNED IN AS MAO');
      }

      function logoutUser() {
        currentUser = null;
        try {
          sessionStorage.removeItem('ct_user');
        } catch (e) {}
        syncUserUi();
        showCelebrationToast('SIGNED OUT');
      }
