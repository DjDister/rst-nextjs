export enum AddressType {
  HOME = "HOME",
  WORK = "WORK",
  INVOICE = "INVOICE",
  POSTAL = "POSTAL",
}

export interface UserAddress {
  user_id: number;
  address_type: AddressType;
  valid_from: Date;
  post_code: string;
  city: string;
  country_code: string;
  street: string;
  building_number: string;
  created_at: Date;
  updated_at: Date;
}

export interface AddressFormData {
  address_type: AddressType;
  post_code: string;
  city: string;
  country_code: string;
  street: string;
  building_number: string;
}

export interface UserAddressFormData extends AddressFormData {
  userId: number;
  validFrom: Date;
}
