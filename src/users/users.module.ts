import { Module } from "@nestjs/common"
import { UsersService } from "./users.service"
import { UserEntity } from "../model/user.entity"
import { TypeOrmModule } from "@nestjs/typeorm"
import { UsersController } from "./users.controller"
import { OrganizerEntity } from "src/model/organizer.entity"
import { AttendeeEntity } from "src/model/attendee.entity"

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, OrganizerEntity, AttendeeEntity]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
