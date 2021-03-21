# Bingo

A simple client-side web app for playing Bingo.

## Usage

### Create Bingo Board

First you will need to populate the board "spaces" with text. Simply navigate to `/`, and you'll be able to enter 25+ phrases to use as your Bingo text.

### Play Bingo

Once you've navigated to `/bingo.html`, you'll be presented with the game board. The algorithm is basically:

1. Find a person that matches the text in a space
2. Put their name in the text input
3. Once you've gotten 5 unique names in a row, column, or diagonal, it will turn green to indicate you've won

## Development

This game is built with [Svelte](https://svelte.dev). Getting started is quite simple:

```bash
# Install dependencies
npm install
# Start dev server
npm run dev
```

## Deployment

```bash
npm run build
```

Builds go to `/public`. Deployment is currently as simple as `rsync`ing this directory somewhere. This is a purely static (client-side) application.
