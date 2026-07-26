import { getEffectsPanel } from "../utils/gets.js";

export const CrudActiveEffects = {
    listen: () => {
        Hooks.on("createActiveEffect", () => {
            getEffectsPanel()?.refresh();
        });
        Hooks.on("updateActiveEffect", () => {
            getEffectsPanel()?.refresh();
        });
        Hooks.on("deleteActiveEffect", () => {
            getEffectsPanel()?.refresh();
        });
    },
};
