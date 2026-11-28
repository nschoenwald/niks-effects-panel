import { EffectsPanelAppV2 } from "../app/effects-panel-app-v2.js";
import { MODULE_ID } from "../constants.js";
import { getEffectsPanel } from "../utils/gets.js";

/** Creates the effects panel if it doesn't exist yet, and renders it. */
function ensureEffectsPanel() {
    let effectsPanel = getEffectsPanel();
    if (!effectsPanel) {
        effectsPanel = new EffectsPanelAppV2();
        game.modules.get(MODULE_ID).effectsPanel = effectsPanel;
    }
    effectsPanel.render({ force: true });
}

export const CanvasReady = {
    listen: () => {
        // Also created on "ready", so the panel exists when the game canvas is disabled and canvasReady never fires
        Hooks.once("ready", () => {
            if (!getEffectsPanel()) ensureEffectsPanel();
        });
        Hooks.on("canvasReady", () => {
            getEffectsPanel()?.hideInfo();
            ensureEffectsPanel();
        });
    },
};
