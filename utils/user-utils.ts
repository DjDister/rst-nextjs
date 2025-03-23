import { UserStatus } from "@/types";

export function getUserStatusColorClass(status: UserStatus): string {
  switch (status) {
    case UserStatus.ACTIVE:
      return "text-green-700";
    case UserStatus.INACTIVE:
      return "text-red-600";
    default:
      return "text-gray-500";
  }
}

export function getUserStatusLabel(status: UserStatus): string {
  switch (status) {
    case UserStatus.ACTIVE:
      return "Active";
    case UserStatus.INACTIVE:
      return "Inactive";
    default:
      return status;
  }
}
