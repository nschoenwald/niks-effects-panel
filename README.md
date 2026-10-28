# Nik's Effects Panel

[![Foundry VTT](https://img.shields.io/badge/Foundry%20VTT-V14-orange.svg)](https://foundryvtt.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Latest Release](https://img.shields.io/github/v/release/nschoenwald/niks-effects-panel?color=purple)](https://github.com/nschoenwald/niks-effects-panel/releases/latest)

A floating panel next to the sidebar that shows the active effects of the selected token in **Foundry VTT v14**. Check, inspect, disable or remove effects without opening the character sheet.

---

## ✨ Features

- **Follows your selection**: Shows the selected token's effects. With nothing selected, it shows your own character.
- **Effect details**: Hover an icon to see the effect's name. Click it to see its description, its remaining duration and the item it comes from. Click it again, or anywhere else, to close it.
- **Quick actions**:
  - Double-click an effect to disable or enable it.
  - Right-click an effect to choose between deleting and disabling it.
  - <kbd>Shift</kbd> + right-click to delete it right away.
  - <kbd>Shift</kbd> + double-click to open the effect's sheet.
  - Effects that come from an item are never deleted. They are disabled instead.
- **Temporary and passive effects**: Temporary effects have square icons, passive effects round ones. A line between them keeps the two groups apart.
- **Disabled effects**: Shown greyed out with a striped overlay at the bottom of the panel.
- **Duration badges**: A small clock or infinity sign on each icon shows at a glance whether an effect runs out. Expired effects get an orange clock.
- **Stays next to the sidebar**: The panel follows the sidebar when it opens or closes, the camera dock and the UI scale. Drag it up or down to move it. Each player's position is remembered.
- **Keyboard**: Reach effect icons with <kbd>Tab</kbd> and press <kbd>Enter</kbd> or <kbd>Space</kbd> to open their details.

---

## ⚙️ Settings

- **For each player**:
  - Icon size (16 to 100 px).
  - Whether to show disabled effects, duration badges and the line between temporary and passive effects.
  - Which passive effects to show: **Never**, **If Always Visible** (respects the effect's "Show Icon?" setting) or **Always**.
  - What double-click, right-click and <kbd>Shift</kbd> + right-click do: open the dialog, delete or disable.
- **For GMs**: The minimum role needed to see the panel, to see effect details and to use right-click actions. Set any of them to **None** to turn the feature off for everyone.

---

## 🤝 Compatibility

- **Game systems**: Works with any system that uses Foundry's active effects.
- **[Aura Effects](https://foundryvtt.com/packages/auraeffects)**: A token with an aura shows the aura once, not once more for the copy it applies to itself. Tokens inside someone else's aura show it once, even if they received it more than once.
- **Shadow of the Demon Lord**: Special durations such as "End of the Round" or "Next Attack Roll" are shown as the effect's duration.

---

## 🌐 Languages

🇬🇧 English

---

## 📦 Installation

In Foundry, go to **Add-on Modules → Install Module** and paste this manifest URL:
```
https://github.com/nschoenwald/niks-effects-panel/releases/latest/download/module.json
```

Requires **Foundry VTT v14**. The last version for v13 is [14.3.0](https://github.com/nschoenwald/niks-effects-panel/releases/tag/14.3.0).

---

## Other Modules by Nik

### 🎲 D&D 5e Specific
* **[Nik's DnD5e Tweaks](https://github.com/nschoenwald/niks-dnd5e-tweaks)** – Consolidated collection of quality-of-life enhancements and combat automation tweaks for DnD5e.

### ⚔️ Combat & Token Tools
* **[Nik's Action HUD](https://github.com/nschoenwald/niks-action-hud)** – Sleek, modern canvas-docked Action HUD for quick access to attacks, spells, inventory, and utility rolls.
* **[Nik's Token Tags](https://github.com/nschoenwald/niks-token-tags)** – Automatically numbers duplicate combatant NPCs (A, B, C…) with color-coded letter overlays.
* **[Nik's Shared NPC Initiative](https://github.com/nschoenwald/niks-shared-npc-initiative)** – Groups NPCs of the same type in combat so they share a single initiative roll.
* **[Nik's Movement Control](https://github.com/nschoenwald/niks-movement-control)** – GM controls to toggle player movement and automatically restrict/allow movement on combat start and end.
* **[Nik's Tiny Change Logs](https://github.com/nschoenwald/niks-tiny-changelogs)** – Compact, single-line chat messages logging token HP and Temp HP changes.

### 🎲 Visuals & Display
* **[Nik's Dynamic Roll Area](https://github.com/nschoenwald/niks-dynamic-roll-area)** – Dynamically restricts Dice So Nice 3D dice rolling area to exclude the sidebar / chat log across all screen resolutions and window sizes.

### ⚙️ Utilities & System Management
* **[Nik's Settings Locks](https://github.com/nschoenwald/niks-settings-locks)** – Soft-lock and hard-lock client settings and keybindings across all connected players.
* **[Nik's Compendium Search Tweaks](https://github.com/nschoenwald/niks-compendium-search-tweaks)** – Configure which compendium packs are included or excluded from native sidebar search.
* **[Nik's Show & Tell](https://github.com/nschoenwald/niks-show-and-tell)** – Share popout images to chat and paste image files directly into chat messages.
* **[Nik's Zoom / Pan Options](https://github.com/nschoenwald/niks-zoom-pan-options)** – Touchpad and scroll wheel pan/zoom controls and canvas navigation enhancements.

---

## 📜 License

MIT License. See [LICENSE](LICENSE).

Based on **[DFreds Effects Panel](https://github.com/DFreds/dfreds-effects-panel)** by Derek Fredrickson (DFreds), who created the original effects panel for Foundry VTT. Not affiliated with Foundry Gaming LLC.
