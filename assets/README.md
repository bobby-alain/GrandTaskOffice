# Grand Task Office Graphics

## Assets

- `office-map.png` — main interactive office-map background; place responsive hotspot buttons over the six visible zones.
- `title-screen-background.png` — title/setup screen background; render the game title, tagline, fields, and button in React rather than inside the image.
- `item-icons-sprite.png` — transparent 3 × 2 collectible-object sprite sheet.

## Item sprite order

```text
cinnamon bun | coffee          | laptop
keycard      | stapler         | secret document
```

The sheet is 1536 × 1024 pixels. Each sprite occupies a 512 × 512 cell. It can be used with CSS `background-image`, `background-size: 300% 200%`, and per-item background positions, or cropped into individual files during implementation.

## Usage rules

- Keep UI labels and clickable controls in React/CSS for clarity and accessibility.
- Do not place sensitive company information over the map.
- Preserve the images' aspect ratios.
- Use `object-fit: cover` for the title background and `object-fit: contain` for the office map.
