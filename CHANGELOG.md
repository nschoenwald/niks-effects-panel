# Changelog

All notable changes to **Nik's Effects Panel (`niks-effects-panel`)** are documented in this file.

## [14.4.0] - 2026-10-28
### Removed
- **Foundry v13 Support**:
  - The module now requires Foundry v14. Foundry v13 users can keep using [14.3.0](https://github.com/nschoenwald/niks-effects-panel/releases/tag/14.3.0).
  - Removed the code that only existed to run on v13: the passive effect fallback, the round/turn duration labels outside of combat and the expired-clock workaround.

## [14.3.0] - 2026-10-26
### Added
- **Effect Names on Hover**:
  - Hovering an effect icon shows the effect's name, so you can tell effects apart without opening them.
- **Keyboard Support**:
  - Effect icons can be reached with <kbd>Tab</kbd>. Press <kbd>Enter</kbd> or <kbd>Space</kbd> to open or close an effect's details.

### Changed
- **Panel Placement**:
  - The panel now sits in Foundry's own interface, right next to the sidebar. It moves along when the sidebar is opened or closed, when the camera dock is on the right, and when the UI is scaled, without any delay or animation.
  - Works with UI modules that change the sidebar's width.
  - If you use a UI scale other than 100%, your saved panel height may shift slightly once. Drag it back where you want it.
- **Effect Details**:
  - The "Temporary" and "Passive" tags are now translated like the rest of the panel.
  - Details that would run past the bottom of the screen now open further up, so they stay fully visible.
  - Effects without a description of their own only show "From …" when they come from an item that has a description.
- **Performance Improvements**:
  - Effect descriptions are only prepared when you open an effect's details, and are remembered until the effect changes. Before, every description was prepared again on every update.
  - Updating the panel no longer copies every effect.
  - The panel no longer updates on every combat turn or world time change when it shows no temporary effects.
  - The panel no longer updates whenever any token on the scene is hovered, moved or redrawn. It only updates when something changes for the token it shows.
  - Effect changes on other actors no longer update the panel.
  - The panel no longer looks up each effect's source every time it updates, and no longer saves its default position to your user data before you've moved it.
- **Effect Order**:
  - Temporary and passive effects keep the order they have on the actor.
- **Code Cleanup**:
  - Replaced the bundled drag library and jQuery with a few lines of plain code.
  - Permission settings are now stored as numbers. Existing worlds keep their settings.
  - Removed unused code, styles and translation strings left over from earlier versions.
  - The module's changelog is now linked from its package information.

### Fixed
- **Shift + Double-Click: Open Effect Sheet**:
  - Shift + double-clicking an effect now opens its sheet as described. Before, it did the same as a normal double-click.
- **Dragging the Panel**:
  - Releasing the mouse after dragging the panel no longer opens or closes the details of the effect under the cursor.
  - Fixed the panel saving its position several times per drag after it had updated a few times.
  - Fixed the panel jumping back to its old spot when dragged after the sidebar was opened or closed.
  - The panel can't be dragged past the bottom of the screen, also after the browser window was resized.
- **Durations**:
  - Effects without a duration now always show "Unlimited", also when Foundry is set to a language other than English.
  - Foundry v13: Effects that last a number of rounds or turns now show that duration outside of combat, instead of "Unlimited".
  - Foundry v13: Effects whose time has run out now get the orange expired clock.
- **Delete Dialog: Effect Names**:
  - Effects without a name are now called "Unknown Effect" in the dialog, instead of showing a raw translation key.
  - Effect names are shown as plain text in the dialog.
- **Shadow of the Demon Lord: Source Token Names**:
  - "Turn End" and "Turn Start" durations no longer show a wrong or empty token name when the effect's source can't be found.

## [14.2.0] - 2026-10-07
### Fixed
- **Aura Effects: Duplicate Icons**:
  - A token with a self-applying aura from the Aura Effects module no longer shows the aura twice. The copy applied to the token is hidden in favor of the aura itself.
  - Disabling or deleting the shown aura still updates the aura and everyone inside it, and Shift + double-click opens the full aura sheet.
  - Tokens that received the same aura more than once show it only once.

## [14.1.2] - 2026-07-26
### Added
- **Releases**:
  - New releases are now built and published automatically on GitHub.

## [14.0.8] - 2026-07-26
### Fixed
- **Deleted Tokens**:
  - Fixed the panel staying on screen after its token was deleted, until another token was selected.
  - The panel now also updates when tokens, actors, items, combats or a player's assigned character change.
  - An open effect description closes when its effect or token is removed.
  - Switching scenes no longer creates a second panel.

## [14.0.7]
### Added
- **Separate Temporary and Passive Effects**:
  - New setting to show or hide the line between temporary and passive effects.

### Changed
- **Disabled Effects: Clearer Look**:
  - Disabled effects are now greyed out with a subtle white stripe pattern, while keeping their frame, so the icon stays easy to recognize.

## [14.0.6]
### Fixed
- **Panel Above Windows**:
  - The panel no longer appears above character sheets and other windows. It is only raised while an effect description is open.

## [14.0.5]
### Fixed
- **Panel Off-Screen**:
  - The panel can no longer be dragged off the bottom of the screen.
  - A saved position is moved back on screen when the browser window is smaller than before.

## [14.0.4]
### Changed
- **Show Passive Effects: Three Options**:
  - The setting is now a dropdown:
    - **Never**: Passive effects are always hidden.
    - **If Always Visible** *(default)*: Shows passive effects whose "Show Icon?" is set to "Always" in Foundry v14. On v13, all passive effects are shown.
    - **Always**: All passive effects are shown.

### Removed
- **Translations**:
  - Removed the Italian, Spanish, Portuguese and Romanian translations.

## [14.0.3]
### Fixed
- **Effect Descriptions**:
  - Clicking outside the panel now closes the effect description.
  - The description now shows above HUD elements such as the dnd5e calendar.
- **Delete / Disable Dialog**:
  - The dialog now opens closer to the effect you clicked.

## [14.0.2]
### Fixed
- **Stability**:
  - Fixed errors that could break the panel while it was updating or being moved, including together with lib-wrapper.

## [14.0.1]
### Changed
- **Foundry v14 Support**:
  - Rebuilt for Foundry v14 on the new application framework.
  - The panel moves to the right place when the browser window is resized.
