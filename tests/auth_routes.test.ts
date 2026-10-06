import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import express from 'express';
import authRoutes from '../server/routes/auth.routes';
import { prisma } from '../server/config/prisma';

// Create test app instance
const app = express();
app.use(express.json());
app.use('/api/v1/auth', authRoutes);

describe('Integration Tests: Express Auth Routes & DB Integration', () => {
  it('GET /api/v1/auth/facebook/url returns Facebook OAuth URL', async () => {
    const { AuthService } = await import('../server/services/auth.service');
    const url = AuthService.getFacebookAuthUrl();
    assert.ok(url.includes('https://www.facebook.com/v19.0/dialog/oauth'));
    assert.ok(url.includes('client_id='));
  });

  it('POST /api/v1/auth/phone/send-otp saves verification record in PostgreSQL', async () => {
    const { AuthService } = await import('../server/services/auth.service');
    const cambodianPhone = '012 888 777';
    const result = await AuthService.sendPhoneOtp(cambodianPhone);

    assert.equal(result.success, true);
    assert.equal(result.phone, '+85512888777');
    assert.ok(result.devOtp && result.devOtp.length === 6);

    // Verify record in PostgreSQL table phone_verifications
    const dbRecord = await prisma.phoneVerification.findFirst({
      where: { phone: '+85512888777' },
      orderBy: { createdAt: 'desc' },
    });

    assert.ok(dbRecord);
    assert.equal(dbRecord.phone, '+85512888777');
    assert.equal(dbRecord.code, result.devOtp);
    assert.equal(dbRecord.verified, false);
  });

  it('POST /api/v1/auth/phone/verify-otp marks verified and saves user to PostgreSQL', async () => {
    const { AuthService } = await import('../server/services/auth.service');
    const cambodianPhone = '012 888 777';
    
    // Get active code from DB
    const verification = await prisma.phoneVerification.findFirst({
      where: { phone: '+85512888777', verified: false },
      orderBy: { createdAt: 'desc' },
    });
    assert.ok(verification);

    const result = await AuthService.verifyPhoneOtp({
      phone: cambodianPhone,
      code: verification.code,
      name: 'Rithy Sok',
    });

    assert.ok(result.user);
    assert.equal(result.user.phone, '+85512888777');
    assert.equal(result.user.name, 'Rithy Sok');
    assert.equal(result.user.authProvider, 'PHONE');
    assert.ok(result.tokens.accessToken);
    assert.ok(result.tokens.refreshToken);

    // Check DB record updated to verified
    const updatedVerification = await prisma.phoneVerification.findUnique({
      where: { id: verification.id },
    });
    assert.equal(updatedVerification?.verified, true);

    // Check user in users table
    const dbUser = await prisma.user.findFirst({
      where: { phone: '+85512888777' },
    });
    assert.ok(dbUser);
    assert.equal(dbUser.phone, '+85512888777');
    assert.equal(dbUser.authProvider, 'PHONE');
  });

  it('OAuth Facebook saves user with facebookId and authProvider in PostgreSQL', async () => {
    const { AuthService } = await import('../server/services/auth.service');
    const fbId = 'fb_test_' + Date.now();
    const result = await AuthService.oauthLogin({
      provider: 'FACEBOOK',
      name: 'Facebook User Test',
      email: `${fbId}@facebook.concertapp.com`,
      avatar: 'https://images.unsplash.com/fb-avatar.jpg',
      providerId: fbId,
    });

    assert.ok(result.user);
    assert.equal(result.user.name, 'Facebook User Test');
    assert.equal(result.user.authProvider, 'FACEBOOK');

    const dbUser = await prisma.user.findFirst({
      where: { facebookId: fbId },
    });
    assert.ok(dbUser);
    assert.equal(dbUser.facebookId, fbId);
    assert.equal(dbUser.authProvider, 'FACEBOOK');
  });
});
