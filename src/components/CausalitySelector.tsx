import { Input, MenuItem, Select } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { CausalityData, CausalityOptions } from "../types";

interface Props {
  onChange: (value: string[]) => void;
  options: CausalityOptions;
  values: string[];
}

const CausalitySelector: React.FC<Props> = (props) => {
  const { onChange, options, values } = props;
  const [causalitySelection, setCausalitySelection] = useState(
    values ? values : ["None", "None", "None"]
  );

  const handleChange = (
    evt: React.ChangeEvent<{
      name?: string | undefined;
      value: unknown;
    }>
  ) => {
    const update = causalitySelection;
    switch (evt.target.name) {
      case "causality":
        update[0] = evt.target.value as string;
        break;
      case "comparisonOperator":
        update[1] = evt.target.value as string;
        break;
      case "threshold":
        update[2] = evt.target.value as string;
        break;
      default:
        break;
    }
    setCausalitySelection(update);
    onChange(causalitySelection);
  };

  return (
    <>
      <Select
        onChange={(
          evt: React.ChangeEvent<{
            name?: string | undefined;
            value: unknown;
          }>
        ) => {
          handleChange(evt);
        }}
        name="causality"
        value={causalitySelection[0]}
      >
        {options.causalities.map((el: string, i: number) => (
          <MenuItem key={el + i} value={el}>
            {el}
          </MenuItem>
        ))}
      </Select>
      <Select
        onChange={(
          evt: React.ChangeEvent<{
            name?: string | undefined;
            value: unknown;
          }>
        ) => {
          handleChange(evt);
        }}
        name="comparisonOperator"
        value={causalitySelection[1]}
      >
        {options.comparisonOperators.map((el: string, i: number) => (
          <MenuItem key={el + i} value={el}>
            {el}
          </MenuItem>
        ))}
      </Select>
      <Input
        placeholder="Threshold"
        onChange={(
          evt: React.ChangeEvent<{
            name?: string | undefined;
            value: unknown;
          }>
        ) => {
          handleChange(evt);
        }}
        name="threshold"
        value={causalitySelection[2]}
      />
    </>
  );
};

export default CausalitySelector;
