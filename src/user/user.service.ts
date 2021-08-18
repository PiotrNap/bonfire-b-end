import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserEntity } from "../model/user.entity";
import { UserDTO } from "./user.dto";
export type User = {
  userId: number;
  username: string;
  password: string;
  x: string[];
};

@Injectable()
export class UserService {
  constructor(  
    @InjectRepository(UserEntity) private readonly repo: Repository<UserEntity>,
    thing = 'shit'
    ) {}
  public async getAll(): Promise<UserDTO[] | null > {
    try {
      return await this.repo
        .find()
        .then((users) => users.map((e) => UserDTO.fromEntity(e)));
    } catch (e) {
      console.error(`Attempted Query: ${e.query} ..... has failed`);
      return null
    }
  }
  // public async findOne(username: string): Promise<User | undefined> {
  //   return user.find(user => user.username === username);
  // }
  public async create(dto: UserDTO, user: UserEntity): Promise<UserDTO> {
    try {return this.repo
      .save(dto.toEntity(user))
      .then((e) => UserDTO.fromEntity(e));} catch(e) {
        console.error(e)
      }
  }
}
