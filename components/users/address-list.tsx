"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable, Column } from "@/components/common/data-table";
import { User, UserAddress, ValidationError } from "@/types";
import { PlusCircle, ArrowLeft } from "lucide-react";
import { ListLayout } from "@/components/common/list-layout";
import { AddressForm } from "./address-form";
import { deleteUserAddress } from "@/app/actions/adresses";
import { toast } from "sonner";
import { ConfirmationModal } from "@/components/common/confirmation-modal";
import { getAddressTypeLabel } from "@/utils/address-utils";

interface AddressListProps {
  initialAddresses: UserAddress[];
  totalPages: number;
  currentPage: number;
  user: User;
}

export function AddressList({
  initialAddresses,
  totalPages,
  currentPage,
  user,
}: AddressListProps) {
  const router = useRouter();
  const [addresses, setAddresses] = useState<UserAddress[]>(initialAddresses);
  const [page, setPage] = useState(currentPage);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<
    UserAddress | undefined
  >(undefined);
  const [formErrors, setFormErrors] = useState<ValidationError[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setAddresses(initialAddresses);
  }, [initialAddresses]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    router.push(`/users/${user.id}/addresses?page=${newPage}`);
  };

  const handleCreateAddress = () => {
    setFormErrors([]);
    setIsCreateModalOpen(true);
  };

  const handleEditAddress = (address: UserAddress) => {
    setSelectedAddress(address);
    setFormErrors([]);
    setIsEditModalOpen(true);
  };

  const handleDeleteAddress = (address: UserAddress) => {
    setSelectedAddress(address);
    setIsDeleteModalOpen(true);
  };

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    router.refresh();
  };

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    router.refresh();
  };

  const confirmDelete = async () => {
    if (!selectedAddress) return;

    setIsDeleting(true);
    try {
      const result = await deleteUserAddress({
        userId: selectedAddress.user_id,
        addressType: selectedAddress.address_type,
        validFrom: selectedAddress.valid_from,
      });

      if (result.success) {
        toast("Address deleted", {
          description: "Address has been deleted successfully.",
        });
        router.refresh();
      } else {
        toast.error("Error", {
          description: result.error || "Failed to delete address",
        });
      }
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  const columns: Column<UserAddress>[] = [
    {
      key: "type",
      header: "Type",
      width: "15%",
      cell: (address) => <div>{getAddressTypeLabel(address.address_type)}</div>,
    },
    {
      key: "address",
      header: "Address",
      width: "45%",
      cell: (address) => (
        <div
          className="truncate"
          title={`${address.street} ${address.building_number}, ${address.post_code} ${address.city}, ${address.country_code}`}
        >
          {address.street} {address.building_number}, {address.post_code}{" "}
          {address.city}, {address.country_code}
        </div>
      ),
    },
    {
      key: "validFrom",
      header: "Valid From",
      width: "25%",
      cell: (address) => (
        <div>{new Date(address.valid_from).toLocaleDateString()}</div>
      ),
    },
    {
      key: "actions",
      header: "",
      width: "15%",
      cell: () => <div></div>,
    },
  ];

  return (
    <ListLayout
      title={`Addresses for ${user.first_name || ""} ${user.last_name}`}
      actionLabel="Add Address"
      onAction={handleCreateAddress}
      actionIcon={<PlusCircle />}
      backButton={{
        onClick: () => router.push("/"),
        icon: <ArrowLeft className=" h-4 w-4" />,
      }}
    >
      <DataTable
        data={addresses}
        columns={columns}
        actions={{
          onEdit: handleEditAddress,
          onDelete: handleDeleteAddress,
        }}
        keyExtractor={(address) =>
          `${address.user_id}-${
            address.address_type
          }-${address.valid_from.toString()}`
        }
        currentPage={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      <AddressForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        userId={user.id}
        errors={formErrors}
        setErrors={setFormErrors}
        onSuccess={handleCreateSuccess}
      />

      <AddressForm
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        userId={user.id}
        address={selectedAddress}
        errors={formErrors}
        setErrors={setFormErrors}
        onSuccess={handleEditSuccess}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Are you sure?"
        description="This will permanently delete this address. This action cannot be undone."
        isLoading={isDeleting}
      />
    </ListLayout>
  );
}
