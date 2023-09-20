import { OmitType, PartialType } from "@nestjs/swagger"
import { CreateUserDto } from "./user-create.dto.js"

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ["username"] as const)
) {}
