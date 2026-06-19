# `src/pages/link` Agent Guide

## Purpose

This directory defines the standalone "link" page for generating short links, backup links, message links, and QR codes. It is built through the shared page webpack config with `ENTRY=link`.

## Entry Points

- `index.js` is the JavaScript entry point. Webpack resolves it from `./src/pages/${ENTRY}/index.js` when `ENTRY=link`.
- `index.html` is the HTML template consumed by `HtmlWebpackPlugin`. It provides `<div id="tiny-box"></div>` as the React mount point and sets `window.TINY_FOREIGN_BASE_URL`.
- Root scripts:
  - `npm run serve:link` starts webpack-dev-server with `ENTRY=link`.
  - `npm run build:link` builds the production page with `ENTRY=link`.

## Key Files

- `index.js`
  - Defines the `Tiny` React component.
  - Defines `TinyInit(selector, options)` for mounting `Tiny` into any matching DOM node.
  - Immediately calls `TinyInit("#tiny-box", { isGrayBackground: true })`.
  - Exposes `window.TINY_INIT = TinyInit` for external consumers.
- `store.js`
  - Creates a page-local Redux Toolkit store.
  - Registers both the local `link` slice reducer and the local RTK Query `linkApi` reducer.
  - Adds `linkApi.middleware`.
  - `TinyInit` creates a fresh store per mounted root and passes it through `react-redux`'s `Provider`.
- `linkSlice.js`
  - Defines the `link` Redux slice for page data.
  - Owns original link input, generated short link, query message, copy state, QR visibility, Layer loaded state, and backup short links.
- `linkApi.js`
  - Defines a page-local RTK Query API slice using `createApi` + `fetchBaseQuery`.
  - Exports `linkBaseUrl` and `useGenerateShortLinkMutation`.
  - Builds the `/api/gee/generate-short-link` request body with `ori_link`, optional `one_time`, and optional `base_url`.
- `utils.js`
  - Provides `getQueryParamUltimate`, `isHtmlTag`, `isValidAnyUrl`, `isValidENCode`, and `getStringLength`.
  - `getStringLength` uses `Array.from(str || "").length` for Unicode-safer input length checks.
- `index.html`
  - Supplies the mount target and page-local global config.
  - `window.TINY_FOREIGN_BASE_URL` enables optional backup short-link generation.
- `tiny.scss`
  - Contains the page UI styles scoped under `.tiny-box`.
  - Currently not imported by `index.js`; both Sass imports are commented out.
- `normalize.scss`
  - Contains normalize/reset rules scoped under `.tiny-box`.
  - Currently not imported by `index.js`.
- `images.js`
  - Exports `QRCodeFavBase64`, a base64 SVG asset.
  - Currently unused by `index.js`, which instead uses remote `QRCodeFav`.

## Component/Data Flow

1. `index.html` loads the generated bundle and exposes runtime config on `window`.
2. `index.js` calls `TinyInit("#tiny-box", { isGrayBackground: true })`.
3. `TinyInit` finds the DOM node, creates a React root with `createRoot`, creates a page-local Redux store, renders `<Provider store={store}><Tiny /></Provider>`, and optionally injects gray background styles through `mazey`'s `addStyle`.
4. `Tiny` reads page data from `linkSlice` through `useSelector(selectLinkState)`:
   - `oriLink`: user input / normalized original URL.
   - `tinyLink`: primary generated short link or query message.
   - `queryMsg`: decoded `msg` query parameter state.
   - `copied`: copy status for the primary result.
   - `showQRCode`: controls QR code rendering.
   - `loadedLayer`: tracks whether the external `layer` UI library has loaded.
   - `backupTinyLinks`: optional backup short links.
5. `Tiny` uses RTK Query's `useGenerateShortLinkMutation()` for short-link requests, but still copies successful results into `linkSlice` state via `setTinyLink` / `setBackupTinyLinks`.
6. On mount, `Tiny` writes `mazey_loaded_tiny` to `localStorage`, loads jQuery if needed, then loads `layer.js`. If `?msg=` exists, it dispatches both `setTinyLink(tempQueryMsg)` and `setQueryMsg(tempQueryMsg)`.
7. User input flows through `inputChange` into `oriLink`; pressing Enter or clicking `生成` calls `fetchShortLink`.
8. `fetchShortLink` validates and normalizes input:
   - empty input shows `不能为空`;
   - valid URLs pass through as-is;
   - short alphabetic codes up to 4 chars trigger `hashCodeToLink` and open `/t/{code}`;
   - domain-like input gets an `http://` prefix if valid;
   - plain text or HTML tags may be converted into a `?msg=` sharing URL after confirmation.
9. After normalization, `fetchShortLink` trims spaces again if present and rejects input when `getStringLength(realOriLink) > 500`, showing `链接过长，请输入小于 500 字符的链接`.
10. `getTinyLink` triggers the RTK Query mutation to post to `//i.mazey.net/api/gee/generate-short-link` with `ori_link`, optional `one_time` (from `onetime` or `oneTime` query params), and optional `base_url`.
11. Successful primary responses update `tinyLink`, reset copy state, show a success message, and generate a QR code with `qr-code-styling`.
12. Before rendering a new QR code, `convertUrlStringToQRCode` calls `ref.current.replaceChildren()` so repeated generations do not stack duplicate QR DOM nodes.
13. If `window.TINY_FOREIGN_BASE_URL` is present, `fetchShortLink` requests a backup short link and replaces `backupTinyLinks` with a single backup entry labeled `备用链接`.
14. Copy buttons use `react-copy-to-clipboard`; callbacks update `copied` or the matching backup link's `copied` field.

## External Dependencies and Globals

- React and React DOM power the UI; `createRoot` means this page already uses the React 18+ root API.
- RTK Query (`@reduxjs/toolkit/query/react`) handles the short-link API requests.
- `react-copy-to-clipboard` handles copy actions.
- `qr-code-styling` renders the QR code into the `.qr-code` ref.
- `mazey` provides utility helpers for query params, URL validation, debug logging, script loading, style injection, and browser detection.
- Runtime globals:
  - `window.TINY_FOREIGN_BASE_URL` from `index.html`.
  - `window.layer` from the remotely loaded Layer library.
  - `window.$` / `window.jQuery`, loaded remotely if missing.
  - `window.TINY_INIT`, exported by this page.

## Upgrade Notes

- As of 2026-06-13, npm's `latest` dist-tags report:
  - `react`: `19.2.7`
  - `@reduxjs/toolkit`: `2.12.0`
- Upgrade `react` and `react-dom` together to matching versions.
- Redux Toolkit, RTK Query, and React Redux are used locally by this page. Keep `store.js`, `linkSlice.js`, and `linkApi.js` scoped to this directory unless the state needs to be shared across entries.
- If React 19 is adopted, test this page around `createRoot`, clipboard behavior, remote script loading, and QR-code rendering.
