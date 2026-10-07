# Nik's Effects Panel

[![Foundry VTT Version](https://img.shields.io/badge/foundry-v13%20%7C%20v14-orange)](https://foundryvtt.com/)
[![Latest Release](https://img.shields.io/github/v/release/nschoenwald/niks-effects-panel?color=blue)](https://github.com/nschoenwald/niks-effects-panel/releases)

**Nik's Effects Panel** is a sleek, modern, and highly configurable module for **Foundry VTT** (supporting V13 & V14) that displays a floating panel of active effects for currently controlled tokens or assigned player characters.

Built on Foundry's modern **ApplicationV2** framework, it gives players and Game Masters instant visual status tracking, rich detailed tooltips, and rapid effect management right on the canvas.

---

## 🌟 Key Features

- **⚡ Real-Time Active Effect Panel**: Automatically displays active effects (temporary, passive, disabled) for selected tokens, fallback to assigned user character if no token is controlled.
- **🔍 Rich Info Tooltips**: Single-click any effect icon to pop open a detailed overlay containing formatted HTML descriptions, duration readouts (rounds, turns, seconds, or expiration states), and parent item origins.
- **🎨 Visual Customization**:
  - **Icon Resizing**: Dynamically scale icon sizes from `16px` to `100px` with auto-adjusting badges.
  - **Disabled Effects**: High-contrast desaturation combined with a subtle diagonal stripe overlay for clear visual feedback.
  - **Passive Effect Modes**: Filter passive effects (`Never`, `If Always Visible` [V14 `showIcon` integration], or `Always`).
  - **Effect Grouping**: Optional horizontal divider line to separate temporary and passive effects.
  - **Duration Badges**: Toggle overlay badges indicating remaining rounds, turns, or time.
- **🖱️ Flexible Controls & Click Actions**: Configure custom behaviors for double-clicking, right-clicking, and shift-right-clicking (toggle disable/enable, prompt deletion dialog, or delete directly). Shift+Double-Click opens the underlying Active Effect sheet instantly.
- **🔒 Granular Permission Controls**: Independent settings for View Panel, View Details/Descriptions, and Right-Click Interactions based on Foundry user roles (Player, Trusted Player, Assistant GM, GM).
- **📌 Persistent & Clamped Dragging**: Reposition the panel vertically along the screen edge with automatic coordinate saving per user and viewport boundaries clamping.
- **🛡️ Aura Effects Compatibility**: Seamless deduplication for the `aura-effects` module, suppressing redundant self-applied duplicate effects on originating tokens while preserving master aura controls and downstream effects.

---

## 🎮 Usage & Controls

Once enabled, selecting a token (or controlling an actor) displays the panel along the edge of the screen.

| Mouse Action | Default Behavior | Configurable |
| :--- | :--- | :---: |
| **Left Click** | Open / close rich effect description popover | ❌ |
| **Double Click** | Toggle effect state (Enable / Disable) | ✅ |
| **Right Click** | Open Delete / Disable confirmation dialog | ✅ |
| **Shift + Right Click** | Immediately delete effect | ✅ |
| **Shift + Double Click** | Open Active Effect configuration sheet | ❌ |
| **Drag & Drop** | Drag vertical handle to reposition panel | ❌ |

---

## ⚙️ Configuration Settings

Customize panel appearance and control rights in **Game Settings ➔ Module Settings ➔ Nik's Effects Panel**:

| Setting | Scope | Default | Description |
| :--- | :---: | :---: | :--- |
| **Show Disabled Effects** | Client | `Enabled` | Shows disabled/inactive effects with a desaturated frame and overlay pattern. |
| **Show Passive Effects** | Client | `If Always Visible` | Controls passive effect visibility (`Never`, `If Always Visible`, `Always`). |
| **Show Duration Overlays** | Client | `Enabled` | Shows overlay icons/badges for effect durations. |
| **Separate Temporary and Passive** | Client | `Enabled` | Renders a horizontal divider line between temporary and passive effects. |
| **Icon Size** | Client | `42px` | Sets panel effect icon size (range: 16px - 100px). |
| **Double-Click Behavior** | Client | `Disable` | Action triggered on double-click (`Disable`, `Delete`, `Dialog`). |
| **Right-Click Behavior** | Client | `Dialog` | Action triggered on right-click (`Dialog`, `Delete`, `Disable`). |
| **Shift Right-Click Behavior** | Client | `Delete` | Action triggered on Shift + Right-Click (`Delete`, `Disable`, `Dialog`). |
| **Allow Right-Click** | World | `Player` | Minimum user role required to interact via right-click. |
| **View Permission** | World | `Player` | Minimum user role required to see the effects panel. |
| **View Details Permission** | World | `Player` | Minimum user role required to expand detailed tooltips/descriptions. |

---

## 🛠️ Compatibility & Requirements

- **Foundry VTT**: Minimum Version **13**, Verified Version **14** (ApplicationV2)
- **Game Systems**: System-agnostic (optimized for D&D 5e 5.2+ and generic active effect workflows)

---

## 🙏 Credits & Acknowledgments

This module is based on and inspired by **[DFreds Effects Panel](https://github.com/DFreds/dfreds-effects-panel)** created by **Derek Fredrickson (DFreds)**. We are immensely grateful for their foundational work creating the original effects panel concept for Foundry VTT.

---

## Other Modules by Nik

### 🎲 D&D 5e Specific
* **[Nik's DnD5e Tweaks](https://github.com/nschoenwald/niks-dnd5e-tweaks)** – Consolidated collection of quality-of-life enhancements and combat automation tweaks for DnD5e.

### ⚔️ Combat & Token Tools
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
