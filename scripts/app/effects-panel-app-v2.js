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

const DEFAULT_TOP = 12;
const DRAG_THRESHOLD = 10;
const SCREEN_MARGIN = 8;
const DESCRIPTION_CACHE_LIMIT = 200;

export class EffectsPanelAppV2 extends HandlebarsApplicationMixin(ApplicationV2) {
    #settings = new Settings();
    #resizeHandler;
    #documentClickHandler;
    #dragMoveHandler;
    #dragEndHandler;

    #currentShownEffectInfoId = null;
    #showsTemporaryEffects = false;
    #descriptionCache = new Map();
    #drag = null;
    #suppressNextClick = false;

    constructor(options = {}) {
        super(options);
        this.refresh = foundry.utils.debounce(this.render.bind(this), 100);

        this.#resizeHandler = foundry.utils.debounce(() => this.#applyTop(), 200);
        this.#documentClickHandler = this.#onDocumentClick.bind(this);
        this.#dragMoveHandler = this.#onDragMove.bind(this);
        this.#dragEndHandler = this.#onDragEnd.bind(this);
    }

    static DEFAULT_OPTIONS = {
        id: "effects-panel",
        window: {
            frame: false,
            positioned: false,
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

    /**
     * Whether the panel currently shows effects whose duration labels depend on combat or world time.
     * @returns {boolean}
     */
    get showsTemporaryEffects() {
        return this.#showsTemporaryEffects;
    }

    async _prepareContext(_options) {
        const temporaryEffects = [];
        const passiveEffects = [];
        const disabledTemporaryEffects = [];
        const disabledPassiveEffects = [];

        const showDisabledEffects = this.#settings.showDisabledEffects;
        const passiveEffectMode = this.#settings.passiveEffectMode;

        const isPassiveShown = (effect) =>
            passiveEffectMode === PASSIVE_EFFECT_MODE.ALWAYS ||
            (passiveEffectMode === PASSIVE_EFFECT_MODE.ALWAYS_ICON && effect.showIcon === CONST.ACTIVE_EFFECT_SHOW_ICON.ALWAYS);

        const actor = this.#actor;
        const effects = actor ? this.#getActorEffects(actor) : [];

        for (const effect of effects) {
            // V14 also counts expired effects as suppressed, but those stay visible with the expired clock
            if (effect.isSuppressed && !effect.duration.expired) continue;
            if (effect.disabled && !showDisabledEffects) continue;
            if (!effect.isTemporary && !isPassiveShown(effect)) continue;

            const view = this.#toViewData(effect);
            if (effect.disabled) {
                (effect.isTemporary ? disabledTemporaryEffects : disabledPassiveEffects).push(view);
            } else {
                (effect.isTemporary ? temporaryEffects : passiveEffects).push(view);
            }
        }

        this.#showsTemporaryEffects = temporaryEffects.length > 0 || disabledTemporaryEffects.length > 0;

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

    /**
     * Builds the plain data the template needs for one effect, instead of cloning the whole document.
     * Descriptions are enriched later, when the effect's info overlay is opened.
     */
    #toViewData(effect) {
        const parentItem = this.#isItemEffect(effect) ? effect.parent : null;
        return {
            id: effect.id,
            name: this.#getEffectName(effect),
            img: effect.img,
            tint: effect.tint?.css ?? "",
            isTemporary: effect.isTemporary,
            expired: effect.duration?.expired === true,
            overlay: !!foundry.utils.getProperty(effect, "flags.core.overlay"),
            timeLabel: this.#determineTimeLabel(effect),
            hasDescription: !!effect.description,
            parentName: parentItem?.name ?? "",
            hasParentDescription: !!parentItem?.system?.description?.value,
        };
    }

    /**
     * Inserts the panel next to the sidebar, so it follows the sidebar, the camera dock and the UI scale.
     */
    _insertElement(element) {
        const existing = document.getElementById(element.id);
        if (existing) {
            existing.replaceWith(element);
            return;
        }
        const column = document.getElementById("ui-right-column-1") ?? document.body;
        column.append(element);
    }

    async _onFirstRender(context, options) {
        await super._onFirstRender(context, options);

        // The root element survives re-renders, so these delegated listeners are bound once
        this.element.addEventListener("click", this.#onClick.bind(this));
        this.element.addEventListener("dblclick", this.#onDoubleClick.bind(this));
        this.element.addEventListener("contextmenu", this.#onRightClick.bind(this));
        this.element.addEventListener("keydown", this.#onKeyDown.bind(this));
        this.element.addEventListener("pointerdown", this.#onPointerDown.bind(this));

        window.addEventListener("resize", this.#resizeHandler);
        document.addEventListener("click", this.#documentClickHandler);
    }

    async _onRender(context, options) {
        await super._onRender(context, options);

        this.#applyTop();

        if (this.#currentShownEffectInfoId) {
            const effectItem = this.#getEffectItemElement(this.#currentShownEffectInfoId);
            if (effectItem) {
                this.#showInfo(effectItem);
            } else {
                this.#currentShownEffectInfoId = null;
            }
        }
    }

    _onClose(options) {
        super._onClose(options);
        this.#endDrag();
        window.removeEventListener("resize", this.#resizeHandler);
        document.removeEventListener("click", this.#documentClickHandler);
    }

    // Position & dragging

    get #uiScale() {
        const height = this.element?.offsetHeight;
        if (!height) return 1;
        return this.element.getBoundingClientRect().height / height || 1;
    }

    get #maxTop() {
        const containerHeight = this.element?.parentElement?.clientHeight || window.innerHeight;
        return Math.max(0, containerHeight - (this.element?.offsetHeight ?? 0));
    }

    get #currentTop() {
        return parseFloat(this.element?.style.top) || 0;
    }

    #clampTop(top) {
        return Math.min(Math.max(0, top), this.#maxTop);
    }

    #applyTop(top = game.user.getFlag(MODULE_ID, USER_FLAGS.TOP_POSITION) ?? DEFAULT_TOP) {
        if (!this.element) return;
        this.element.style.top = `${this.#clampTop(top)}px`;
    }

    #onPointerDown(event) {
        this.#suppressNextClick = false;
        if (event.button !== 0 || this.#drag) return;
        if (!event.target.closest(".effect-icon-container")) return;

        this.#drag = {
            startY: event.clientY,
            startTop: this.#currentTop,
            scale: this.#uiScale,
            dragging: false,
        };
        window.addEventListener("pointermove", this.#dragMoveHandler);
        window.addEventListener("pointerup", this.#dragEndHandler);
        window.addEventListener("pointercancel", this.#dragEndHandler);
    }

    #onDragMove(event) {
        const drag = this.#drag;
        if (!drag) return;

        const deltaY = event.clientY - drag.startY;
        if (!drag.dragging && Math.abs(deltaY) < DRAG_THRESHOLD) return;

        drag.dragging = true;
        this.element.classList.add("dragging");
        this.#applyTop(drag.startTop + deltaY / drag.scale);
    }

    #onDragEnd(event) {
        const drag = this.#drag;
        this.#endDrag();
        if (!drag?.dragging || event.type === "pointercancel") return;

        // Releasing the mouse after a drag also fires a click, which must not toggle an effect's info
        this.#suppressNextClick = true;
        game.user.setFlag(MODULE_ID, USER_FLAGS.TOP_POSITION, Math.round(this.#currentTop));
    }

    #endDrag() {
        this.#drag = null;
        this.element?.classList.remove("dragging");
        window.removeEventListener("pointermove", this.#dragMoveHandler);
        window.removeEventListener("pointerup", this.#dragEndHandler);
        window.removeEventListener("pointercancel", this.#dragEndHandler);
    }

    // Info overlay

    #getEffectItemElement(effectId) {
        return this.element?.querySelector(`.effect-item[data-effect-id="${CSS.escape(effectId)}"]`) ?? null;
    }

    hideInfo() {
        this.#currentShownEffectInfoId = null;
        for (const info of this.element?.querySelectorAll(".effect-info.visible") ?? []) {
            info.classList.remove("visible");
        }
    }

    #showInfo(effectItem) {
        this.hideInfo();
        const info = effectItem.querySelector(".effect-info");
        if (!info) return;

        info.classList.add("visible");
        this.#currentShownEffectInfoId = effectItem.dataset.effectId ?? null;
        this.#fitInfo(info);
        this.#populateDescription(effectItem);
    }

    #toggleInfo(effectItem) {
        if (effectItem.querySelector(".effect-info.visible")) {
            this.hideInfo();
        } else {
            this.#showInfo(effectItem);
        }
    }

    /**
     * Moves the overlay up when it would run past the bottom of the screen.
     */
    #fitInfo(info) {
        info.style.top = "";
        const rect = info.getBoundingClientRect();
        const overflow = rect.bottom - (window.innerHeight - SCREEN_MARGIN);
        if (overflow <= 0) return;

        const shift = Math.min(overflow, Math.max(0, rect.top - SCREEN_MARGIN));
        info.style.top = `${-shift / this.#uiScale}px`;
    }

    async #populateDescription(effectItem) {
        const container = effectItem.querySelector(".effect-description");
        if (!container || container.dataset.loaded) return;

        const effect = this.#findEffect(effectItem.dataset.effectId);
        if (!effect) return;

        const html = await this.#getDescriptionHTML(effect, container.dataset.source);
        if (!container.isConnected) return;

        container.innerHTML = html;
        container.dataset.loaded = "true";

        const info = effectItem.querySelector(".effect-info.visible");
        if (info) this.#fitInfo(info);
    }

    async #getDescriptionHTML(effect, source) {
        const fromParent = source === "parent" && this.#isItemEffect(effect);
        const doc = fromParent ? effect.parent : effect;
        const raw = fromParent ? doc.system?.description?.value : doc.description;

        const key = `${doc.uuid}:${source}`;
        const stamp = doc._stats?.modifiedTime ?? null;
        const cached = this.#descriptionCache.get(key);
        if (cached && cached.stamp === stamp) return cached.html;

        const html = await TextEditor.enrichHTML(game.i18n.localize(raw ?? ""), { relativeTo: doc });

        if (this.#descriptionCache.size >= DESCRIPTION_CACHE_LIMIT) this.#descriptionCache.clear();
        this.#descriptionCache.set(key, { stamp, html });
        return html;
    }

    #onDocumentClick(event) {
        if (!this.#currentShownEffectInfoId) return;

        const target = event.target;
        if (!target || this.element?.contains(target)) return;

        this.hideInfo();
    }

    // Effect interactions

    #onClick(event) {
        if (this.#suppressNextClick) {
            this.#suppressNextClick = false;
            return;
        }

        const effectItem = event.target.closest(".effect-icon-container")?.closest(".effect-item");
        if (effectItem) this.#toggleInfo(effectItem);
    }

    #onKeyDown(event) {
        if (event.key !== "Enter" && event.key !== " ") return;

        const effectItem = event.target.closest(".effect-icon-container")?.closest(".effect-item");
        if (!effectItem) return;

        event.preventDefault();
        this.#toggleInfo(effectItem);
    }

    async #onRightClick(event) {
        const effect = this.#getEffectFromEvent(event);
        if (!effect) return;

        event.preventDefault();

        if (game.user.role < this.#settings.allowRightClick) return;

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

    async #onDoubleClick(event) {
        const effect = this.#getEffectFromEvent(event);
        if (!effect) return;

        if (event.shiftKey) {
            effect.sheet?.render(true);
            return;
        }

        if (game.user.role < this.#settings.allowRightClick) return;

        await this.#handleEffectChange({
            eventX: event.clientX,
            eventY: event.clientY,
            effect,
            clickBehavior: this.#settings.doubleClickBehavior,
        });
    }

    #getEffectFromEvent(event) {
        const effectId = event.target.closest(".effect-icon-container")?.closest(".effect-item")?.dataset.effectId;
        return effectId ? this.#findEffect(effectId) : null;
    }

    #findEffect(effectId) {
        return this.#getActorEffects(this.#actor).find((e) => e.id === effectId) ?? null;
    }

    #isItemEffect(effect) {
        return !!(effect.parent && effect.parent instanceof Item);
    }

    async #handleEffectChange({ eventX, eventY, effect, clickBehavior }) {
        this.hideInfo();

        const isItemEffect = this.#isItemEffect(effect);

        if (clickBehavior === CLICK_BEHAVIOR.DIALOG) {
            const content = game.i18n.format("EffectsPanel.DeleteOrDisableEffectContent", {
                effect: foundry.utils.escapeHTML(this.#getEffectName(effect)),
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
                            await effect.delete();
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
            }
        } else if (clickBehavior === CLICK_BEHAVIOR.DISABLE) {
            await effect.update({ disabled: !effect.disabled });
        }
    }

    // Effect data

    #getEffectName(effect) {
        return effect.name || game.i18n.localize("EffectsPanel.UnknownEffect");
    }

    get #actor() {
        const userActor = game.user?.character ?? null;
        return canvas.tokens?.controlled[0]?.actor ?? userActor ?? null;
    }

    #getActorEffects(actor) {
        const effects = Array.from(actor?.allApplicableEffects() ?? []);
        return this.#deduplicateAuraEffects(effects, actor);
    }

    #deduplicateAuraEffects(effects, actor) {
        if (!effects?.length) return [];

        const sourceAuraUuids = new Set();
        for (const effect of effects) {
            if (effect.type === "auraeffects.aura") {
                if (effect.uuid) sourceAuraUuids.add(effect.uuid);
                if (effect.id) sourceAuraUuids.add(effect.id);
            }
        }

        const actorUuid = actor?.uuid ?? "";
        const tokenUuid = actor?.token?.uuid ?? "";
        const seenAppliedAuraUuids = new Set();

        return effects.filter((effect) => {
            const auraSourceUuid = this.#getAuraSourceUuid(effect);
            if (!auraSourceUuid) return true;

            // Layer 2: Originating token deduplication
            if (this.#isOriginatingAuraEffect(auraSourceUuid, sourceAuraUuids, actorUuid, tokenUuid, actor)) {
                return false;
            }

            // Layer 3: Redundant applied aura deduplication on recipient
            if (seenAppliedAuraUuids.has(auraSourceUuid)) {
                return false;
            }
            seenAppliedAuraUuids.add(auraSourceUuid);

            return true;
        });
    }

    #getAuraSourceUuid(effect) {
        // getFlag throws when the Aura Effects module is not active
        const fromAura = effect.flags?.auraeffects?.fromAura;
        if (!fromAura) return null;
        if (typeof fromAura === "string") return fromAura;
        return effect.origin || null;
    }

    #isOriginatingAuraEffect(auraSourceUuid, sourceAuraUuids, actorUuid, tokenUuid, actor) {
        if (sourceAuraUuids.has(auraSourceUuid)) return true;
        if (actorUuid && auraSourceUuid.startsWith(actorUuid)) return true;
        if (tokenUuid && auraSourceUuid.startsWith(tokenUuid)) return true;

        try {
            const sourceDoc = fromUuidSync(auraSourceUuid);
            if (sourceDoc) {
                const sourceActor = sourceDoc.actor ?? (sourceDoc.parent instanceof Actor ? sourceDoc.parent : sourceDoc.parent?.actor);
                if (sourceActor && (sourceActor === actor || sourceActor.uuid === actorUuid)) return true;
            }
        } catch {
            // Ignore fromUuidSync lookup errors
        }

        return false;
    }

    #determineTimeLabel(effect) {
        if (game.system.id === "demonlord") {
            const dlResult = this.#handleDemonLordRemainingTime(effect);
            if (dlResult) return dlResult;
        }

        const label = effect.duration.label;
        if (label && !this.#isNoneLabel(label)) {
            return label;
        }

        return game.i18n.localize("EffectsPanel.Unlimited");
    }

    /**
     * Foundry labels effects without a duration with its own, translated "None".
     */
    #isNoneLabel(label) {
        return label === "None" || label === game.i18n.localize("COMMON.None");
    }

    #handleDemonLordRemainingTime(effect) {
        const specialDuration = foundry.utils.getProperty(
            effect,
            "flags.demonlord.specialDuration",
        );
        if (specialDuration !== "None" && specialDuration !== undefined) {
            const getTokenName = () => {
                const actorIndex = effect.origin?.indexOf(".Actor.") ?? -1;
                if (actorIndex < 0) return "";
                try {
                    return fromUuidSync(effect.origin.substring(0, actorIndex))?.name ?? "";
                } catch {
                    return "";
                }
            };
            switch (specialDuration) {
                case "EndOfTheRound":
                    return game.i18n.localize("EffectsPanel.EndOfTheRound");
                case "NextAttackRoll":
                    return game.i18n.localize("EffectsPanel.NextAttackRoll");
                case "NextChallengeRoll":
                    return game.i18n.localize("EffectsPanel.NextChallengeRoll");
                case "TurnEndSource":
                    return game.i18n.localize("EffectsPanel.TurnEnd") + ` [${getTokenName()}]`;
                case "TurnStartSource":
                    return game.i18n.localize("EffectsPanel.TurnStart") + ` [${getTokenName()}]`;
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
