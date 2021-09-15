import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UsersService } from "src/users/users.service";
import { JwtPayload } from "../interfaces/payload.interface";
import { RolesType, ROLES_KEY } from "./roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly usersService: UsersService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<RolesType[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    const { profileType }: JwtPayload = user;

    console.log("user from http context: ", user);
    // check if profile type is the required one
    return requiredRoles.some((role: string) => profileType === role);

    // try {
    //   const _user = await this.usersService.findOne(
    //     {
    //       where: { id: user.userId },
    //     },
    //     false
    //   );

    //   if (_user.profileType === "organizer") {
    //     return true;
    //   }
    // } catch {
    //   return false;
    // }

    // console.log("reflector: ", requiredRoles);
  }
}
