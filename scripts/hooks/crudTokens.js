import { getEffectsPanel } from "../utils/gets.js";

export const CrudTokens = {
    listen: () => {
        Hooks.on("deleteToken", () => {
            const panel = getEffectsPanel();
            panel?.resetCurrentShownEffectInfoId();
            panel?.refresh();
        });
        Hooks.on("updateToken", () => {
            getEffectsPanel()?.refresh();
        });
    },
};
