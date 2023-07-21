interface GamepadInfo {
    controller: Gamepad;
    buttonsDown: Set<number>;
    buttonDownListeners: Map<number, Set<() => void>>;
    buttonUpListeners: Map<number, Set<() => void>>;
}

const gamepads: Record<number, GamepadInfo> = {};
const gamepadConnectedCallbacks = new Set<(gamepadIndex: number) => void>();
const gamepadDisconnectedCallbacks = new Set<(gamepadIndex: number) => void>();
const gamepadButtonDownCallbacks = new Map<number, Set<() => void>>();
const gamepadButtonUpCallbacks = new Map<number, Set<() => void>>();

window.addEventListener('gamepadconnected', function (e) {
    setupGamepad(e.gamepad);

    gamepadConnectedCallbacks.forEach((callback) => {
        callback(e.gamepad.index);
    });
});

window.addEventListener('gamepaddisconnected', function (e) {
    if (e.gamepad.index in gamepads) {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete gamepads[e.gamepad.index];

        gamepadDisconnectedCallbacks.forEach((callback) => {
            callback(e.gamepad.index);
        });
    }
});

export function updateGamepads() {
    if ('getGamepads' in navigator) {
        navigator.getGamepads().forEach((newGamepad) => {
            if (newGamepad) {
                setupGamepad(newGamepad);
            }
        });
    } else if ('webkitGetGamepads' in navigator) {
        // @ts-expect-error - webkitGetGamepads is not in the Gamepad API
        navigator.webkitGetGamepads().forEach((newGamepad: Gamepad | null) => {
            if (newGamepad) {
                setupGamepad(newGamepad);
            }
        });
    }
}

function setupGamepad(gamepad: Gamepad) {
    const gamepadInfo = gamepads[gamepad.index];

    if (gamepadInfo) {
        if (gamepad.timestamp > gamepadInfo.controller.timestamp) {
            gamepadInfo.controller = gamepad;

            gamepad.buttons.forEach((button, index) => {
                if (button.pressed) {
                    if (!gamepadInfo.buttonsDown.has(index)) {
                        gamepadInfo.buttonsDown.add(index);
                        gamepadInfo.buttonDownListeners.get(index)?.forEach((callback) => { callback(); });
                        gamepadButtonDownCallbacks.get(index)?.forEach((callback) => { callback(); });
                    }
                } else {
                    gamepadInfo.buttonsDown.delete(index);
                    gamepadInfo.buttonUpListeners.get(index)?.forEach((callback) => { callback(); });
                    gamepadButtonUpCallbacks.get(index)?.forEach((callback) => { callback(); });
                }
            });
        }
    } else {
        gamepads[gamepad.index] = {
            controller: gamepad,
            buttonsDown: new Set(gamepad.buttons.filter((button) => button.pressed).map((_, index) => index)),
            buttonDownListeners: new Map(),
            buttonUpListeners: new Map()
        };
    }
}

export function addGamepadConnectedListener(callback: (gamepadIndex: number) => void) {
    gamepadConnectedCallbacks.add(callback);
}

export function removeGamepadConnectedListener(callback: (gamepadIndex: number) => void) {
    gamepadConnectedCallbacks.delete(callback);
}

export function addGamepadDisconnectedListener(callback: (gamepadIndex: number) => void) {
    gamepadDisconnectedCallbacks.add(callback);
}

export function removeGamepadDisconnectedListener(callback: (gamepadIndex: number) => void) {
    gamepadDisconnectedCallbacks.delete(callback);
}

export function addGamepadButtonDownListener(button: number, callback: () => void, gamepadIndex?: number) {
    if (gamepadIndex) {
        if (gamepadIndex in gamepads) {
            const gamepadInfo = gamepads[gamepadIndex];

            if (!gamepadInfo.buttonDownListeners.has(button)) {
                gamepadInfo.buttonDownListeners.set(button, new Set());
            }

            gamepadInfo.buttonDownListeners.get(button)?.add(callback);
        }
    } else {
        if (!gamepadButtonDownCallbacks.has(button)) {
            gamepadButtonDownCallbacks.set(button, new Set());
        }

        gamepadButtonDownCallbacks.get(button)?.add(callback);
    }

    return callback;
}

export function removeGamepadButtonDownListener(button: number, callback: () => void, gamepadIndex?: number) {
    if (gamepadIndex) {
        if (gamepadIndex in gamepads) {
            gamepads[gamepadIndex].buttonDownListeners.get(button)?.delete(callback);
        }
    } else {
        gamepadButtonDownCallbacks.get(button)?.delete(callback);
    }
}

export function addGamepadButtonUpListener(button: number, callback: () => void, gamepadIndex?: number) {
    if (gamepadIndex) {
        if (gamepadIndex in gamepads) {
            const gamepadInfo = gamepads[gamepadIndex];

            if (!gamepadInfo.buttonUpListeners.has(button)) {
                gamepadInfo.buttonUpListeners.set(button, new Set());
            }

            gamepadInfo.buttonUpListeners.get(button)?.add(callback);
        }
    } else {
        if (!gamepadButtonUpCallbacks.has(button)) {
            gamepadButtonUpCallbacks.set(button, new Set());
        }

        gamepadButtonUpCallbacks.get(button)?.add(callback);
    }
}

export function removeGamepadButtonUpListener(button: number, callback: () => void, gamepadIndex?: number) {
    if (gamepadIndex) {
        if (gamepadIndex in gamepads) {
            gamepads[gamepadIndex].buttonUpListeners.get(button)?.delete(callback);
        }
    } else {
        gamepadButtonUpCallbacks.get(button)?.delete(callback);
    }
}

/**
 * Check if a button is down or if any button is down.
 * @param button If specified, checks if the button is being pressed. Otherwise, checks if any button is being pressed.
 * @param gamepadIndex If specified, only checks the specified gamepad. Otherwise, checks all gamepads.
 * @returns `true` if the button is down or if any button is down.
 */
export function isGamepadButtonDown(button?: number, gamepadIndex?: number): boolean {
    if (gamepadIndex) {
        if (gamepadIndex in gamepads) {
            const buttonsPressed = gamepads[gamepadIndex]?.buttonsDown;

            if (buttonsPressed) {
                if (button) {
                    return buttonsPressed.has(button);
                }

                return buttonsPressed.size > 0;
            }
        }
    } else {
        const _gamepads = Object.values(gamepads);

        let isDown = false;

        for (let i = 0; i < _gamepads.length && !isDown; i++) {
            const gamepad = _gamepads[i];

            if (typeof button === 'number') {
                isDown = gamepad.buttonsDown.has(button);
            } else {
                isDown = gamepad.buttonsDown.size > 0;
            }
        }

        return isDown;
    }

    return false;
}

/**
 * Standard button layout.
 * Names follow XBox controller layout.
 */
export enum GamepadStandardButton {
    A,
    B,
    X,
    Y,
    LeftBumper,
    RightBumper,
    LeftTrigger,
    RightTrigger,
    Back,
    Start,
    LeftStick,
    RightStick,
    DPadUp,
    DPadDown,
    DPadLeft,
    DPadRight
}
