<script lang="ts">
    import { get } from 'svelte/store';
    import { blocksBackground, blocksTransition, debugMode } from '../stores/SettingsStore';
    import type CBlock from './CBlock';

    export let blockInfo: CBlock;

    const isOn = blockInfo.on;

    function manualToggle() {
        if (get(debugMode)) {
            blockInfo.toggle();
        }
    }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="brick" class:on={$isOn} class:no-bg={!$blocksBackground} class:no-transition={!$blocksTransition} on:click={manualToggle} role="button" tabindex="-1"/>

<style lang="scss">
    .brick {
        --game-block-min-opacity: 0.05;
        --game-block-on-transition-time: 48ms;
        --game-block-off-transition-time: 66ms;

        background: black;
        opacity: var(--game-block-min-opacity);
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
