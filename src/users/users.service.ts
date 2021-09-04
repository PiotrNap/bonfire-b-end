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

  async challengeLogin(
    response: ChallengeResponseDTO,
    id?: string
  ): Promise<UserDto> {
    var user: UserEntity;

    if (id == null) {
      user = await this.userRepo.findOne({
        where: { username: response.username },
      });
    } else {
      user = await this.userRepo.findOne({
        where: { id },
      });
    }

    if (!user) {
      throw new HttpException("User not found", HttpStatus.UNAUTHORIZED);
    }
    const valid = await new ChallengeResponseDTO().validate(user);

    if (!valid) {
      throw new HttpException("Invalid credentials", HttpStatus.UNAUTHORIZED);
    }

    return toUserDto(user);
  }

  async findByPayload({ username }: any): Promise<UserDto> {
    return await this.findOne({ where: { username } });
  }

  async registerUser(newUserDto: CreateUserDto): Promise<UserDto> {
    const { name, username, publicKey, profileType } = newUserDto;

    // check if user doesn't exists yet
    const user = await this.userRepo.findOne({ username });

    if (user) {
      throw new HttpException("User already exists", HttpStatus.BAD_REQUEST);
    }

    try {
      const newUser = new UserEntity();
      newUser.name = name;
      newUser.username = username;
      newUser.publicKey = publicKey;
      newUser.profileType = profileType;

      await this.userRepo.save(newUser);

      const userDto = new CreateUserDto(
        newUser.name,
        newUser.username,
        newUser.publicKey,
        newUser.id,
        newUser.profileType
      );

      return userDto;
    } catch (e) {
      throw new HttpException(
        "Something went wrong while creating new user",
        HttpStatus.BAD_REQUEST
      );
    }
  }

  // private _sanitizeUser(user: UserEntity) {
  //   delete user.password;
  //   return user;
  // }
}
