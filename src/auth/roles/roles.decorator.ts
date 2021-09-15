import { SetMetadata } from "@nestjs/common";

export type RolesType = "admin" | "attendee" | "organizer";
export const roles: Record<RolesType, string> = {
  admin: "admin",
  attendee: "attendee",
  organizer: "organizer",
};

export const ROLES_KEY = "roles";
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
