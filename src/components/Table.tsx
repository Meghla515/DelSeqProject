import React, { useEffect, useState } from "react";
import MaterialTable, { MTableToolbar } from "material-table";
import { makeStyles } from "@material-ui/core/styles";
import { useDispatch, useSelector } from "react-redux";
import {
  CausalityData,
  ColumnDef,
  MaterialTableData,
  MultiselectOptions,
  ProcedureData,
  RootState,
  TableMetaData,
  TaxonomyData,
} from "../types";
import { setActiveTaxonomy, toggleCausalities } from "../actions";
import { editComponentTypes, tableTypes } from "../utils/const";
import {
  Button,
  ButtonGroup,
  FormControl,
  Input,
  InputLabel,
  MenuItem,
  Select,
} from "@material-ui/core";
import { unique } from "../utils/utils";
import EditComponent from "./EditComponent";
import { doc, collection, updateDoc, deleteDoc } from "firebase/firestore";
import {
  useFirestore,
  useFirestoreCollectionData,
  useFirestoreDocData,
} from "reactfire";
import CausalitySelector from "./CausalitySelector";

interface Props {
  tableMetaData: TableMetaData;
}

const Table: React.FC<Props> = (props) => {
  const { tableMetaData } = props;
  const firestore = useFirestore();
  const taxonomiesCollection = collection(firestore, "taxonomies");
  const { data: firestoreTaxonomies } = useFirestoreCollectionData(
    taxonomiesCollection,
    { idField: "key" }
  );
  const ref = doc(firestore, tableMetaData.type, tableMetaData.key);
  const { data: document } = useFirestoreDocData(ref, {
    idField: "key",
  });

  const activeTaxonomy = useSelector(
    (state: RootState) => state.activeTaxonomy
  );
  const classes = useStyles();
  const dispatch = useDispatch();
  const [columns, setColumns] = useState<any>();
  const [lookupValues, setLookupValues] = useState<any>();
  const [multiselectOptions, setMultiselectOptions] =
    useState<MultiselectOptions>({
      role: [],
      agent: [],
      causality: {
        causalities: [],
        comparisonOperators: [],
        threshold: "",
      },
    });
  const tableColumns = {
    procedures: [
      { title: "Action", field: "action" },
      {
        title: "Role",
        field: "role",
        options: multiselectOptions,
        editComponent: (props: {
          columnDef: ColumnDef;
          onChange: any;
          value: string[];
        }) => (
          <EditComponent
            columnDef={props.columnDef}
            onChange={props.onChange}
            value={props.value}
          />
        ),
      },
      {
        title: "Agent",
        field: "agent",
        options: multiselectOptions,
        editComponent: (props: {
          columnDef: ColumnDef;
          onChange: any;
          value: string[];
        }) => (
          <EditComponent
            columnDef={props.columnDef}
            onChange={props.onChange}
            value={props.value}
          />
        ),
      },
      {
        title: "Quantity",
        field: "quantity",
      },
      {
        title: "Abbreviation",
        field: "abbreviation",
      },
      {
        title: "Precedence",
        field: "precedence",
        lookup: {},
      },
      {
        title: "Causality",
        field: "causality",
        options: multiselectOptions,
        editComponent: (props: { onChange: any; value: string[] }) => (
          <CausalitySelector
            options={multiselectOptions.causality}
            onChange={props.onChange}
            values={props.value}
          />
        ),
      },
    ],
    taxonomies: [
      {
        title: "Agent",
        field: "agent",
      },
      {
        title: "Role",
        field: "role",
      },
      {
        title: "Parent",
        field: "parent",
        lookup: {},
      },
    ],
  };

  useEffect(() => {
    if (tableMetaData.type === tableTypes.PROCEDURES) {
      if (firestoreTaxonomies && document) {
        const currentTaxonomyData = firestoreTaxonomies.find(
          (el) => el.key === activeTaxonomy
        );
        const roles = currentTaxonomyData?.tableData
          .filter((el: TaxonomyData) => el.role)
          .map((el: any) => el.role)
          .filter(unique) as string[];

        const agents = currentTaxonomyData?.tableData
          .filter((el: TaxonomyData) => el.parent === "None")
          .filter((el: TaxonomyData) => el.agent)
          .map((el: TaxonomyData) => el.agent)
          .filter(unique) as string[];

        const causalities = document.causalityData.map(
          (el: CausalityData) => el?.causality
        );

        //Add "None" to the options to allow users to undo their choice
        if (!causalities.includes("None")) {
          causalities.push("None");
        }

        setMultiselectOptions({
          role: roles,
          agent: agents,
          causality: {
            causalities: causalities,
            comparisonOperators: [
              "Less than",
              "Greater than",
              "Equal to",
              "None",
            ],
            threshold: "",
          },
        });
      }
    }
  }, [firestoreTaxonomies, activeTaxonomy, document]);

  /**
   * Whenever the firestore document is fetched, parse the relevant columns for lookup data.
   * Set the lookupData in state for later use. This isn't really intuitive, but the Table library
   * used is such a diva to work with, and requires that all the table columns are rerendered bacause
   * of the state in the editComponent.
   */
  useEffect(() => {
    if (!document) return;

    let lookupData: Record<string, string> = {};
    let updateColumns: Record<string, any> = {};

    if (props.tableMetaData.type === tableTypes.PROCEDURES) {
      lookupData = document.tableData
        .map((el: ProcedureData) => el.abbreviation)
        .reduce((obj: any, val: any) => {
          // @ts-ignore: Object is possibly 'undefined'. //https://github.com/microsoft/TypeScript/issues/29642
          obj[val] = val;
          return obj;
        }, {});
      const precedenceFieldIndex = tableColumns.procedures.findIndex(
        (el) => el.field === "precedence"
      );
      lookupData["None"] = "None";
      updateColumns = tableColumns.procedures;
      updateColumns[precedenceFieldIndex].lookup = lookupData;
    } else {
      lookupData = document.tableData
        .filter((el: TaxonomyData) => !el.parentId)
        .map((el: TaxonomyData) => el.agent)
        .reduce((obj: any, val: any) => {
          // @ts-ignore: Object is possibly 'undefined'. //https://github.com/microsoft/TypeScript/issues/29642
          obj[val] = val;
          return obj;
        }, {});
      const parentFieldIndex = tableColumns.taxonomies.findIndex(
        (el) => el.field === "parent"
      );
      lookupData["None"] = "None";
      updateColumns = tableColumns.taxonomies;
      updateColumns[parentFieldIndex].lookup = lookupData;
    }
    setLookupValues(lookupData);
    setColumns(updateColumns);

    console.log("TABLE COLUMNS", tableColumns);
    console.log("LOOKUP data", lookupData);
  }, [document]);

  /**
   * Really cumbersome logic in order to update the table columns. Have to rerender all of the columns whenever
   * the multiselectOptions are updated. Also have to make sure the lookup values are included in the update.
   * Also, the taxonomyTable data has no multiselect options, so the useEffect is not triggered for taxonomy data.
   */
  useEffect(() => {
    // @ts-ignore: Object is possibly 'undefined'. //https://github.com/microsoft/TypeScript/issues/29642
    if (tableMetaData.type === tableTypes.PROCEDURES) {
      let updateColumns = tableColumns.procedures;
      if (lookupValues) {
        const precedenceFieldIndex = updateColumns.findIndex(
          (el) => el.field === "precedence"
        );
        updateColumns[precedenceFieldIndex].lookup = lookupValues;
      }

      setColumns(updateColumns);
    }
    console.log("multiselectOptions hook called");
  }, [tableMetaData.type, multiselectOptions, lookupValues]);

  useEffect(() => {
    // @ts-ignore: Object is possibly 'undefined'. //https://github.com/microsoft/TypeScript/issues/29642
    setColumns(tableColumns[tableMetaData.type]);
  }, [tableMetaData.type]);

  const handleTaxonomyChange = (evt: any) => {
    // @ts-ignore: Object is possibly 'undefined'. //https://github.com/microsoft/TypeScript/issues/29642
    dispatch(setActiveTaxonomy(evt.target.value));

    const newTaxonomyData = firestoreTaxonomies.find(
      (el) => el.key === evt.target.value
    );

    let updateColumns: any = [...columns];
    updateColumns[1].lookup = newTaxonomyData?.tableData
      .filter((el: any) => el.hasOwnProperty("parentId") && el["role"])
      // @ts-ignore: Object is possibly 'undefined'. //https://github.com/microsoft/TypeScript/issues/29642
      // eslint-disable-next-line no-sequences
      .reduce((acc, curr) => ((acc[curr.role] = curr.role), acc), {});
    updateColumns[2].lookup = newTaxonomyData?.tableData
      .filter((el: any) => !el.hasOwnProperty("parentId") && el["agent"])
      // @ts-ignore: Object is possibly 'undefined'. //https://github.com/microsoft/TypeScript/issues/29642
      // eslint-disable-next-line no-sequences
      .reduce((acc, curr) => ((acc[curr.agent] = curr.agent), acc), {});
  };

  const addTableRow = async (
    newData: ProcedureData | TaxonomyData
  ): Promise<void> => {
    const currentTableData = document.tableData;

    console.log("currentTableData", currentTableData);

    if (tableMetaData.type === tableTypes.PROCEDURES) {
      const dataUpdate = currentTableData as ProcedureData[];
      const procedureData = newData as unknown as ProcedureData;
      procedureData.id = currentTableData.length + 1;
      if (!procedureData.role) {
        procedureData.role = [""];
      }

      dataUpdate.push(procedureData as ProcedureData);
      await updateDoc(doc(firestore, tableMetaData.type, tableMetaData.key), {
        tableData: dataUpdate,
      });
    } else if (tableMetaData.type === tableTypes.TAXONOMIES) {
      let taxonomyData = newData as TaxonomyData;
      if (taxonomyData.parent && taxonomyData.parent !== "None") {
        const parentId = currentTableData!.find(
          (el: TaxonomyData) => el.agent === taxonomyData.parent
        )!.id;
        taxonomyData.parentId = parentId;
        taxonomyData.id = parentId + 1;
      } else {
        const prevId = Math.max.apply(
          Math,
          currentTableData.map((el: ProcedureData) => el.id)
        );
        newData.id = prevId < 0 ? 1 : prevId + 1;
        taxonomyData.role = "";
        taxonomyData.parent = "None";
      }
      const dataUpdate = currentTableData as TaxonomyData[];
      dataUpdate.push(taxonomyData);
      const columnUpdate: any = tableColumns;
      columnUpdate.taxonomies[2].lookup[taxonomyData.agent] =
        taxonomyData.agent;
      await updateDoc(doc(firestore, tableMetaData.type, tableMetaData.key), {
        tableData: dataUpdate,
      });
    } else {
      console.log(
        `${tableMetaData.type} does not match ${tableTypes.PROCEDURES} or ${tableTypes.TAXONOMIES}`
      );
    }
  };

  const updateTableRow = async (
    newData: TaxonomyData | ProcedureData,
    oldData: MaterialTableData | undefined
  ): Promise<void> => {
    if (oldData) {
      const dataUpdate = document.tableData! as
        | TaxonomyData[]
        | ProcedureData[];
      const index = oldData.tableData.id;
      dataUpdate[index] = newData;
      if (tableMetaData.type === tableTypes.TAXONOMIES) {
        //If its a taxonomy update, then need to make sure the nesting is updated
        if ((newData as TaxonomyData).parent === "None") {
          delete (dataUpdate[index] as TaxonomyData).parentId;
        } else {
          const parentId = getParentId(newData as TaxonomyData);
          dataUpdate[index].parentId = parentId;
        }
      }

      await updateDoc(doc(firestore, tableMetaData.type, tableMetaData.key), {
        tableData: dataUpdate,
      });
    }
  };

  const getParentId = (taxonomy: TaxonomyData) => {
    const parent: TaxonomyData = document.tableData.find(
      (el: TaxonomyData) => el.agent === taxonomy.parent
    );
    return parent.id;
  };

  const deleteTableRow = async (
    oldData: MaterialTableData | undefined
  ): Promise<void> => {
    if (oldData) {
      const dataDelete = document.tableData!;
      const index = oldData.tableData.id;
      dataDelete.splice(index, 1);
      await updateDoc(doc(firestore, tableMetaData.type, tableMetaData.key), {
        tableData: dataDelete,
      });
    }
  };

  const deleteDocument = async () => {
    await deleteDoc(doc(firestore, tableMetaData.type, tableMetaData.key));
  };

  return (
    <MaterialTable
      title={tableMetaData.key}
      columns={columns}
      data={
        document &&
        document.tableData.map((obj: ProcedureData[] | TaxonomyData[]) => ({
          ...obj,
        }))
      }
      parentChildData={(row, rows) => rows.find((o) => o.id === row.parentId)}
      options={{
        rowStyle: (rowData: any) => ({
          backgroundColor:
            rowData.parent !== "None" && tableMetaData.type === "taxonomies"
              ? "#EEE"
              : "",
        }),
      }}
      editable={{
        onRowAdd: (newData: ProcedureData | TaxonomyData) =>
          addTableRow(newData),
        onRowUpdate: (newData: ProcedureData | TaxonomyData, oldData: any) =>
          new Promise((resolve: any, reject) => {
            setTimeout(() => {
              updateTableRow(newData, oldData);
              resolve();
            }, 0);
          }),
        onRowDelete: (oldData: any) => deleteTableRow(oldData),
      }}
      components={{
        Toolbar: (props) => (
          <div>
            <MTableToolbar {...props} />
            <div
              style={{
                padding: "0 16px",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              {tableMetaData.type === tableTypes.PROCEDURES && (
                <FormControl className={classes.formControl}>
                  <InputLabel>Taxonomy</InputLabel>
                  <Select
                    data-testid="taxonomy-selector"
                    value={activeTaxonomy}
                    onChange={handleTaxonomyChange}
                  >
                    {firestoreTaxonomies &&
                      firestoreTaxonomies.map((taxonomy) => (
                        <MenuItem key={taxonomy.key} value={taxonomy.key}>
                          {taxonomy.key}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              )}
              <ButtonGroup>
                <Button
                  color="secondary"
                  variant="outlined"
                  data-testid="delete-document"
                  onClick={deleteDocument}
                >
                  Delete {tableMetaData.key}
                </Button>
                {tableMetaData.type === tableTypes.PROCEDURES && (
                  <Button
                    color="primary"
                    variant="outlined"
                    data-testid="show-causalities"
                    onClick={() => dispatch(toggleCausalities())}
                  >
                    Show causalities
                  </Button>
                )}
              </ButtonGroup>
            </div>
          </div>
        ),
      }}
    />
  );
};

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

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

export default Table;
