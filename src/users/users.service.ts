import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindManyOptions, Repository } from "typeorm";
import { UserDto } from "./dto/user.dto";
import { UserEntity } from "../model/user.entity";
import { toUserDto } from "../common/mapper";
import { CreateUserDto } from "./dto/user-create.dto";
import { ChallengeResponseDTO } from "./dto/challenge-response.dto";
import { ChallengeRequestDTO } from "./dto/challenge-request.dto";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>
  ) {}

  async findOne(options?: object, toDto?: boolean): Promise<UserDto> {
    const user = await this.userRepo.findOne(options);

    if (toDto) return toUserDto(user);

    return user;
  }

  async updateUser(values: any, id: string): Promise<any> {
    try {
      let user = await this.userRepo.findOne({ where: { id } });
      if (typeof values === "object")
        for (let key in values) {
          user[`${key}`] = values[key];
        }
      console.log("new user record: ", user);
      await this.userRepo.save(user);

      const newUser = await this.userRepo.findOne({ where: { id } });

      return {
        status: 201,
        message: "User record updated successfully.",
        record: newUser,
      };
    } catch (e) {
      console.error(e);
      throw new HttpException(
        "Could not update the record",
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async challengeLogin(
    challengeRequestDTO: ChallengeRequestDTO,
    id?: string,
    username?: string
  ): Promise<UserDto> {
    var user: UserEntity;

    if (id == null) {
      user = await this.userRepo.findOne({
        where: { username },
      });
    } else {
      user = await this.userRepo.findOne({
        where: { id },
      });
    }

    if (!user) {
      throw new HttpException("User not found", HttpStatus.UNAUTHORIZED);
    }

    const { signature, challenge } = challengeRequestDTO;
    const valid = new ChallengeResponseDTO().validate(
      user,
      signature,
      challenge
    );

    if (!valid) {
      throw new HttpException("Invalid credentials", HttpStatus.UNAUTHORIZED);
    }

    return toUserDto(user);
  }

  async findByPayload({ username }: any): Promise<UserDto> {
    return await this.findOne({ where: { username } });
  }

  async register(newUserDto: any): Promise<UserDto> {
    const { name, username, publicKey, profileType } = newUserDto;

    // check if user doesn't exists yet
    const user = await this.userRepo.findOne({ username });

    if (user) {
      throw new HttpException("User already exists", HttpStatus.BAD_REQUEST);
    }

    try {
      let newUser = new UserEntity();
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
      console.error(e);
      throw new HttpException(
        "Something went wrong while creating new user",
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async getAll(options?: FindManyOptions<UserEntity>): Promise<UserEntity[]> {
    try {
      const users = await this.userRepo.find(options);

      return users;
    } catch (e) {}
  }

  // private _sanitizeUser(user: UserEntity) {
  //   delete user.password;
  //   return user;
  // }
}
