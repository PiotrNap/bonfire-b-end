import { TypeOrmModuleOptions } from "@nestjs/typeorm"
import * as dotenv from "dotenv"
dotenv.config()

class ConfigService {
  constructor(private env: { [k: string]: string | undefined }) {}

  private getValue(key: string, throwOnMissing = true): string {
    const value = this.env[key]
    if (!value && throwOnMissing) {
      throw new Error(`config error - missing env.${key}`)
    }

    return value
  }

  public ensureValues(keys: string[]) {
    keys.forEach((k) => this.getValue(k, true))
    return this
  }

  public getPort() {
    return this.getValue("PORT", true)
  }

  public getTypeOrmConfig(): TypeOrmModuleOptions {
    return {
      type: "postgres",
      host: this.getValue("POSTGRES_HOST"),
      port: parseInt(this.getValue("POSTGRES_PORT")),
      username: this.getValue("POSTGRES_USER"),
      password: this.getValue("POSTGRES_PASSWORD"),
      database: this.getValue("POSTGRES_DATABASE"),
      synchronize: process.env.NODE_ENV !== "dev" ? false : true,
      entities: ["dist/model/*.entity.js"],
      migrationsTableName: "migration",
      migrations: ["dist/migration/*.js"],
      cli: {
        migrationsDir: "src/migration",
      },
      ssl: false,
      logging: !!parseInt(process.env.LOGGING),
    }
  }
}

const configService = new ConfigService(process.env).ensureValues([
  "POSTGRES_HOST",
  "POSTGRES_PORT",
  "POSTGRES_USER",
  "POSTGRES_PASSWORD",
  "POSTGRES_DATABASE",
])

export { configService }
