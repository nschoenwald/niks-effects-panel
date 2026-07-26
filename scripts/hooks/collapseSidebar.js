import { getEffectsPanel } from "../utils/gets.js";

export const CollapseSidebar = {
    listen: () => {
        Hooks.on("collapseSidebar", (_sidebar, _collapse) => {
            getEffectsPanel()?.animateFromLeftPx();
        });
    },
};
