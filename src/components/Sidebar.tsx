import { useState } from "react";
import {
  Divider,
  Drawer,
  ListItem,
  List,
  ListItemIcon,
  IconButton,
  ListItemText,
  Collapse,
  Toolbar,
  AppBar,
} from "@material-ui/core";
import {
  Add,
  Description,
  ChevronLeft,
  Assignment,
  ExpandLess,
  ExpandMore,
  Menu,
  AccountTree,
} from "@material-ui/icons";
import clsx from "clsx";

import { useSelector, useDispatch } from "react-redux";
import {
  toggleSidebar,
  toggleDialog,
  toggleProcedures,
  renderTable,
} from "../actions";
import useStyles from "../Styles";
import { dialogOptions, tableTypes } from "../utils/const";
import { RootState } from "../types";
import { collection } from "firebase/firestore";
import { useFirestore, useFirestoreCollectionData } from "reactfire";

const Sidebar = () => {
  const firestore = useFirestore();
  const proceduresCollection = collection(firestore, "procedures");
  const taxonomiesCollection = collection(firestore, "taxonomies");

  const { data: firestoreProcedures } = useFirestoreCollectionData(
    proceduresCollection,
    {
      idField: "key",
    }
  );

  const { data: firestoreTaxonomies } = useFirestoreCollectionData(
    taxonomiesCollection,
    {
      idField: "key",
    }
  );

  const showSidebar = useSelector((state: RootState) => state.showSidebar);
  const showProcedures = useSelector(
    (state: RootState) => state.showProcedures
  );

  const dispatch = useDispatch();
  const [displayTaxonomies, setDisplayTaxonomies] = useState(false);

  const classes = useStyles();

  return (
    <>
      <AppBar
        position="fixed"
        className={clsx(classes.appBar, {
          [classes.appBarShift]: showSidebar,
        })}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={() => dispatch(toggleSidebar())}
            edge="start"
            className={clsx(classes.menuButton, showSidebar && classes.hide)}
          >
            <Menu />
          </IconButton>
          <h4>DelSeq</h4>
        </Toolbar>
      </AppBar>
      <Drawer
        className={classes.drawer}
        variant="persistent"
        anchor="left"
        open={showSidebar}
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <div className={classes.drawerHeader}>
          <IconButton onClick={() => dispatch(toggleSidebar())}>
            <ChevronLeft />
          </IconButton>
        </div>
        <ListItem button>
          <ListItemIcon>
            <Add />
          </ListItemIcon>
          <ListItemText
            data-testid="new-procedure"
            primary={"New procedure"}
            onClick={() => dispatch(toggleDialog(dialogOptions.PROCEDURE))}
          />
        </ListItem>
        <ListItem button>
          <ListItemIcon>
            <Add />
          </ListItemIcon>
          <ListItemText
            data-testid="new-taxonomy"
            primary={"New taxonomy"}
            onClick={() => dispatch(toggleDialog(dialogOptions.TAXONOMY))}
          />
        </ListItem>
        <Divider />
        <ListItem button onClick={() => dispatch(toggleProcedures())}>
          <ListItemIcon>
            <Assignment />
          </ListItemIcon>
          <ListItemText data-testid="procedure-dropdown" primary="Procedures" />
          {showProcedures ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={showProcedures} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {firestoreProcedures &&
              firestoreProcedures.map((el) => (
                <ListItem
                  data-testid="procedure"
                  button
                  className={classes.nested}
                  key={el.key}
                >
                  <ListItemIcon>
                    <Description />
                  </ListItemIcon>
                  <ListItemText
                    primary={el.key}
                    onClick={() =>
                      dispatch(
                        // @ts-ignore: Object is possibly 'undefined'. //https://github.com/microsoft/TypeScript/issues/29642
                        renderTable(tableTypes.PROCEDURES, el.key)
                      )
                    }
                  />
                </ListItem>
              ))}
          </List>
        </Collapse>
        <ListItem
          button
          onClick={() => setDisplayTaxonomies(!displayTaxonomies)}
        >
          <ListItemIcon>
            <AccountTree />
          </ListItemIcon>
          <ListItemText data-testid="taxonomy-dropdown" primary="Taxonomies" />
          {displayTaxonomies ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={displayTaxonomies} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {firestoreTaxonomies &&
              firestoreTaxonomies.map((el) => (
                <ListItem
                  data-testid="taxonomy"
                  button
                  className={classes.nested}
                  key={el.key}
                >
                  <ListItemIcon>
                    <Description />
                  </ListItemIcon>
                  <ListItemText
                    primary={el.key}
                    onClick={() =>
                      dispatch(
                        // @ts-ignore: Object is possibly 'undefined'. //https://github.com/microsoft/TypeScript/issues/29642
                        renderTable(tableTypes.TAXONOMIES, el.key)
                      )
                    }
                  />
                </ListItem>
              ))}
          </List>
        </Collapse>
      </Drawer>
    </>
  );
};

export default Sidebar;
