import { ChildEntity, Column, OneToMany } from "typeorm";
import { EventEntity } from "./event.entity";
import { UserEntity } from "./user.entity";

@ChildEntity()
export class OrganizerEntity extends UserEntity {
  @Column({ name: "bio", type: "varchar", length: 250 })
  bio: string;

  @Column({ name: "profession", type: "varchar", length: 100, nullable: true })
  profession?: string | string[];

  @Column({ name: "jobTitle", type: "varchar", length: 100, nullable: true })
  jobTitle?: string | string[];

  @Column({ name: "skills", type: "varchar", length: 100, nullable: true })
  skills?: string | string[];

  @Column({ name: "hourlyRate", type: "integer" })
  hourlyRate: number | null;

  @Column({ type: "simple-array", nullable: true })
  tags?: string[] | null;

  /**
   * Organizer should be able to fetch events he is hosting,
   * and see how many attendees are registered for those events.
   */

  // hosted events (events for sale)
  @OneToMany(() => EventEntity, (event: EventEntity) => event.organizerId)
  events: EventEntity[];
}

export function isOrganizerEntity(obj: any): obj is OrganizerEntity {
  return obj.bio != "undefined" && obj.hourlyRate !== "undefined";
}
