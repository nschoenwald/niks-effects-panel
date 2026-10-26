import { getEffectsPanel } from "../utils/gets.js";

export const UpdateWorldTime = {
    listen: () => {
        Hooks.on("updateWorldTime", () => {
            const panel = getEffectsPanel();
            if (panel?.showsTemporaryEffects) panel.refresh();
        });
    },
};
