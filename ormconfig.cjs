module.exports = {
  type: "postgres",
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,
  synchronize: process.env.SYNCHRONIZE,
  entities: ["dist/model/*.entity.js"],
  migrationsTableName: "migration",
  migrations: ["dist/migration/*.js"],
  cli: {
    migrationsDir: "src/migration",
  },
  ssl: false,
  logging: true,
}
