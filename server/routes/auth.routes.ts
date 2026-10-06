import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middlewares/validate';
import { authenticate } from '../middlewares/auth';
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  oauthSchema,
  sendPhoneOtpSchema,
  verifyPhoneOtpSchema,
} from '../validations';

const router = Router();

router.post('/register', validate(registerSchema), AuthController.register);
router.post('/login', validate(loginSchema), AuthController.login);
router.post('/oauth', validate(oauthSchema), AuthController.oauth);
router.post('/phone/send-otp', validate(sendPhoneOtpSchema), AuthController.sendPhoneOtp);
router.post('/phone/verify-otp', validate(verifyPhoneOtpSchema), AuthController.verifyPhoneOtp);
router.get('/facebook/url', AuthController.getFacebookUrl);
router.get('/facebook', AuthController.getFacebookUrl);
router.get('/facebook/callback', AuthController.facebookCallback);
router.post('/facebook/callback', AuthController.facebookCallback);
router.post('/refresh', validate(refreshSchema), AuthController.refresh);
router.post('/logout', AuthController.logout);
router.get('/me', authenticate, AuthController.getMe);

export default router;
