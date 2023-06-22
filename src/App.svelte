<script lang="ts">
    import { onMount } from "svelte";
    import Renderer from "./lib/Renderer.svelte";
    import { RendererInstance } from "./stores/RendererStore";

    let renderer: Renderer;

    onMount(() => {
        RendererInstance.update(() => renderer);
    });
</script>

<main>
    <Renderer bind:this={renderer} />
</main>

<style>
    main {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
    }
</style>
