import { Action, ProcedureData, RevisionOptions, TaxonomyData } from "./types";

export const setActiveTaxonomy = (activeTaxonomy: string) => {
  return {
    type: "SET_ACTIVE_TAXONOMY",
    payload: {
      activeTaxonomy,
    },
  };
};

export const renderTable = (type: string, key: string) => {
  return {
    type: "RENDER_TABLE",
    payload: {
      type,
      key,
    },
  };
};

export const setProcedure = (key: string, procedure: ProcedureData[]) => {
  return {
    type: "SET_PROCEDURE",
    payload: {
      key,
      procedure,
    },
  };
};

export const setTaxonomy = (key: string, taxonomy: TaxonomyData[]) => {
  return {
    type: "SET_TAXONOMY",
    payload: {
      key,
      taxonomy,
    },
  };
};

export const toggleSidebar = () => {
  return {
    type: "TOGGLE_SIDEBAR",
  };
};

export const toggleDialog = (options?: { title: string; label: string }) => {
  return {
    type: "TOGGLE_DIALOG",
    payload: {
      options,
    },
  };
};

export const toggleCausalities = () => {
  return {
    type: "TOGGLE_CAUSALITIES",
  };
};

export const toggleProcedures = () => {
  return {
    type: "TOGGLE_PROCEDURES",
  };
};

export const setPreviousModel = (model: string[]) => {
  return {
    type: "SET_PREVIOUS_MODEL",
    payload: {
      previousModel: model,
    },
  };
};

export const setAcceptedActions = (acceptedActions: string[]) => {
  return {
    type: "SET_ACCEPTED_ACTIONS",
    payload: {
      acceptedActions,
    },
  };
};

export const setRevisionOptions = (revisionOptions: RevisionOptions) => {
  return {
    type: "SET_REVISION_OPTIONS",
    payload: {
      revisionOptions,
    },
  };
};

export const setRevisedPlan = (revisedPlan: string[]) => {
  return {
    type: "SET_REVISED_PLAN",
    payload: {
      revisedPlan,
    },
  };
};

export const setCollapsed = (collapsed: boolean[]) => {
  return {
    type: "SET_COLLAPSED",
    payload: {
      collapsed,
    },
  };
};

export const setActionCardData = (actionCardData: Action[][][] | null) => {
  return {
    type: "SET_ACTION_CARD_DATA",
    payload: {
      actionCardData,
    },
  };
};
