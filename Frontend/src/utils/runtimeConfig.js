const RUNTIME_CONFIG_KEY = "__SAMVAD_CONFIG__";

const getWindowRuntimeConfig = () => {
  if (typeof window === "undefined") {
    return {};
  }

  const runtimeConfig = window[RUNTIME_CONFIG_KEY];
  if (!runtimeConfig || typeof runtimeConfig !== "object") {
    return {};
  }

  return runtimeConfig;
};

const TEMPLATE_VAR_PATTERN = /^\$\{.+\}$/;

const getStringValue = (value) => {
  if (value === undefined || value === null) {
    return "";
  }

  const normalized = String(value).trim();

  // Guard against unreplaced envsubst template variables like "${VITE_BACKEND_URL}"
  if (TEMPLATE_VAR_PATTERN.test(normalized)) {
    return "";
  }

  return normalized;
};

export const getPublicEnv = (key) => {
  const runtimeConfig = getWindowRuntimeConfig();
  const runtimeValue = getStringValue(runtimeConfig[key]);
  if (runtimeValue) {
    return runtimeValue;
  }

  const buildValue = getStringValue(import.meta.env?.[key]);
  if (buildValue) {
    return buildValue;
  }

  return "";
};

export const getRuntimeConfigSnapshot = () => {
  const runtimeConfig = getWindowRuntimeConfig();
  return { ...runtimeConfig };
};
