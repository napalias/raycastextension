# Window Display Mover

A Raycast extension that lets you move your active window to any display with a simple command.

## Features

- 🖥️ **Instant window movement** - Move windows between displays in milliseconds
- ⚡ **Simple command** - Just type `display [number]` in Raycast
- ✅ **Universal compatibility** - Works with all macOS applications
- 🎯 **Smart positioning** - Automatically positions windows on the target display
- 🚫 **No Raycast Pro required** - Uses AppleScript for universal compatibility

## Installation

### From Source

1. Clone this repository
2. Navigate to the extension directory
3. Install dependencies:
   ```bash
   npm install
   ```
4. Build the extension:
   ```bash
   npm run build
   ```
5. Import into Raycast:
   - Open Raycast
   - Go to Extensions
   - Click "+" and select "Import Extension"
   - Choose this directory

### From Raycast Store (Coming Soon)

Once published, you'll be able to install directly from the Raycast Store.

## Usage

### Basic Usage

1. **Open Raycast** (default: ⌘ Space)
2. **Type the command**: `display 2`
3. **Press Enter**

Your active window will instantly move to Display 2!

### Display Numbers

Display numbers are assigned as follows:

- **Display 1** - Primary display (main monitor)
- **Display 2** - First secondary display
- **Display 3** - Second secondary display
- And so on...

### Examples

```
display 1    # Move to primary display
display 2    # Move to second display
display 3    # Move to third display
```

## Requirements

- **macOS** 11.0 or later (Big Sur or newer)
- **Raycast** 1.50.0 or later
- **Multiple displays** (for meaningful use)

## Permissions

On first use, macOS may request the following permissions:

### Accessibility Permissions

Raycast needs accessibility permissions to control windows. Grant this when prompted:

1. System Settings → Privacy & Security → Accessibility
2. Enable Raycast

### Automation Permissions

The extension uses AppleScript to move windows. macOS may ask for permission to control System Events. Click "OK" when prompted.

## Troubleshooting

### "Display not found"

**Problem**: You entered a display number that doesn't exist.

**Solution**:
- Check your connected displays
- Try `display 1` or `display 2`
- Ensure all displays are powered on and detected by macOS

### "No active window found"

**Problem**: No window is currently active or focused.

**Solution**:
- Click on a window to make it active
- Try with a different application
- Some system windows (like System Settings dialogs) cannot be moved

### "Permission denied" or "Not authorized"

**Problem**: Raycast doesn't have necessary permissions.

**Solution**:
1. Open System Settings
2. Go to Privacy & Security → Accessibility
3. Ensure Raycast is enabled
4. If already enabled, try removing and re-adding it

### Window moves to wrong position

**Problem**: Window appears at an unexpected location on the display.

**Solution**:
- This is normal - the extension positions windows with a small offset from the top-left
- You can manually adjust the window position after moving
- Future versions may include positioning options

### Extension not appearing in Raycast

**Problem**: Can't find the extension after installation.

**Solution**:
1. Ensure you've run `npm install` and `npm run build`
2. Check Raycast Extensions settings
3. Try reloading extensions in Raycast
4. Restart Raycast if necessary

## Development

### Setup

```bash
# Install dependencies
npm install

# Start development mode (hot reload)
npm run dev

# Run linter
npm run lint

# Fix linting issues
npm run fix-lint

# Build for production
npm run build
```

### Project Structure

```
raycastextension/
├── src/
│   └── move-to-display.tsx    # Main command implementation
├── assets/
│   └── ICONS_README.md        # Icon requirements
├── package.json               # Extension manifest
├── tsconfig.json              # TypeScript configuration
├── EXTENSION_PLAN.md          # Implementation plan
├── CLAUDE.md                  # AI assistant guide
└── README.md                  # This file
```

### Technology Stack

- **Language**: TypeScript
- **Framework**: React (via Raycast API)
- **Window Management**: AppleScript with NSScreen framework
- **API**: @raycast/api, @raycast/utils

### How It Works

1. **User input**: Receives display number from command argument
2. **Validation**: Validates input is a positive integer
3. **Display detection**: Uses AppleScript with NSScreen framework to enumerate displays
4. **Window detection**: Identifies the frontmost application and its active window
5. **Position calculation**: Calculates new window position on target display
6. **Window movement**: Moves window using System Events AppleScript
7. **Feedback**: Shows success/error toast notification

### Contributing

Contributions are welcome! Here's how you can help:

1. **Report bugs**: Open an issue describing the problem
2. **Suggest features**: Share your ideas for improvements
3. **Submit PRs**: Fork, create a feature branch, and submit a pull request
4. **Improve documentation**: Help make the docs clearer

#### Development Guidelines

- Follow TypeScript best practices
- Maintain existing code style
- Test with multiple displays
- Update documentation for new features
- Run linting before committing: `npm run fix-lint`

## Limitations

- **System windows**: Some system dialogs cannot be moved
- **Fullscreen apps**: Fullscreen windows may behave differently
- **Permission-restricted apps**: Some apps may block window manipulation
- **Display detection**: Display numbers may change when displays are added/removed

## Future Enhancements

Potential features for future versions:

- [ ] List all available displays with details
- [ ] Custom window positioning (center, corners, etc.)
- [ ] Keyboard shortcuts for quick access
- [ ] Remember window positions per application
- [ ] Support for moving all windows of an app
- [ ] Native Raycast Window Management API support (for Pro users)

## Privacy

This extension:
- ✅ Runs entirely locally on your Mac
- ✅ Does not collect any data
- ✅ Does not require internet connection
- ✅ Does not send any information externally
- ✅ Only accesses window information when you run the command

## License

MIT License - see LICENSE file for details

## Support

- **Issues**: [GitHub Issues](https://github.com/napalias/raycastextension/issues)
- **Discussions**: [GitHub Discussions](https://github.com/napalias/raycastextension/discussions)
- **Raycast**: [Raycast Community](https://raycast.com/community)

## Credits

**Author**: napalias

**Built with**:
- [Raycast](https://raycast.com/) - Blazingly fast, extensible launcher
- [TypeScript](https://www.typescriptlang.org/) - JavaScript with syntax for types
- [AppleScript](https://developer.apple.com/library/archive/documentation/AppleScript/Conceptual/AppleScriptLangGuide/) - macOS automation

## Changelog

### Version 1.0.0 (Initial Release)

- ✨ Move active window to any display with simple command
- 🎯 Automatic display detection and validation
- 🔔 Clear success and error notifications
- 📱 Support for unlimited number of displays
- 🔧 Robust error handling and user feedback

---

**Made with ❤️ for the Raycast community**
