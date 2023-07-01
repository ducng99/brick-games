<script lang="ts">
    import { blocksBackground, blocksTransition } from '../stores/SettingsStore';
    import type CBlock from './CBlock';

    export let blockInfo: CBlock;

    const isOn = blockInfo.on;
</script>

<div class="brick" class:on={$isOn} class:no-bg={!$blocksBackground} class:no-transition={!$blocksTransition} />

<style lang="scss">
    .brick {
        --game-block-min-opacity: 0.05;
        --game-block-on-transition-time: 48ms;
        --game-block-off-transition-time: 66ms;

        width: var(--game-block-size);
        height: var(--game-block-size);
        background: black;
        opacity: var(--game-block-min-opacity);
        border: 0.2em solid var(--game-bg);
        box-shadow: inset 0 0 0 0.2em black,
            inset 0 0 0 0.5em var(--game-bg);
        transition: opacity var(--game-block-off-transition-time) ease-out;

        &.on {
            opacity: 1;
            transition: opacity var(--game-block-on-transition-time) ease-out;
        }

        &.no-bg {
            --game-block-min-opacity: 0;
        }

        &.no-transition {
            --game-block-on-transition-time: 0ms;
            --game-block-off-transition-time: 0ms;
        }
    }
</style>
