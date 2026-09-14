import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { UserRole } from '../common/enums';
import { User } from '../events/entities/user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly users: Repository<User>) {}

  async assignees() {
    const users = await this.users.find({
      where: { role: In([UserRole.ADMIN, UserRole.ANALYST]) },
      order: { name: 'ASC' }
    });
    return users.map((user) => ({ id: user.id, name: user.name, email: user.email, role: user.role }));
  }
}
