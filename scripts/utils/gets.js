import { MODULE_ID } from "../constants.js";

/**
 * Returns the active effects panel application instance.
 * @returns {import("../app/effects-panel-app-v2.js").EffectsPanelAppV2|undefined}
 */
export function getEffectsPanel() {
    return game.modules.get(MODULE_ID)?.effectsPanel;
}
