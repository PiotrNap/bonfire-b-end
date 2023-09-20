import { PartialType } from "@nestjs/swagger"
import { CreateIdTokenDto } from "./create-id-token.dto.js"

export class UpdateIdTokenDto extends PartialType(CreateIdTokenDto) {}
