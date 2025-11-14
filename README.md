# Window Display Mover

Move your active window to any display with a simple command.

## Features

- 🖥️ Move windows between displays instantly
- ⚡ Simple command: just type `display [number]`
- ✅ Works with all macOS applications
- 🎯 Intelligent window positioning
- 🔓 No Raycast Pro required (uses AppleScript)

## Usage

1. Open Raycast (⌘ Space or your configured hotkey)
2. Type: `move to display` or `display`
3. Enter the display number (e.g., `2` for second display)
4. Press Enter

Your active window will instantly move to the specified display!

### Quick Examples

- Move window to primary display: `display 1`
- Move window to second display: `display 2`
- Move window to third display: `display 3`

## Display Numbers

- Display 1 = Primary display (main monitor)
- Display 2 = First secondary display
- Display 3 = Second secondary display
- etc.

**Note**: Display numbers correspond to the order macOS assigns to your displays.

## Requirements

- macOS 11.0 or later
- Raycast 1.50.0 or later
- No Raycast Pro subscription required

## Permissions

On first use, macOS may request the following permissions:

1. **Accessibility permissions** - Required to control window positions
2. **Screen Recording permissions** - May be requested to detect displays

**How to grant permissions:**
1. Go to System Preferences → Security & Privacy → Privacy
2. Select "Accessibility" from the left sidebar
3. Ensure Raycast has a checkmark
4. If needed, click the lock icon and enter your password to make changes

## Installation

### From Raycast Store (Coming Soon)
Search for "Window Display Mover" in the Raycast Store and click Install.

### Manual Installation (Development)
```bash
# Clone the repository
git clone https://github.com/napalias/raycastextension.git

# Navigate to the directory
cd raycastextension

# Install dependencies
npm install

# Run in development mode
npm run dev
```

## Troubleshooting

### "Display not found"
- **Cause**: The specified display number doesn't exist
- **Solution**: Check your display number. Available displays start from 1
- **Tip**: Make sure all displays are connected and recognized by macOS

### "No active window found"
- **Cause**: No window is currently active, or the active element is not a window
- **Solution**: Click on a window to make it active before running the command
- **Note**: Some system windows and dialogs cannot be moved

### "Invalid Display Number"
- **Cause**: You entered a non-numeric value or zero/negative number
- **Solution**: Enter a valid positive number (1, 2, 3, etc.)

### "Permission denied" or "Not authorized"
- **Cause**: macOS accessibility permissions not granted
- **Solution**:
  1. Open System Preferences → Security & Privacy → Privacy
  2. Select "Accessibility"
  3. Ensure Raycast is checked
  4. Restart Raycast if needed

### Window moves but appears off-screen
- **Cause**: Display positioning or bounds issue
- **Solution**: The window is positioned 100 pixels from the top-left of the target display. You may need to adjust the window manually once.

## Technical Details

### Implementation
This extension uses AppleScript with macOS frameworks (Foundation, AppKit) to:
1. Query available displays using NSScreen API
2. Detect the active window using System Events
3. Calculate the target position based on display bounds
4. Move the window to the new position

### Why AppleScript?
- Universal compatibility (no Raycast Pro required)
- Reliable access to macOS window management
- Full control over window positioning
- Works with all standard macOS applications

## Development

### Building
```bash
npm run build
```

### Linting
```bash
npm run lint
npm run fix-lint  # Auto-fix issues
```

### Testing
To test the extension:
1. Run `npm run dev`
2. Open Raycast
3. Search for "Move to Display"
4. Test with different display numbers

### Project Structure
```
raycastextension/
├── src/
│   ├── move-to-display.tsx   # Main command implementation
│   └── types.ts               # TypeScript type definitions
├── assets/
│   └── ICONS_NEEDED.md        # Icon specifications
├── package.json               # Extension manifest
├── tsconfig.json              # TypeScript configuration
└── README.md                  # Documentation
```

## Known Limitations

- Fullscreen windows may not move correctly (macOS limitation)
- Some system dialogs cannot be moved (security restriction)
- Window positioning is fixed at 100px offset from top-left
- Display numbers are based on macOS internal ordering

## Future Enhancements

Planned features for future releases:
- [ ] List all available displays with info
- [ ] Configurable window positioning (center, corners, etc.)
- [ ] Remember preferred display per application
- [ ] Keyboard shortcuts for quick display switching
- [ ] Optional Raycast Pro integration for enhanced features

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Author

**napalias**

## Acknowledgments

- Built with [Raycast API](https://developers.raycast.com/)
- Inspired by the need for quick window management across multiple displays
- Thanks to the Raycast community for feedback and suggestions

## Support

If you encounter issues or have questions:
1. Check the Troubleshooting section above
2. Search existing GitHub issues
3. Create a new issue with details about your setup and the problem

---

**Version**: 1.0.0
**Last Updated**: 2025-11-14
