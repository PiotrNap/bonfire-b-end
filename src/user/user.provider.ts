import { SetMetadata } from '@nestjs/common';

import { UserEntity} from '../model/user.entity';

export const USERS_PROVIDER = 'UsersProvider';
export class UsersProvider extends UserEntity {
    provide: 'UsersProvider';
    useValue: UserEntity
}
    
export const UsersProviderDecorator = () => SetMetadata(USERS_PROVIDER, true);
