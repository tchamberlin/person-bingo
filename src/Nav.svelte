<style type="text/css">
  :global(.navbar) {
    padding-top: 0;
    padding-bottom: 0;
  }
  :global(.nav-link) {
    padding-top: 0;
    padding-bottom: 0;
  }
  :global(.img-link) {
    max-height: 1rem;
  }

  .seed-button {
    color: rgba(0, 0, 0, 0.5);
    cursor: pointer;
  }

</style>

<script lang="ts">
  import {
    Collapse,
    Navbar,
    NavbarToggler,
    NavbarBrand,
    Nav,
    NavItem,
    NavLink,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
  } from 'sveltestrap';
  import githubLogo from './icons/GitHub-Mark-32px.png';

  let isOpen = false;

  function handleCopyToClipboard(): void {
    const promise = navigator.clipboard.writeText(bingoUrl);
    promise.then(
      () => console.log('SUCCESS: Copied', bingoUrl, 'to clipboard'),
      () => console.log('FAILURE: Could not copy', bingoUrl, 'to clipboard')
    );
  }

  function handleUpdate(event) {
    isOpen = event.detail.isOpen;
  }
  export let active;
  export let seed;
  export let bingoUrl;

</script>

<header>
  <Navbar class="navbar" color="light fixed-top" light expand="md">
    <NavbarBrand href="/">Bingo</NavbarBrand>
    <NavbarToggler on:click="{() => (isOpen = !isOpen)}" />
    <Collapse isOpen="{isOpen}" navbar expand="md" on:update="{handleUpdate}">
      <Nav navbar>
        <NavItem>
          <NavLink href="./" active="{active === 'create'}"
            >Create <span class="visually-hidden">(current)</span></NavLink
          >
        </NavItem>
        <NavItem>
          <NavLink href="./bingo.html" active="{active === 'play'}">Play</NavLink>
        </NavItem>
      </Nav>
      <Nav class="ms-auto" navbar>
        {#if seed}
          <NavItem>
            <span
              class="seed-button"
              title="Copy bingo URL to clipboard (e.g. to share with others)"
              on:click="{handleCopyToClipboard}">Seed: {seed}</span
            >
          </NavItem>
        {/if}
        <NavItem>
          <NavLink href="https://github.com/tchamberlin/person-bingo">
            <span>
              {'v[VI]{version}[/VI]'}
              <img class="img-link" src="{githubLogo}" alt="GitHub Repo Link" />
            </span>
          </NavLink>
        </NavItem>
      </Nav>
    </Collapse>
  </Navbar>
</header>
