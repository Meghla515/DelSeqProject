import { Drawer } from "@material-ui/core";
import { doc, updateDoc } from "firebase/firestore";
import MaterialTable from "material-table";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFirestore, useFirestoreDocData } from "reactfire";
import { toggleCausalities } from "../actions";
import { CausalityData, RootState } from "../types";

interface Props {
  currentProcedure: string;
}
//TODO: Causality table have ghost entries which need to be cleaned up. Also, the procedure table need to get real time updates from the causality editor,
//e.g. when adding a new causality, this should be immediately available in the multiselect options for the causality selector
const CausalityEditor: React.FC<Props> = (props) => {
  const dispatch = useDispatch();
  const showCausalities = useSelector(
    (state: RootState) => state.showCausalities
  );
  const { currentProcedure } = props;
  const firestore = useFirestore();
  const ref = doc(firestore, "procedures", currentProcedure);
  const { data: document } = useFirestoreDocData(ref, {
    idField: "key",
  });

  const addTableRow = async (newData: any): Promise<void> => {
    const currentCausalityData = document.causalityData;
    const dataUpdate = currentCausalityData as CausalityData[];
    const causalityData = newData as unknown as CausalityData;
    causalityData.id = currentCausalityData.length + 1;

    dataUpdate.push(causalityData as CausalityData);
    await updateDoc(doc(firestore, "procedures", currentProcedure), {
      causalityData: dataUpdate,
    });
  };

  const updateTableRow = async (newData: any, oldData: any): Promise<void> => {
    if (oldData) {
      const dataUpdate = document.causalityData;
      const index = oldData.tableData.id;
      dataUpdate[index] = newData;

      await updateDoc(doc(firestore, "procedures", currentProcedure), {
        causalityData: dataUpdate,
      });
    }
  };

  const deleteTableRow = async (oldData: any): Promise<void> => {
    if (oldData) {
      const dataDelete = document.causalityData!;
      const index = oldData.tableData.id;
      dataDelete.splice(index, 1);
      await updateDoc(doc(firestore, "procedures", currentProcedure), {
        causalityData: dataDelete,
      });
    }
  };

  return (
    <Drawer
      anchor="right"
      open={showCausalities}
      onClose={() => dispatch(toggleCausalities())}
    >
      <MaterialTable
        options={{
          paging: false,
          search: false,
        }}
        title="Causality editor"
        columns={[
          {
            title: "Causality",
            field: "causality",
          },
          {
            title: "Value",
            field: "value",
          },
        ]}
        data={
          document &&
          document.causalityData.map((obj: CausalityData[]) => ({
            ...obj,
          }))
        }
        editable={{
          onRowAdd: (newData: any) => addTableRow(newData),
          onRowUpdate: (newData: any, oldData: any) =>
            new Promise((resolve: any, reject) => {
              setTimeout(() => {
                updateTableRow(newData, oldData);
                resolve();
              }, 0);
            }),
          onRowDelete: (oldData: any) => deleteTableRow(oldData),
        }}
      />
      {console.log("doc", document)}
    </Drawer>
  );
};

export default CausalityEditor;
