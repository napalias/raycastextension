# Window Desktop Mover

Move your active window to any desktop (Space) with a simple command.

## Features

- 🖥️ Move windows between desktops (Spaces) instantly
- ⚡ Simple command: just type `desktop [number]`
- ✅ Works with all macOS applications
- 🎯 Smart fallback: tries Window menu first, then keyboard shortcuts
- 🔓 No Raycast Pro required (uses AppleScript)

## Usage

1. Open Raycast (⌘ Space or your configured hotkey)
2. Type: `move to desktop` or `desktop`
3. Enter the desktop number (e.g., `2` for second desktop)
4. Press Enter

Your active window will instantly move to the specified desktop!

### Quick Examples

- Move window to first desktop: `desktop 1`
- Move window to second desktop: `desktop 2`
- Move window to third desktop: `desktop 3`

## Desktop Numbers

- Desktop 1 = First desktop/Space
- Desktop 2 = Second desktop/Space
- Desktop 3 = Third desktop/Space
- etc.

**Note**: Desktop numbers correspond to your Mission Control Spaces from left to right.

## Requirements

- macOS 11.0 or later
- Raycast 1.50.0 or later
- No Raycast Pro subscription required
- Multiple desktops (Spaces) configured in Mission Control

## Permissions

On first use, macOS may request the following permissions:

1. **Accessibility permissions** - Required to control window management and access menus

**How to grant permissions:**
1. Go to System Settings → Privacy & Security → Accessibility
2. Ensure Raycast has a checkmark
3. If needed, click the lock icon and enter your password to make changes

## Setup

This extension uses two methods to move windows:

### Method 1: Window Menu (Primary)
Works with most applications that have a "Window → Move to" menu. No additional setup required.

### Method 2: Keyboard Shortcuts (Fallback)
If the Window menu approach fails, the extension will attempt to use Mission Control keyboard shortcuts.

**To enable keyboard shortcuts:**
1. Go to System Settings → Keyboard → Keyboard Shortcuts
2. Select "Mission Control" from the sidebar
3. Enable "Switch to Desktop 1", "Switch to Desktop 2", etc.
4. Ensure shortcuts are set to ^1, ^2, ^3, etc. (Control + number)

## Installation

### From Raycast Store (Coming Soon)
Search for "Window Desktop Mover" in the Raycast Store and click Install.

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

### "Desktop not found"
- **Cause**: The specified desktop number doesn't exist
- **Solution**: Check your desktop number. Available desktops start from 1
- **Tip**: Open Mission Control (F3 or swipe up with three fingers) to see all your desktops

### "No active window found"
- **Cause**: No window is currently active, or the active element is not a window
- **Solution**: Click on a window to make it active before running the command
- **Note**: Some system windows and dialogs cannot be moved

### "Invalid Desktop Number"
- **Cause**: You entered a non-numeric value or zero/negative number
- **Solution**: Enter a valid positive number (1, 2, 3, etc.)

### "This application does not support moving windows to desktops via Window menu"
- **Cause**: The active application doesn't have a Window menu or "Move to" submenu
- **Solution**: The extension will automatically fall back to keyboard shortcuts. Ensure Mission Control shortcuts are enabled (see Setup section above)

### "Permission denied" or "Not authorized"
- **Cause**: macOS accessibility permissions not granted
- **Solution**:
  1. Open System Settings → Privacy & Security → Accessibility
  2. Ensure Raycast is checked
  3. Restart Raycast if needed

### "Unable to move window. Please enable Mission Control keyboard shortcuts"
- **Cause**: Both Window menu and keyboard shortcuts failed
- **Solution**:
  1. Enable Mission Control keyboard shortcuts in System Settings → Keyboard → Keyboard Shortcuts → Mission Control
  2. Ensure you have multiple desktops created in Mission Control
  3. Some applications may not support window movement between desktops

## Technical Details

### Implementation
This extension uses AppleScript with a dual-approach strategy:

**Primary Method (Window Menu):**
1. Detects the frontmost application and window using System Events
2. Accesses the application's Window menu via UI scripting
3. Navigates to "Move to" submenu and clicks the target desktop
4. Provides reliable window movement for applications with Window menus

**Fallback Method (Keyboard Shortcuts):**
1. Uses Mission Control keyboard shortcuts (Control + number)
2. Simulates key presses to switch to the target desktop
3. Brings the active window along with the switch
4. Works when Window menu is unavailable

### Why AppleScript?
- Universal compatibility (no Raycast Pro required)
- Reliable access to macOS window management via UI scripting
- Native support for Mission Control and Spaces
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
3. Search for "Move to Desktop"
4. Test with different desktop numbers
5. Ensure you have multiple desktops created in Mission Control

### Project Structure
```
raycastextension/
├── src/
│   ├── move-to-desktop.tsx   # Main command implementation
│   └── types.ts              # TypeScript type definitions
├── assets/
│   └── ICONS_NEEDED.md       # Icon specifications
├── package.json              # Extension manifest
├── tsconfig.json             # TypeScript configuration
└── README.md                 # Documentation
```

## Known Limitations

- Fullscreen windows cannot be moved between desktops (macOS limitation)
- Some system dialogs cannot be moved (security restriction)
- Desktop numbers are based on left-to-right ordering in Mission Control
- Some applications without Window menu support require keyboard shortcuts to be enabled
- The window menu approach may vary slightly between different applications

## Future Enhancements

Planned features for future releases:
- [ ] List all available desktops with names
- [ ] Move window and follow to new desktop (optional)
- [ ] Remember preferred desktop per application
- [ ] Support for moving windows to specific desktop by name
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
- Inspired by the need for quick window management across multiple desktops
- Thanks to the Raycast community for feedback and suggestions

## Support

If you encounter issues or have questions:
1. Check the Troubleshooting section above
2. Search existing GitHub issues
3. Create a new issue with details about your setup and the problem

---

**Version**: 1.0.0
**Last Updated**: 2025-11-14
