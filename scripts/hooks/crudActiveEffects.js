import { getEffectsPanel } from "../utils/gets.js";

export const CrudActiveEffects = {
    listen: () => {
        const handleEffectChange = (effect) => {
            const panel = getEffectsPanel();
            if (!panel) return;
            const owner = effect.parent instanceof Actor ? effect.parent : effect.parent?.actor;
            if (!panel.actor || owner === panel.actor) {
                panel.refresh();
            }
        };

        Hooks.on("createActiveEffect", handleEffectChange);
        Hooks.on("updateActiveEffect", handleEffectChange);
        Hooks.on("deleteActiveEffect", handleEffectChange);
    },
};
