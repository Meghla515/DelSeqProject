import { any } from "cypress/types/bluebird";
import { combineReducers } from "redux";
import initialState from "./utils/initialState";

const activeTaxonomyReducer = (
  state = initialState.activeTaxonomy,
  action: any
) => {
  switch (action.type) {
    case "SET_ACTIVE_TAXONOMY":
      return action.payload.activeTaxonomy;
    default:
      return state;
  }
};

const tableReducer = (state = initialState.tableMetaData, action: any) => {
  switch (action.type) {
    case "RENDER_TABLE":
      return {
        type: action.payload.type,
        key: action.payload.key,
      };
    default:
      return state;
  }
};

const showSidebarReducer = (state: boolean = false, action: any) => {
  switch (action.type) {
    case "TOGGLE_SIDEBAR":
      return !state;
    default:
      return state;
  }
};

const dialogReducer = (state = initialState.dialog, action: any) => {
  switch (action.type) {
    case "TOGGLE_DIALOG":
      return {
        show: !state.show,
        title: action.payload.options?.title,
        label: action.payload.options?.label,
      };
    default:
      return state;
  }
};

const showCausalitiesReducer = (
  state = initialState.showCausalities,
  action: any
) => {
  switch (action.type) {
    case "TOGGLE_CAUSALITIES":
      return !state;
    default:
      return state;
  }
};

const showProceduresReducer = (state: boolean = false, action: any) => {
  switch (action.type) {
    case "TOGGLE_PROCEDURES":
      return !state;
    default:
      return state;
  }
};

const previousModelReducer = (
  state = initialState.previousModel,
  action: any
) => {
  switch (action.type) {
    case "SET_PREVIOUS_MODEL":
      return action.payload.previousModel;
    default:
      return state;
  }
};

const acceptedActionsReducer = (
  state = initialState.acceptedActions,
  action: any
) => {
  switch (action.type) {
    case "SET_ACCEPTED_ACTIONS":
      return action.payload.acceptedActions;
    default:
      return state;
  }
};

const revisionOptionsReducer = (
  state = initialState.revisionOptions,
  action: any
) => {
  switch (action.type) {
    case "SET_REVISION_OPTIONS":
      return action.payload.revisionOptions;
    default:
      return state;
  }
};

const revisedPlanReducer = (state = initialState.revisedPlan, action: any) => {
  switch (action.type) {
    case "SET_REVISED_PLAN":
      return action.payload.revisedPlan;
    default:
      return state;
  }
};

const collapedReducer = (state = initialState.collapsed, action: any) => {
  switch (action.type) {
    case "SET_COLLAPSED":
      return action.payload.collapsed;
    default:
      return state;
  }
};

const actionCardDataReducer = (
  state = initialState.actionCardData,
  action: any
) => {
  switch (action.type) {
    case "SET_ACTION_CARD_DATA":
      return action.payload.actionCardData;
    default:
      return state;
  }
};

const allReducers = combineReducers({
  showSidebar: showSidebarReducer,
  showProcedures: showProceduresReducer,
  dialog: dialogReducer,
  showCausalities: showCausalitiesReducer,
  tableMetaData: tableReducer,
  activeTaxonomy: activeTaxonomyReducer,
  previousModel: previousModelReducer,
  acceptedActions: acceptedActionsReducer,
  revisionOptions: revisionOptionsReducer,
  revisedPlan: revisedPlanReducer,
  collapsed: collapedReducer,
  actionCardData: actionCardDataReducer,
});

export default allReducers;
