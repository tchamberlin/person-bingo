<script lang="ts">
  import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'sveltestrap';
  import { bitlyAccessTokenStore } from './stores/boardStore';

  export let isOpen = false;
  export let toggleModal: () => void;
  export let onSubmit: () => void;
  function handleSubmit() {
    console.log('handleSubmit', $bitlyAccessTokenStore, isOpen);
    if ($bitlyAccessTokenStore) {
      isOpen = false;
      console.log('onSubmit');
      onSubmit();
    }
  }

</script>

<Modal isOpen="{isOpen}" toggle="{toggleModal}">
  <ModalHeader toggle="{toggleModal}">Enter Bitly API Access Token</ModalHeader>
  <ModalBody>
    <form on:submit|preventDefault="{handleSubmit}" id="token-form" class="form">
      <div class="form-group">
        <label for="seed-text">API Token</label>
        <input
          type="text"
          name="access-token"
          bind:value="{$bitlyAccessTokenStore}"
          placeholder=""
          class="form-control"
          id="access-token"
        />
      </div>
    </form>
  </ModalBody>
  <ModalFooter>
    <Button color="primary" disabled="{!$bitlyAccessTokenStore}" on:click="{handleSubmit}"
      >Submit</Button
    >
  </ModalFooter>
</Modal>
