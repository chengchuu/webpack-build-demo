import { configureStore } from "@reduxjs/toolkit";

import linkReducer from "./linkSlice";

const createLinkStore = () => configureStore({
  reducer: {
    link: linkReducer,
  },
});

export default createLinkStore;
