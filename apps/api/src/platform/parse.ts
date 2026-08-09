import { BadRequestException } from "@nestjs/common";
import type { z } from "zod";

export const parseBody = <T>(schema: z.ZodType<T>, input: unknown): T => {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new BadRequestException({
      code: "VALIDATION_FAILED",
      message:
        result.error.issues[0]?.message ?? "The request body is invalid.",
    });
  }
  return result.data;
};
