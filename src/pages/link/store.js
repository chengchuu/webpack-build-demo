import { configureStore } from "@reduxjs/toolkit";

import linkApi from "./linkApi";
import linkReducer from "./linkSlice";

const createLinkStore = () => configureStore({
  reducer: {
    [linkApi.reducerPath]: linkApi.reducer,
    link: linkReducer,
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware().concat(linkApi.middleware),
});

export default createLinkStore;
