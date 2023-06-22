<script lang="ts">
    import CBlock from "../components/CBlock";
    import Block from "../components/Block.svelte";
    import { bricks, height, width } from "../stores/RendererStore";

    for (let row = 0; row < $height; row++) {
        $bricks[row] = [];
        for (let col = 0; col < $width; col++) {
            $bricks[row][col] = new CBlock();
        }
    }

    /**
     * Set the state for a block using X and Y coordinates
     * @param x X-axis, starts from 0
     * @param y Y-axis, starts from 0
     * @param state true as "on", false as "off"
     * @return true if successfully updated, false otherwise
     */
    export function setBlock(x: number, y: number, state: boolean): boolean {
        if (x >= 0 && x < $bricks.length && y >= 0 && y < $bricks[x].length) {
            $bricks[y][x].toggle(state);

            return true;
        }

        return false;
    }

    /**
     * Toggle all blocks to "off" state
     */
    export function clearScreen(): void {
        $bricks.forEach((row) => {
            row.forEach((block) => {
                block.toggle(false);
            });
        });
    }
</script>

<div class="container">
    {#each $bricks as rows}
        <div class="row">
            {#each rows as blockInfo}
                <Block {blockInfo} />
            {/each}
        </div>
    {/each}
</div>

<style>
    .container {
        padding: 0.4em 0.2em;
        background-color: var(--game-bg);
        box-shadow: 0 0 1px 2px black;
    }

    .row {
        display: flex;
    }
</style>
