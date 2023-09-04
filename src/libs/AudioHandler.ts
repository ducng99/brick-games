import AudioSoundClick from '@/assets/sounds/click.wav?url';

const audioCtx = new AudioContext();

export enum AudioTypes {
    Click
}

const audiosCache = new Map<AudioTypes, AudioBuffer>();

export function initAudio() {
    // Loads all the audio files
    Promise.all([
        cacheAudio(AudioTypes.Click, AudioSoundClick)
    ]).catch(err => {
        console.error(err);
    });
}

async function cacheAudio(type: AudioTypes, filepath: string) {
    if (!audiosCache.has(type)) {
        audiosCache.set(type, await loadAudioFile(filepath));
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

export function playAudio(type: AudioTypes) {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => { console.error('Failed to resume audio context'); });
    }

    if (audiosCache.has(type)) {
        const audioBuffer = audiosCache.get(type);

        if (audioBuffer) {
            const source = audioCtx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioCtx.destination);
            source.start(0);
        }
    }
}
