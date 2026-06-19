import {
  getQueryParam, isValidUrl, convertCamelToUnder,
} from "mazey";

export const getQueryParamUltimate = param => {
  const underParam = convertCamelToUnder(param);
  return getQueryParam(param) || getQueryParam(underParam);
};

export const isHtmlTag = str => {
  return /<([a-z]+)([^<]+)*(?:>(.*)<\/\1>|\s+\/>)/g.test(str);
};

export const isValidAnyUrl = url => {
  return isValidUrl(url);
};

export const isValidENCode = str => {
  return /^[a-zA-Z]+$/g.test(str);
};

export const getStringLength = str => {
  return Array.from(str || "").length;
};
