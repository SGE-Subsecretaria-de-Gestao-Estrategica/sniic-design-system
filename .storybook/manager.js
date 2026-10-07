import React from "react";
import { DownloadIcon } from "@storybook/icons";
import { Button } from "storybook/internal/components";
import { addons, types } from "storybook/manager-api";
import { EXPORT_SVG } from "./events.js";

// A toolbar button that downloads the first <svg> of the story on screen.
addons.register(EXPORT_SVG, (api) => {
  addons.add(`${EXPORT_SVG}/tool`, {
    type: types.TOOL,
    title: "Exportar SVG",
    match: ({ viewMode, tabId }) => viewMode === "story" && !tabId,
    render: () =>
      React.createElement(
        Button,
        {
          key: EXPORT_SVG,
          variant: "ghost",
          padding: "small",
          ariaLabel: "Exportar o SVG desta story",
          onClick: () =>
            api.emit(EXPORT_SVG, { name: api.getCurrentStoryData()?.id }),
        },
        React.createElement(DownloadIcon),
        "SVG",
      ),
  });
});
