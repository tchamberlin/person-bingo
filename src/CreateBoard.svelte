<style type="text/css">
  .invalid {
    color: red;
    font-weight: bold;
  }
  .valid {
    color: green;
    font-weight: bold;
  }
</style>

<script lang="ts">
  import seedrandom from 'seedrandom';
  import suggestions from './suggested_prompts';
  import { shuffle, genRandomString } from './utils';
  import Nav from './Nav.svelte';

  function handleCopyToClipboard(): void {
    const phrasesText = document.getElementById('go-to-bingo-board') as HTMLAnchorElement;
    const promise = navigator.clipboard.writeText(phrasesText.href);
    promise.then(
      () => console.log('SUCCESS'),
      () => console.log('FAILURE')
    );
  }

  function handleShorten(): void {
    const urlToShorten = new URL(BINGO_URL, window.location.href).toString();
    fetch(`https://url.pizza/shorten/${urlToShorten}`)
      .then((response) => response.text())
      .then((url) => {
        SHORTENED_URL = url;
        const promise = navigator.clipboard.writeText(url);
        promise.then(
          () => console.log('Copied ', url, ' to clipboard'),
          () => console.log('Failed to copy ', url, ' to clipboard')
        );
      });
  }

  function genBingoUrl(): void {
    const searchParams = new URLSearchParams();
    PHRASES_STR.split('\n').forEach((phrase) => {
      const trimmed: string = phrase.trim();
      if (trimmed.length) {
        searchParams.append('c', trimmed);
      }
    });
    searchParams.append('clear', '');
    searchParams.append('goal', win_condition);
    BINGO_URL = './bingo.html?' + searchParams.toString();
  }

  function handlePhrasesChange(): void {
    const phrases_array = PHRASES_STR.split('\n').filter((phrase) => phrase.trim() !== '');
    NUM_PHRASES = phrases_array.length;
    PHRASES_LEFT = EXPECTED_PHRASES - NUM_PHRASES;
    if (PHRASES_LEFT < 0) {
      PHRASES_LEFT = 0;
    }
    IS_VALID = NUM_PHRASES >= EXPECTED_PHRASES;
    genBingoUrl();
  }

  function loadSuggestedPrompts(): void {
    let seed: string = localStorage.getItem('bingo-seed');
    console.log(`Got seed from localStorage: ${seed}`);
    if (seed == null) {
      seed = genRandomString();
      console.log(`Set seed in localStorage to ${seed}`);
      localStorage.setItem('bingo-seed', seed);
    }
    // TODO: Make interface
    const random = seedrandom(JSON.stringify(seed));
    if (PHRASES_STR.trim().length) {
      PHRASES_STR = [PHRASES_STR, ...shuffle(suggestions, random).slice(0, PHRASES_LEFT)].join(
        '\n'
      );
    } else {
      PHRASES_STR = shuffle(suggestions, random).slice(0, PHRASES_LEFT).join('\n');
    }
    handlePhrasesChange();
  }

  let PHRASES_STR: string = '';
  let EXPECTED_PHRASES: number = 25;
  let NUM_PHRASES: number = 0;
  let PHRASES_LEFT: number = EXPECTED_PHRASES - NUM_PHRASES;
  if (PHRASES_LEFT < 0) {
    PHRASES_LEFT = 0;
  }
  let IS_VALID: Boolean = false;
  let BINGO_URL: string = '';
  let SHORTENED_URL: string = '';

  let win_condition = 'line';
</script>

<Nav active="create" />
<main role="main" class="container">
  <h1>Create Bingo</h1>
  <p>
    Let's make a bingo board! All you need to do is enter <strong>at least</strong> 25 lines of text.
    Once you're done, you'll get a link to your board.
  </p>

  <form on:submit|preventDefault="{() => null}" id="wordsform" class="form">
    <div class="form-group">
      <label for="win-conditions">Win Condition (Board Pattern)</label>
      <select
        class="form-control"
        name="win-conditions"
        id="win-conditions"
        bind:value="{win_condition}"
        on:change="{() => genBingoUrl()}"
      >
        <option value="line">Line (horizontal, vertical, diagonal)</option>
        <option value="four-corners">Four Corners</option>
        <option value="blackout">Blackout</option>
      </select>
    </div>

    <div class="form-group">
      <label for="phrases-text">Prompts</label>
      <textarea
        name="phrases"
        form="wordsform"
        bind:value="{PHRASES_STR}"
        on:input="{handlePhrasesChange}"
        placeholder="Enter phrases, one per line"
        class="form-control"
        id="phrases-text"></textarea>
    </div>
    <br />
    <div>
      {#if IS_VALID}
        <a class="btn btn-primary" href="{BINGO_URL}" id="go-to-bingo-board">Go to Bingo Board</a>
        <button class="btn btn-info" on:click="{handleCopyToClipboard}">
          📋 Copy link to clipboard 📋
        </button>
        <button class="btn btn-info" on:click="{handleShorten}"
          >📋 Copy shortened link to clipboard 📋</button
        >
      {:else}
        <div class="d-flex flex-row align-items-center">
          <div class="p-2">
            <button class="btn btn-secondary" on:click="{loadSuggestedPrompts}">
              Fill Suggested Prompts
            </button>
          </div>
          <div class="p-2">
            <div>
              You've entered
              <span class:invalid="{!IS_VALID}" class:valid="{IS_VALID}">
                {NUM_PHRASES}/{EXPECTED_PHRASES}
              </span>
              required phrases. Use this button to fill in the
              <span class:invalid="{!IS_VALID}" class:valid="{IS_VALID}">{PHRASES_LEFT}</span> remaining.
            </div>
          </div>
        </div>
      {/if}
    </div>
  </form>
</main>
