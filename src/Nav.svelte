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
  .version-number {
    vertical-align: middle;
  }

</style>

<script lang="ts">
  import { Collapse, Navbar, NavbarToggler, NavbarBrand, Nav, NavItem, NavLink } from 'sveltestrap';
  import githubLogo from './icons/GitHub-Mark-32px.png';

  let isOpen = false;

  function handleUpdate(event) {
    isOpen = event.detail.isOpen;
  }
  export let active: string;

</script>

<header>
  <Navbar color="light" light expand="md">
    <NavbarBrand href="/">Bingo</NavbarBrand>
    <NavbarToggler on:click="{() => (isOpen = !isOpen)}" />
    <Collapse isOpen="{isOpen}" navbar expand="md" on:update="{handleUpdate}">
      <Nav navbar>
        <NavItem>
          <NavLink href="./" active="{active === 'create'}">
            Create <span class="visually-hidden">(current)</span>
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink href="./bingo.html" active="{active === 'play'}">Play</NavLink>
        </NavItem>
      </Nav>
      <Nav class="ms-auto" navbar>
        <NavItem>
          <NavLink href="https://github.com/tchamberlin/person-bingo">
            <span class="version-number">{'v[VI]{version}[/VI]'}</span>
            <img class="img-link ms-1" src="{githubLogo}" alt="GitHub Repo Link" />
          </NavLink>
        </NavItem>
      </Nav>
    </Collapse>
  </Navbar>
</header>
