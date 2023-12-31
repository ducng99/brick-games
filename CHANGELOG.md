# Changelog

All notable changes to this project will be documented in this file.

## [0.8.1] - 2023-11-06

### ⛰️  Features

- *(flappy-brick)* Added audio on jump and score

### 🐛 Bug Fixes

- *(audio)* Fixed audio error when start() called while playing

## [0.7.0] - 2023-10-05

### ⛰️  Features

- *(audio)* Added simple AudioHandler 🎶
- *(audio)* Added audio for all games (no bg music yet)
- *(audio)* Added sfx to GameMenu

### 🐛 Bug Fixes

- Fixed some errors with TS 5.2

### ⚙️ Miscellaneous Tasks

- *(deps)* Bump typescript from 5.0.4 to 5.2.2
- *(deps)* Bump @tsconfig/svelte from 5.0.0 to 5.0.2
- *(deps)* Bump sass from 1.66.1 to 1.67.0
- *(deps)* Bump @sveltejs/vite-plugin-svelte from 2.4.5 to 2.4.6
- *(deps)* Bump sass from 1.67.0 to 1.68.0
- *(deps)* Bump svelte from 4.2.0 to 4.2.1
- *(deps)* Bump dompurify from 3.0.5 to 3.0.6
- *(deps)* Bump postcss from 8.4.28 to 8.4.31
- *(deps-dev)* Bump eslint from 8.47.0 to 8.48.0
- *(deps-dev)* Bump eslint-plugin-n from 16.0.1 to 16.0.2
- *(deps-dev)* Bump eslint-plugin-svelte from 2.32.4 to 2.33.0
- *(deps-dev)* Bump svelte-check from 3.5.0 to 3.5.1
- *(deps-dev)* Bump eslint-plugin-svelte from 2.33.0 to 2.33.1
- *(deps-dev)* Bump eslint from 8.48.0 to 8.49.0
- *(deps-dev)* Bump eslint-plugin-n from 16.0.2 to 16.1.0
- *(deps-dev)* Bump svelte-check from 3.5.1 to 3.5.2
- *(deps-dev)* Bump @types/dompurify from 3.0.2 to 3.0.3
- *(deps-dev)* Bump eslint-plugin-svelte from 2.33.1 to 2.33.2
- *(deps-dev)* Bump eslint from 8.49.0 to 8.50.0

## [0.6.4] - 2023-08-20

### ⛰️  Features

- Added spinning LetterC
- Returns gamepadIndex which button was pressed
- Added shoot-bricks game 🎉

### ⚙️ Miscellaneous Tasks

- *(deps)* Bump sass from 1.65.1 to 1.66.1
- *(deps-dev)* Bump eslint-plugin-import from 2.28.0 to 2.28.1
- Only checks standard mapping gamepad for axes in range

## [0.6.3] - 2023-08-14

### ⛰️  Features

- *(pong)* Added Pong 3 with power 💪

### 🐛 Bug Fixes

- Fixed incorrect letter B rotation

### 🎨 Styling

- *(modal)* Better button select highlighting
- Re-style modal borders

## [0.6.2+patch1] - 2023-08-13

### 🐛 Bug Fixes

- *(modal)* Fixed incorrect syntax to unsubscribe

### ⚙️ Miscellaneous Tasks

- *(action)* Use bun to run actions

## [0.6.2] - 2023-08-13

### ⛰️  Features

- *(car-racing)* Added engine start rumbling on start
- *(car-racing)* Added vibrating on explosion
- *(pong)* Added vibration on collision

### 🐛 Bug Fixes

- *(pong)* Fixed `onBallCollideWithPaddle` not called when paddle moved

## [0.6.1] - 2023-08-13

### ⛰️  Features

- *(car-racing)* Added joystick support
- *(pong)* Added gamepad support for Pong 2

### 🐛 Bug Fixes

- Fixed variant games share storage with main game

### 🚜 Refactor

- *(gamepad)* Simplify unsubscribing axis listeners

## [0.6.0] - 2023-08-13

### ⛰️  Features

- *(gamepad)* Added support function to vibrate
- *(gamepad)* Added joystick support 🕹
- *(gamepad)* Added joystick support to Modals, GameMenu and SplashScreen
- *(gamepad)* Added gamepad support for games brain
- *(modal)* Added `onOpen` and `onClose` callbacks
- *(modal)* Added DOMPurifiy sanitize modal content
- *(persistentstore)* Added lz-string compression
- *(pong)* Added gamepad support for Pong v1

### 🐛 Bug Fixes

- Fixed modal ESC key stop showing other modals in queue

### 🚜 Refactor

- *(Modal)* Now use UUID as identifier instead of index
- *(utils)* Renamed `pad` to `padLeft`
- Removed using `window` object 👀

### ⚙️ Miscellaneous Tasks

- *(action)* Lint action now runs svelte-check
- *(action)* Fixed lint not triggering on src file change
- *(deps)* Bump dependencies
- *(deps)* Bump vite to v4.4.9
- *(deps)* Bump @sveltejs/vite-plugin-svelte to v2.4.4
- *(deps)* Bump svelte from 4.1.2 to 4.2.0
- *(deps)* Bump @sveltejs/vite-plugin-svelte from 2.4.4 to 2.4.5
- *(deps)* Bump sass from 1.64.2 to 1.65.1
- *(deps-dev)* Bump svelte-check from 3.4.6 to 3.5.0
- *(deps-dev)* Bump eslint from 8.46.0 to 8.47.0

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

