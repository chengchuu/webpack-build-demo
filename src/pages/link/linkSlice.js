import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  oriLink: "",
  tinyLink: "",
  queryMsg: "",
  copied: false,
  showQRCode: false,
  loadedLayer: false,
  backupTinyLinks: [],
};

const linkSlice = createSlice({
  name: "link",
  initialState,
  reducers: {
    setOriLink: (state, action) => ({
      ...state,
      oriLink: action.payload,
    }),
    setTinyLink: (state, action) => ({
      ...state,
      tinyLink: action.payload,
    }),
    setQueryMsg: (state, action) => ({
      ...state,
      queryMsg: action.payload,
    }),
    setCopied: (state, action) => ({
      ...state,
      copied: action.payload,
    }),
    setShowQRCode: (state, action) => ({
      ...state,
      showQRCode: action.payload,
    }),
    setLoadedLayer: (state, action) => ({
      ...state,
      loadedLayer: action.payload,
    }),
    setBackupTinyLinks: (state, action) => ({
      ...state,
      backupTinyLinks: action.payload,
    }),
    markBackupTinyCopied: (state, action) => ({
      ...state,
      backupTinyLinks: state.backupTinyLinks.map((tiny, index) => (
        index === action.payload ? { ...tiny, copied: true } : tiny
      )),
    }),
  },
});

export const linkActions = linkSlice.actions;

export const selectLinkState = state => state.link;

export default linkSlice.reducer;
