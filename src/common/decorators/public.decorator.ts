import { SetMetadata } from "@nestjs/common";

<<<<<<< Updated upstream
export const IS_PUBLIC_KEY = "isPublic";
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
=======
export const NO_JWT_AUTH = "isPublic";
export const Public = () => SetMetadata(NO_JWT_AUTH, true);
>>>>>>> Stashed changes
