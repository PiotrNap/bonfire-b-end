import { Entity, Column } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity({ name: 'organizer' })
export class OrganizerEntity extends UserEntity {

  @Column({ type: 'varchar', length: 300 })
  name?: string; // real name

  @Column({ type: 'varchar', length: 300 })
  handle?: string;  // username or alias

  @Column({ type: 'varchar', length: 65535 })
  description?: string; // 1000 char limit

  @Column({ type: 'varchar', length: 300 })
  profileImage?: string; //base encoded png 512x512

  @Column({ type: 'varchar', length: 300 })
  identity?: string; // reference to identity object

}