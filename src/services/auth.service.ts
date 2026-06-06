import type { User } from '@prisma/client';
import prisma from '../config/prisma';
import { ApiError } from '../utils/ApiError';
import { hashPassword, comparePassword } from '../utils/password';
import { signToken } from '../utils/jwt';

/** Strip the password hash before returning a user to the client. */
const sanitize = (user: User) => {
  const safe = { ...user } as Partial<User>;
  delete safe.passwordHash;
  return safe;
};

export const authService = {
  async register(input: { email: string; username: string; password: string }) {
    const existing = await prisma.user.findUnique({
      where: { email: input.email },
    });
    if (existing) {
      throw ApiError.conflict('An account with this email already exists');
    }

    const user = await prisma.user.create({
      data: {
        email: input.email,
        username: input.username,
        passwordHash: await hashPassword(input.password),
      },
    });

    const token = signToken({ sub: user.id, email: user.email });
    return { user: sanitize(user), token };
  },

  async login(input: { email: string; password: string }) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });
    // Same message for both cases to avoid leaking which emails exist.
    if (!user) throw ApiError.unauthorized('Invalid email or password');

    const valid = await comparePassword(input.password, user.passwordHash);
    if (!valid) throw ApiError.unauthorized('Invalid email or password');

    const token = signToken({ sub: user.id, email: user.email });
    return { user: sanitize(user), token };
  },
};
