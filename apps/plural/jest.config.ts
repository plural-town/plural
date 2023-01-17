/* eslint-disable */
export default {
  displayName: "plural",
  preset: "../../jest.preset.js",
  transform: {
    // Needed for MDX - most/all other libraries are CJS
    "node_modules\\/.+\\.js$": "jest-esm-transformer-2",
    "^(?!.*\\.(js|jsx|ts|tsx|css|json|md|mdx)$)": "@nrwl/react/plugins/jest",
    "^.+\\.(?:[tj]sx|mdx?)?$": ["babel-jest", { presets: ["@nrwl/next/babel"] }],
  },
  transformIgnorePatterns: [],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
  coverageDirectory: "../../coverage/apps/plural",
};
