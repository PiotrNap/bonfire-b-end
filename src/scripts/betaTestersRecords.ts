import { createConnection } from "typeorm"
import { configService } from "../config/config.service.js"

async function generateUniqueKey(keyValueRepository) {
  let key
  const existingKeys = new Set(
    (await keyValueRepository.find()).map((record) => record.key)
  )

  do {
    key = Math.floor(100000 + Math.random() * 900000).toString()
  } while (existingKeys.has(key))

  return key
}

async function createRecords() {
  const connection = await createConnection(configService.getTypeOrmConfig())
  const repo = connection.getRepository("BetaTestersEntity")
  const records = []

  while (records.length < 50) {
    const key = await generateUniqueKey(repo)
    const record = repo.create({ key, redeemed: false })
    records.push(record)
  }

  await repo.save(records)
  await connection.close()
}

createRecords()
  .then(() => {
    console.log("Records created successfully")
  })
  .catch((error) => {
    console.error("Error creating records:", error)
  })
