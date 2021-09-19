import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindManyOptions, Repository } from "typeorm";
import { UserDto } from "./dto/user.dto";
import { UserEntity } from "../model/user.entity";
import { toUserDto } from "../common/mapper";
import { CreateUserDto } from "./dto/user-create.dto";
import { ChallengeResponseDTO } from "./dto/challenge-response.dto";
import { ChallengeRequestDTO } from "./dto/challenge-request.dto";
import { PaginationRequestDto, PaginationResult } from "src/pagination";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>
  ) {}

  async findOne(options: any, toDto?: boolean): Promise<UserDto> {
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
    challengeRequestDTO: ChallengeRequestDTO
  ): Promise<UserDto> {
    console.log("challengeRequestDTO: ", challengeRequestDTO);
    const { signature, challenge, userCredential } = challengeRequestDTO;
    var user: UserEntity = await this.userRepo.findOne({
      where: userCredential,
    });

    if (!user) {
      throw new HttpException("User not found", HttpStatus.UNAUTHORIZED);
    }

    const valid = new ChallengeResponseDTO().validate(
      user,
      signature,
      challenge,
      userCredential
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
      const users = await this.userRepo.find({ ...options, skip: 1 });

      return users;
    } catch (e) {}
  }

  async getAllWithPagination(
    paginationRequestDto: PaginationRequestDto,
    options?: FindManyOptions<UserEntity>
  ): Promise<PaginationResult<UserEntity> | void> {
    try {
      let { limit, page } = paginationRequestDto;
      page = Math.abs(Number(page));
      limit = Math.abs(Number(limit));
      if (limit < 10) limit = 10;
      let skip = (page - 1) * limit;

      const results = await this.userRepo.findAndCount({
        take: limit,
        skip,
        order: {
          createDateTime: "ASC",
        },
        // default cache time = 1s
        cache: true,
        ...options,
      });

      if (results == null) throw new Error();

      return {
        result: results[0],
        count: results[1],
        limit,
        page,
      };
    } catch (e) {
      console.error(e);
      throw new HttpException("Something went wrong", HttpStatus.BAD_REQUEST);
    }
  }

  // private _sanitizeUser(user: UserEntity) {
  //   delete user.password;
  //   return user;
  // }
}
