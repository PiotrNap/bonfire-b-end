import { ExecutionContext, Injectable } from "@nestjs/common"
import { NO_JWT_AUTH } from "src/common/decorators/public.decorator"
import { Reflector } from "@nestjs/core"
import { AuthGuard } from "@nestjs/passport"

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  constructor(private reflector: Reflector) {
    super()
  }
  canActivate(context: ExecutionContext) {
    try {
      const isPublic = this.reflector.getAllAndOverride<boolean>(NO_JWT_AUTH, [
        context.getHandler(),
        context.getClass(),
      ])
      if (isPublic) {
        return true
      }
      return super.canActivate(context)
    } catch (e) {
      console.error(e)
    }
  }
}
