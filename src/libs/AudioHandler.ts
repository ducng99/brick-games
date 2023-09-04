import AudioSoundClick from '@/assets/sounds/click.wav?url';

const audioCtx = new AudioContext();

export enum AudioTypes {
    Click
}

const audiosCache: Partial<Record<AudioTypes, AudioBuffer>> = {};

export function initAudio() {
    // Loads all the audio files
    Promise.all([
        cacheAudio(AudioTypes.Click, AudioSoundClick)
    ]).catch(err => {
        console.error(err);
    });
}

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
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

    return audioBuffer;
}

/**
 * Plays an audio
 * @param type The type of the audio to play
 */
export function playAudio(type: AudioTypes) {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => { console.error('Failed to resume audio context'); });
    }

    if (type in audiosCache) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const audioBuffer = audiosCache[type]!;
        const source = audioCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioCtx.destination);
        source.start(0);
    }
}
