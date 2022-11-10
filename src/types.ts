export interface RootState {
  activeTaxonomy: string;
  showSidebar: boolean;
  showProcedures: boolean;
  dialog: Dialog;
  tableMetaData: TableMetaData;
  sunburstData: SunburstData[];
  previousModel: string[];
  revisionOptions: RevisionOptions;
  revisedPlan: string[];
  acceptedActions: string[];
  collapsed: boolean[];
  actionCardData: Action[][][] | null;
  showCausalities: boolean;
}

export interface TableMetaData {
  type: string;
  key: string;
}

export interface TableData {
  agent: any;
  action: string;
  time: number;
}

export interface ProcedureData {
  id: number;
  parentId?: number;
  action: string;
  agent: string[] | string;
  quantity: string;
  abbreviation: string;
  precedence: string;
  role: string[] | string;
  causality?: string[];
}

export interface CausalityData {
  id: string;
  causality: string;
  value: string;
}

export interface MultiselectOptions {
  role: string[];
  agent: string[];
  causality: CausalityOptions;
}

export interface CausalityOptions {
  causalities: string[];
  comparisonOperators: string[];
  threshold: string;
}

export interface TaxonomyData {
  id: number;
  parentId?: number;
  agent: string;
  role: string;
  parent: string;
}

export interface Dialog {
  show: boolean;
  title?: string;
  label?: string;
}
export interface SunburstData {
  id: string;
  parent: string;
  name: string;
  value?: number;
}

export interface Action {
  name: string;
  agent: string;
  time: number;
}

export interface MaterialTableData {
  tableData: {
    childRows: number;
    editing: boolean;
    id: number;
    isTreeExpanded: boolean;
    markedForTreeRemove: boolean;
    path: number[];
  };
}
export interface ColumnDef {
  field: string;
  options?: string[];
  lookup?: any;
  title: string;
  editComponent?: (props: {
    field: string;
    onChange: (e: any) => void;
    value: string[];
    multiselectOptions: MultiselectOptions;
  }) => JSX.Element;
  type?: string;
}

export interface Models {
  Solver: string;
  Input: string[];
  Call: Call[];
  Calls: number;
  Time: Time;
}

export interface Call {
  Witnesses: Witnesses[];
  Result: string;
  Models: ModelMetaData;
}

export interface Witnesses {
  Value: string[];
  Costs: number[];
}

export interface ModelMetaData {
  Number: number;
  More: string;
  Optimum: string;
  Optimal: number;
  Costs: number[];
}

export interface Time {
  Total: number;
  Solve: number;
  Model: number;
  Unsat: number;
  CPU: number;
}

export interface BackendResponse extends ModelResponse {
  error?: string;
}

export interface ModelResponse {
  newModels?: Action[][];
  newPreviousModel?: string[];
}

export interface RevisionOptions {
  key: string;
  agents: string[];
}
