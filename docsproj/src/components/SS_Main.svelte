<script>
  import { appStore } from "../js/stores";

  let exampleField = $appStore.textSample;
  $: if (exampleField) {
    appStore.setTextSample(exampleField);
  } else {
    appStore.setTextSample("Hello World! =)");
  }
</script>

<div class="ss-main">
  <p>
    SPA Storage is a Plugin for Svelte and Pinia Stores that allows you to store
    data in Local Storage or IndexedDB.
    <br /><br />
    The default storage is IndexedDB - since it can be use to store a lot of information
    - more than Local Storage.
  </p>

  <div class="ss-sample">
    <label for="ss-sample">Testing - Sample Text</label>
    <input type="text" id="ss-sample" bind:value={exampleField} />
    <small><i>write some text in the field and reload the page - the same text must appear</i></small>
  </div>
</div>

<style>
  .ss-main {
    display: grid;
    justify-content: center;
    align-content: center;
  }

  .ss-sample {
    display: grid;
    justify-content: center;
    align-content: center;
  }

  p {
    font-size: 1.5rem;
    text-align: justify;
    padding: 0 3rem;
  }

  input[type=text] {
  width: 100%;
  padding: 12px 20px;
  margin: 8px 0;
  display: inline-block;
  border: 1px solid #fca728;
  border-radius: 4px;
  box-sizing: border-box;
}
  
</style>
