import { ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
<<<<<<< Updated upstream
import { IS_PUBLIC_KEY } from "src/common/decorators/public.decorator";
=======
import { NO_JWT_AUTH } from "src/common/decorators/public.decorator";
>>>>>>> Stashed changes

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    try {
<<<<<<< Updated upstream
      const isPublic = this.reflector.getAllAndOverride<boolean>(
        IS_PUBLIC_KEY,
        [context.getHandler(), context.getClass()]
      );
=======
      const isPublic = this.reflector.getAllAndOverride<boolean>(NO_JWT_AUTH, [
        context.getHandler(),
        context.getClass(),
      ]);
>>>>>>> Stashed changes

      if (isPublic) {
        return true;
      }
<<<<<<< Updated upstream
      console.log(context);
=======
>>>>>>> Stashed changes
      return super.canActivate(context);
    } catch (e) {
      console.error(e);
    }
  }
}
