<script>
  import SS_Header from "./components/SS_Header.svelte";
  import SS_Main from "./components/SS_Main.svelte";
  import { loadStores } from "./js/stores/index.js";
  import { appStore } from "./js/stores";

  $: classThemeMode = $appStore.themeDark ? "ss-theme-dark" : "ss-theme-light";
</script>

<div class="ss-app {classThemeMode}">
  {#await loadStores()}
    <div class="ss-loading">loading...</div>
  {:then data}
    <header>
      <SS_Header />
    </header>
    <main>
      <SS_Main />
    </main>
  {/await}
</div>

<style>
  .ss-app {
    position: relative;
    display: grid;
    grid-template-columns: 1fr;
    grid-template-areas:
      "header"
      "main";
    min-height: 100vh;
    transition: all 0.3s ease-in-out;
  }

  .ss-loading {
    display: grid;
    grid-template-columns: 1fr;
    justify-content: center;
    align-content: center;
    text-align: center;
    padding: 1rem;
  }
</style>
