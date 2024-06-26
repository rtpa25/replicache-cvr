/** @type {import("eslint").Linter.Config} */
const config = {
  extends: ["./base.js"],
  plugins: ["simple-import-sort"],
  rules: {
    //#region  //*=========== Sort Import ===========
    "simple-import-sort/exports": "warn",
    "simple-import-sort/imports": [
      "warn",
      {
        groups: [
          // ext library & side effect imports
          ["^@?\\w", "^\\u0000"],
          ["^.+\\.s?css$"],
          ["^@repo/models"],
          // repo models
          ["^@repo/"],
          // repo packages
          ["^~/lib"],
          // Lib
          ["^~/utils"],
          // utils
          ["^~/components"],
          // Components
          ["^~/hooks"],
          // hooks
          ["^~/ui"],
          // UIs
          ["^~/"],
          // Other imports
          [
            "^\\./?$",
            "^\\.(?!/?$)",
            "^\\.\\./?$",
            "^\\.\\.(?!/?$)",
            "^\\.\\./\\.\\./?$",
            "^\\.\\./\\.\\.(?!/?$)",
            "^\\.\\./\\.\\./\\.\\./?$",
            "^\\.\\./\\.\\./\\.\\.(?!/?$)",
          ],
          // relative paths up until 3 level
          ["^"],
          // other that didnt fit in
        ],
      },
    ],
    //#endregion  //*======== Sort Import ===========
  },
};
module.exports = config;
