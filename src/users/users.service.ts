import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindManyOptions, Repository } from "typeorm";
import { UserDto } from "./dto/user.dto";
import { isUserEntity, UserEntity } from "../model/user.entity";
import { toUserDto } from "../common/mapper";
import { CreateUserDto } from "./dto/user-create.dto";
import { ChallengeResponseValidation } from "../common/challengeValidation";
import { ChallengeResponseDTO } from "./dto/challenge-response.dto";
import { PaginationRequestDto, PaginationResult } from "src/pagination";
import { isOrganizerEntity, OrganizerEntity } from "src/model/organizer.entity";
import { CreateOrganizerDto } from "./dto/organizer.dto";

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

  async challengeLogin(payload: ChallengeResponseDTO): Promise<UserDto> {
    const { signature, challengeString, userCredential } = payload;
    var user: UserEntity = await this.userRepo.findOne({
      where: userCredential,
    });

    if (!user) {
      throw new HttpException("User not found", HttpStatus.UNAUTHORIZED);
    }

    const valid = new ChallengeResponseValidation().validate(
      user,
      signature,
      challengeString,
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

  async register(
    newUserDto: CreateUserDto | CreateOrganizerDto
  ): Promise<UserDto> {
    const { username, profileType } = newUserDto;
    const user = await this.userRepo.findOne({ username });

    if (user) {
      throw new HttpException("User already exists", HttpStatus.BAD_REQUEST);
    }

    try {
      let newUser: any;
      const { name, publicKey } = newUserDto;
      newUser = new UserEntity();
      newUser.name = name;
      newUser.username = username;
      newUser.publicKey = publicKey;
      newUser.profileType = profileType;

      // if (isOrganizerEntity(newUserDto)) {
      //   newUser = new OrganizerEntity();
      //   newUser.name = name;
      //   newUser.username = username;
      //   newUser.publicKey = publicKey;
      //   newUser.profileType = profileType;
      //   newUser.bio = newUserDto.bio;
      //   newUser.hourlyRate = newUserDto.hourlyRate;
      //   newUser.profession = newUserDto?.profession;
      //   newUser.jobTitle = newUserDto?.jobTitle;
      //   newUser.skills = newUserDto?.skills;
      // } else if (isUserEntity(newUserDto)) {
      // }

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

  // public async getUserEvents(query?: any) {
  //     if(!query){
  //         return
  //     }

  // }

  // private _sanitizeUser(user: UserEntity) {
  //   delete user.password;
  //   return user;
  // }
}
