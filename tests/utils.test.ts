import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { AppError } from '../server/utils/AppError';
import { signAccessToken, verifyAccessToken } from '../server/utils/jwt';

describe('Unit Tests: Server Utilities', () => {
  it('AppError creates operational error with correct status codes', () => {
    const error404 = new AppError('Resource not found', 404);
    assert.equal(error404.message, 'Resource not found');
    assert.equal(error404.statusCode, 404);
    assert.equal(error404.status, 'fail');
    assert.equal(error404.isOperational, true);

    const error500 = new AppError('Server explosion', 500);
    assert.equal(error500.statusCode, 500);
    assert.equal(error500.status, 'error');
  });

  it('JWT sign and verify works correctly', () => {
    const payload = {
      userId: 'test-user-id-123',
      email: 'test@camtech.edu.kh',
      role: 'USER',
    };

    const token = signAccessToken(payload);
    assert.ok(typeof token === 'string' && token.length > 0);

    const decoded = verifyAccessToken(token);
    assert.equal(decoded.userId, payload.userId);
    assert.equal(decoded.email, payload.email);
    assert.equal(decoded.role, payload.role);
  });
});
