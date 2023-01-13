import { defineConfig } from "cypress";
import * as getCompareScreenshotsPlugin from "cypress-image-diff-js/dist/plugin";
import { nxE2EPreset } from "@nrwl/cypress/plugins/cypress-preset";

const nxPreset = nxE2EPreset(__dirname);

export default defineConfig({
  e2e: {
    ...nxPreset,
    setupNodeEvents(on, config) {
      getCompareScreenshotsPlugin(on, config);
    },
    experimentalSessionAndOrigin: true,
    viewportWidth: 1536,
    viewportHeight: 960,
  },
});
