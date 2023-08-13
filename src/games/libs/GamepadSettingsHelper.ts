import { filterObject } from '../../libs/utils';
import { PersistentStore } from '../../stores/PersistentStore';

export interface GamepadSettings {
    _version: number;
    gamepadId: string;
    player: number;
}

/**
 * An object with key as gamepadId and value as GamepadSettings
 */
export type GamepadSettingsType<T> = Record<number, T & GamepadSettings>;

/**
 * A suite of gamepad settings helper functions
 */
export class GamepadSettingsHelper<T> {
    private readonly _settings: PersistentStore<GamepadSettingsType<T>>;

    /**
     * Initialize the gamepad helper
     * @param id Game ID
     * @param defaultValue Default gamepads settings
     */
    constructor(id: string, defaultValue: GamepadSettingsType<T>) {
        this._settings = new PersistentStore<GamepadSettingsType<T>>(id + '-gamepad-settings', defaultValue);
    }

    /**
     * Pair a gamepad with a player. A player can only be paired with one gamepad and vice versa.
     * If the player is already paired with another gamepad, the old gamepad settings will be removed. This is to prevent a new gamepad with the same index using another gamepad's settings.
     * @param gamepadIndex
     * @param gamepadId
     * @param player Player identifier number
     * @param otherSettings Other game-specific settings for the gamepad. This will be merged with the existing settings.
     * @param version Version of the gamepad custom settings in `otherSettings`. This should be used to determine if the settings should be updated.
     */
    pairGamepad(gamepadIndex: number, gamepadId: string, player: number, otherSettings: T, version = 1) {
        this._settings.update(settings => {
            settings = filterObject(settings, (_, value) => value.player !== player);
            return { ...settings, [gamepadIndex]: { _version: version, gamepadId, player, ...otherSettings } };
        });
    }

    /**
     * Get gamepad index for the player
     * @param player Player identifier number
     * @returns Gamepad index for the player, -1 if not found
     */
    getGamepadForPlayer(player: number) {
        const gamepadIndex = Object.keys(this.settings).find(index => this.settings[index].player === player);

        return gamepadIndex ? Number.parseInt(gamepadIndex) : -1;
    }

    get settings() {
        return this._settings.value;
    }
}
