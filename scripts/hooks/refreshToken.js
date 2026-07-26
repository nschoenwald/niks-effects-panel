import { getEffectsPanel } from "../utils/gets.js";

export const RefreshToken = {
    listen: () => {
        Hooks.on("refreshToken", () => {
            getEffectsPanel()?.refresh();
        });
    },
};
