import { ChildEntity, Column } from "typeorm";
import { UserEntity } from "./user.entity";

@ChildEntity()
export class OrganizerEntity extends UserEntity {
  @Column({ name: "bio", type: "varchar", length: 250 })
  bio: string;

  @Column({ name: "profession", type: "varchar", length: 100 })
  profession?: string | string[];

  @Column({ name: "jobTitle", type: "varchar", length: 100 })
  jobTitle?: string | string[];

  @Column({ name: "skills", type: "varchar", length: 100 })
  skills?: string | string[];

  @Column({ name: "hourlyRate", type: "integer" })
  hourlyRate: number;
}
