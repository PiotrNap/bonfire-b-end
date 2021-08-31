import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserDto } from "./dto/user.dto";
import { UserEntity } from "../model/user.entity";
import { toUserDto } from "../common/mapper";
import { CreateUserDto } from "./dto/user.create.dto";
import { ChallengeResponseDTO } from "./dto/challenge-response.dto";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>
  ) {}

  async findOne(options?: object): Promise<UserDto> {
    const user = await this.userRepo.findOne(options);
    return toUserDto(user);
  }

  async challengeLogin(response: ChallengeResponseDTO): Promise<UserDto> {
    const user = await this.userRepo.findOne({
      where: { username: response.username },
    });
    if (!user) {
      throw new HttpException("User not found", HttpStatus.UNAUTHORIZED);
    }
    const valid = await response.validate(user);
    if (!valid) {
      throw new HttpException("Invalid credentials", HttpStatus.UNAUTHORIZED);
    }

    return toUserDto(user);
  }

  async findByPayload({ username }: any): Promise<UserDto> {
    return await this.findOne({ where: { username } });
  }

  async create(newUserDto: CreateUserDto): Promise<UserDto> {
    const { name, username, publicKey } = newUserDto;

    // check if the user exists in the db
    const userInDb = await this.userRepo.findOne({ where: { username } });
    if (userInDb) {
      throw new HttpException("User already exists", HttpStatus.BAD_REQUEST);
    }

    const user: UserEntity = await this.userRepo.create({
      username,
      publicKey,
    });

    await this.userRepo.save(user);

    return toUserDto(user);
  }

  // private _sanitizeUser(user: UserEntity) {
  //   delete user.password;
  //   return user;
  // }
}
