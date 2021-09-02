import { Entity, Column, TableInheritance, BeforeInsert } from "typeorm";
import { BaseEntity } from "./base.entity";
import bcrypt from "bcrypt";

@Entity({ name: "user" })
@TableInheritance({ column: { type: "varchar", name: "userType" } })
export class UserEntity extends BaseEntity {
  @Column({ type: "varchar", length: 300 })
  name?: string; // real name

  // @Column({ type: "varchar", length: 300 })
  // handle?: string; // username or alias or "@"

  // @Column({ type: "varchar", length: 65535 })
  // profileImage?: string; //base encoded png 512x512

  // @Column({ type: "varchar", length: 65535 })
  // didDocument?: string; // reference to did-document

  @Column({
    name: "username",
    type: "varchar",
    nullable: false,
  })
  username: string;

  @Column({
    name: "publicKey",
    type: "varchar",
    nullable: false,
  })
  publicKey: string;

  @Column({
    name: "calendarToken",
    type: "varchar",
    nullable: true,
  })
  calendarToken?: string;

  @Column({
    name: "refreshToken",
    type: "varchar",
    nullable: true,
  })
  refreshToken?: string;

  @Column({ name: "id", type: "varchar", nullable: false })
  id: string;

  // @Column({ type: 'varchar', length: 65535 })
  // profileSettings?: string; // profile settings
}
