import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "../users/dto/user-create.dto";
import { UserDto } from "./dto/user.dto";
import { UpdateUserDto } from "./dto/user-update.dto";
import { Public } from "src/common/decorators/public.decorator";
import { PaginationRequestDto, PaginationResult } from "src/pagination";
import { UserEntity } from "src/model/user.entity";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getUsers(
    @Query() query: PaginationRequestDto
  ): Promise<PaginationResult<UserEntity> | UserEntity[] | void> {
    if (query !== undefined)
      return await this.usersService.getAllWithPagination(query);
    return await this.usersService.getAll();
  }

  @Public()
  @Post("register")
  public async registerUser(
    @Body() createUserDto: CreateUserDto
  ): Promise<UserDto> {
    return await this.usersService.register(createUserDto);
  }

  @Get("organizers")
  public async getOrganizers(
    @Query() query: PaginationRequestDto
  ): Promise<any> {
    if (query !== undefined)
      return await this.usersService.getAllWithPagination(query, {
        where: { profileType: "organizer" },
      });
    return await this.usersService.getAll({
      where: { profileType: "organizer" },
      relations: [],
    });
  }

  @Get(":uuid")
  public async getUserById(@Param("uuid", ParseUUIDPipe) uuid: string) {
    return await this.usersService.findOne({ where: { id: uuid } }, false);
  }

  @Put(":uuid")
  public async updateUser(
    @Body() body: UpdateUserDto,
    @Param("uuid", ParseUUIDPipe) uuid: string
  ): Promise<any> {
    return await this.usersService.updateUser(body, uuid);
  }
}
