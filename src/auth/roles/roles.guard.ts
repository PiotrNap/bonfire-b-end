import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common"
import { Reflector } from "@nestjs/core"
import { RolesType, ROLES_KEY } from "./roles.decorator"

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<RolesType[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()]
    )

    if (!requiredRoles) {
      return true
    }

    const { user } = context.switchToHttp().getRequest()
    // check if profile type is the required one
    // return requiredRoles.some((role: string) => profileType === role)
  }
}
