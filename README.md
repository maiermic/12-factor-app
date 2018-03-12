# 12-factor-app

See [presentation](https://maiermic.github.io/12-factor-app/) (work in progress).

## Keyboard Shortcuts

- <kbd>N</kbd>, <kbd>SPACE</kbd>:	Next slide
- <kbd>P</kbd>: Previous slide
- <kbd>←</kbd>, <kbd>H</kbd>: Navigate left
- <kbd>→</kbd>, <kbd>L</kbd>: Navigate right
- <kbd>↑</kbd>, <kbd>K</kbd>: Navigate up
- <kbd>↓</kbd>, <kbd>J</kbd>: Navigate down
- <kbd>Home</kbd>: First slide
- <kbd>End</kbd>: Last slide
- <kbd>B</kbd>, <kbd>.</kbd>: Pause (Blackout)
- <kbd>F</kbd>: Fullscreen
- <kbd>ESC</kbd>, <kbd>O</kbd>: Slide overview / Escape from full-screen
- <kbd>S</kbd>: Speaker notes view
- <kbd>?</kbd>: Show keyboard shortcuts
- <kbd>alt</kbd> + click: Zoom in. Repeat to zoom back out.


## Development

```
nvm use
yarn install
yarn run watch
```

Open http://localhost:1948/presentation.md

### Create PDF
```
yarn run create-pdf
```

#### Alternative
Local development server has to be running on port 1948

```
yarn run start
```

Then run:

```
yarn run create-pdf-local
```

## Deploy

```
yarn run deploy
```

