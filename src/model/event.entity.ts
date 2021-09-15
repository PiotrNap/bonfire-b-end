import { EventAvailability, SelectedDays } from "src/events/events.interface";
import { Entity, Column } from "typeorm";
import { BaseEntity } from "./base.entity";

export interface EventUser {
  id: string; // this should be a uuidv4 or uuidv5
  userName?: string;
}

@Entity()
export class EventEntity extends BaseEntity {
  @Column({ type: "varchar", length: 150, nullable: false })
  description: string;

  @Column({ type: "varchar", length: 40, nullable: false })
  title: string;

  @Column({ type: "jsonb" })
  availabilities: EventAvailability[];

  @Column({ type: "jsonb" })
  selectedDays: SelectedDays;

  @Column({ type: "simple-array" })
  tags: string[];

  @Column({ type: "int" })
  hourlyRate: number;

  @Column({ type: "varchar" })
  imageURI: string;

  @Column({ type: "boolean" })
  privateEvent: boolean;

  @Column({ type: "varchar" })
  eventCardColor: string;

  @Column({ type: "jsonb" })
  organizer: EventUser;

  @Column({ type: "jsonb", default: [] })
  attendees: EventUser[] = [];
}
