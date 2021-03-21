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

<script>
  function handleCopyPhrases() {
    const phrasesText = document.getElementById("go-to-bingo-board");
    const promise = navigator.clipboard.writeText(phrasesText.href);
    promise.then(() => console.log("SUCCESS"), () => console.log("FAILURE"))
  }

  function genBingoUrl() {
    const searchParams = new URLSearchParams()
    PHRASES_STR.split("\n").forEach(phrase => {
      searchParams.append("c", phrase.trim())
    })
    searchParams.append("clear", true)
    BINGO_URL = "./bingo.html?" + searchParams.toString()
  }

  function submit() {
    window.location = BINGO_URL

  }
  function handlePhrasesChange() {
    const phrases_array = PHRASES_STR.split("\n").filter(phrase => phrase.trim() !== "");
    NUM_PHRASES = phrases_array.length;
    PHRASES_LEFT = EXPECTED_PHRASES - NUM_PHRASES;
    if (PHRASES_LEFT < 0) {
      PHRASES_LEFT = 0;
    }
    IS_VALID = NUM_PHRASES >= EXPECTED_PHRASES;
    genBingoUrl()
  }

  let PHRASES_STR = "";
  let EXPECTED_PHRASES = 25;
  let NUM_PHRASES = 0;
  let PHRASES_LEFT = EXPECTED_PHRASES - NUM_PHRASES;
  if (PHRASES_LEFT < 0) {
    PHRASES_LEFT = 0;
  }
  let IS_VALID = false;
  let BINGO_URL = ""
</script>




<div class="container">
  <div class="d-flex flex-row align-items-center">
    <div class="p-2">
      <h1>Create Bingo</h1>
    </div>
    <div class="p-2">
      <a class="btn btn-primary" href="./bingo.html" id="go-to-bingo-board">Jump to Board</a>
    </div>
  </div>
  <p>
    Let's make a bingo board! All you need to do is enter <strong>at least</strong> 25 lines of text. Once you're done, you'll get a link to your board.
  </p>
  <form on:submit|preventDefault={null} id="wordsform" class="form">
    <textarea
      name="phrases"
      form="wordsform"
      bind:value={PHRASES_STR}
      on:input={handlePhrasesChange}
      placeholder="Enter phrases, one per line"
      class="form-control"
      id="phrases-text"
    />
    <br>
    {#if IS_VALID}
    <p>
      <a class="btn btn-primary" href="{BINGO_URL}" id="go-to-bingo-board">Go to Bingo Board</a>
      <button class="btn btn-info" on:click={handleCopyPhrases}>📋 Copy link to clipboard 📋</button>
    </p>
    <p><strong>Give this link to everyone that is playing bingo!</strong></p>
    {:else}
    <p>You've entered <span class:invalid="{!IS_VALID}" class:valid="{IS_VALID}">{NUM_PHRASES}/{EXPECTED_PHRASES}</span> required phrases (<span class:invalid="{!IS_VALID}" class:valid="{IS_VALID}">{PHRASES_LEFT}</span> remaining)</p>
    <p>Once you're done, a button will appear here that will navigate you to your board!</p>
    {/if}
  </form>
</div>
