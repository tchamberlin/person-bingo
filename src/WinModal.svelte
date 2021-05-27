<script lang="ts">
  import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'sveltestrap';
  export let isOpen = false;
  export let toggleModal: () => void;
</script>

<Modal isOpen="{isOpen}" toggle="{toggleModal}">
  <ModalHeader toggle="{toggleModal}">🙌 You've Won</ModalHeader>
  <ModalBody>
    <p>That's right, you're a winner!</p>
    <p>Even if you've accomplished nothing else today... you have this</p>
  </ModalBody>
  <ModalFooter>
    <Button color="primary" on:click="{toggleModal}">I'm a winner 😌</Button>
  </ModalFooter>
</Modal>
