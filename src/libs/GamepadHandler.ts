interface GamepadInfo {
    controller: Gamepad;
    buttonsDown: Set<number>;
    buttonDownListeners: Map<number, Set<() => void>>;
    buttonUpListeners: Map<number, Set<() => void>>;
}

type GamepadConnectionCallback = (gamepadIndex: number, gamepadId: string) => void;

const gamepads: Record<number, GamepadInfo> = {};
const gamepadConnectedCallbacks = new Set<GamepadConnectionCallback>();
const gamepadDisconnectedCallbacks = new Set<GamepadConnectionCallback>();
const gamepadButtonDownCallbacks = new Map<number, Set<() => void>>();
const gamepadButtonUpCallbacks = new Map<number, Set<() => void>>();

window.addEventListener('gamepadconnected', function (e) {
    setupGamepad(e.gamepad);

    gamepadConnectedCallbacks.forEach((callback) => {
        callback(e.gamepad.index, e.gamepad.id);
    });
});

window.addEventListener('gamepaddisconnected', function (e) {
    if (e.gamepad.index in gamepads) {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete gamepads[e.gamepad.index];

        gamepadDisconnectedCallbacks.forEach((callback) => {
            callback(e.gamepad.index, e.gamepad.id);
        });
    }
});

/**
 * Get all connected gamepads and update their state. Add new gamepads to the list if they are not already in it.
 * This function is called every frame.
 */
(function updateGamepads() {
    if ('getGamepads' in navigator) {
        navigator.getGamepads().forEach((newGamepad) => {
            if (newGamepad) {
                setupGamepad(newGamepad);
            }
        });

        requestAnimationFrame(updateGamepads);
    } else if ('webkitGetGamepads' in navigator) {
        // @ts-expect-error - webkitGetGamepads is not in the Gamepad API
        navigator.webkitGetGamepads().forEach((newGamepad: Gamepad | null) => {
            if (newGamepad) {
                setupGamepad(newGamepad);
            }
        });

        requestAnimationFrame(updateGamepads);
    }
})();

/**
 * Setup a new Gamepad object or update an existing one.
 * @param gamepad Gamepad object to setup
 */
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
                    if (gamepadInfo.buttonsDown.has(index)) {
                        gamepadInfo.buttonsDown.delete(index);
                        gamepadInfo.buttonUpListeners.get(index)?.forEach((callback) => { callback(); });
                        gamepadButtonUpCallbacks.get(index)?.forEach((callback) => { callback(); });
                    }
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

        gamepads[gamepad.index].buttonsDown.forEach((button) => {
            gamepadButtonDownCallbacks.get(button)?.forEach((callback) => { callback(); });
        });
    }
}

/**
 * Add a callback to be called when a new gamepad is connected.
 * @param callback Callback to be called when a new gamepad is connected.
 * @param initialCall If `true`, the callback will be called for all currently connected gamepads.
 */
export function addGamepadConnectedListener(callback: GamepadConnectionCallback, initialCall = true) {
    if (initialCall) {
        Object.values(gamepads).forEach((gamepad) => {
            callback(gamepad.controller.index, gamepad.controller.id);
        });
    }

    gamepadConnectedCallbacks.add(callback);
}

/**
 * Remove a previously added callback to be called when a new gamepad is connected.
 * @param callback Callback was added with {@link addGamepadConnectedListener}.
 */
export function removeGamepadConnectedListener(callback: GamepadConnectionCallback) {
    gamepadConnectedCallbacks.delete(callback);
}

/**
 * Add a callback to be called when a gamepad is disconnected.
 * @param callback Callback to be called when a gamepad is disconnected.
 */
export function addGamepadDisconnectedListener(callback: GamepadConnectionCallback) {
    gamepadDisconnectedCallbacks.add(callback);
}

/**
 * Remove a previously added callback to be called when a gamepad is disconnected.
 * @param callback Callback was added with {@link addGamepadDisconnectedListener}.
 */
export function removeGamepadDisconnectedListener(callback: GamepadConnectionCallback) {
    gamepadDisconnectedCallbacks.delete(callback);
}

/**
 * Add a callback to be called when a gamepad button is pressed.
 * @param button Gamepad button index
 * @param callback Callback to be called when the button is pressed.
 * @param gamepadIndex Gamepad index. If not provided, checks all gamepads.
 * @returns `true` if the button is down or if any button is down.
 */
export function addGamepadButtonDownListener(button: number, callback: () => void, gamepadIndex?: number) {
    if (typeof gamepadIndex !== 'undefined') {
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

/**
 * Remove a previously added callback to be called when a gamepad button is pressed.
 * @param button Button index
 * @param callback Callback was added with {@link addGamepadButtonDownListener}.
 * @param gamepadIndex Gamepad index. If not provided, remove callback in global listeners list.
 */
export function removeGamepadButtonDownListener(button: number, callback: () => void, gamepadIndex?: number) {
    if (typeof gamepadIndex !== 'undefined') {
        if (gamepadIndex in gamepads) {
            gamepads[gamepadIndex].buttonDownListeners.get(button)?.delete(callback);
        }
    } else {
        gamepadButtonDownCallbacks.get(button)?.delete(callback);
    }
}

/**
 * Add a callback to be called when a gamepad button is released.
 * @param button Button index
 * @param callback Callback to be called when the button is released.
 * @param gamepadIndex Gamepad index. If not provided, checks all gamepads.
 */
export function addGamepadButtonUpListener(button: number, callback: () => void, gamepadIndex?: number) {
    if (typeof gamepadIndex !== 'undefined') {
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

/**
 * Remove a previously added callback to be called when a gamepad button is released.
 * @param button Button index
 * @param callback Callback was added with {@link addGamepadButtonUpListener}.
 * @param gamepadIndex Gamepad index. If not provided, remove callback in global listeners list.
 */
export function removeGamepadButtonUpListener(button: number, callback: () => void, gamepadIndex?: number) {
    if (typeof gamepadIndex !== 'undefined') {
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
    if (typeof gamepadIndex !== 'undefined') {
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
 * Vibrates a gamepad with specified intensity and duration. Returns after the vibration(s) finish.
 * @param gamepadIndex Gamepad to vibrate
 * @param intensity Intensity of the vibration (0.0 - 1.0)
 * @param duration Duration of the vibration in milliseconds
 * @returns `true` if the gamepad supports vibration and the vibration has completed.
 */
export async function vibrateGamepad(gamepadIndex: number, intensity: number, duration: number) {
    if (gamepadIndex in gamepads) {
        const controller = gamepads[gamepadIndex].controller;

        if ('hapticActuators' in controller) {
            const actuators = controller.hapticActuators;

            if (actuators && actuators.length > 0) {
                // @ts-expect-error - experimental GamepadAPI feature
                await Promise.all(actuators.map(actuator => actuator.pulse(intensity, duration)));

                return true;
            }

            return false;
        } else if ('vibrationActuator' in controller) {
            // @ts-expect-error - only in Chromium (unofficial feature)
            const actuator = controller.vibrationActuator;

            if (actuator) {
                await actuator.playEffect(actuator.type, {
                    startDelay: 0,
                    duration,
                    weakMagnitude: intensity,
                    strongMagnitude: intensity
                });
            }

            return true;
        }
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
