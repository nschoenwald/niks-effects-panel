import { CanvasReady } from "./canvasReady.js";
import { Init } from "./init.js";
import { ControlToken } from "./controlToken.js";
import { CrudActiveEffects } from "./crudActiveEffects.js";
import { CrudTokens } from "./crudTokens.js";
import { CrudActors } from "./crudActors.js";
import { CrudItems } from "./crudItems.js";
import { CombatHooks } from "./combat.js";
import { UserHooks } from "./user.js";
import { UpdateWorldTime } from "./updateWorldTime.js";

export const HooksEffectsPanel = {
    listen() {
        const listeners = [
            Init,
            CanvasReady,
            ControlToken,
            CrudTokens,
            CrudActors,
            CrudItems,
            CombatHooks,
            UserHooks,
            CrudActiveEffects,
            UpdateWorldTime,
        ];

        for (const listener of listeners) {
            listener.listen();
        }
    },
};
