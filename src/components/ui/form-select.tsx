"use client";

import { useMemo } from "react";
import { createListCollection, type SelectRootProps } from "@chakra-ui/react";
import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from "./select";

export type FormSelectOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

type FormSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: FormSelectOption[];
  placeholder?: string;
  size?: SelectRootProps["size"];
  disabled?: boolean;
  width?: SelectRootProps["width"];
  minW?: SelectRootProps["minW"];
  maxW?: SelectRootProps["maxW"];
  flex?: SelectRootProps["flex"];
  mb?: SelectRootProps["mb"];
  "aria-label"?: string;
};

/**
 * Chakra Select wrapper — never renders a native browser <select>.
 */
export function FormSelect({
  value,
  onChange,
  options,
  placeholder = "Select…",
  size = "sm",
  disabled,
  width = "full",
  minW,
  maxW,
  flex,
  mb,
  "aria-label": ariaLabel,
}: FormSelectProps) {
  const collection = useMemo(
    () =>
      createListCollection({
        items: options,
        itemToString: (item) => item.label,
        itemToValue: (item) => item.value,
        isItemDisabled: (item) => !!item.disabled,
      }),
    [options],
  );

  return (
    <SelectRoot
      collection={collection}
      size={size}
      disabled={disabled}
      width={width}
      minW={minW}
      maxW={maxW}
      flex={flex}
      mb={mb}
      value={value ? [value] : []}
      onValueChange={(details) => {
        const next = details.value[0];
        if (next != null) onChange(next);
      }}
      positioning={{ sameWidth: true }}
    >
      <SelectTrigger aria-label={ariaLabel}>
        <SelectValueText placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {collection.items.map((item) => (
          <SelectItem item={item} key={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
  );
}
