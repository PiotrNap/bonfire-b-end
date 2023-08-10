import { Module } from "@nestjs/common"
import { UsersService } from "./users.service"
import { UserEntity } from "../model/user.entity"
import { TypeOrmModule } from "@nestjs/typeorm"
import { UsersController } from "./users.controller"

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
