export const toUserDto = (data: any) => {
  const { id, username, name, profileImage, hourlyRateAda, baseAddresses } = data
  const user = {
    id,
    name,
    username,
    profileImage,
    hourlyRateAda,
    baseAddresses,
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
