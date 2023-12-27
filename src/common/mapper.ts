export const toUserDto = (data: any) => {
  const {
    id,
    username,
    name,
    profileImage,
    hourlyRateAda,
    mainnetBaseAddress,
    testnetBaseAddress,
  } = data
  const user = {
    id,
    name,
    username,
    profileImage,
    hourlyRateAda,
    mainnetBaseAddress,
    testnetBaseAddress,
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
