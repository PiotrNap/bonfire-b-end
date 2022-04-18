export const toUserDto = (data: any) => {
  const { id, username, name, profileType, profileImage, hourlyRate } = data
  const user = {
    id,
    name,
    username,
    profileType,
    profileImage,
    hourlyRate,
  }

  if (data.profileType === "attendee") return user
  if (data.profileType === "organizer")
    return {
      ...user,
      bio: data.bio,
      profession: data.profession,
      skills: data.skills,
      tags: data.tags,
      jobTitle: data.jobTitle,
      hourlyRate: data.hourlyRate,
    }
}
