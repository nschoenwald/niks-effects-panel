# Changelog

## 14.0.9

### Added
- Added a GitHub Action workflow for automatic module releases on GitHub release publication.

## 14.0.8

### Fixed
- Fixed an issue where deleting a token left its effects panel on screen until another token was selected.
- Added hook listeners for token deletion/updates (`deleteToken`, `updateToken`), actor deletion/updates (`deleteActor`, `updateActor`), item changes (`createItem`, `updateItem`, `deleteItem`), combat updates (`updateCombat`, `deleteCombat`), and user character assignment changes (`updateUser`).
- Automatically clear orphan effect info popovers and restore standard z-index if a target effect or token is removed.
- Prevented duplicate application instances across scene switches (`canvasReady`).

## 14.0.7

### Added
- Added a setting to toggle whether temporary and passive effects are separated by a horizontal line in the panel.

### Changed
- Improved visual indicators for disabled effects using a high-contrast desaturation styling paired with a subtle white diagonal stripe overlay pattern and preserved frame borders for maximum icon readability.

## 14.0.6

### Fixed
- The effects panel no longer appears above character sheets and other application windows. The panel's z-index is now only elevated when an info overlay is open and correctly resets on every re-render.

## 14.0.5

### Fixed
- Effects panel can no longer be dragged off-screen — the drag limit now accounts for the panel's actual height.
- Restored panel position is clamped to the viewport on load, preventing off-screen placement after a browser resize.

## 14.0.4

### Changed
- **Show Passive Effects** setting is now a dropdown with three options:
  - **Never** — Passive effects are always hidden.
  - **If Always Visible** *(default)* — Shows passive effects that have Foundry V14's "Show Icon?" set to "Always" (`showIcon: 2`). Falls back gracefully on V13.
  - **Always** — All passive effects are shown.

### Removed
- Removed non-English localizations (Italian, Spanish, Portuguese, Romanian).

## 14.0.3

### Fixed
- Clicking outside the effects panel now dismisses the effect description overlay.
- The panel z-index is elevated when the description overlay is visible so it renders above HUD elements (e.g. the dnd5e calendar widget), then resets when dismissed.
- Confirmation dialogs for delete/disable are positioned better.

## 14.0.2

### Fixed
- Added defensive null checks for DOM elements to prevent rendering crashes.
- Guarded `setPosition` calls against disconnected elements and lib-wrapper interactions that could cause null pointer errors.

## 14.0.1

### Changed
- Full rewrite for Foundry VTT V14 compatibility using `ApplicationV2` / `HandlebarsApplicationMixin`.
- Migrated from the legacy Application class to the modern V2 application framework.
- Updated all hooks and rendering lifecycle to V14 APIs.
- Added window resize listener to reposition the panel when the browser window changes size.