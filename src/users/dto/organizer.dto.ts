import { IsNotEmpty, MaxLength } from "class-validator"
import { CreateUserDto } from "./user-create.dto"
import { OrganizerEntity } from "../../model/organizer.entity"
import { HourlyRate } from "src/common/lib/types"

export class CreateOrganizerDto extends CreateUserDto {
  constructor(organizerDto: OrganizerEntity) {
    const {
      name,
      username,
      publicKey,
      id,
      profileType,
      bio,
      profession,
      jobTitle,
      hourlyRate,
      skills,
    } = organizerDto
    super(name, username, publicKey, id, profileType)
    this.bio = bio
    this.profession = profession
    this.jobTitle = jobTitle
    this.hourlyRate.ada = hourlyRate.ada
    this.hourlyRate.gimbals = hourlyRate.gimbals
    this.skills = skills
  }
  @IsNotEmpty({ message: "Bio cannot be empty" })
  @MaxLength(100)
  bio: string
  @IsNotEmpty({ message: "Hourly rate cannot be empty" })
  hourlyRate: HourlyRate
  @MaxLength(100)
  profession?: string | string[]
  jobTitle?: string | string[]
  skills?: string | string[]
}
