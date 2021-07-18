import { Injectable } from '@nestjs/common';

export type User = {
  userId: number;
  username: string;
  password: string;
  x: string[];
};

@Injectable()
export class UsersService {
  private readonly users: User[];

  constructor() {
    this.users = [
      {
        userId: 1,
        username: 'piotr',
        password: 'r0ckst@r',
        x: ['a list', 'of things', 'i am good at']
      },
      {
        userId: 2,
        username: 'chris',
        password: 'secret',
        x: ['a list', 'of things', 'i am good at']
      },
      {
        userId: 3,
        username: 'maria',
        password: 'guess',
        x: ['a list', 'of things', 'i am good at']
      },
    ];
  }

  async findOne(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }
}
