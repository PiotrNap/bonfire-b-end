import { configService } from "src/config/config.service.js"
import { writeFileSync } from "node:fs"
writeFileSync(
  "ormconfig.json",
  JSON.stringify(configService.getTypeOrmConfig(), null, 2)
)
