import { getEffectsPanel } from "../utils/gets.js";

export const CrudTokens = {
    listen: () => {
        Hooks.on("deleteToken", () => {
            const panel = getEffectsPanel();
            panel?.resetCurrentShownEffectInfoId();
            panel?.refresh();
        });
        Hooks.on("updateToken", (tokenDoc) => {
            const panel = getEffectsPanel();
            if (!panel?.actor || tokenDoc.actor === panel.actor) {
                panel?.refresh();
            }
        });
    },
};
