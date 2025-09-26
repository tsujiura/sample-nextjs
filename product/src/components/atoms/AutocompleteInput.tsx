import React from "react";
import { Autocomplete, type AutocompleteProps } from "@mui/material";

export default function AutocompleteInput<
  TValue,
  Multiple extends boolean | undefined,
  DisableClearable extends boolean | undefined,
  FreeSolo extends boolean | undefined,
>(props: AutocompleteProps<TValue, Multiple, DisableClearable, FreeSolo>) {
  return <Autocomplete {...props} />;
}