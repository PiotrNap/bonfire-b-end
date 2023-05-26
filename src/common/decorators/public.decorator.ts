import { SetMetadata } from "@nestjs/common"

export const NO_JWT_AUTH = "isPublic"
export const Public = () => SetMetadata(NO_JWT_AUTH, true)
