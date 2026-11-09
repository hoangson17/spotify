import { applyMiddleware, createStore } from "redux";
import { persistStore } from "redux-persist";
import { thunk } from "redux-thunk";
import rootReducer from "./stores/reducers/rootReducer";

export const store = createStore(rootReducer, applyMiddleware(thunk));
export const persistor = persistStore(store);
const reduxStore = { store, persistor };

export default reduxStore;
