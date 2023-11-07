export const toUserDto = (data: any) => {
  const { id, username, name, profileImage, hourlyRateAda, baseAddress } = data
  const user = {
    id,
    name,
    username,
    profileImage,
    hourlyRateAda,
    baseAddress,
  }

  return {
    ...user,
    bio: data.bio,
    profession: data.profession,
    skills: data.skills,
    tags: data.tags,
    jobTitle: data.jobTitle,
    hourlyRateAda: data.hourlyRateAda,
  }
}
