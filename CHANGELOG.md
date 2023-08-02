# Changelog

All notable changes to this project will be documented in this file.

## [0.5.2] - 2023-08-02

### ⛰️  Features

- *(gamepad)* Added gamepad events in GameMenu, SplashScreen and car-racing
- Added Gamepad API support 🎮
- Added Modal 🎉 (beta)

### 🐛 Bug Fixes

- Fixed GameMenu incorrect button order to change game variant
- Fixed game load fails once when renderer size change

### 🚜 Refactor

- *(GameMenu)* Move `loadGame` outside of class
- Cleaner renderer size update code

### ⚙️ Miscellaneous Tasks

- *(dep)* Bump some deps
- *(deps)* Bump vite from 4.4.4 to 4.4.6
- *(deps)* Bump sass from 1.63.6 to 1.64.1
- *(deps)* Bump svelte from 4.0.5 to 4.1.1
- *(deps-dev)* Bump eslint-plugin-svelte from 2.32.2 to 2.32.4
- *(deps-dev)* Bump eslint from 8.45.0 to 8.46.0

## [0.5.1] - 2023-07-20

### ⛰️  Features

- Added Hi-score persistant storage for each game

### ⚙️ Miscellaneous Tasks

- *(deps)* Bump svelte-check from 3.4.5 to 3.4.6
- *(deps)* Bump vite from 4.4.2 to 4.4.4
- *(deps-dev)* Bump eslint from 8.44.0 to 8.45.0
- *(deps-dev)* Bump eslint-config-standard-with-typescript
- *(deps-dev)* Bump eslint-plugin-n from 15.7.0 to 16.0.1

## [0.5.0] - 2023-07-17

### ⛰️  Features

- *(pong)* Added second variant of Pong 🎉
- [**breaking**] Added support for multiple game variants

### 🐛 Bug Fixes

- Fixed resizing renderer cause game to not render on start

### 🚜 Refactor

- *(KeyboardHandler)* Changed `Map` to `Object` to store callbacks

## [0.4.0] - 2023-07-14

### ⛰️  Features

- *(pong)* Random ball start direction
- [**breaking**] Allow games to specify renderer width & height

### 🚜 Refactor

- [**breaking**] Reworked how renderer sizing works

### ⚙️ Miscellaneous Tasks

- *(pong)* Ball initial speed is now slower
- *(pong)* Makes paddle smaller
- [**breaking**] RendererMini cannot be resized for magic reasons 🧝‍♀️

## [0.3.2] - 2023-07-13

### ⛰️  Features

- *(pong)* Ball randomly go faster & can go straight

### ⚙️ Miscellaneous Tasks

- *(pong)* Increase default speed of ball
- Added headers and footer to CHANGELOG.md

## [0.3.1] - 2023-07-12

### 🐛 Bug Fixes

- Fixed renderer mini not cleared after game stopped

## [0.3.0] - 2023-07-12

### ⛰️  Features

- *(pong)* Released Pong game 🎉
- Added LetterB animmation
- [**breaking**] Added X, Y offset to collision box
- Added entity predict collision using offset
- Added "Escape" key to return to game menu

### 🐛 Bug Fixes

- *(car-racing)* Fixed MenuAnimation not clearing all blocks
- Fixed negative game index in GameMenu
- Fixed reload on GameMenu destroys its instance
- Fixed restart game might load both game and menu
- Fixed animation runs after game started

### 🚜 Refactor

- [**breaking**] Frame timestamp now comes from `requestAnimationFrame`
- Score is now a string, updatable per game

### ⚡ Performance

- Improved entity move & sprite update logic

### ⚙️ Miscellaneous Tasks

- *(deps)* Bump svelte from 4.0.4 to 4.0.5
- *(deps)* Bump svelte from 4.0.4 to 4.0.5
- *(deps)* Bump semver from 6.3.0 to 6.3.1
- *(deps)* Bump svelte-check from 3.4.4 to 3.4.5
- *(deps)* Bump semver from 6.3.0 to 6.3.1
- *(deps)* Bump svelte-check from 3.4.4 to 3.4.5
- *(deps)* Bump vite from 4.3.9 to 4.4.2
- *(deps)* Bump vite from 4.3.9 to 4.4.2
- *(deps)* Bump @typescript-eslint/eslint-plugin from 5.61.0 to 5.62.0
- *(eslint)* Disable enum undefined
- Allow provide empty frames array in `AnimatedFrames`

## [0.2.2] - 2023-07-08

### ⛰️  Features

- Added splash screen animation

### 🚜 Refactor

- Moved GameMenu to its own file

## [0.2.1] - 2023-07-06

### 🐛 Bug Fixes

- Fixed game restart loads menu instead

### 🚜 Refactor

- [**breaking**] Makes store value available without `get`

## [0.2.0] - 2023-07-06

### ⛰️  Features

- *(AnimatedFrames)* Added infinite loop mode
- Added debug mode
- Added a Game Menu 🎉

### 🐛 Bug Fixes

- Fixed first frame of AnimatedFrame not showing after clearSquare

### 🚜 Refactor

- Refactored store/get renderer instance
- Changed how Brain functions are called in subclass

### 🎨 Styling

- *(car-racing)* Slower wipe transition when has 0 health

### ⚙️ Miscellaneous Tasks

- *(action)* Added Check ESLint workflow
- *(deps)* Bump dependencies
- *(lint)* Only lint specified extensions

## [0.1.2] - 2023-07-01

### ⛰️  Features

- *(car-racing)* Added wipe bottom-to-top transition
- *(car-racing)* Added health and display in sidebar
- Added RendererMini in sidebar

### 🚜 Refactor

- Refactored AnimatedEntity class, splitting to AnimatedFrames
- Changed how animated frames/sprites transition
- Added `Sprite` type
- Let svelte update renderer instance

### 🎨 Styling

- Make brick's border thicker

### ⚙️ Miscellaneous Tasks

- *(car-racing)* Walls are now displayed on game start

## [0.1.1+patch2] - 2023-06-27

### 🐛 Bug Fixes

- *(deploy)* Fixed incorrect paths for fonts

## [0.1.1+patch1] - 2023-06-27

### 🐛 Bug Fixes

- *(deploy)* Fixed incorrect GH base path

## [0.1.1] - 2023-06-27

### 🎨 Styling

- Changed size to follow `vmin` instead of `px`

### ⚙️ Miscellaneous Tasks

- *(deploy)* Added deploy + release workflows
- *(deps-dev)* Bump @typescript-eslint/eslint-plugin

