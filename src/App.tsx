import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  CircularProgress,
} from "@material-ui/core";

import Sunburst from "./components/Sunburst";
import clsx from "clsx";
import {
  causalityThresholdReached,
  generateActionCardData,
  generateSunburstData,
  getASPModels,
} from "./utils/utils";
import { Action, BackendResponse, ProcedureData, RootState } from "./types";
import { useSelector, useDispatch } from "react-redux";
import {
  renderTable,
  setActionCardData,
  setPreviousModel,
  toggleDialog,
} from "./actions";
import Sidebar from "./components/Sidebar";
import Table from "./components/Table";
import useStyles from "./Styles";
import { dialogOptions, modelTypes, tableTypes } from "./utils/const";
import ActionCardSection from "./components/ActionCardSection";
import { useFirestore, useFirestoreDocData } from "reactfire";

import { setDoc } from "@firebase/firestore";
import { doc } from "firebase/firestore";
import CausalityEditor from "./components/CausalityEditor";

const App = () => {
  const firestore = useFirestore();

  const dialog = useSelector((state: RootState) => state.dialog);
  const revisedPlan = useSelector((state: RootState) => state.revisedPlan);
  const previousModel = useSelector((state: RootState) => state.previousModel);
  const showSidebar = useSelector((state: RootState) => state.showSidebar);
  const tableMetaData = useSelector((state: RootState) => state.tableMetaData);
  const activeTaxonomy = useSelector(
    (state: RootState) => state.activeTaxonomy
  );
  const actionCardData = useSelector(
    (state: RootState) => state.actionCardData
  );
  const [sunburstData, setSunburstData] = useState();
  const [newDocument, setNewDocument] = useState("");
  const [failureMessage, setFailureMessage] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);

  const taxonomyRef = doc(firestore, "taxonomies", activeTaxonomy);
  const { data: taxonomyData } = useFirestoreDocData(taxonomyRef, {
    idField: "key",
  });
  const procedureRef = doc(firestore, "procedures", tableMetaData.key);
  const { data: procedureData } = useFirestoreDocData(procedureRef, {
    idField: "key",
  });

  const dispatch = useDispatch();
  const classes = useStyles();

  useEffect(() => {
    resetData();
  }, [activeTaxonomy]); //Active taxonomy has to be there to only trigger when taxonomy changes

  const createNewDocument = async () => {
    if (dialog.title === dialogOptions.PROCEDURE.title) {
      dispatch(renderTable(tableTypes.PROCEDURES, newDocument));
      await setDoc(doc(firestore, "procedures", newDocument), {
        tableData: [],
        causalityData: [],
      });
    } else if (dialog.title === dialogOptions.TAXONOMY.title) {
      dispatch(renderTable(tableTypes.TAXONOMIES, newDocument));
      await setDoc(doc(firestore, "taxonomies", newDocument), {
        tableData: [],
      });
    } else {
      console.log(
        `${dialog.title} does not match ${dialogOptions.PROCEDURE.title} or ${dialogOptions.TAXONOMY.title}`
      );
    }
    dispatch(toggleDialog());
  };

  const resetData = () => {
    setSunburstData(undefined);
    dispatch(setActionCardData(null));
    setFailureMessage(undefined);
  };

  const generateModels = async (modelType: string) => {
    resetData();

    const tmpProcedure = JSON.parse(JSON.stringify(procedureData.tableData));
    console.log("tmpprocedure", tmpProcedure);
    for (let i = tmpProcedure.length - 1; i >= 0; i--) {
      if (
        tmpProcedure[i].causality &&
        !causalityThresholdReached(
          tmpProcedure[i].causality,
          procedureData.causalityData
        )
      ) {
        console.log("Should remove", tmpProcedure[i]);
        tmpProcedure.splice(i, 1); //Remove the item from the procedure as the threshold has not been reached
      } else {
        tmpProcedure[i].role = (tmpProcedure[i].role as string[])
          .filter((e) => e)
          .join(",");
        tmpProcedure[i].agent = (tmpProcedure[i].agent as string[])
          .filter((e) => e)
          .join(",");
      }
    }

    const requestData = {
      taxonomy: taxonomyData.tableData,
      procedure: tmpProcedure,
    };

    setIsLoading(true);
    const { newModels, newPreviousModel, error }: BackendResponse =
      await getASPModels(
        tmpProcedure,
        taxonomyData.tableData,
        requestData,
        "initial",
        1
      );
    setIsLoading(false);

    if (error) {
      setSunburstData(undefined);
      dispatch(setActionCardData(null));
      setFailureMessage(JSON.stringify(error, null, 2));
      return;
    }

    console.log("MODELS:: ", newModels);

    dispatch(setPreviousModel(newPreviousModel as string[]));
    if (modelType === modelTypes.SUNBURST) {
      setFailureMessage(undefined);
      dispatch(setActionCardData(null));
      setSunburstData(generateSunburstData(newModels as Action[][]));
    } else if (modelType === modelTypes.ACTION_CARDS) {
      setFailureMessage(undefined);
      setSunburstData(undefined);
      dispatch(
        setActionCardData(generateActionCardData(newModels as Action[][]))
      );
    } else {
      console.log(`${modelType} is not yet implemented`);
    }
  };

  const reviseResponse = async () => {
    resetData();

    const revisionRequest: any = {
      previousModel,
      changes: revisedPlan,
    };

    setIsLoading(true);
    const { newModels, newPreviousModel, error }: BackendResponse =
      await getASPModels(
        procedureData.tableData as ProcedureData[],
        taxonomyData.tableData,
        revisionRequest,
        "revise",
        1
      );
    setIsLoading(false);

    if (error) {
      console.log("Error", error);
      dispatch(setActionCardData([]));
      setFailureMessage(JSON.stringify(error, null, 2));
      return;
    } else {
      dispatch(setPreviousModel(newPreviousModel as string[]));
      dispatch(
        setActionCardData(generateActionCardData(newModels as Action[][]))
      );
    }
  };

  return (
    <>
      <div className={classes.root}>
        <Sidebar />
        <main
          className={clsx(classes.content, {
            [classes.contentShift]: showSidebar,
          })}
        >
          <div className={classes.drawerHeader} />
          <Dialog
            open={dialog.show}
            onClose={() => dispatch(toggleDialog())}
            aria-labelledby="form-dialog-title"
          >
            <DialogTitle id="form-dialog-title">{dialog.title}</DialogTitle>
            <DialogContent>
              <TextField
                onChange={(e) => setNewDocument(e.target.value)}
                autoFocus
                margin="dense"
                id="name"
                label={dialog.label}
                type="text"
                fullWidth
                data-testid="dialog-input"
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => dispatch(toggleDialog())} color="primary">
                Cancel
              </Button>
              <Button
                data-testid="dialog-submit"
                type="submit"
                onClick={() => createNewDocument()}
                color="primary"
              >
                Create
              </Button>
            </DialogActions>
          </Dialog>
          <Table tableMetaData={tableMetaData} />
          <CausalityEditor currentProcedure={tableMetaData.key} />
          {tableMetaData.type === tableTypes.PROCEDURES && (
            <>
              <div className="center padding-l">
                <Button
                  data-testid="generate-action-cards-button"
                  variant="contained"
                  color="primary"
                  onClick={() => generateModels(modelTypes.ACTION_CARDS)}
                >
                  Initiate new response
                </Button>
                {actionCardData && (
                  <Button
                    data-testid="revision-submit-button"
                    variant="contained"
                    color="primary"
                    onClick={() => reviseResponse()}
                  >
                    Revise response
                  </Button>
                )}
              </div>
              {failureMessage && PrettyPrintJson(failureMessage)}
              {sunburstData && <Sunburst data={sunburstData} />}
            </>
          )}
        </main>
      </div>
      {isLoading && (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </div>
      )}
      <ActionCardSection />
    </>
  );
};

const PrettyPrintJson = (data: any) => {
  return (
    <div>
      <pre>{data}</pre>
    </div>
  );
};

export default App;
