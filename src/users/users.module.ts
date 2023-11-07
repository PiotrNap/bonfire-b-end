import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { DeviceCredentialEntity } from "../model/deviceCredential.entity.js"
import { UserEntity } from "../model/user.entity.js"
import { UsersController } from "./users.controller.js"
import { UsersService } from "./users.service.js"
import { EventEntity } from "../model/event.entity.js"
import { BetaTestersEntity } from "../model/betaTesters.entity.js"

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      EventEntity,
      DeviceCredentialEntity,
      BetaTestersEntity,
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
