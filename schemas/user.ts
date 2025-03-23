import * as z from "zod";
import { UserStatus } from "@/types";

export const userFormSchema = z.object({
  first_name: z
    .string()
    .max(60, "First name must be at most 60 characters")
    .optional()
    .transform((val) => (val === "" ? undefined : val)),
  last_name: z
    .string()
    .min(1, "Last name is required")
    .max(100, "Last name must be at most 100 characters"),
  initials: z
    .string()
    .max(30, "Initials must be at most 30 characters")
    .optional()
    .transform((val) => (val === "" ? undefined : val)),
  email: z
    .string()
    .min(1, "Email is required")
    .max(100, "Email must be at most 100 characters")
    .email("Invalid email format"),
  status: z.nativeEnum(UserStatus),
});

export type UserFormValues = z.infer<typeof userFormSchema>;
