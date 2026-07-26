import { getEffectsPanel } from "../utils/gets.js";

export const RtcSettingsChanged = {
    listen: () => {
        Hooks.on("rtcSettingsChanged", () => {
            getEffectsPanel()?.animateFromLeftPx();
        });
    },
};
