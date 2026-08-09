import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { AppController } from "./app.controller.js";
import { DevelopmentAuthGuard } from "./auth/development-auth.guard.js";
import { InMemoryStore } from "./store/in-memory.store.js";

@Module({
  controllers: [AppController],
  providers: [
    InMemoryStore,
    {
      provide: APP_GUARD,
      useClass: DevelopmentAuthGuard,
    },
  ],
})
export class AppModule {}
