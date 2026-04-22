/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CAL_URL?: string;
  readonly VITE_BETA_REQUIRED?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
