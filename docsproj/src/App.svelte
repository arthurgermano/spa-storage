<script>
  import SS_Header from "./components/SS_Header.svelte";
  import SS_Main from "./components/SS_Main.svelte";
  import SS_Footer from "./components/SS_Footer.svelte";
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
    <footer>
      <SS_Footer />
    </footer>
  {/await}
</div>

<style>
  .ss-app {
    position: relative;
    min-height: 100vh;
    transition: all 0.3s ease-in-out;
    overflow: hidden;
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
