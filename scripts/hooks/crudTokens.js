import { getEffectsPanel } from "../utils/gets.js";

/** Token fields that never change what the panel shows (movement, vision, lighting, canvas display). */
const IRRELEVANT_TOKEN_CHANGES = new Set([
    "_id", "x", "y", "elevation", "rotation", "sort", "width", "height", "depth", "shape", "level",
    "locked", "lockRotation", "alpha", "hidden", "light", "sight", "detectionModes", "occludable",
    "displayBars", "displayName", "turnMarker", "movementAction", "_movementHistory", "_regions",
]);

export const CrudTokens = {
    listen: () => {
        Hooks.on("deleteToken", () => {
            const panel = getEffectsPanel();
            panel?.hideInfo();
            panel?.refresh();
        });
        Hooks.on("updateToken", (tokenDoc, changed) => {
            const panel = getEffectsPanel();
            if (!panel) return;
            if (Object.keys(changed ?? {}).every((key) => IRRELEVANT_TOKEN_CHANGES.has(key))) return;
            // Without an actor only the selected token can bring one (e.g. it was linked to an actor just now)
            const relevant = panel.actor ? tokenDoc.actor === panel.actor : tokenDoc.object?.controlled;
            if (relevant) panel.refresh();
        });
    },
};
