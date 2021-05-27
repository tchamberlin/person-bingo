<script lang="ts">
  import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'sveltestrap';
  export let isOpen = false;
  export let toggleModal: () => void;
</script>

<Modal isOpen="{isOpen}" toggle="{toggleModal}">
  <ModalHeader toggle="{toggleModal}">📜 Rules</ModalHeader>
  <ModalBody>
    <p>
      This is "person Bingo". It's a super cool way to get to know whoever else you've been
      convinced to play with.
    </p>
    <p>
      Unlike normal Bingo, in order <strong
        >to "mark" a cell, you will need to find a person that matches the prompt inside of it</strong
      >. For example, if B1 says "owns a motorcycle", then you would need to find someone who owns a
      motorcycle, then put there name into the text box in B1.
    </p>
    <p>
      In order to win, you will need to meet the <strong>Win Condition</strong> displayed to the top
      right of the board. In "standard" mode, for example, you could win if fill in B1 through B5
      with 5 <strong>different</strong> names!
    </p>
    <p>
      A final note: <strong>nothing</strong> that you put into this website will leave your computer!
      All of the information is stored locally, and no one else has any way of seeing it.
    </p>
  </ModalBody>
  <ModalFooter>
    <Button color="primary" on:click="{toggleModal}">Okay</Button>
  </ModalFooter>
</Modal>
