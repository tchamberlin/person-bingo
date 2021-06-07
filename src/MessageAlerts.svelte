<style type="text/css">
  .alert-over {
    position: absolute;
    top: 10px;
    width: 100%;
    /* Just enough to put it over the navbar */
    z-index: 1040;
  }

</style>

<script lang="ts">
  import MessageAlert from './MessageAlert.svelte';
  export let messageAlerts: Array<{ message: string }>;

</script>

<div class="alert-over d-flex align-items-center flex-column">
  {#each messageAlerts as messageAlert}
    <div class="mx-auto">
      <MessageAlert {...messageAlert} />
    </div>
  {/each}
</div>
