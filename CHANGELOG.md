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

