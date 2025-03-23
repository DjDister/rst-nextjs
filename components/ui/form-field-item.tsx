"use client";

import { ReactNode } from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Control,
  FieldPath,
  FieldValues,
  ControllerRenderProps,
} from "react-hook-form";

interface FormFieldItemProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  control: Control<TFieldValues>;
  name: TName;
  label: string;
  placeholder: string;
  type?: string;
  required?: boolean;
  maxLength?: number;
  style?: React.CSSProperties;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  renderInput?: (
    field: ControllerRenderProps<TFieldValues, TName>
  ) => ReactNode;
  disabled?: boolean;
}

export function FormFieldItem<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  label,
  placeholder,
  type = "text",
  required = false,
  maxLength,
  style,
  onChange,
  renderInput,
  disabled,
}: FormFieldItemProps<TFieldValues, TName>) {
  return (
    <FormField
      control={control}
      name={name}
      disabled={disabled}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label}
            {required && "*"}
          </FormLabel>
          <FormControl>
            {renderInput ? (
              renderInput(field)
            ) : (
              <Input
                placeholder={placeholder}
                type={type}
                maxLength={maxLength}
                style={style}
                {...field}
                value={field.value || ""}
                onChange={(e) => {
                  if (onChange) {
                    onChange(e);
                  } else {
                    field.onChange(e);
                  }
                }}
              />
            )}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
