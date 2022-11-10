import { ExpandLess, ExpandMore } from "@material-ui/icons";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCollapsed } from "../actions";
import { Action, RootState } from "../types";
import { ExpanderOptions } from "../utils/const";

interface Props {
  index: number;
  actions: Action[];
}

const ActionCardSectionHeader: React.FC<Props> = ({ index, actions }) => {
  const acceptedActions = useSelector(
    (state: RootState) => state.acceptedActions
  );
  const collapsed = useSelector((state: RootState) => state.collapsed);

  const dispatch = useDispatch();

  const handleExpand = (option: ExpanderOptions, index: number) => {
    const update = [...collapsed];
    if (option === ExpanderOptions.EXPAND) {
      update[index] = false;
      dispatch(setCollapsed(update));
    } else {
      update[index] = true;
      dispatch(setCollapsed(update));
    }
  };

  return (
    <div className="actions-header">
      <h2>Actions at {index + 1}: </h2>
      <p>
        {" "}
        Accepted{" "}
        {actions.reduce(
          (a, v, i) => (acceptedActions.includes(v.name + i) ? a + 1 : a),
          0
        )}{" "}
        of {actions.length}
      </p>
      {collapsed[index] ? (
        <div
          className="expander"
          onClick={() => handleExpand(ExpanderOptions.EXPAND, index)}
        >
          <p>Show actions</p>
          <ExpandMore />
        </div>
      ) : (
        <div
          className="expander"
          onClick={() => handleExpand(ExpanderOptions.COLLAPSE, index)}
        >
          <p>Hide actions</p>
          <ExpandLess />
        </div>
      )}
    </div>
  );
};

export default ActionCardSectionHeader;
