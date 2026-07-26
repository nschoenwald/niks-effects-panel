import { getEffectsPanel } from "../utils/gets.js";

export const CombatHooks = {
    listen: () => {
        Hooks.on("updateCombat", () => {
            getEffectsPanel()?.refresh();
        });
        Hooks.on("deleteCombat", () => {
            getEffectsPanel()?.refresh();
        });
    },
};
