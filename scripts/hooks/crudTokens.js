import { getEffectsPanel } from "../utils/gets.js";

export const CrudTokens = {
    listen: () => {
        Hooks.on("deleteToken", () => {
            const panel = getEffectsPanel();
            panel?.hideInfo();
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
