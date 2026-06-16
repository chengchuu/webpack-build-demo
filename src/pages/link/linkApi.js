import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const linkBaseUrl = "//i.mazey.net";

const buildGenerateShortLinkPayload = ({ oriLink, baseUrl, oneTime }) => ({
  ori_link: oriLink,
  ...(oneTime ? { one_time: true } : {}),
  ...(baseUrl ? { base_url: baseUrl } : {}),
});

const linkApi = createApi({
  reducerPath: "linkApi",
  baseQuery: fetchBaseQuery({
    baseUrl: linkBaseUrl,
  }),
  endpoints: builder => ({
    generateShortLink: builder.mutation({
      query: ({ oriLink, baseUrl, oneTime }) => ({
        url: "/api/gee/generate-short-link",
        method: "POST",
        body: buildGenerateShortLinkPayload({ oriLink, baseUrl, oneTime }),
      }),
      transformResponse: response => response.tiny_link,
    }),
  }),
});

export const { useGenerateShortLinkMutation } = linkApi;

export default linkApi;
