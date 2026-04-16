import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    provider: "postgresql",
    url: process.env.DATABASE_URL!,
  },
});

console.log("0");
console.log(process.env.DATABASE_URL);
console.log("1");
console.log(process.env.DATABASE_URL!);
console.log("2");
console.log(process.env["DATABASE_URL"]);