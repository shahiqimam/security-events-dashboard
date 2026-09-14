import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from '../events/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly jwt: JwtService
  ) {}

  async login(email: string, password: string) {
    const user = await this.users.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return {
      accessToken: await this.jwt.signAsync({ sub: user.id, email: user.email, role: user.role }),
      user: this.publicUser(user)
    };
  }

  publicUser(user: User) {
    return { id: user.id, name: user.name, email: user.email, role: user.role };
  }
}
