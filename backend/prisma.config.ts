
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  // Миграции идут по прямому адресу, без пула соединений
  datasource: {
    url: env("DIRECT_URL"),
  },
});
