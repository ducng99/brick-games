import AudioSoundClick from '@/assets/sounds/click.wav?url';
import AudioSoundLaserShoot from '@/assets/sounds/laserShoot.wav?url';
import AudioSoundExplosion from '@/assets/sounds/explosion.wav?url';
import AudioSoundHit from '@/assets/sounds/hit.wav?url';
import AudioSoundPickupCoin from '@/assets/sounds/pickupCoin.wav?url';
import AudioSoundJump from '@/assets/sounds/jump.wav?url';

const audioCtx = new AudioContext();

export enum AudioTypes {
    Click,
    LaserShoot,
    Explosion,
    Hit,
    PickupCoin,
    Jump,
}

const audiosCache: Partial<Record<AudioTypes | string, AudioBuffer>> = {};

/**
 * Preloads all the audio files
 */
export function initAudio() {
    Promise.all([
        cacheAudio(AudioTypes.Click, AudioSoundClick),
        cacheAudio(AudioTypes.LaserShoot, AudioSoundLaserShoot),
        cacheAudio(AudioTypes.Explosion, AudioSoundExplosion),
        cacheAudio(AudioTypes.Hit, AudioSoundHit),
        cacheAudio(AudioTypes.PickupCoin, AudioSoundPickupCoin),
        cacheAudio(AudioTypes.Jump, AudioSoundJump)
    ]).catch(err => {
        console.error(err);
    });
}

/**
 * Loads an audio file and caches it
 * @param type The type of the audio to cache
 * @param filepath The path to the audio file
 */
async function cacheAudio(type: AudioTypes, filepath: string) {
    if (!(type in audiosCache)) {
        audiosCache[type] = await loadAudioFile(filepath);
    }
}

/**
 * Loads an audio file and returns the audio buffer
 * @param filepath The path to the audio file
 * @returns The audio buffer
 */
async function loadAudioFile(filepath: string) {
    const response = await fetch(filepath);
    const arrayBuffer = await response.arrayBuffer();
    return await audioCtx.decodeAudioData(arrayBuffer);
}

/**
 * Plays an audio
 * @param type The type of the audio to play
 * @param repeat The number of times to repeat the audio. Default is 1
 */
export function getAudioPlayer(type: AudioTypes): AudioPlayer | null {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => { console.error('Failed to resume audio context'); });
    }

    if (type in audiosCache && typeof audiosCache[type] !== 'undefined') {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return new AudioPlayer(audiosCache[type]!);
    }

    return null;
}

/**
 * Plays a custom audio using a path to the audio file. The file will be fetched and cached
 * @param filepath The path to the audio file
 * @param repeat The number of times to repeat the audio. Default is 1
 * @returns The audio buffer
 */
export async function getCustomAudioPlayer(filepath: string) {
    if (!(filepath in audiosCache)) {
        audiosCache[filepath] = await loadAudioFile(filepath);
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return audiosCache[filepath]!;
}

export class AudioPlayer {
    private readonly audioBuffer: AudioBuffer;
    private source?: AudioBufferSourceNode;
    private isPlaying = false;

    constructor(audioBuffer: AudioBuffer) {
        this.audioBuffer = audioBuffer;
    }

    play() {
        try {
            if (!this.source) {
                this.source = audioCtx.createBufferSource();
                this.source.buffer = this.audioBuffer;
                this.source.connect(audioCtx.destination);
                this.source.addEventListener('ended', () => {
                    this.source?.disconnect();
                    this.source = undefined;
                });
            }

            if (!this.isPlaying) {
                this.source.start();
                this.isPlaying = true;
            }
        } catch (err) {
            console.error(err);
        }
    }

    stop() {
        this.source?.stop();
    }
}
