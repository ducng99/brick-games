<script lang="ts">
    import { CBlock } from "../components/Block";
    import Block from "../components/Block.svelte";
    import { bricks, height, width } from "./RendererStore";

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
            $bricks[y][x].on.update(() => state);

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
                block.on.update(() => false);
            });
        });
    }
</script>

{#each $bricks as rows}
    <div class="row">
        {#each rows as blockInfo}
            <Block {blockInfo} />
        {/each}
    </div>
{/each}

<style>
    .row {
        display: flex;
    }
</style>
