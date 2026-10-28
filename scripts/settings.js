import { MODULE_ID, CLICK_BEHAVIOR, PASSIVE_EFFECT_MODE, ROLE_NONE } from "./constants.js";
import { getEffectsPanel } from "./utils/gets.js";

export class Settings {
    // Settings keys
    #DOUBLE_CLICK_BEHAVIOR = "doubleClickBehavior";
    #RIGHT_CLICK_BEHAVIOR = "rightClickBehavior";
    #SHIFT_RIGHT_CLICK_BEHAVIOR = "shiftRightClickBehavior";

    #ICON_SIZE = "iconSize";
    #SHOW_DISABLED_EFFECTS = "showDisabledEffects";
    #SHOW_PASSIVE_EFFECTS = "showPassiveEffects";
    #SHOW_DURATION_OVERLAYS = "showDurationOverlays";
    #SEPARATE_TEMPORARY_AND_PASSIVE = "separateTemporaryAndPassive";

    #ALLOW_RIGHT_CLICK = "allowRightClick";
    #VIEW_PERMISSION = "viewPermission";
    #VIEW_DETAILS_PERMISSION = "viewDetailsPermission";

    register() {
        const userRoles = {
            [CONST.USER_ROLES.PLAYER]: game.i18n.localize("EffectsPanel.SettingPlayer"),
            [CONST.USER_ROLES.TRUSTED]: game.i18n.localize("EffectsPanel.SettingTrustedPlayer"),
            [CONST.USER_ROLES.ASSISTANT]: game.i18n.localize("EffectsPanel.SettingAssistantGM"),
            [CONST.USER_ROLES.GAMEMASTER]: game.i18n.localize("EffectsPanel.SettingGameMaster"),
            [ROLE_NONE]: game.i18n.localize("EffectsPanel.SettingNone"),
        };

        const clickBehaviors = {
            [CLICK_BEHAVIOR.DIALOG]: game.i18n.localize("EffectsPanel.SettingDialog"),
            [CLICK_BEHAVIOR.DELETE]: game.i18n.localize("EffectsPanel.SettingDelete"),
            [CLICK_BEHAVIOR.DISABLE]: game.i18n.localize("EffectsPanel.SettingDisable"),
        };

        game.settings.register(MODULE_ID, this.#SHOW_DISABLED_EFFECTS, {
            name: "EffectsPanel.SettingShowDisabledEffects",
            hint: "EffectsPanel.SettingShowDisabledEffectsHint",
            scope: "client",
            config: true,
            default: true,
            type: Boolean,
            onChange: () => getEffectsPanel()?.refresh(),
        });

        const passiveEffectModes = {
            [PASSIVE_EFFECT_MODE.NEVER]: game.i18n.localize("EffectsPanel.SettingPassiveModeNever"),
            [PASSIVE_EFFECT_MODE.ALWAYS_ICON]: game.i18n.localize("EffectsPanel.SettingPassiveModeAlwaysIcon"),
            [PASSIVE_EFFECT_MODE.ALWAYS]: game.i18n.localize("EffectsPanel.SettingPassiveModeAlways"),
        };

        game.settings.register(MODULE_ID, this.#SHOW_PASSIVE_EFFECTS, {
            name: "EffectsPanel.SettingShowPassiveEffects",
            hint: "EffectsPanel.SettingShowPassiveEffectsHint",
            scope: "client",
            config: true,
            default: PASSIVE_EFFECT_MODE.ALWAYS_ICON,
            choices: passiveEffectModes,
            type: String,
            onChange: () => getEffectsPanel()?.refresh(),
        });

        game.settings.register(MODULE_ID, this.#SHOW_DURATION_OVERLAYS, {
            name: "EffectsPanel.SettingShowDurationOverlays",
            hint: "EffectsPanel.SettingShowDurationOverlaysHint",
            scope: "client",
            config: true,
            default: true,
            type: Boolean,
            onChange: () => getEffectsPanel()?.refresh(),
        });

        game.settings.register(MODULE_ID, this.#SEPARATE_TEMPORARY_AND_PASSIVE, {
            name: "EffectsPanel.SettingSeparateTemporaryAndPassive",
            hint: "EffectsPanel.SettingSeparateTemporaryAndPassiveHint",
            scope: "client",
            config: true,
            default: true,
            type: Boolean,
            onChange: () => getEffectsPanel()?.refresh(),
        });

        game.settings.register(MODULE_ID, this.#ICON_SIZE, {
            name: "EffectsPanel.SettingIconSize",
            hint: "EffectsPanel.SettingIconSizeHint",
            scope: "client",
            config: true,
            type: new foundry.data.fields.NumberField({
                min: 16,
                max: 100,
                step: 1,
                initial: 42,
            }),
            onChange: () => getEffectsPanel()?.refresh(),
        });

        game.settings.register(MODULE_ID, this.#DOUBLE_CLICK_BEHAVIOR, {
            name: "EffectsPanel.SettingDoubleClickBehavior",
            hint: "EffectsPanel.SettingDoubleClickBehaviorHint",
            scope: "client",
            config: true,
            default: CLICK_BEHAVIOR.DISABLE,
            choices: clickBehaviors,
            type: String,
            onChange: () => getEffectsPanel()?.refresh(),
        });

        game.settings.register(MODULE_ID, this.#RIGHT_CLICK_BEHAVIOR, {
            name: "EffectsPanel.SettingRightClickBehavior",
            hint: "EffectsPanel.SettingRightClickBehaviorHint",
            scope: "client",
            config: true,
            default: CLICK_BEHAVIOR.DIALOG,
            choices: clickBehaviors,
            type: String,
            onChange: () => getEffectsPanel()?.refresh(),
        });

        game.settings.register(MODULE_ID, this.#SHIFT_RIGHT_CLICK_BEHAVIOR, {
            name: "EffectsPanel.SettingShiftRightClickBehavior",
            hint: "EffectsPanel.SettingShiftRightClickBehaviorHint",
            scope: "client",
            config: true,
            default: CLICK_BEHAVIOR.DELETE,
            choices: clickBehaviors,
            type: String,
            onChange: () => getEffectsPanel()?.refresh(),
        });

        game.settings.register(MODULE_ID, this.#ALLOW_RIGHT_CLICK, {
            name: "EffectsPanel.SettingAllowRightClick",
            hint: "EffectsPanel.SettingAllowRightClickHint",
            scope: "world",
            config: true,
            default: CONST.USER_ROLES.PLAYER,
            choices: userRoles,
            type: Number,
            onChange: () => getEffectsPanel()?.refresh(),
        });

        game.settings.register(MODULE_ID, this.#VIEW_PERMISSION, {
            name: "EffectsPanel.SettingViewPermission",
            hint: "EffectsPanel.SettingViewPermissionHint",
            scope: "world",
            config: true,
            default: CONST.USER_ROLES.PLAYER,
            choices: userRoles,
            type: Number,
            onChange: () => getEffectsPanel()?.refresh(),
        });

        game.settings.register(MODULE_ID, this.#VIEW_DETAILS_PERMISSION, {
            name: "EffectsPanel.SettingViewDetailsPermission",
            hint: "EffectsPanel.SettingViewDetailsPermissionHint",
            scope: "world",
            config: true,
            default: CONST.USER_ROLES.PLAYER,
            choices: userRoles,
            type: Number,
            onChange: () => getEffectsPanel()?.refresh(),
        });
    }

    /**
     * Returns the game setting for the icon size
     * @returns {number}
     */
    get iconSize() {
        return game.settings.get(MODULE_ID, this.#ICON_SIZE);
    }

    /**
     * Returns the game setting for the double-click behavior
     * @returns {string}
     */
    get doubleClickBehavior() {
        return game.settings.get(MODULE_ID, this.#DOUBLE_CLICK_BEHAVIOR);
    }

    /**
     * Returns the game setting for the right-click behavior
     * @returns {string}
     */
    get rightClickBehavior() {
        return game.settings.get(MODULE_ID, this.#RIGHT_CLICK_BEHAVIOR);
    }

    /**
     * Returns the game setting for the shift right-click behavior
     * @returns {string}
     */
    get shiftRightClickBehavior() {
        return game.settings.get(MODULE_ID, this.#SHIFT_RIGHT_CLICK_BEHAVIOR);
    }

    /**
     * Returns the game setting for showing disabled effects
     * @returns {boolean}
     */
    get showDisabledEffects() {
        return game.settings.get(MODULE_ID, this.#SHOW_DISABLED_EFFECTS);
    }

    /**
     * Returns the game setting for showing passive effects.
     * One of PASSIVE_EFFECT_MODE values: "never", "alwaysIcon", "always".
     * @returns {string}
     */
    get passiveEffectMode() {
        return game.settings.get(MODULE_ID, this.#SHOW_PASSIVE_EFFECTS);
    }

    /**
     * Returns the game setting for showing duration overlays
     * @returns {boolean}
     */
    get showDurationOverlays() {
        return game.settings.get(MODULE_ID, this.#SHOW_DURATION_OVERLAYS);
    }

    /**
     * Returns the game setting for separating temporary and passive effects
     * @returns {boolean}
     */
    get separateTemporaryAndPassive() {
        return game.settings.get(MODULE_ID, this.#SEPARATE_TEMPORARY_AND_PASSIVE);
    }

    /**
     * Returns the game setting for allowing right-click
     * @returns {number}
     */
    get allowRightClick() {
        return game.settings.get(MODULE_ID, this.#ALLOW_RIGHT_CLICK);
    }

    /**
     * Returns the game setting for view permission
     * @returns {number}
     */
    get viewPermission() {
        return game.settings.get(MODULE_ID, this.#VIEW_PERMISSION);
    }

    /**
     * Returns the game setting for view details permission
     * @returns {number}
     */
    get viewDetailsPermission() {
        return game.settings.get(MODULE_ID, this.#VIEW_DETAILS_PERMISSION);
    }
}
