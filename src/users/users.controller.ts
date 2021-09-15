import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "../users/dto/user-create.dto";
import { UserDto } from "./dto/user.dto";
import { Public } from "src/common/decorators/public.decorator";
import { UpdateUserDto } from "./dto/user-update.dto";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getUsers() {
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
  public async getOrganizers(): Promise<any> {
    return await this.usersService.getAll({
      where: { profileType: "organizer" },
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
