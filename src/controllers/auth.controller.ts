import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { sendSuccess } from '../utils/ApiResponse';

export const authController = {
  async register(req: Request, res: Response) {
    const result = await authService.register(req.body);
    sendSuccess(res, result, {
      status: 201,
      message: 'Account created successfully',
    });
  },

  async login(req: Request, res: Response) {
    const result = await authService.login(req.body);
    sendSuccess(res, result, { message: 'Logged in successfully' });
  },
};
