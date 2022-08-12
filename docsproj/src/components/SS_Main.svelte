<script>
  import { appStore } from "../js/stores";

  let exampleField = $appStore.textSample;
  $: if (exampleField) {
    appStore.setTextSample(exampleField);
  } else {
    appStore.setTextSample("Hello World! =) - We will fill this field for you.");
  }
</script>

<div class="ss-main">
  <p>
    SPA Storage is a Plugin for Svelte and Pinia Stores that allows you to store
    data in Local Storage or IndexedDB.
    <br /><br />
    The default storage is <b>IndexedDB</b> - since it can be use to store a lot of information
    - more than Local Storage.
  </p>
  <div class="ss-img">
    <span>
      <a href="https://svelte.dev/tutorial/writable-stores" target="_blank">
        <img src="./img/svelte.png" alt="svelte.png" height="200" width="169" />
      </a>
    </span>
    <span>
      <a href="https://pinia.vuejs.org/core-concepts/" target="_blank">
        <img src="./img/pinia.png" alt="pinia.png" height="200" width="134" />
      </a>
    </span>
  </div>
  <br />
  <hr width="100%" />

  <div class="ss-sample">
    <label for="ss-sample">Testing - Sample Text</label>
    <input type="text" id="ss-sample" bind:value={exampleField} />
    <small
      ><i
        >write some text in the field and reload the page - the same text must
        appear</i
      ></small
    >
  </div>
</div>

<style>
  .ss-main,
  .ss-sample,
  .ss-img {
    position: relative;
    display: grid;
    justify-content: center;
    align-content: center;
    overflow: hidden;
  }

  .ss-img {
    grid-template-columns: 1fr 1fr;
    text-align: center;
    height: 300px;
  }

  img {
    display: inline-block;
    position: relative;
    transition: all 0.3s ease-in-out;
  }

  img:hover {
    transform: scale(1.1);
    filter: drop-shadow(0 0 2rem #fca728);
  }

  p {
    font-size: 1.5rem;
    text-align: justify;
    padding: 0 3rem;
  }

  label {
    margin-top: 1rem;
  }

  input[type="text"] {
    width: 100%;
    padding: 12px 20px;
    margin: 0.5rem 0;
    display: inline-block;
    border: 1px solid #fca728;
    border-radius: 4px;
    box-sizing: border-box;
  }
</style>
