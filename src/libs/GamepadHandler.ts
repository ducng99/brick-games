import { clamp } from './utils';

export interface GamepadAxisRangeListener {
    range: [lower: number, upper: number];
    callback: () => void;
}

interface GamepadInfo {
    controller: Gamepad;
    axes: readonly number[];
    buttonsDown: Set<number>;
    buttonDownListeners: Map<number, Set<() => void>>;
    buttonUpListeners: Map<number, Set<() => void>>;
    axisInRangeListeners: Map<number, Set<GamepadAxisRangeListener>>;
    axisOutRangeListeners: Map<number, Set<GamepadAxisRangeListener>>;
}

type GamepadConnectionCallback = (gamepadIndex: number, gamepadId: string) => void;

const stickDeadzone = 0.2;
const stickInRangeTriggerZone = 0.6;

const gamepads: Record<number, GamepadInfo> = {};
const gamepadConnectedCallbacks = new Set<GamepadConnectionCallback>();
const gamepadDisconnectedCallbacks = new Set<GamepadConnectionCallback>();
const gamepadButtonDownCallbacks = new Map<number, Set<() => void>>();
const gamepadButtonUpCallbacks = new Map<number, Set<() => void>>();
const gamepadAxisInRangeCallbacks = new Map<number, Set<GamepadAxisRangeListener>>();
const gamepadAxisOutRangeCallbacks = new Map<number, Set<GamepadAxisRangeListener>>();

addEventListener('gamepadconnected', (e) => {
    setupGamepad(e.gamepad);

    gamepadConnectedCallbacks.forEach((callback) => {
        callback(e.gamepad.index, e.gamepad.id);
    });
});

addEventListener('gamepaddisconnected', (e) => {
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
                if ((typeof button === 'number' && button === 1) || button.pressed) {
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

            gamepad.axes.forEach((axis, index) => {
                const inRangeHandler = (listener: GamepadAxisRangeListener) => {
                    if (axis >= listener.range[0] && axis <= listener.range[1] && (gamepadInfo.axes[index] < listener.range[0] || gamepadInfo.axes[index] > listener.range[1])) {
                        listener.callback();
                    }
                };

                gamepadInfo.axisInRangeListeners.get(index)?.forEach(inRangeHandler);
                gamepadAxisInRangeCallbacks.get(index)?.forEach(inRangeHandler);

                const outOfRangeHandler = (listener: GamepadAxisRangeListener) => {
                    if ((axis < listener.range[0] || axis > listener.range[1]) && gamepadInfo.axes[index] >= listener.range[0] && gamepadInfo.axes[index] <= listener.range[1]) {
                        listener.callback();
                    }
                };

                gamepadInfo.axisOutRangeListeners.get(index)?.forEach(outOfRangeHandler);
                gamepadAxisOutRangeCallbacks.get(index)?.forEach(outOfRangeHandler);
            });

            gamepadInfo.axes = gamepad.axes;
        }
    } else {
        gamepads[gamepad.index] = {
            controller: gamepad,
            axes: gamepad.axes,
            buttonsDown: new Set(gamepad.buttons.filter((button) => button.pressed).map((_, index) => index)),
            buttonDownListeners: new Map(),
            buttonUpListeners: new Map(),
            axisInRangeListeners: new Map(),
            axisOutRangeListeners: new Map()
        };

        gamepads[gamepad.index].buttonsDown.forEach((button) => {
            gamepadButtonDownCallbacks.get(button)?.forEach((callback) => { callback(); });
        });

        gamepads[gamepad.index].axes.forEach((axis, index) => {
            gamepadAxisInRangeCallbacks.get(index)?.forEach((listener) => {
                if (axis >= listener.range[0] && axis <= listener.range[1]) {
                    listener.callback();
                }
            });
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
    if (typeof gamepadIndex === 'number') {
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
    if (typeof gamepadIndex === 'number') {
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
    if (typeof gamepadIndex === 'number') {
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
    if (typeof gamepadIndex === 'number') {
        if (gamepadIndex in gamepads) {
            gamepads[gamepadIndex].buttonUpListeners.get(button)?.delete(callback);
        }
    } else {
        gamepadButtonUpCallbacks.get(button)?.delete(callback);
    }
}

/**
 * Add a callback to be called when a gamepad axis enters a specified range.
 * @param axis Axis index
 * @param listener Listener containing the range to check (0.0 to 1.0) and the callback
 * @param gamepadIndex Gamepad index. If not provided, checks all gamepads.
 */
export function addGamepadAxisInRangeListener(axis: number, listener: GamepadAxisRangeListener, gamepadIndex?: number) {
    if (typeof gamepadIndex === 'number') {
        if (gamepadIndex in gamepads) {
            const gamepadInfo = gamepads[gamepadIndex];

            if (!gamepadInfo.axisInRangeListeners.has(axis)) {
                gamepadInfo.axisInRangeListeners.set(axis, new Set());
            }

            gamepadInfo.axisInRangeListeners.get(axis)?.add(listener);
        }
    } else {
        if (!gamepadAxisInRangeCallbacks.has(axis)) {
            gamepadAxisInRangeCallbacks.set(axis, new Set());
        }

        gamepadAxisInRangeCallbacks.get(axis)?.add(listener);
    }
}

/**
 * Remove a previously added callback to be called when a gamepad axis enters a range.
 * @param axis Axis index
 * @param listener Listener was added with {@link addGamepadAxisInRangeListener}.
 * @param gamepadIndex Gamepad index. If not provided, remove callback in global listeners list.
 */
export function removeGamepadAxisInRangeListener(axis: number, listener: GamepadAxisRangeListener, gamepadIndex?: number) {
    if (typeof gamepadIndex === 'number') {
        if (gamepadIndex in gamepads) {
            gamepads[gamepadIndex].axisInRangeListeners.get(axis)?.delete(listener);
        }
    } else {
        gamepadAxisInRangeCallbacks.get(axis)?.delete(listener);
    }
}

/**
 * Add a callback to be called when a gamepad axis is out of range.
 * @param axis Axis index
 * @param listener Listener containing the range to check (0.0 to 1.0) and the callback
 * @param gamepadIndex Gamepad index. If not provided, checks all gamepads.
 */
export function addGamepadAxisOutOfRangeListener(axis: number, listener: GamepadAxisRangeListener, gamepadIndex?: number) {
    if (typeof gamepadIndex === 'number') {
        if (gamepadIndex in gamepads) {
            const gamepadInfo = gamepads[gamepadIndex];

            if (!gamepadInfo.axisOutRangeListeners.has(axis)) {
                gamepadInfo.axisOutRangeListeners.set(axis, new Set());
            }

            gamepadInfo.axisOutRangeListeners.get(axis)?.add(listener);
        }
    } else {
        if (!gamepadAxisOutRangeCallbacks.has(axis)) {
            gamepadAxisOutRangeCallbacks.set(axis, new Set());
        }

        gamepadAxisOutRangeCallbacks.get(axis)?.add(listener);
    }
}

/**
 * Remove a previously added callback to be called when a gamepad axis is out of range.
 * @param axis Axis index
 * @param listener Listener was added with {@link addGamepadAxisOutOfRangeListener}.
 * @param gamepadIndex Gamepad index. If not provided, remove callback in global listeners list.
 */
export function removeGamepadAxisOutOfRangeListener(axis: number, listener: GamepadAxisRangeListener, gamepadIndex?: number) {
    if (typeof gamepadIndex === 'number') {
        if (gamepadIndex in gamepads) {
            gamepads[gamepadIndex].axisOutRangeListeners.get(axis)?.delete(listener);
        }
    } else {
        gamepadAxisOutRangeCallbacks.get(axis)?.delete(listener);
    }
}

/**
 * Add a callback to be called when a gamepad axis in is positive range. A default high value is used for the range.
 * This function is aimed to be used for menu navigation.
 * @param axis Axis index
 * @param callback Callback to be called when the axis has positive value.
 * @param gamepadIndex Gamepad index. If not provided, checks all gamepads.
 * @returns Listener object, can be passed to {@link removeGamepadAxisInRangeListener}
 * @uses {@link addGamepadAxisInRangeListener}
 */
export function addGamepadAxisInRangePositiveListener(axis: number, callback: () => void, gamepadIndex?: number): GamepadAxisRangeListener {
    const listener: GamepadAxisRangeListener = { range: [stickInRangeTriggerZone, 1], callback };
    addGamepadAxisInRangeListener(axis, listener, gamepadIndex);

    return listener;
}

/**
 * Add a callback to be called when a gamepad axis has negative value. A default high value is used for the range.
 * This function is aimed to be used for menu navigation.
 * @param axis Axis index
 * @param callback Callback to be called when the axis has negative value.
 * @param gamepadIndex Gamepad index. If not provided, checks all gamepads.
 * @returns Listener object, can be passed to {@link removeGamepadAxisInRangeListener}
 * @uses {@link addGamepadAxisInRangeListener}
 */
export function addGamepadAxisInRangeNegativeListener(axis: number, callback: () => void, gamepadIndex?: number): GamepadAxisRangeListener {
    const listener: GamepadAxisRangeListener = { range: [-1, -stickInRangeTriggerZone], callback };
    addGamepadAxisInRangeListener(axis, listener, gamepadIndex);

    return listener;
}

/**
 * Add a callback to be called when a gamepad axis no longer has positive value. A default high value is used for the range.
 * This function is aimed to be used for menu navigation.
 * @param axis Axis index
 * @param callback Callback to be called when the axis no longer has positive value.
 * @param gamepadIndex Gamepad index. If not provided, checks all gamepads.
 * @returns Listener object, can be passed to {@link removeGamepadAxisOutOfRangeListener}
 * @uses {@link addGamepadAxisOutOfRangeListener}
 */
export function addGamepadAxisOutOfRangePositiveListener(axis: number, callback: () => void, gamepadIndex?: number): GamepadAxisRangeListener {
    const listener: GamepadAxisRangeListener = { range: [stickInRangeTriggerZone, 1], callback };
    addGamepadAxisOutOfRangeListener(axis, listener, gamepadIndex);

    return listener;
}

/**
 * Add a callback to be called when a gamepad axis no longer has negative value. A default high value is used for the range.
 * This function is aimed to be used for menu navigation.
 * @param axis Axis index
 * @param callback Callback to be called when the axis no longer has negative value.
 * @param gamepadIndex Gamepad index. If not provided, checks all gamepads.
 * @returns Listener object, can be passed to {@link removeGamepadAxisOutOfRangeListener}
 * @uses {@link addGamepadAxisOutOfRangeListener}
 */
export function addGamepadAxisOutOfRangeNegativeListener(axis: number, callback: () => void, gamepadIndex?: number): GamepadAxisRangeListener {
    const listener: GamepadAxisRangeListener = { range: [-1, -stickInRangeTriggerZone], callback };
    addGamepadAxisOutOfRangeListener(axis, listener, gamepadIndex);

    return listener;
}

/**
 * Check if a button is down or if any button is down.
 * @param button If specified, checks if the button is being pressed. Otherwise, checks if any button is being pressed.
 * @param gamepadIndex If specified, only checks the specified gamepad. Otherwise, checks all gamepads.
 * @returns `true` if the button is down or if any button is down.
 */
export function isGamepadButtonDown(button?: number, gamepadIndex?: number): boolean {
    if (typeof gamepadIndex === 'number') {
        if (gamepadIndex in gamepads) {
            const buttonsPressed = gamepads[gamepadIndex]?.buttonsDown;

            if (buttonsPressed) {
                if (typeof button === 'number') {
                    return buttonsPressed.has(button);
                }

                return buttonsPressed.size > 0;
            }
        }
    } else {
        const _gamepads = Object.values(gamepads);

        for (let i = 0; i < _gamepads.length; i++) {
            const gamepad = _gamepads[i];

            if (typeof button === 'number') {
                if (gamepad.buttonsDown.has(button)) {
                    return true;
                }
            } else if (gamepad.buttonsDown.size > 0) {
                return true;
            }
        }
    }

    return false;
}

/**
 * Check if a stick axis is in range.
 * @param axis The axis to check. If not provided, checks all axes.
 * @param range An array containing lower and upper bounds of the range. From -1 to 1.
 * @param gamepadIndex Gamepad index. If not provided, checks all gamepads.
 * @returns `true` if the stick is down. `false` if the stick is not down or if the gamepad does not support the specified axis.
 */
export function isGamepadStickDown(range: [lower: number, upper: number], axis?: number, gamepadIndex?: number): boolean {
    if (typeof gamepadIndex === 'number') {
        if (gamepadIndex in gamepads) {
            const axes = gamepads[gamepadIndex].axes;

            if (typeof axis === 'number') {
                if (axes.length > axis) {
                    const value = axes[axis];
                    return value >= range[0] && value <= range[1];
                }
            } else {
                for (let i = 0; i < axes.length; i++) {
                    const value = axes[i];

                    if (value >= range[0] && value <= range[1]) {
                        return true;
                    }
                }
            }
        }
    } else {
        const _gamepads = Object.values(gamepads);

        for (let i = 0; i < _gamepads.length; i++) {
            const gamepad = _gamepads[i];

            if (typeof axis === 'number') {
                if (gamepad.axes.length > axis) {
                    const value = gamepad.axes[axis];

                    if (value >= range[0] && value <= range[1]) {
                        return true;
                    }
                }
            } else {
                for (let j = 0; j < gamepad.axes.length; j++) {
                    const value = gamepad.axes[j];

                    if (value >= range[0] && value <= range[1]) {
                        return true;
                    }
                }
            }
        }
    }

    return false;
}

/**
 * Check if a stick is in the positive direction. A default deadzone value is used for the range.
 * @param axis The axis to check
 * @param gamepadIndex Gamepad index. If not provided, checks all gamepads.
 * @uses {@link isGamepadStickDown}
 * @returns `true` if the stick is down. `false` if the stick is not down or if the gamepad does not support the specified axis.
 */
export function isGamepadStickPositive(axis?: number, gamepadIndex?: number): boolean {
    return isGamepadStickDown([stickDeadzone, 1], axis, gamepadIndex);
}

/**
 * Check if a stick is in the negative direction. A default deadzone value is used for the range.
 * @param axis The axis to check
 * @param gamepadIndex Gamepad index. If not provided, checks all gamepads.
 * @uses {@link isGamepadStickDown}
 * @returns `true` if the stick is down. `false` if the stick is not down or if the gamepad does not support the specified axis.
 */
export function isGamepadStickNegative(axis?: number, gamepadIndex?: number): boolean {
    return isGamepadStickDown([-1, -stickDeadzone], axis, gamepadIndex);
}

/**
 * Check if the specified gamepad can vibrate.
 * @param gamepadIndex Gamepad to check
 * @returns `true` if the gamepad supports vibration.
 */
export function canGamepadVibrate(gamepadIndex: number): boolean {
    if (gamepadIndex in gamepads) {
        const controller = gamepads[gamepadIndex].controller;

        if ('hapticActuators' in controller) {
            const actuators = controller.hapticActuators;
            return actuators && actuators.length > 0;
        } else if ('vibrationActuator' in controller) {
            // @ts-expect-error - only in Chromium (unofficial feature)
            return !!controller.vibrationActuator;
        }
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
        intensity = clamp(intensity, 0, 1);

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

/**
 * Standard button layout.
 * Names follow XBox controller layout.
 */
export enum GamepadStandardAxis {
    LeftStickX,
    LeftStickY,
    RightStickX,
    RightStickY
}
