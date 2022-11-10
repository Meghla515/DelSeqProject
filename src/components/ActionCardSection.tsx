import React from "react";
import { RootState } from "../types";
import { useSelector } from "react-redux";
import ActionCard from "./ActionCard";
import ActionCardSectionHeader from "./ActionCardSectionHeader";

const ActionCardSection = () => {
  const actionCardData = useSelector(
    (state: RootState) => state.actionCardData
  );
  const collapsed = useSelector((state: RootState) => state.collapsed);

  return (
    <>
      {actionCardData &&
        actionCardData.map((actionCardSection) => (
          <>
            {actionCardSection.map((actions, i) => (
              <>
                <ActionCardSectionHeader index={i} actions={actions} />
                {!collapsed[i] && (
                  <div className="action-card-horizontal-scroll">
                    {actions.map((action, j) => (
                      <div className="container">
                        <ActionCard index={j} action={action} />
                      </div>
                    ))}
                  </div>
                )}
              </>
            ))}
            <hr />
          </>
        ))}
    </>
  );
};

export default ActionCardSection;
