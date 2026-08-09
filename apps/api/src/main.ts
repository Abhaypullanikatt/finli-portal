import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { AppModule } from "./app.module.js";
import { ApiExceptionFilter } from "./platform/api-exception.filter.js";

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: {
        level: process.env.LOG_LEVEL ?? "info",
        redact: {
          paths: [
            "req.headers.authorization",
            "req.body",
            "res.body",
            "*.transcript",
            "*.amountPaise",
          ],
          censor: "[REDACTED]",
        },
      },
    }),
  );

  app.setGlobalPrefix("v1");
  app.enableCors({
    origin: (
      process.env.CORS_ORIGIN ?? "http://localhost:8081,http://localhost:3000"
    )
      .split(",")
      .map((origin) => origin.trim()),
    credentials: false,
  });
  app.useGlobalFilters(new ApiExceptionFilter());
  app.enableShutdownHooks();

  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port, "0.0.0.0");
}

void bootstrap();
