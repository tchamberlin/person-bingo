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
  import { Circle as CircleLoading } from 'svelte-loading-spinners';

  import suggestions from './suggested_prompts';
  import { shuffle, genRandomString } from './utils';
  import Nav from './Nav.svelte';
  import WinTypePreview from './WinTypePreview.svelte';
  import MessageAlerts from './MessageAlerts.svelte';
  import BitlyAccessTokenModal from './BitlyAccessTokenModal.svelte';
  import { DEFAULT_WIN_CONDITION } from './defaults';
  import { bitlyAccessTokenStore } from './stores/boardStore';
  import { bitlyShortenUrl } from './shorten';
  import { RULES } from './rules';

  function handleCopyToClipboard(url, message): void {
    const promise = navigator.clipboard.writeText(url);
    // TODO: Add error messageAlert, too!
    promise.then(
      () => (messageAlerts = [...messageAlerts, { message: message || 'Copied to clipboard' }]),
      () => console.log('FAILURE')
    );
  }

  function genSeed(prefix): string {
    let seed;
    if (prefix) {
      seed = `${prefix.replaceAll(/\s+/g, '_')}-${genRandomString()}`;
    } else {
      seed = genRandomString();
    }
    return seed;
  }

  function genPhrases(): Array<string> {
    let phrases: Array<string> = [];
    FORM.phrases.split('\n').forEach((phrase) => {
      const trimmed: string = phrase.trim();
      if (trimmed.length) {
        phrases.push(trimmed);
      }
    });
    return phrases;
  }

  // TODO: optionally give seed?
  function genBoardLink({ phrases, win_condition, board_name }): string {
    const url = new URL('/bingo.html', window.location);
    // const url = new URL('https://person-bingo.vercel.app/bingo.html');
    phrases.split('\n').forEach((phrase) => {
      const trimmed: string = phrase.trim();
      if (trimmed.length) {
        url.searchParams.append('c', trimmed);
      }
    });

    url.searchParams.append('clear', true);
    url.searchParams.append('goal', win_condition);
    const seed = genSeed();
    url.searchParams.append('seed', seed);
    url.searchParams.append('name', board_name);

    return url;
  }

  function handleFormChange(FORM): void {
    const phrases_array = FORM.phrases.split('\n').filter((phrase) => phrase.trim() !== '');
    const unique_phrases = [...new Set(phrases_array)];
    // Set UNIQUE_ERROR state depending on whether we find duplicates or not
    UNIQUE_ERROR = phrases_array.length !== unique_phrases.length;
    NUM_PHRASES = unique_phrases.length;
    PHRASES_LEFT = EXPECTED_PHRASES - NUM_PHRASES;
    if (PHRASES_LEFT < 0) {
      PHRASES_LEFT = 0;
    }
    IS_VALID = NUM_PHRASES >= EXPECTED_PHRASES && !UNIQUE_ERROR;
    // Remove the previous URL promise (whether it existed or not)
    SHORT_URL_PROMISE = null;
    return genBoardLink(FORM);
  }

  function loadSuggestedPrompts(): void {
    const phrases = FORM.phrases.split('\n').map((phrase) => phrase.trim());
    // Make sure we don't suggest something that's already being used!
    const unused_suggestions = shuffle(suggestions).filter((phrase) => !phrases.includes(phrase));
    if (FORM.phrases.trim().length) {
      FORM.phrases = [...phrases, ...unused_suggestions.slice(0, PHRASES_LEFT)].join('\n');
    } else {
      FORM.phrases = shuffle(suggestions).slice(0, PHRASES_LEFT).join('\n');
    }
  }

  const FREE_SPACE = 'Free Space';
  let EXPECTED_PHRASES: number = 24;
  let NUM_PHRASES: number = 0;
  let PHRASES_LEFT: number = EXPECTED_PHRASES - NUM_PHRASES;
  if (PHRASES_LEFT < 0) {
    PHRASES_LEFT = 0;
  }
  let IS_VALID: Boolean = false;
  let BINGO_URL: string = '';
  let UNIQUE_ERROR = false;

  let ACCESS_TOKEN_MODAL_OPEN = false;

  // TODO: Replace with store
  const _prompts: Array<string> = JSON.parse(localStorage.getItem('bingo-_prompts')) || [];
  if (_prompts.length > 0) {
    FORM.phrases = _prompts.filter((phrase) => phrase !== FREE_SPACE).join('\n');
  }

  let FORM = {
    win_condition: DEFAULT_WIN_CONDITION,
    phrases: '',
    board_name: '',
  };

  // Every time the form changes, update the generated Bingo URL
  $: {
    BINGO_URL = handleFormChange(FORM);
  }

  $: {
    console.log('SHORT_URL', SHORT_URL);
  }

  $: {
    console.log('SHORT_URL_PROMISE', SHORT_URL_PROMISE);
  }

  let SHORT_URL_PROMISE = null;
  let SHORT_URL = null;

  function handleUrlShortenRequest() {
    if (!$bitlyAccessTokenStore) {
      ACCESS_TOKEN_MODAL_OPEN = true;
    }
    if ($bitlyAccessTokenStore) {
      return bitlyShortenUrl(BINGO_URL, $bitlyAccessTokenStore);
    } else {
      return null;
    }
  }
  let messageAlerts = [];

  // Convert RULES into an array for easier parsing
  const rulesArray = Object.entries(RULES).map(([key, rule]) => ({ value: key, ...rule }));

</script>

<MessageAlerts messageAlerts="{messageAlerts}" />
<Nav active="create" />
<main role="main" class="container">
  <h1>Create Bingo</h1>
  <p>
    Let's make a bingo board! All you need to do is enter <strong>at least</strong>
    {EXPECTED_PHRASES} lines of text. Once you're done, you'll get a link to your board.
  </p>

  <form on:submit|preventDefault="{() => null}" id="wordsform" class="form">
    <div class="row">
      <div class="form-group col">
        <label for="win-conditions">Win Condition (Board Pattern)</label>
        <div class="d-flex flex-row align-items-center">
          <select
            class="form-select"
            name="win-conditions"
            id="win-conditions"
            bind:value="{FORM.win_condition}"
          >
            {#each rulesArray as { value, name }}
              <option value="{value}">{name}</option>
            {/each}
          </select>
          <WinTypePreview rule="{RULES[FORM.win_condition]}" />
        </div>
      </div>

      <div class="form-group col">
        <label for="seed-text">Board Name (optional)</label>
        <input
          name="board-name"
          bind:value="{FORM.board_name}"
          placeholder="Enter board name (optional)"
          class="form-control"
          id="board-name"
        />
      </div>
    </div>

    <div class="form-group mt-2">
      <label for="phrases-text">Prompts</label>
      <textarea
        name="phrases"
        form="wordsform"
        bind:value="{FORM.phrases}"
        placeholder="Enter phrases, one per line"
        class="form-control"
        class:is-invalid="{UNIQUE_ERROR}"
        id="phrases-text"
        rows="5"></textarea>
      {#if UNIQUE_ERROR}
        <small id="phrases-help" class="text-danger"> All lines must be unique! </small>
      {/if}
    </div>
    <br />
    <div>
      {#if IS_VALID}
        <div class="d-flex flex-row align-items-center">
          <a
            class="btn btn-primary me-2"
            on:click="{() => handleCopyToClipboard(BINGO_URL, 'Copied full URL to clipboard')}"
            href="{BINGO_URL}">Go to Board</a
          >
          {#if SHORT_URL_PROMISE}
            {#await SHORT_URL_PROMISE}
              <CircleLoading color="black" size="2" unit="em" duration="1s" />
            {:then data}
              {#if data.link}
                <a class="btn btn-info me-2" href="{data.link}">Short URL</a>
                <button
                  class="btn btn-info btn-outline"
                  on:click="{() => handleCopyToClipboard(data.link)}"
                >
                  📋
                </button>
              {:else}
                <span>Error: {data.message}</span>
              {/if}
            {:catch error}
              <span>Error {JSON.stringify(error.message)}</span>
            {/await}
          {:else}
            <button
              class="btn btn-info me-2"
              on:click="{() => (SHORT_URL_PROMISE = handleUrlShortenRequest())}"
            >
              Generate Short URL
            </button>
          {/if}
        </div>
      {:else}
        <div class="d-flex flex-row align-items-center">
          <div class="me-2">
            <button class="btn btn-secondary" on:click="{loadSuggestedPrompts}">
              Fill Suggested Prompts
            </button>
          </div>
          <div class="me-2">
            <div>
              You've entered
              <span class:invalid="{!IS_VALID}" class:valid="{IS_VALID}">
                {NUM_PHRASES}/{EXPECTED_PHRASES}
              </span>
              required phrases. Either enter more above, or use this button to fill in the
              <span class:invalid="{!IS_VALID}" class:valid="{IS_VALID}">{PHRASES_LEFT}</span>
              remaining.
            </div>
          </div>
        </div>
      {/if}
    </div>
  </form>
</main>

<BitlyAccessTokenModal
  isOpen="{ACCESS_TOKEN_MODAL_OPEN}"
  toggleModal="{() => (ACCESS_TOKEN_MODAL_OPEN = !ACCESS_TOKEN_MODAL_OPEN)}"
  onSubmit="{() => (SHORT_URL_PROMISE = handleUrlShortenRequest())}"
/>
