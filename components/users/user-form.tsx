"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, UserStatus, ValidationError } from "@/types";
import { userFormSchema, UserFormValues } from "@/schemas/user";
import { createUser, updateUser } from "@/app/actions/users";
import { toast } from "sonner";
import { FormFieldItem } from "@/components/ui/form-field-item";
import { getUserStatusLabel } from "@/utils/user-utils";

interface UserFormProps {
  user?: User;
  isOpen: boolean;
  onClose: () => void;
  errors: ValidationError[];
  setErrors: (errors: ValidationError[]) => void;
  onSuccess: () => void;
}

export function UserForm({
  user,
  isOpen,
  onClose,
  errors,
  setErrors,
  onSuccess,
}: UserFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!user;

  const getDefaultValues = (): UserFormValues => ({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    initials: user?.initials || "",
    email: user?.email || "",
    status: user?.status || UserStatus.ACTIVE,
  });

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: getDefaultValues(),
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        first_name: user?.first_name || "",
        last_name: user?.last_name || "",
        initials: user?.initials || "",
        email: user?.email || "",
        status: user?.status || UserStatus.ACTIVE,
      });
    }
  }, [form, user, isOpen]);

  useEffect(() => {
    if (errors.length > 0) {
      errors.forEach((error) => {
        if (error.field !== "general") {
          form.setError(error.field as keyof UserFormValues, {
            type: "server",
            message: error.message,
          });
        } else {
          toast.error("Error", {
            description: error.message,
          });
        }
      });
    }
  }, [errors, form]);

  const onSubmit = async (data: UserFormValues) => {
    setIsSubmitting(true);
    setErrors([]);

    try {
      const result =
        isEditing && user
          ? await updateUser(user.id, data)
          : await createUser(data);

      if (result.errors) {
        setErrors(result.errors);
      } else if (result.user) {
        toast(isEditing ? "User updated" : "User created", {
          description: isEditing
            ? "User has been updated successfully."
            : "User has been created successfully.",
        });
        onSuccess();
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !isSubmitting && !open && onClose()}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit User" : "Create User"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormFieldItem
              control={form.control}
              name="first_name"
              label="First Name"
              placeholder="First name"
            />
            <FormFieldItem
              control={form.control}
              name="last_name"
              label="Last Name"
              placeholder="Last name"
              required
            />
            <FormFieldItem
              control={form.control}
              name="initials"
              label="Initials"
              placeholder="Initials"
            />
            <FormFieldItem
              control={form.control}
              name="email"
              label="Email"
              placeholder="Email"
              type="email"
              required
              disabled={isEditing}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status*</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(UserStatus).map((status) => (
                        <SelectItem key={status} value={status}>
                          {getUserStatusLabel(status)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : isEditing
                  ? "Save Changes"
                  : "Create User"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
