import { getEffectsPanel } from "../utils/gets.js";

export const UpdateWorldTime = {
    listen: () => {
        Hooks.on("updateWorldTime", () => {
            getEffectsPanel()?.refresh();
        });
    },
};
