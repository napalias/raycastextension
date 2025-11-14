# Icons Required

This directory should contain the following icons:

## Extension Icon
- **Filename**: `extension-icon.png`
- **Size**: 512x512 pixels
- **Format**: PNG with transparency
- **Design**: A monitor/display icon representing window management
- **Suggestion**: Use a simple icon showing two displays or a window moving between screens

## Command Icon (Optional)
- **Filename**: `command-icon.png`
- **Size**: 512x512 pixels
- **Format**: PNG with transparency
- **Design**: Similar to extension icon or use Raycast's built-in SF Symbols

## Temporary Solution

Until custom icons are added, Raycast will use default icons. The extension will work without custom icons, but custom icons provide better visual identity.

## How to Create Icons

1. **Use SF Symbols**: Export symbols from macOS SF Symbols app
2. **Design Tools**: Use Figma, Sketch, or Adobe Illustrator
3. **Icon Generator**: Use https://www.appicon.co/ or similar services
4. **AI Generation**: Use DALL-E or Midjourney for custom designs

## Icon Guidelines

- Keep designs simple and recognizable
- Use consistent styling with macOS design language
- Ensure good contrast for both light and dark modes
- Test icons at small sizes (they'll be displayed at 40x40 in Raycast)

## Installation

Once you have the icons:
1. Place `extension-icon.png` in this directory
2. The extension will automatically detect and use them
3. Rebuild the extension: `npm run build`
