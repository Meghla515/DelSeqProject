import { createStore } from "redux";
import allReducers from "./reducers";

const store = createStore(
    allReducers,
    // @ts-ignore: Object is possibly 'undefined'. //https://github.com/microsoft/TypeScript/issues/29642
    ((window["__REDUX_DEVTOOLS_EXTENSION_COMPOSE__"] as any)) && window.__REDUX_DEVTOOLS_EXTENSION__()
  );

export default store;