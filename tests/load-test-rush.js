const autocannon = require('autocannon');

const url = 'http://127.0.0.1:8000/api/v1/concerts'; // Endpoint to query tickets/seats

async function runPhase(title, connections, duration) {
  console.log(`\n=== Starting Phase: ${title} ===`);
  console.log(`Target: ${connections} concurrent connections for ${duration} seconds`);
  
  return new Promise((resolve, reject) => {
    const instance = autocannon({
      url,
      connections,
      duration,
      pipelining: 1, // 1 request per connection at a time
      timeout: 10 // 10 seconds timeout
    }, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });

    autocannon.track(instance, { renderProgressBar: true, renderStatusCodes: true });
  });
}

async function runLoadTest() {
  console.log('🚀 Starting 10,000-User Flash Sale Rush Simulation (Edge Queue Protection R2)\n');
  
  try {
    // Stage 1 (Warmup): 500 virtual users over 30s.
    await runPhase('Stage 1: Warmup', 500, 30);

    // Stage 2 (Sale Opening Surge): 5,000 concurrent users over 60s.
    await runPhase('Stage 2: Sale Opening Surge (09:00 AM)', 5000, 60);

    // Stage 3 (Peak Rush): 10,000 users for 4 minutes (240s).
    await runPhase('Stage 3: Peak Rush', 10000, 240);

    // Stage 4 (Cooldown): Ramp down to normal traffic (200 users for 30s).
    await runPhase('Stage 4: Cooldown', 200, 30);

    console.log('\n✅ Flash Sale Rush Simulation Completed Successfully.');
  } catch (error) {
    console.error('\n❌ Error during load test:', error);
  }
}

runLoadTest();
