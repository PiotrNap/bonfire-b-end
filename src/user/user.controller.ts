import { Body, Controller, Get, Post } from "@nestjs/common";
import { UsersProvider } from "src/users/users.provider";
import { UserDTO } from "./user.dto";
import { UserService } from "./user.service";
import { UserEntity } from "../model/user.entity";
let date = new Date(Date().normalize())

@Controller("user")
export class UserController {
  constructor(private serv: UserService) {}

  @Get("all")
  public async getAll(): Promise<UserDTO[]> {
    return await this.serv.getAll();
  }
  @Get("new")
  public async post(
    //@UsersProvider() user: User,
    @Body() dto: UserDTO
  ): Promise<UserDTO> {
    return this.serv.create(dto, {
      name: "ocg",
      id: "1337",
      isActive: true,
      isArchived: true,
      createdBy: "ocg",
      createDateTime: date,
      lastChangedBy: "ocg",
      internalComment: "n/a",
      lastChangedDateTime: date
    });
  }
}
