import { getEffectsPanel } from "../utils/gets.js";

export const UserHooks = {
    listen: () => {
        Hooks.on("updateUser", (user, changes) => {
            if (user.id === game.user?.id && "character" in changes) {
                const panel = getEffectsPanel();
                panel?.resetCurrentShownEffectInfoId();
                panel?.refresh();
            }
        });
    },
};
