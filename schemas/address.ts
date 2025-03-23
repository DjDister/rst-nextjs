import * as z from "zod";
import { AddressType } from "@/types";

export const addressFormSchema = z.object({
  address_type: z.nativeEnum(AddressType),
  post_code: z
    .string()
    .min(1, "Post code is required")
    .max(6, "Post code must be at most 6 characters")
    .regex(
      /^[0-9A-Z\-\s]+$/i,
      "Post code must contain only letters, numbers, spaces, and hyphens"
    ),
  city: z
    .string()
    .min(1, "City is required")
    .max(60, "City must be at most 60 characters"),
  country_code: z
    .string()
    .length(3, "Country code must be exactly 3 characters")
    .regex(
      /^[A-Z]{3}$/i,
      "Country code must be 3 uppercase letters (ISO3166-1 alpha-3)"
    )
    .transform((val) => val.toUpperCase()),
  street: z
    .string()
    .min(1, "Street is required")
    .max(100, "Street must be at most 100 characters"),
  building_number: z
    .string()
    .min(1, "Building number is required")
    .max(60, "Building number must be at most 60 characters"),
});

export type AddressFormValues = z.infer<typeof addressFormSchema>;