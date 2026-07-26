import { getEffectsPanel } from "../utils/gets.js";

export const ControlToken = {
    listen: () => {
        Hooks.on("controlToken", () => {
            const panel = getEffectsPanel();
            panel?.resetCurrentShownEffectInfoId();
            panel?.refresh();
        });
    },
};
