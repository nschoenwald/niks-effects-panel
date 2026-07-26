import { getEffectsPanel } from "../utils/gets.js";

export const CrudActors = {
    listen: () => {
        Hooks.on("deleteActor", (actor) => {
            const panel = getEffectsPanel();
            if (!panel?.actor || panel.actor.id === actor.id) {
                panel?.resetCurrentShownEffectInfoId();
            }
            panel?.refresh();
        });
        Hooks.on("updateActor", (actor) => {
            const panel = getEffectsPanel();
            if (!panel?.actor || panel.actor.id === actor.id) {
                panel?.refresh();
            }
        });
    },
};
