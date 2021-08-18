import { Entity, Column, TableInheritance, ChildEntity } from "typeorm";
import { BaseEntity } from "./base.entity";

@Entity({ name: "user" })
@TableInheritance({ column: { type: "varchar", name: "userType" } })
export class UserEntity extends BaseEntity {
  @Column({ type: "varchar", length: 300 })
  name?: string; // real name

  @Column({ type: "varchar", length: 300 })
  handle?: string; // username or alias or "@"

  @Column({ type: "varchar", length: 65535 })
  profileImage?: string; //base encoded png 512x512

  @Column({ type: "varchar", length: 65535 })
  didDocument?: string; // reference to did-document

  // @Column({ type: 'varchar', length: 65535 })
  // profileSettings?: string; // profile settings
}
