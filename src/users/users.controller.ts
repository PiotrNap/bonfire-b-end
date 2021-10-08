import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Req,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "../users/dto/user-create.dto";
import { UserDto } from "./dto/user.dto";
import { UpdateUserDto } from "./dto/user-update.dto";
import { Public } from "src/common/decorators/public.decorator";
import { PaginationRequestDto, PaginationResult } from "src/pagination";
import { UserEntity } from "src/model/user.entity";
import { CreateOrganizerDto } from "./dto/organizer.dto";

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
    @Body() body: CreateUserDto | CreateOrganizerDto
  ): Promise<UserDto> {
    return await this.usersService.register(body);
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
  public async getUserById(
    @Param("uuid", ParseUUIDPipe) uuid: string,
    @Req() req: any
  ) {
    const { user } = req;
    return await this.usersService.findOne({ where: { id: uuid } }, false);
  }

  // @Get(":uuid/event")
  // public async getUserEvents(
  //   @Param("uuid", ParseUUIDPipe) uuid: string,
  //   @Query() query: any
  // ) {
  //   return await this.usersService.getUserEvents(query);
  // }

  @Put(":uuid")
  public async updateUser(
    @Body() body: UpdateUserDto,
    @Req() req: any,
    @Param("uuid", ParseUUIDPipe) uuid: string
  ): Promise<any> {
    // const { user } = req;
    return await this.usersService.updateUser(body, uuid);
  }
}
