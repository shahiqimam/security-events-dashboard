import bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';
import { UserRole } from '../common/enums';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  it('rejects bad login attempts', async () => {
    const service = new AuthService({ findOne: jest.fn().mockResolvedValue(null) } as any, {} as any);
    await expect(service.login('missing@example.com', 'bad')).rejects.toThrow(UnauthorizedException);
  });

  it('returns a token and public user on valid login', async () => {
    const user = {
      id: 'user-1',
      name: 'Demo Analyst',
      email: 'analyst@sentinelview.local',
      role: UserRole.ANALYST,
      passwordHash: await bcrypt.hash('Password123!', 4)
    };
    const service = new AuthService(
      { findOne: jest.fn().mockResolvedValue(user) } as any,
      { signAsync: jest.fn().mockResolvedValue('jwt-token') } as any
    );

    const result = await service.login(user.email, 'Password123!');

    expect(result.accessToken).toBe('jwt-token');
    expect(result.user).toEqual({ id: user.id, name: user.name, email: user.email, role: user.role });
  });
});
