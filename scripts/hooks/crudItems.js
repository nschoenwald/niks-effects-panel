import { getEffectsPanel } from "../utils/gets.js";

export const CrudItems = {
    listen: () => {
        const handleItemChange = (item) => {
            const panel = getEffectsPanel();
            if (!panel?.actor) return;
            if (panel.actor === item.actor || panel.actor.id === item.actor?.id) panel.refresh();
        };

        Hooks.on("createItem", handleItemChange);
        Hooks.on("updateItem", handleItemChange);
        Hooks.on("deleteItem", handleItemChange);
    },
};
