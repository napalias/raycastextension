# Icon Creation TODO

## Current Status

The extension currently has a placeholder 1x1 pixel icon. For production use, you need to create a proper 512x512 pixel icon.

## Requirements

- **Size**: 512x512 pixels
- **Format**: PNG with transparency
- **Location**: `assets/extension-icon.png`

## How to Create

### Option 1: Use SF Symbols (Recommended)

1. Open **SF Symbols** app on macOS
2. Search for "display" or "monitor" symbols
3. Export at 512x512 pixels
4. Save as `assets/extension-icon.png`

### Option 2: Design Your Own

1. Use Figma, Sketch, or Adobe Illustrator
2. Create a 512x512 pixel artboard
3. Design a simple monitor/display icon
4. Export as PNG with transparency
5. Save as `assets/extension-icon.png`

### Option 3: Use Online Tools

1. Visit https://www.appicon.co/
2. Upload or create an icon design
3. Generate 512x512 size
4. Download and save as `assets/extension-icon.png`

### Option 4: Use ImageMagick (if installed)

```bash
# Create a simple colored square (placeholder)
convert -size 512x512 xc:#4A90E2 assets/extension-icon.png

# Or create with text
convert -size 512x512 xc:#4A90E2 -pointsize 200 -fill white \
  -gravity center -annotate +0+0 "📱" assets/extension-icon.png
```

## Icon Design Tips

- Keep it simple and recognizable
- Use colors that work in both light and dark modes
- Consider using macOS design language
- Test at small sizes (40x40) to ensure clarity
- Use rounded corners if desired (optional)

## Testing the Icon

After creating the icon:

1. Replace `assets/extension-icon.png`
2. Run `npm run build`
3. The icon should appear in Raycast

## Temporary Workaround

The extension will work with the placeholder icon during development. Raycast will use a default icon if the provided icon has issues. For production/publishing, a proper icon is required.
