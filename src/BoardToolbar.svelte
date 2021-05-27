<script lang="ts">
  function handleShuffleBoard(): void {
    if (userIsSureTheyWantToSubmit) {
      genBoard({ resetSeed: true });
      userIsSureTheyWantToSubmit = false;
    } else {
      userIsSureTheyWantToSubmit = true;
    }
  }

  function handleClearBoard(): void {
    if (userIsSureTheyWantToClear) {
      clearBoard();
      userIsSureTheyWantToClear = false;
    } else {
      userIsSureTheyWantToClear = true;
    }
  }

  function handleCopyToClipboard(): void {
    const promise = navigator.clipboard.writeText(originalBoardUrl);
    promise.then(
      () => console.log('SUCCESS: Copied', originalBoardUrl, 'to clipboard'),
      () => console.log('FAILURE: Could not copy', originalBoardUrl, 'to clipboard')
    );
  }

  let userIsSureTheyWantToClear = false;
  let userIsSureTheyWantToSubmit = false;

  export let toggleRulesModal: () => void;
  export let genBoard: () => void;
  export let clearBoard: () => void;
  export let allowShuffle: boolean;
  export let winConditionBlurb: string;
  export let originalBoardUrl: string;
</script>

<div class="container-fluid">
  <div class="row align-items-center">
    <div class="col-xs-6">
      <div class="d-flex flex-row align-items-center">
        <div class="pr-2">
          <button
            on:click="{handleClearBoard}"
            class="btn btn-sm"
            class:btn-secondary="{!userIsSureTheyWantToClear}"
            class:btn-danger="{userIsSureTheyWantToClear}"
            on:blur="{() => {
              userIsSureTheyWantToClear = false;
            }}"
            title="Clear all text inputs from the board (but keep everything else the same)"
          >
            {userIsSureTheyWantToClear ? '❌ Are You Sure?' : '❌ Clear Board'}
          </button>
        </div>
        {#if allowShuffle}
          <div class="pr-2">
            <button
              on:click="{handleShuffleBoard}"
              class="btn btn-sm"
              class:btn-warning="{!userIsSureTheyWantToSubmit}"
              class:btn-danger="{userIsSureTheyWantToSubmit}"
              on:blur="{() => {
                userIsSureTheyWantToSubmit = false;
              }}"
              title="Shuffle locations of board spaces, but use the same words. Also clears all text inputs."
            >
              {userIsSureTheyWantToSubmit ? '🔀 Are You Sure?' : '🔀 Clear & Shuffle Board'}
            </button>
          </div>
        {/if}
        <div class="pr-2">
          <button
            on:click="{toggleRulesModal}"
            class="btn btn-info btn-sm"
            title="What's going on?"
          >
            📜 Rules
          </button>
        </div>
        <div class="pr-2">
          <button
            class="btn btn-secondary btn-sm"
            on:click="{handleCopyToClipboard}"
            title="Copy the full URL for this Bingo board to your clipboard (can be used to share with others)"
          >
            📋 URL
          </button>
        </div>
      </div>
    </div>
    <div class="col-xs-6 ml-auto text-right">
      <div>
        <small>Find people that match the prompt in each cell. A name can be used only once</small>
      </div>
      <div>
        <small>After you <strong>{winConditionBlurb}</strong>, you win!</small>
      </div>
    </div>
  </div>
</div>
