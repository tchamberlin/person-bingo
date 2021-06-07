<style type="text/css">
  .preview-cell {
    /* We want the borders to be exactly 1px, so we don't get weird aliasing */
    /*csslint box-model: false*/
    border: 1px solid black;
    height: 6px;
    width: 6px;
  }

  .preview-cell-expanded {
    /* We want the borders to be exactly 1px, so we don't get weird aliasing */
    /*csslint box-model: false*/
    box-sizing: content-box;
    border: 1px solid black;
    height: 18px;
    width: 18px;
  }
  .filled {
    background-color: #75bbfd;
  }

  .toggler {
    cursor: pointer;
  }

</style>

<script lang="ts">
  export let rule;
  // Execute all of the example-creation functions to get the grids
  let exampleGrids;
  // Update exampleGrids when rule changes, otherwise a re-render won't be triggered
  $: exampleGrids = rule.examples.map((exampleFunc) => exampleFunc());
  let expanded = false;

</script>

<div
  class="d-flex flex-row align-items-center toggler"
  on:click="{() => (expanded = !expanded)}"
  title="Toggle size"
>
  {#each exampleGrids as grid}
    <div class="ms-2">
      <table>
        {#each grid as row}
          <tr>
            {#each row as found}
              <td
                class="preview-cell {found ? 'filled' : 'empty'}"
                class:preview-cell-expanded="{expanded}"></td>
            {/each}
          </tr>
        {/each}
      </table>
    </div>
  {/each}
</div>
