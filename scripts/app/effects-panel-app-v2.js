import Draggable from "../lib/draggable.js";
import { Settings } from "../settings.js";
import {
    MODULE_ID,
    CLICK_BEHAVIOR,
    PASSIVE_EFFECT_MODE,
    USER_FLAGS,
} from "../constants.js";

const { ApplicationV2, HandlebarsApplicationMixin, DialogV2 } =
    foundry.applications.api;
const { TextEditor } = foundry.applications.ux;

export class EffectsPanelAppV2 extends HandlebarsApplicationMixin(ApplicationV2) {
    #settings;
    #rootView;
    #draggable;
    #resizeHandler;
    #documentClickHandler;

    #currentShownEffectInfoId = null;

    constructor(options = {}) {
        super(options);
        this.refresh = foundry.utils.debounce(this.render.bind(this), 100);

        this.#settings = new Settings();
        this.#rootView = $("<div>");
        this.#resizeHandler = foundry.utils.debounce(this.#onWindowResize.bind(this), 200);
        this.#documentClickHandler = this.#onDocumentClick.bind(this);
    }

    static DEFAULT_OPTIONS = {
        id: "effects-panel",
        window: {
            frame: false,
            minimizable: false,
            resizable: false,
            positioned: true,
        },
    };

    static PARTS = {
        effectsPanel: {
            id: "content",
            template: "modules/niks-effects-panel/templates/effects-panel.hbs",
        },
    };

    get actor() {
        return this.#actor;
    }

    resetCurrentShownEffectInfoId() {
        this.#currentShownEffectInfoId = null;
        if (this.#rootView?.length) {
            this.#rootView.find(".effect-info").hide();
        }
        this.#syncZIndex();
    }

    async _prepareContext(_options) {
        const temporaryEffects = [];
        const passiveEffects = [];
        const disabledTemporaryEffects = [];
        const disabledPassiveEffects = [];

        const effects = this.#actorEffects;

        for (const effect of effects) {
            effect.description = await TextEditor.enrichHTML(
                game.i18n.localize(effect.description || ""),
                { relativeTo: effect },
            );

            if (effect.parent && effect.parent instanceof Item) {
                effect.parentDescription = await TextEditor.enrichHTML(
                    game.i18n.localize(effect.parent.system?.description?.value ?? ""),
                    { relativeTo: effect.parent },
                );
            }

            if (effect.disabled && this.#settings.showDisabledEffects) {
                if (effect.isTemporary) {
                    disabledTemporaryEffects.push(effect);
                } else {
                    const mode = this.#settings.passiveEffectMode;
                    if (
                        mode === PASSIVE_EFFECT_MODE.ALWAYS ||
                        (mode === PASSIVE_EFFECT_MODE.ALWAYS_ICON && effect.showIcon === 2)
                    ) {
                        disabledPassiveEffects.push(effect);
                    }
                }
            }

            if (!effect.disabled) {
                if (effect.isTemporary) {
                    temporaryEffects.push(effect);
                } else {
                    const mode = this.#settings.passiveEffectMode;
                    if (
                        mode === PASSIVE_EFFECT_MODE.ALWAYS ||
                        (mode === PASSIVE_EFFECT_MODE.ALWAYS_ICON && effect.showIcon === 2)
                    ) {
                        passiveEffects.push(effect);
                    }
                }
            }
        }

        const iconSize = this.#settings.iconSize;
        const itemSize = iconSize + 8;
        const badgeSize = Math.max(8, Math.round(iconSize * (15 / 42)));

        return {
            temporaryEffects,
            passiveEffects,
            disabledTemporaryEffects,
            disabledPassiveEffects,
            canViewEffectsPanel: game.user.role >= this.#settings.viewPermission,
            canViewEffectDetails: game.user.role >= this.#settings.viewDetailsPermission,
            showDurationOverlays: this.#settings.showDurationOverlays,
            separateTemporaryAndPassive: this.#settings.separateTemporaryAndPassive,
            iconSize,
            itemSize,
            badgeSize,
        };
    }

    async _onFirstRender(_context, _options) {
        this.#rootView = $(this.element);
    }

    async _onRender(context, options) {
        await super._onRender(context, options);

        this.#initClickListeners();

        const leftPosition = this.#getLeftPosition();
        const panelHeight = this.element.offsetHeight || 42;
        this.#draggable = new Draggable(this.element, {
            limit: {
                x: [leftPosition, leftPosition],
                y: [0, Math.max(0, window.innerHeight - panelHeight)],
            },
            threshold: 10,
            onDragEnd: (_element, _x, y, _event) => {
                this.#syncZIndex();
                game.user.setFlag(MODULE_ID, USER_FLAGS.TOP_POSITION, y);
            },
        });

        this.#draggable.set({
            left: leftPosition,
            top: this.#getTopPosition(),
        });

        this.#safeSetPosition({
            left: leftPosition,
            top: this.#getTopPosition(),
        });

        window.removeEventListener("resize", this.#resizeHandler);
        window.addEventListener("resize", this.#resizeHandler);

        document.removeEventListener("click", this.#documentClickHandler);
        document.addEventListener("click", this.#documentClickHandler);

        if (this.#currentShownEffectInfoId) {
            const $effectItem = this.#rootView.find(`[data-effect-id="${this.#currentShownEffectInfoId}"]`);
            if ($effectItem.length) {
                $effectItem.find(".effect-info").show();
            } else {
                this.#currentShownEffectInfoId = null;
            }
        }

        this.#syncZIndex();
    }

    _preClose(_options) {
        this.#draggable?.destroy();
        window.removeEventListener("resize", this.#resizeHandler);
        document.removeEventListener("click", this.#documentClickHandler);
        return Promise.resolve();
    }

    animateFromLeftPx() {
        const leftPosition = this.#getLeftPosition();
        this.#rootView.animate({ left: leftPosition }, { duration: 200 });
    }

    #getLeftPosition() {
        const isSidebarExpanded = document
            .getElementById("sidebar-content")
            ?.classList.contains("expanded");
        const isWebrtcRight = ui.webrtc?.element?.classList.contains("right") ?? false;

        const webrtcWidth = isWebrtcRight ? 300 : 0;
        const { uiScale = 1 } = game.settings.get("core", "uiConfig") ?? {};

        const panelWidth = $("#effects-panel").width() ?? 42;
        const padding = 18;

        const rightPosition = isSidebarExpanded
            ? this.#getExpandedRightPosition({
                padding,
                webrtcWidth,
                panelWidth,
                uiScale,
            })
            : this.#getCollapsedRightPosition({
                padding,
                webrtcWidth,
                panelWidth,
                uiScale,
            });
        const leftPosition = window.innerWidth - rightPosition;

        return leftPosition;
    }

    #getCollapsedRightPosition({ padding, webrtcWidth, panelWidth, uiScale }) {
        const sidebarWidth = 48;
        return (padding + sidebarWidth + webrtcWidth + panelWidth) * uiScale;
    }

    #getExpandedRightPosition({ padding, webrtcWidth, panelWidth, uiScale }) {
        const sidebarEl = document.getElementById("sidebar");
        const expandedSidebarWidthPx = sidebarEl
            ? window.getComputedStyle(sidebarEl).getPropertyValue("--sidebar-width") || "348px"
            : "348px";
        const expandedSidebarWidth = parseInt(expandedSidebarWidthPx.replace("px", ""), 10);

        const sidebarScrollGutterPx = sidebarEl
            ? window.getComputedStyle(sidebarEl).getPropertyValue("--sidebar-scroll-gutter") || "12px"
            : "12px";
        const sidebarScrollGutter = parseInt(sidebarScrollGutterPx.replace("px", ""), 10);

        const sidebarTabsWidth = $("#sidebar-tabs").width() ?? 32;

        return (
            (padding +
                expandedSidebarWidth +
                webrtcWidth +
                sidebarTabsWidth +
                sidebarScrollGutter +
                panelWidth) *
            uiScale
        );
    }

    #getTopPosition() {
        const topPosition = game.user.getFlag(MODULE_ID, USER_FLAGS.TOP_POSITION);
        if (topPosition === undefined) {
            game.user.setFlag(MODULE_ID, USER_FLAGS.TOP_POSITION, 12);
        }

        const raw = topPosition ?? 12;
        const panelHeight = this.element?.offsetHeight || 42;
        const maxTop = Math.max(0, window.innerHeight - panelHeight);
        return Math.min(raw, maxTop);
    }

    #syncZIndex() {
        if (this.element) {
            this.element.style.zIndex = this.#currentShownEffectInfoId ? "1000" : "";
        }
    }

    #safeSetPosition(position) {
        if (!this.rendered || !this.element?.isConnected) return;
        try {
            this.setPosition(position);
        } catch {
            // Swallow errors from setPosition when element is in a bad state
        }
    }

    setPosition(position) {
        if (!this.element?.isConnected) return this.position;
        try {
            return super.setPosition(position);
        } catch {
            return this.position;
        }
    }

    #setOverlayZIndex(_visible) {
        this.#syncZIndex();
    }

    #onWindowResize() {
        if (!this.rendered || !this.element?.isConnected) return;

        const leftPosition = this.#getLeftPosition();

        if (this.#draggable) {
            this.#draggable.options.limit.x = [leftPosition, leftPosition];
        }

        this.#safeSetPosition({ left: leftPosition });
        this.#rootView.css({ left: leftPosition });
    }

    #onDocumentClick(event) {
        if (!this.#currentShownEffectInfoId) return;

        const target = event.target;
        if (!target) return;

        if (this.element?.contains(target)) return;

        this.#rootView.find(".effect-info").hide();
        this.#currentShownEffectInfoId = null;
        this.#setOverlayZIndex(false);
    }

    #initClickListeners() {
        const icons = this.#rootView.find("div.effect-icon-container");
        icons.on("click", this.#onIconClick.bind(this));
        icons.on("contextmenu", this.#onIconRightClick.bind(this));
        icons.on("dblclick", this.#onIconDoubleClick.bind(this));
    }

    #onIconClick(event) {
        if (event.currentTarget === null) return;

        const $target = $(event.currentTarget);
        const $effectItem = $target.closest(".effect-item");
        const $effectInfo = $effectItem.find(".effect-info");

        const effectId = $effectItem.attr("data-effect-id");

        if ($effectInfo.is(":visible")) {
            $effectInfo.hide();
            this.#currentShownEffectInfoId = null;
        } else {
            this.#rootView.find(".effect-info").hide();
            $effectInfo.show();
            this.#currentShownEffectInfoId = effectId ?? null;
        }

        this.#syncZIndex();
    }

    async #onIconRightClick(event) {
        if (event.currentTarget === null) return;

        this.#syncZIndex();

        if (game.user.role < this.#settings.allowRightClick) return;

        const $target = $(event.currentTarget);
        const $effectItem = $target.closest(".effect-item");

        const actor = this.#actor;
        const effects = this.#getActorEffects(actor);
        const effectId = $effectItem.attr("data-effect-id");

        const effect = effects.find((e) => e.id === effectId);

        if (!effect) return;

        const clickBehavior = event.shiftKey
            ? this.#settings.shiftRightClickBehavior
            : this.#settings.rightClickBehavior;

        await this.#handleEffectChange({
            eventX: event.clientX,
            eventY: event.clientY,
            effect,
            clickBehavior,
        });
    }

    async #onIconDoubleClick(event) {
        if (event.currentTarget === null) return;

        this.#syncZIndex();

        if (event instanceof MouseEvent && event.shiftKey) {
            const $target = $(event.currentTarget);
            const $effectItem = $target.closest(".effect-item");

            const actor = this.#actor;
            const effects = this.#getActorEffects(actor);
            const effectId = $effectItem.attr("data-effect-id");

            const effect = effects.find((e) => e.id === effectId);

            if (!effect) return;

            effect.sheet?.render(true);
            return;
        }

        const $target = $(event.currentTarget);
        const $effectItem = $target.closest(".effect-item");

        const actor = this.#actor;
        const effects = this.#getActorEffects(actor);
        const effectId = $effectItem.attr("data-effect-id");

        const effect = effects.find((e) => e.id === effectId);

        if (!effect) return;

        const clickBehavior = this.#settings.doubleClickBehavior;

        await this.#handleEffectChange({
            eventX: event.clientX,
            eventY: event.clientY,
            effect,
            clickBehavior,
        });
    }

    #isItemEffect(effect) {
        return !!(effect.parent && effect.parent instanceof Item);
    }

    async #handleEffectChange({ eventX, eventY, effect, clickBehavior }) {
        this.#rootView.find(".effect-info").hide();
        this.#currentShownEffectInfoId = null;
        this.#setOverlayZIndex(false);

        const isItemEffect = this.#isItemEffect(effect);

        if (clickBehavior === CLICK_BEHAVIOR.DIALOG) {
            const content = game.i18n.format("EffectsPanel.DeleteOrDisableEffectContent", {
                effect: effect.name ?? effect.label ?? game.i18n.localize("EffectsPanel.UnknownEffect"),
            });

            await DialogV2.wait({
                window: {
                    title: game.i18n.localize("EffectsPanel.DeleteOrDisableEffect"),
                    controls: [],
                },
                position: {
                    width: 300,
                    top: eventY + 20,
                    left: eventX - 300 - 42,
                },
                content: `<p>${content}?</p>`,
                buttons: [
                    {
                        action: "delete",
                        label: game.i18n.localize("EffectsPanel.Delete"),
                        icon: "fa-solid fa-trash",
                        disabled: isItemEffect,
                        callback: async () => {
                            if (isItemEffect) {
                                ui.notifications.info(game.i18n.localize("EffectsPanel.ItemEffectProtected"));
                                return;
                            }
                            await effect.delete();
                            this.refresh();
                        },
                    },
                    {
                        action: "disable",
                        label: effect.disabled
                            ? game.i18n.localize("EffectsPanel.Enable")
                            : game.i18n.localize("EffectsPanel.Disable"),
                        icon: effect.disabled ? "fas fa-check" : "fas fa-close",
                        callback: async () => {
                            await effect.update({
                                disabled: !effect.disabled,
                            });
                        },
                    },
                ],
            });
        } else if (clickBehavior === CLICK_BEHAVIOR.DELETE) {
            if (isItemEffect) {
                ui.notifications.info(game.i18n.localize("EffectsPanel.ItemEffectProtected"));
                await effect.update({ disabled: !effect.disabled });
            } else {
                await effect.delete();
                this.refresh();
            }
        } else if (clickBehavior === CLICK_BEHAVIOR.DISABLE) {
            await effect.update({ disabled: !effect.disabled });
        }
    }

    get #actorEffects() {
        const actor = this.#actor;

        if (!actor) return [];

        const effects = this.#getActorEffects(actor);

        return effects
            .map((effect) => {
                const src = this.#getSourceName(effect);
                const effectData = effect.clone({}, { keepId: true });

                const effectName = effect.name ?? effect.label ?? game.i18n.localize("EffectsPanel.UnknownEffect");
                Object.defineProperty(effectData, "name", {
                    value: effectName,
                    configurable: true,
                    enumerable: true,
                });

                effectData.infinite = effect.duration.value === Infinity;
                effectData.timeLabel = this.#determineTimeLabel(effect);
                effectData.src = src;

                return effectData;
            })
            .sort((a, b) => {
                if (a.isTemporary) return -1;
                if (b.isTemporary) return 1;
                return 0;
            })
            .filter((effectData) => !effectData.isSuppressed);
    }

    get #actor() {
        const userActor = game.user?.character ?? null;
        return canvas.tokens?.controlled[0]?.actor ?? userActor ?? null;
    }

    #getActorEffects(actor) {
        const effects = [];
        for (const effect of actor?.allApplicableEffects() || []) {
            effects.push(effect);
        }
        return effects;
    }

    #getSourceName(effect) {
        if (!effect.origin) return null;
        try {
            const name = fromUuidSync(effect.origin)?.name;
            if (name === undefined) return null;
            return name;
        } catch {
            return null;
        }
    }

    #determineTimeLabel(effect) {
        if (game.system.id === "demonlord") {
            const dlResult = this.#handleDemonLordRemainingTime(effect);
            if (dlResult) return dlResult;
        }

        if (effect.duration.value === Infinity) {
            return game.i18n.localize("EffectsPanel.Unlimited");
        }

        const label = effect.duration.label;
        if (label && label !== "None") {
            return label;
        }

        const value = effect.duration.value;
        const units = effect.duration.units;
        if (value !== undefined && value !== null && units) {
            return `${value} ${units}`;
        }

        return game.i18n.localize("EffectsPanel.Unlimited");
    }

    #handleDemonLordRemainingTime(effect) {
        let tokenName;
        const specialDuration = foundry.utils.getProperty(
            effect,
            "flags.demonlord.specialDuration",
        );
        if (specialDuration !== "None" && specialDuration !== undefined) {
            tokenName = fromUuidSync(
                effect.origin?.substring(0, effect.origin.search(".Actor.")) ?? "",
            )?.name;
            switch (specialDuration) {
                case "EndOfTheRound":
                    return game.i18n.localize("EffectsPanel.EndOfTheRound");
                case "NextAttackRoll":
                    return game.i18n.localize("EffectsPanel.NextAttackRoll");
                case "NextChallengeRoll":
                    return game.i18n.localize("EffectsPanel.NextChallengeRoll");
                case "TurnEndSource":
                    return game.i18n.localize("EffectsPanel.TurnEnd") + ` [${tokenName}]`;
                case "TurnStartSource":
                    return game.i18n.localize("EffectsPanel.TurnStart") + ` [${tokenName}]`;
                case "TurnEnd":
                    return game.i18n.localize("EffectsPanel.TurnEnd");
                case "TurnStart":
                    return game.i18n.localize("EffectsPanel.TurnStart");
                case "NextD20Roll":
                    return game.i18n.localize("EffectsPanel.NextD20Roll");
                case "NextDamageRoll":
                    return game.i18n.localize("EffectsPanel.NextDamageRoll");
                case "RestComplete":
                    return game.i18n.localize("EffectsPanel.RestComplete");
                default:
                    return specialDuration;
            }
        }

        return null;
    }
}
