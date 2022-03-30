import {
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  CreateDateColumn,
  DeleteDateColumn,
} from "typeorm"

export abstract class BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "boolean", default: true })
  isActive: boolean

  @Column({ type: "boolean", default: false })
  isArchived: boolean

  // create and update columns are set automatically, but typescript
  // cries when they aren't specified
  @CreateDateColumn({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  createDateTime: Date

  @Column({ type: "varchar", length: 300 })
  createdBy: string = ""

  @DeleteDateColumn()
  deletedAt?: Date

  @UpdateDateColumn({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  lastChangedDateTime: Date

  @Column({ type: "varchar", length: 300 })
  lastChangedBy: string = ""

  @Column({ type: "varchar", length: 300, nullable: true })
  internalComment: string | null
}
