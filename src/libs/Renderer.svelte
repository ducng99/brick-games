<script lang="ts">
    import CBlock from '../components/CBlock';
    import Block from '../components/Block.svelte';
    import { get } from 'svelte/store';

    let bricks: CBlock[][] = [];
    export let width: number;
    export let height: number;
    export let border: boolean = true;

    $: {
        bricks = [];

        for (let row = 0; row < height; row++) {
            bricks[row] = [];
            for (let col = 0; col < width; col++) {
                bricks[row][col] = new CBlock();
            }
        }
    }

    /**
     * Set the state for a block using X and Y coordinates
     * @param x X-axis, starts from 0
     * @param y Y-axis, starts from 0
     * @param state true as "on", false as "off". If not provided, will invert the current state
     * @return true if successfully updated, false otherwise
     */
    export function setBlock(x: number, y: number, state?: boolean): boolean {
        if (y >= 0 && y < bricks.length && x >= 0 && x < bricks[y].length) {
            bricks[y][x].toggle(state);

            return true;
        }

        return false;
    }

    /**
     * Toggle all blocks to "off" state
     */
    export function clearScreen(): void {
        bricks.forEach((row) => {
            row.forEach((block) => {
                block.toggle(false);
            });
        });
    }

    /**
     * Logs an array of blocks that are currently on
     */
    export function logBricks(): void {
        // Get blocks that are on, store as array of [x, y] using index
        const onBlocks: Array<[number, number]> = [];

        bricks.forEach((row, y) => {
            row.forEach((block, x) => {
                if (get(block.on)) {
                    onBlocks.push([x, y]);
                }
            });
        });

        console.log(JSON.stringify(onBlocks));
    }
</script>

<div class="container" class:border style="--game-renderer-width: {width}; --game-renderer-height: {height}">
    {#each bricks as rows}
        {#each rows as blockInfo (blockInfo.id)}
            <Block {blockInfo} />
        {/each}
    {/each}
</div>

<style lang="scss">
    .container {
        display: grid;
        grid-template-columns: repeat(var(--game-renderer-width), 1fr);
        grid-template-rows: repeat(var(--game-renderer-height), 1fr);
        column-gap: 0.2em;
        row-gap: 0.2em;

        // Exclude padding from parent
        height: calc(100% - 1em);
        width: 100%;

        aspect-ratio: var(--game-renderer-width) / var(--game-renderer-height);
        padding: 0.4em 0.2em;

        &.border {
            box-shadow: 0 0 0.05em 0.1em black;
        }
    }
</style>
