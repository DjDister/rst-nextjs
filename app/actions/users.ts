"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import {
  PaginatedResponse,
  PaginationParams,
  UserFormData,
  ValidationError,
  User,
  UserStatus,
} from "@/types";
import { users } from "@prisma/client";
import { userFormSchema } from "@/schemas/user";
import { ZodError } from "zod";

export async function getUsers({
  page = 1,
  pageSize = 10,
}: PaginationParams): Promise<PaginatedResponse<User>> {
  const skip = (page - 1) * pageSize;

  const [users, totalUsers] = (await Promise.all([
    prisma.users.findMany({
      skip,
      take: pageSize,
      orderBy: {
        last_name: "asc",
      },
    }),
    prisma.users.count(),
  ])) as [
    (users & {
      status: UserStatus;
    })[],
    number
  ];

  return {
    items: users,
    totalItems: totalUsers,
    totalPages: Math.ceil(totalUsers / pageSize),
    currentPage: page,
  };
}

export async function getUserById(id: number) {
  return prisma.users.findUnique({
    where: { id },
  }) as Promise<
    | (User & {
        status: UserStatus;
      })
    | null
  >;
}

export async function createUser(
  data: UserFormData
): Promise<{ user?: User; errors?: ValidationError[] }> {
  try {
    const errors = validateUserData(data);
    if (errors.length > 0) {
      return { errors };
    }

    const existingUser = await prisma.users.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return {
        errors: [{ field: "email", message: "Email already in use" }],
      };
    }

    const user = (await prisma.users.create({
      data: {
        first_name: data.first_name || null,
        last_name: data.last_name,
        initials: data.initials || null,
        email: data.email,
        status: data.status,
      },
    })) as User & {
      status: UserStatus;
    };

    revalidatePath("/users");
    return { user };
  } catch (error) {
    console.error("Error creating user:", error);
    return {
      errors: [{ field: "general", message: "Failed to create user" }],
    };
  }
}

export async function updateUser(
  id: number,
  data: UserFormData
): Promise<{ user?: User; errors?: ValidationError[] }> {
  try {
    const errors = validateUserData(data);
    if (errors.length > 0) {
      return { errors };
    }

    const existingUser = await prisma.users.findUnique({
      where: { email: data.email },
    });

    if (!existingUser) {
      return {
        errors: [{ field: "general", message: "User not found" }],
      };
    }

    if (existingUser && existingUser.id !== id) {
      return {
        errors: [{ field: "email", message: "Email already in use" }],
      };
    }

    const user = (await prisma.users.update({
      where: { id },
      data: {
        first_name: data.first_name || null,
        last_name: data.last_name,
        initials: data.initials || null,
        email: data.email,
        status: data.status,
      },
    })) as User & {
      status: UserStatus;
    };

    revalidatePath("/users");
    revalidatePath(`/users/${id}/addresses`);
    return { user };
  } catch (error) {
    console.error("Error updating user:", error);
    return {
      errors: [{ field: "general", message: "Failed to update user" }],
    };
  }
}

export async function deleteUser(
  id: number
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.users.delete({
      where: { id },
    });

    revalidatePath("/users");
    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return {
      success: false,
      error: "Failed to delete user",
    };
  }
}

function validateUserData(data: UserFormData): ValidationError[] {
  const errors: ValidationError[] = [];

  try {
    userFormSchema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      error.errors.forEach((err) => {
        const field = err.path[0].toString();
        const fieldMap: Record<string, string> = {
          first_name: "firstName",
          last_name: "lastName",
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
