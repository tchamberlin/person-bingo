<script lang="ts">
  import WinTypePreview from './WinTypePreview.svelte';

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

  function decrementConfettiMultiplier() {
    CONFETTI = confettiIsActive();
    if (confettiMultiplier > 1) {
      confettiMultiplier -= 1;
    }
  }
  function incrementConfettiMultiplier() {
    CONFETTI = confettiIsActive();
    if (confettiMultiplier < 5) {
      confettiMultiplier += 1;
    }
  }

  let userIsSureTheyWantToClear = false;
  let userIsSureTheyWantToSubmit = false;

  export let toggleRulesModal: () => void;
  export let genBoard: () => void;
  export let clearBoard: () => void;
  export let allowShuffle: boolean;
  export let boardName: string;
  // TODO Type rules
  export let rule;
  export let enableConfetti = false;
  let confettiMultiplier = 1;
  export let toggleConfetti: () => void;
  export let confettiIsActive: () => bool;
  let CONFETTI = confettiIsActive();
  // Force CONFETTI to update when enableConfetti does. This avoids a weird
  // bug, but could definitely be cleaner
  $: enableConfetti: CONFETTI = enableConfetti;

</script>

<div class="container-fluid">
  <div class="row align-items-center">
    <div class="col-xl-6 p-0">
      <div class="d-flex flex-row align-items-center">
        {#if boardName}
          <div class="pe-4">
            <h1>{boardName}</h1>
          </div>
        {/if}
        <div class="pe-2">
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
          <div class="pe-2">
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
        <div class="pe-2">
          <button
            on:click="{toggleRulesModal}"
            class="btn btn-info btn-sm"
            title="What's going on?"
          >
            📜 Rules
          </button>
        </div>
        {#if enableConfetti}
          <div class="pe-2">
            <div class="btn-group" role="group" aria-label="Basic example">
              <button
                type="button"
                class="btn btn-secondary btn-sm"
                on:click="{decrementConfettiMultiplier}"
              >
                -
              </button>
              <button
                type="button"
                class="btn btn-sm"
                class:btn-success="{CONFETTI}"
                class:btn-danger="{!CONFETTI}"
                on:click="{() => {
                  CONFETTI = toggleConfetti({ particleCount: 100 * confettiMultiplier });
                }}"
                >{#each [...Array(confettiMultiplier)] as _}🎉{/each}</button
              >
              <button
                type="button"
                class="btn btn-secondary btn-sm"
                on:click="{incrementConfettiMultiplier}"
              >
                +
              </button>
            </div>
          </div>
        {/if}
      </div>
    </div>
    <div class="col-xl-6 ms-auto p-0">
      <div class="d-flex flex-row justify-content-end align-items-center">
        <div class="pe-1">
          <div>
            <small>Find unique people that match the prompt in each cell</small>
          </div>
          <div>
            <small>After you <strong>{rule.blurb}</strong>, you win!</small>
          </div>
        </div>
        <div class="ps-1">
          <WinTypePreview rule="{rule}" />
        </div>
      </div>
    </div>
  </div>
</div>
