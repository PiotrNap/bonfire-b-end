export const toUserDto = (data: any) => {
  const {
    id,
    username,
    name,
    profileType,
    profileImage,
    hourlyRateAda,
    baseAddress,
  } = data
  const user = {
    id,
    name,
    username,
    profileType,
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
    hourlyRate: data.hourlyRate,
  }
}
