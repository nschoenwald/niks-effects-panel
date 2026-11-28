import { getEffectsPanel } from "../utils/gets.js";

export const CrudItems = {
    listen: () => {
        const handleItemChange = (item) => {
            const panel = getEffectsPanel();
            if (panel?.isShownActor(item.actor)) panel.refresh();
        };

        Hooks.on("createItem", handleItemChange);
        Hooks.on("updateItem", handleItemChange);
        Hooks.on("deleteItem", handleItemChange);
    },
};
