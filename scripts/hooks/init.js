import { Settings } from "../settings.js";

export const Init = {
    listen: () => {
        Hooks.once("init", () => {
            new Settings().register();
        });
    },
};
