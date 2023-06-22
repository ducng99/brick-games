<script lang="ts">
    import type CBlock from "./CBlock";

    export let blockInfo: CBlock;

    let isOn = blockInfo.on;
</script>

<div class="brick" class:on={$isOn} />

<style lang="scss">
    .brick {
        width: 3em;
        height: 3em;
        background: black;
        opacity: 0.05;
        border-radius: 0.2em;
        box-shadow: inset 0px 0px 0.5px 2px black,
            inset 0px 0px 0px 0.32em var(--game-bg);

        &.on {
            opacity: 1;
        }
    }
</style>
