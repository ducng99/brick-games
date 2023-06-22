<script lang="ts">
    import Renderer from "./lib/Renderer.svelte";

    let renderer;
</script>

<main>
    <Renderer bind:this={renderer}/>
</main>

<style>
</style>
