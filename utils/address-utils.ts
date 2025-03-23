import { AddressType } from "@/types";

export function getAddressTypeLabel(type: AddressType): string {
  switch (type) {
    case AddressType.HOME:
      return "Home";
    case AddressType.INVOICE:
      return "Invoice";
    case AddressType.POSTAL:
      return "Postal";
    case AddressType.WORK:
      return "Work";
    default:
      return type;
  }
}
