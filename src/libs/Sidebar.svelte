<script lang="ts">
    import { type Writable } from 'svelte/store';

    export let score: Writable<number> | undefined;
</script>

<div id="sidebar">
    <div id="score">{$score ?? 0}</div>
</div>

<style lang="scss">
    #sidebar {
        padding-left: calc(var(--game-block-size) / 2);
        width: calc(var(--game-block-size) * 5);
    }

    #score {
        font-family: 'DSEG';
        font-size: calc(var(--game-block-size));
        text-align: right;
        width: 100%;
    }
</style>
