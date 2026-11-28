import { getEffectsPanel } from "../utils/gets.js";

export const CrudActors = {
    listen: () => {
        const handleActorChange = (actor) => {
            const panel = getEffectsPanel();
            if (panel?.isShownActor(actor)) panel.refresh();
        };

        // A deleted actor no longer resolves through its token, so it can't be matched. The refresh only renders if
        // the panel changes, and the details of a deleted actor close on their own once another actor (or none) shows.
        Hooks.on("deleteActor", () => getEffectsPanel()?.refresh());
        Hooks.on("updateActor", handleActorChange);
    },
};
