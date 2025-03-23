"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import {
  AddressFormData,
  AddressType,
  PaginatedResponse,
  PaginationParams,
  UserAddress,
  UserAddressFormData,
  ValidationError,
} from "@/types";
import { addressFormSchema } from "@/schemas/address";
import { ZodError } from "zod";

export async function getUserAddresses(
  userId: number,
  { page = 1, pageSize = 10 }: PaginationParams
): Promise<PaginatedResponse<UserAddress>> {
  const skip = (page - 1) * pageSize;

  const [addresses, totalAddresses] = (await Promise.all([
    prisma.users_addresses.findMany({
      where: {
        user_id: userId,
      },
      skip,
      take: pageSize,
      orderBy: [{ address_type: "asc" }, { valid_from: "desc" }],
    }),
    prisma.users_addresses.count({
      where: {
        user_id: userId,
      },
    }),
  ])) as [
    UserAddress[] & {
      address_type: AddressType;
    },
    number
  ];

  return {
    items: addresses,
    totalItems: totalAddresses,
    totalPages: Math.ceil(totalAddresses / pageSize),
    currentPage: page,
  };
}

export async function createUserAddress(
  data: UserAddressFormData
): Promise<{ address?: UserAddress; errors?: ValidationError[] }> {
  try {
    const errors = validateAddressData(data);
    if (errors.length > 0) {
      return { errors };
    }

    const address = (await prisma.users_addresses.create({
      data: {
        user_id: data.userId,
        address_type: data.address_type,
        valid_from: data.validFrom || new Date(),
        post_code: data.post_code,
        city: data.city,
        country_code: data.country_code,
        street: data.street,
        building_number: data.building_number,
      },
    })) as UserAddress & {
      address_type: AddressType;
    };

    revalidatePath(`/users/${data.userId}/addresses`);
    return { address };
  } catch (error) {
    console.error("Error creating address:", error);
    return {
      errors: [{ field: "general", message: "Failed to create address" }],
    };
  }
}

export async function updateUserAddress(
  key: { userId: number; addressType: AddressType; validFrom: Date },
  data: AddressFormData
): Promise<{ address?: UserAddress; errors?: ValidationError[] }> {
  try {
    const errors = validateAddressData({
      ...data,
      userId: key.userId,
      validFrom: key.validFrom,
    });
    if (errors.length > 0) {
      return { errors };
    }

    const address = (await prisma.users_addresses.update({
      where: {
        user_id_address_type_valid_from: {
          user_id: key.userId,
          address_type: key.addressType,
          valid_from: key.validFrom,
        },
      },
      data,
    })) as UserAddress & {
      address_type: AddressType;
    };

    revalidatePath(`/users/${key.userId}/addresses`);
    return { address };
  } catch (error) {
    console.error("Error updating address:", error);
    return {
      errors: [{ field: "general", message: "Failed to update address" }],
    };
  }
}

export async function deleteUserAddress(key: {
  userId: number;
  addressType: AddressType;
  validFrom: Date;
}): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.users_addresses.delete({
      where: {
        user_id_address_type_valid_from: {
          user_id: key.userId,
          address_type: key.addressType,
          valid_from: key.validFrom,
        },
      },
    });

    revalidatePath(`/users/${key.userId}/addresses`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting address:", error);
    return {
      success: false,
      error: "Failed to delete address",
    };
  }
}

function validateAddressData(
  data: UserAddressFormData | AddressFormData
): ValidationError[] {
  const errors: ValidationError[] = [];

  if ("userId" in data && !data.userId) {
    errors.push({ field: "userId", message: "User ID is required" });
  }

  try {
    addressFormSchema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      error.errors.forEach((err) => {
        const field = err.path[0].toString();
        const fieldMap: Record<string, string> = {
          address_type: "addressType",
          post_code: "postCode",
          country_code: "countryCode",
          building_number: "buildingNumber",
        };

        errors.push({
          field: fieldMap[field] || field,
          message: err.message,
        });
      });
    }
  }

  return errors;
}
