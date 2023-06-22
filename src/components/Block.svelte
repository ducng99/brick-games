<script lang="ts">
    import type { CBlock } from "./Block";

    export let blockInfo: CBlock;

    let isOn = blockInfo.on;
</script>

<div class="brick" class:on={$isOn}></div>

<style lang="scss">
    .brick {
        width: 2em;
        height: 2em;
        background: grey;
        margin: 0;
        padding: 0;

        &.on {
            background: black;
        }
    }
</style>
