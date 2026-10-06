import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { AuthenticatedRequest } from '../middlewares/auth';
import { AppError } from '../utils/AppError';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password, phone } = req.body;
      const result = await AuthService.register({ name, email, password, phone });
      res.status(201).json({
        success: true,
        message: 'Account registered successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login({ email, password });
      res.status(200).json({
        success: true,
        message: 'Logged in successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const tokens = await AuthService.refresh(refreshToken);
      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: tokens,
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const result = await AuthService.logout(refreshToken);
      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }
      const profile = await AuthService.getProfile(req.user.userId);
      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  static async oauth(req: Request, res: Response, next: NextFunction) {
    try {
      const { provider, email, name, avatar, providerId } = req.body;
      const result = await AuthService.oauthLogin({ provider, email, name, avatar, providerId });
      res.status(200).json({
        success: true,
        message: `${provider} authentication successful`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async sendPhoneOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { phone } = req.body;
      const result = await AuthService.sendPhoneOtp(phone);
      res.status(200).json({
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async verifyPhoneOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { phone, code, name } = req.body;
      const result = await AuthService.verifyPhoneOtp({ phone, code, name });
      res.status(200).json({
        success: true,
        message: 'Phone verification successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getFacebookUrl(req: Request, res: Response, next: NextFunction) {
    try {
      const redirectUri = req.query.redirectUri as string | undefined;
      const url = AuthService.getFacebookAuthUrl(redirectUri);

      if (req.query.redirect === 'true') {
        return res.redirect(url);
      }

      res.status(200).json({
        success: true,
        data: { url },
      });
    } catch (error) {
      next(error);
    }
  }

  static async facebookCallback(req: Request, res: Response, next: NextFunction) {
    try {
      const code = (req.query.code || req.body.code) as string;
      if (!code) {
        throw new AppError('Authorization code is required', 400);
      }
      const redirectUri = (req.query.redirectUri || req.body.redirectUri) as string | undefined;
      const result = await AuthService.handleFacebookCallback(code, redirectUri);
      res.status(200).json({
        success: true,
        message: 'Facebook authentication successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
