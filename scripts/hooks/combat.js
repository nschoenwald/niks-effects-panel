import { getEffectsPanel } from "../utils/gets.js";

export const CombatHooks = {
    listen: () => {
        // Only duration labels depend on combat, and only temporary effects have them
        const handleCombatChange = () => {
            const panel = getEffectsPanel();
            if (panel?.showsTemporaryEffects) panel.refresh();
        };

        Hooks.on("updateCombat", handleCombatChange);
        Hooks.on("deleteCombat", handleCombatChange);
    },
};
