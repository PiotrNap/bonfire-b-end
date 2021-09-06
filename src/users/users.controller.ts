import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Req,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "../users/dto/user.create.dto";
import { UserDto } from "./dto/user.dto";
import { Public } from "src/common/decorators/public.decorator";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post("register")
  public async register(
    @Body() createUserDto: CreateUserDto
  ): Promise<UserDto> {
    return await this.usersService.register(createUserDto);
  }

  @Put(":id")
  public async addToUser(
    @Body() body: any,
    @Param("id", ParseUUIDPipe) id: string,
    @Req() req
  ): Promise<any> {
    console.log(req);
    return await this.usersService.updateUser(body, id);
  }
}
