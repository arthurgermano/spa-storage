<script>
  import { appStore } from "../js/stores";

  async function changeTheme() {
    await appStore.setThemeDark(!$appStore.themeDark);
  }
</script>

<div>
  <div class="ss-header">
    <div class="ss-theme">
      <span on:click={changeTheme}>
        {#if $appStore.themeDark}
          <span>
            <i class="fas fa-sun" />
          </span>
        {:else}
          <span>
            <i class="fas fa-moon" />
          </span>
        {/if}
      </span>
    </div>
    <b>SPA Storage</b>
  </div>
</div>

<style>
  .ss-header {
    position: relative;
    display: grid;
    align-items: center;
    justify-content: center;
    height: 100px;
    font-size: 2rem;
    text-align: center;
    color: #fca728;
  }

  .ss-theme {
    position: absolute;
    top: 0;
    right: 0;
    padding: 2rem;
    cursor: pointer;
    will-change: filter;
    transition: all 0.3s ease-in-out;
  }

  .ss-theme:hover {
    filter: drop-shadow(0 0 2rem #ff3e00aa);
  }

  @media (max-width: 500px) {
    .ss-theme {
      padding: 0.5rem;
    }
  }
</style>
