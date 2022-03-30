import { UserEntity } from "../model/user.entity";
import { UserDto } from "../users/dto/user.dto";

export const toUserDto = (data: UserEntity): UserDto => {
  const {
    id,
    username,
    publicKey,
    profileType,
    googleApiCredentials,
    lastUsedRefreshToken,
  } = data;

  let userDto: UserDto = {
    id,
    username,
    publicKey,
    profileType,
    googleApiCredentials,
    lastUsedRefreshToken,
  };

  return userDto;
};
