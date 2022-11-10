import { Button } from "@material-ui/core";
import { doc } from "firebase/firestore";
import MaterialTable from "material-table";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFirestore, useFirestoreDocData } from "reactfire";
import {
  setAcceptedActions,
  setRevisedPlan,
  setRevisionOptions,
} from "../actions";
import {
  Action,
  ProcedureData,
  RootState,
  TableData,
  TaxonomyData,
} from "../types";
import { createReadableConst, unique } from "../utils/utils";

interface Props {
  index: number;
  action: Action;
}

const ActionCard: React.FC<Props> = ({ index, action }) => {
  const [data, setData] = useState<TableData[]>([
    {
      agent: action.agent,
      action: action.name,
      time: action.time,
    },
  ]);

  const firestore = useFirestore();
  const tableMetaData = useSelector((state: RootState) => state.tableMetaData);
  const revisedPlan = useSelector((state: RootState) => state.revisedPlan);
  const acceptedActions = useSelector(
    (state: RootState) => state.acceptedActions
  );

  const revisionOptions = useSelector(
    (state: RootState) => state.revisionOptions
  );
  const activeTaxonomy = useSelector(
    (state: RootState) => state.activeTaxonomy
  );

  const taxonomyRef = doc(firestore, "taxonomies", activeTaxonomy);
  const { data: taxonomyData } = useFirestoreDocData(taxonomyRef, {
    idField: "key",
  });

  useEffect(() => {
    console.log("revisedPlan", revisedPlan);
  }, [revisedPlan]);

  const dispatch = useDispatch();

  const procedureRef = doc(firestore, "procedures", tableMetaData.key);
  const { data: procedureData } = useFirestoreDocData(procedureRef, {
    idField: "key",
  });

  const reviseAction = (actionName: string, index: number) => {
    const agents = possibleAgents(actionName);
    dispatch(setRevisionOptions({ key: actionName + index, agents }));
  };

  const getActionAbbreviation = (action: Action) => {
    const index = procedureData.tableData.findIndex(
      (el: ProcedureData) => el.action === action.name
    );
    return procedureData.tableData[index].abbreviation;
  };

  const possibleAgents = (actionName: string) => {
    const index = procedureData.tableData.findIndex(
      (el: ProcedureData) => el.action === actionName
    );
    const teams = procedureData.tableData[index].agent as string[];
    const roles = procedureData.tableData[index].role as string[];
    const filteredRoles = roles.filter((el) => el);

    if (filteredRoles.length > 0) {
      return teams.map((team) => agentsWithRoleIn(team, filteredRoles)).flat();
    } else {
      return teams.map((team) => agentsIn(team)).flat();
    }
  };

  const agentsIn = (team: string) =>
    taxonomyData.tableData
      .filter((el: TaxonomyData) => el.parent === team)
      .map((el: TaxonomyData) => el.agent)
      .filter(unique) as string[];

  const agentsWithRoleIn = (team: string, roles: string[]) =>
    taxonomyData.tableData
      .filter((el: TaxonomyData) => el.parent === team)
      .filter((el: TaxonomyData) => roles.includes(el.role))
      .map((el: TaxonomyData) => el.agent)
      .filter(unique) as string[];

  const acceptAction = (action: Action, index: number) => {
    const abbreviation = getActionAbbreviation(action);
    const update = `schedule(${createReadableConst(
      abbreviation
    )}, ${createReadableConst(action.agent)}, ${action.time}).`;

    dispatch(setRevisedPlan([...revisedPlan, update]));
    dispatch(setAcceptedActions([...acceptedActions, action.name + index]));
  };

  const handleRevisionChange = (e: any, action: Action, index: number) => {
    const agent: string = e.currentTarget.value;
    const abbreviation = getActionAbbreviation(action);
    let update: string;
    if (agent === action.agent) {
      setData([
        {
          agent: agentChange(action.agent, "?"),
          action: action.name,
          time: action.time,
        },
      ]);
      update = `relieve(${createReadableConst(
        abbreviation
      )}, ${createReadableConst(agent)}).`;
    } else {
      setData([
        {
          agent: agentChange(action.agent, agent),
          action: action.name,
          time: action.time,
        },
      ]);
      update = `schedule(${createReadableConst(
        abbreviation
      )}, ${createReadableConst(agent)}, ${action.time}).`;
    }

    dispatch(setRevisedPlan([...revisedPlan, update]));
    dispatch(setAcceptedActions([...acceptedActions, action.name + index]));
    dispatch(setRevisionOptions({ key: "", agents: [] }));
  };

  const agentChange = (fromAgent: string, toAgent: string) => (
    <p>
      <del>{fromAgent}</del> <ins>{toAgent}</ins>
    </p>
  );

  const undoAccept = (action: Action, index: number) => {
    let agent = action.agent;
    if (data[0].agent.props) {
      //Means that the agent was changed, and we have to reset back to the previous agent
      agent = getNewAgent();
      setData([
        {
          agent: getPreviousAgent(),
          action: action.name,
          time: action.time,
        },
      ]);
    }
    const update = acceptedActions.filter((el) => el !== action.name + index);
    dispatch(setAcceptedActions(update));

    console.log("Data", data);

    //Also need to reset the revised plan, and figure out which action to remove
    const revisionUpdate = revisedPlan.filter(
      (el) =>
        el !==
          `schedule(${getActionAbbreviation(action)}, ${agent}, ${
            action.time
          }).` && el !== `relieve(${getActionAbbreviation(action)}, ${agent}).`
    );

    dispatch(setRevisedPlan(revisionUpdate));
  };

  const getPreviousAgent = () => {
    return data[0].agent.props.children[0].props.children;
  };

  const getNewAgent = () => {
    return data[0].agent.props.children[2].props.children;
  };

  const options = {
    search: false,
    selection: false,
    showTitle: false,
    toolbar: false,
    paging: false,
    cellStyle: {
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      overflow: "hidden",
      maxWidth: 300,
    },
    headerStyle: {
      width: 100,
      maxWidth: 100,
      height: 20,
      maxHeight: 20,
    },
    tableLaoyt: "auto",
  };

  const columns = [
    { title: "Agent", field: "agent" },
    {
      title: "Action",
      field: "action",
    },
  ];

  return (
    <>
      <div data-testid="action-card" className={"action-card"}>
        <MaterialTable
          style={{
            border: acceptedActions.includes(action.name + index)
              ? "2px solid #4050B5"
              : "",
          }}
          options={options}
          columns={columns}
          data={data}
        />
        <div
          className={`confirmation-card ${
            revisionOptions.key === action.name + index ? "expanded" : ""
          }`}
        >
          {revisionOptions.key === action.name + index &&
            revisionOptions.agents.map((agent) => (
              <div
                data-testid="revision-options"
                className="revision-list-item"
              >
                <p>{agent}</p>
                <Button
                  data-testid={
                    agent === action.agent
                      ? "relieve-button"
                      : "schedule-button"
                  }
                  variant={agent === action.agent ? "outlined" : "contained"}
                  color={agent === action.agent ? "secondary" : "primary"}
                  value={agent}
                  onClick={(e) => handleRevisionChange(e, action, index)}
                >
                  {agent === action.agent ? "Relieve" : "Schedule"}
                </Button>
              </div>
            ))}
          {revisionOptions.key !== action.name + index && (
            <>
              {acceptedActions.includes(action.name + index) ? (
                <>
                  {}
                  <p>Action accepted</p>
                  <Button
                    data-testid="revise-button"
                    variant="outlined"
                    color="secondary"
                    onClick={() => undoAccept(action, index)}
                  >
                    Undo
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => acceptAction(action, index)}
                  >
                    Accept
                  </Button>
                  <Button
                    data-testid="revise-button"
                    variant="outlined"
                    color="secondary"
                    onClick={() => reviseAction(action.name, index)}
                  >
                    Revise
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ActionCard;
