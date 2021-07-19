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
        username: 'ocg',
        password: 'code.is.law',
        x: ['a list', 'of things', 'i am good at']
      },
      {
        userId: 3,
        username: 'randall',
        password: 'm@n1nth3h@t',
        x: ['a list', 'of things', 'i am good at']
      },
    ];
  }

  async findOne(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }
}
