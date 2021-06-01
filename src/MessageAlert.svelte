<script lang="ts">
  import { Alert, Button } from 'sveltestrap';

  let visible = true;
  export let message;
  export let timeout = 5000;
  if (timeout !== null) {
    setTimeout(() => (visible = false), timeout);
  }

</script>

<Alert color="primary" isOpen="{visible}" toggle="{() => (visible = false)}">
  {message}
</Alert>
