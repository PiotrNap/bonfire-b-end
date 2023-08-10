import { SetMetadata } from "@nestjs/common"

export type RolesType = "admin" | "user"
export const roles: Record<RolesType, string> = {
  admin: "admin",
  user: "user",
}

export const ROLES_KEY = "roles"
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles)
