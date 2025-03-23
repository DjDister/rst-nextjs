"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable, Column } from "@/components/common/data-table";
import { User, ValidationError } from "@/types";
import { UserForm } from "./user-form";
import { deleteUser } from "@/app/actions/users";
import { toast } from "sonner";
import { PlusCircle } from "lucide-react";
import { ListLayout } from "@/components/common/list-layout";
import { ConfirmationModal } from "@/components/common/confirmation-modal";
import {
  getUserStatusColorClass,
  getUserStatusLabel,
} from "@/utils/user-utils";

interface UserListProps {
  initialUsers: User[];
  totalPages: number;
  currentPage: number;
}

export function UserList({
  initialUsers,
  totalPages,
  currentPage,
}: UserListProps) {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [page, setPage] = useState(currentPage);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
  const [formErrors, setFormErrors] = useState<ValidationError[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    router.replace(`/?page=${newPage}`);
  };

  const handleRowClick = (user: User) => {
    router.push(`/users/${user.id}/addresses`);
  };

  const handleCreateUser = () => {
    setFormErrors([]);
    setIsCreateModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setFormErrors([]);
    setIsEditModalOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;

    setIsDeleting(true);
    try {
      const result = await deleteUser(selectedUser.id);

      if (result.success) {
        toast("User deleted", {
          description: `${selectedUser.first_name || ""} ${
            selectedUser.last_name
          } has been deleted successfully.`,
        });
        router.refresh();
      } else {
        toast.error("Error", {
          description: result.error || "Failed to delete user",
        });
      }
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  const columns: Column<User>[] = [
    {
      key: "name",
      header: "Name",
      width: "40%",
      cell: (user) => (
        <div
          className="font-medium truncate"
          title={`${user.last_name}${
            user.first_name ? `, ${user.first_name}` : ""
          } ${user.initials ? `(${user.initials})` : ""}`}
        >
          {user.last_name}
          {user.first_name ? `, ${user.first_name}` : ""}
          {user.initials ? ` (${user.initials})` : ""}
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      width: "40%",
      cell: (user) => (
        <div className="truncate" title={user.email}>
          {user.email}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: "20%",
      cell: (user) => (
        <div className={getUserStatusColorClass(user.status)}>
          {getUserStatusLabel(user.status)}
        </div>
      ),
    },
  ];

  return (
    <ListLayout
      title="Users"
      actionLabel="Create User"
      onAction={handleCreateUser}
      actionIcon={<PlusCircle />}
    >
      <DataTable
        data={users}
        columns={columns}
        actions={{
          onEdit: handleEditUser,
          onDelete: handleDeleteUser,
        }}
        onRowClick={handleRowClick}
        keyExtractor={(user) => user.id}
        currentPage={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      {isCreateModalOpen && (
        <UserForm
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          errors={formErrors}
          setErrors={setFormErrors}
          onSuccess={() => {
            setIsCreateModalOpen(false);
            router.refresh();
          }}
        />
      )}

      {isEditModalOpen && selectedUser && (
        <UserForm
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          user={selectedUser}
          errors={formErrors}
          setErrors={setFormErrors}
          onSuccess={() => {
            setIsEditModalOpen(false);
            router.refresh();
          }}
        />
      )}

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Are you sure?"
        description={
          <>
            This will permanently delete the user{" "}
            <span className="font-semibold">
              {selectedUser?.first_name || ""} {selectedUser?.last_name}
            </span>{" "}
            and all associated addresses. This action cannot be undone.
          </>
        }
        isLoading={isDeleting}
      />
    </ListLayout>
  );
}
