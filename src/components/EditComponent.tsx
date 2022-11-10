import { MenuItem, OutlinedInput, Select } from "@material-ui/core";
import React from "react";
import { ColumnDef } from "../types";

const EditComponent = (props: {
  columnDef: ColumnDef;
  onChange: (e: any) => void;
  value: string[];
}) => {
  const { columnDef, onChange, value } = props;

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;

  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
      },
    },
  };

  return (
    <Select
      multiple
      value={value ? value : [""]}
      onChange={(evt) => {
        onChange(evt.target.value);
      }}
      MenuProps={MenuProps}
    >
      {console.log("Cdef", columnDef)}
      {/* @ts-ignore: Object is possibly 'undefined'. //https://github.com/microsoft/TypeScript/issues/29642*/}
      {columnDef.options[columnDef.field] &&
        //@ts-ignore: Object is possibly 'undefined'. //https://github.com/microsoft/TypeScript/issues/29642
        columnDef.options[columnDef.field]!.map((el: string) => (
          <MenuItem key={el} value={el}>
            {el}
          </MenuItem>
        ))}
    </Select>
  );
};

export default EditComponent;
