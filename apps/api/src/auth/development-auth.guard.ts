import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import { InMemoryStore } from "../store/in-memory.store.js";

export type AuthenticatedRequest = FastifyRequest & { userId?: string };

@Injectable()
export class DevelopmentAuthGuard implements CanActivate {
  constructor(private readonly store: InMemoryStore) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const path = request.url.split("?")[0] ?? "";
    if (path.endsWith("/health") || path.includes("/auth/")) return true;

    if (
      process.env.NODE_ENV === "production" &&
      process.env.AUTH_MODE !== "oidc"
    ) {
      throw new ServiceUnavailableException({
        code: "AUTH_PROVIDER_NOT_CONFIGURED",
        message:
          "Production authentication is blocked until an approved OIDC provider is configured.",
      });
    }

    const authorization = request.headers.authorization;
    const token = authorization?.startsWith("Bearer ")
      ? authorization.slice("Bearer ".length)
      : "";
    const userId =
      token === "demo-token" && process.env.NODE_ENV !== "production"
        ? "demo-user"
        : this.store.resolveSession(token);
    if (!userId) {
      throw new UnauthorizedException({
        code: "AUTH_REQUIRED",
        message: "A valid bearer token is required.",
      });
    }
    request.userId = userId;
    return true;
  }
}
