<style type="text/css">
  td {
    border: 1px solid black;
    height: 5px;
    width: 5px;
  }
  .filled {
    background-color: #75bbfd;
  }
</style>

<script lang="ts">
  export let rule;
  let examples = rule.examples.map((exampleFunc) => exampleFunc());
</script>

<div class="d-flex flex-row align-items-center">
  {#each examples as grid}
    <div class="pl-2">
      <table>
        {#each grid as row}
          <tr>
            {#each row as found}
              <td class="{found ? 'filled' : 'empty'}"></td>
            {/each}
          </tr>
        {/each}
      </table>
    </div>
  {/each}
</div>
