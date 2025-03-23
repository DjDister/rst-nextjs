"use client";

import { useCallback, useEffect, useState } from "react";
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
import { AddressType, UserAddress, ValidationError } from "@/types";
import { addressFormSchema, AddressFormValues } from "@/schemas/address";
import { createUserAddress, updateUserAddress } from "@/app/actions/adresses";
import { toast } from "sonner";
import { FormFieldItem } from "@/components/ui/form-field-item";
import { getAddressTypeLabel } from "@/utils/address-utils";

interface AddressFormProps {
  address?: UserAddress;
  userId: number;
  isOpen: boolean;
  onClose: () => void;
  errors: ValidationError[];
  setErrors: (errors: ValidationError[]) => void;
  onSuccess: () => void;
}

export function AddressForm({
  address,
  userId,
  isOpen,
  onClose,
  errors,
  setErrors,
  onSuccess,
}: AddressFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addressPreview, setAddressPreview] = useState("");
  const isEditing = !!address;
  const getDefaultValues = useCallback(() => {
    return {
      address_type: address?.address_type || AddressType.HOME,
      post_code: address?.post_code || "",
      city: address?.city || "",
      country_code: address?.country_code || "",
      street: address?.street || "",
      building_number: address?.building_number || "",
    };
  }, [address]);
  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: getDefaultValues(),
  });

  const updateAddressPreview = (data: Partial<AddressFormValues>) => {
    const preview = `${data.street || ""} ${data.building_number || ""}
${data.post_code || ""} ${data.city || ""}
${data.country_code || ""}`;
    setAddressPreview(preview);
  };

  useEffect(() => {
    const subscription = form.watch((data) => {
      updateAddressPreview(data);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  useEffect(() => {
    if (isOpen) {
      form.reset(getDefaultValues());
      updateAddressPreview(form.getValues());
    }
  }, [form, address, isOpen, getDefaultValues]);

  useEffect(() => {
    if (errors.length > 0) {
      errors.forEach((error) => {
        if (error.field !== "general") {
          form.setError(error.field as keyof AddressFormValues, {
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

  const onSubmit = async (data: AddressFormValues) => {
    setIsSubmitting(true);
    setErrors([]);

    try {
      const result =
        isEditing && address
          ? await updateUserAddress(
              {
                userId,
                addressType: address.address_type,
                validFrom: address.valid_from,
              },
              data
            )
          : await createUserAddress({
              ...data,
              userId,
              validFrom: new Date(),
            });

      if (result.errors) {
        setErrors(result.errors);
      } else if (result.address) {
        toast(isEditing ? "Address updated" : "Address created", {
          description: isEditing
            ? "Address has been updated successfully."
            : "Address has been created successfully.",
        });
        onSuccess();
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Error", {
        description: "An unexpected error occurred. Please try again.",
      });
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
          <DialogTitle>
            {isEditing ? "Edit Address" : "Create Address"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="address_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type*</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isEditing}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(AddressType).map((type) => (
                        <SelectItem key={type} value={type}>
                          {getAddressTypeLabel(type)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormFieldItem
              control={form.control}
              name="street"
              label="Street"
              placeholder="Street"
              required
            />
            <FormFieldItem
              control={form.control}
              name="building_number"
              label="Building Number"
              placeholder="Building number"
              required
            />
            <FormFieldItem
              control={form.control}
              name="post_code"
              label="Post Code"
              placeholder="Post code"
              required
            />
            <FormFieldItem
              control={form.control}
              name="city"
              label="City"
              placeholder="City"
              required
            />
            <FormFieldItem
              control={form.control}
              name="country_code"
              label="Country Code (ISO3166-1 alpha-3)"
              placeholder="Country code"
              required
              maxLength={3}
              style={{ textTransform: "uppercase" }}
              onChange={(e) =>
                form.setValue("country_code", e.target.value.toUpperCase())
              }
            />

            <div className="mt-4 p-4 bg-muted rounded-md">
              <h4 className="text-sm font-medium mb-2">Address Preview</h4>
              <pre className="text-sm whitespace-pre-wrap">
                {addressPreview}
              </pre>
            </div>

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
                  : "Create Address"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
