import { EffectsPanelAppV2 } from "../app/effects-panel-app-v2.js";
import { MODULE_ID } from "../constants.js";
import { getEffectsPanel } from "../utils/gets.js";

export const CanvasReady = {
    listen: () => {
        Hooks.on("canvasReady", () => {
            let effectsPanel = getEffectsPanel();
            if (effectsPanel) {
                effectsPanel.hideInfo();
                effectsPanel.render(true);
            } else {
                effectsPanel = new EffectsPanelAppV2();
                game.modules.get(MODULE_ID).effectsPanel = effectsPanel;
                effectsPanel.render(true);
            }
        });
    },
};
