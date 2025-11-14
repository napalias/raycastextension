# Window Desktop Mover

Move your active window to any desktop (Space) with a simple command.

## Features

- 🖥️ Move windows between desktops (Spaces) instantly
- ⚡ Simple command: just type `desktop [number]`
- ✅ Works with all macOS applications
- 🎯 Uses Mission Control UI scripting for reliable window movement
- 🔓 No Raycast Pro required (uses JXA - JavaScript for Automation)

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

This extension uses Mission Control UI scripting to move windows between desktops (Spaces).

**No additional setup required!** The extension will:
1. Automatically detect your virtual desktops
2. Use Mission Control to drag and drop the window to the target desktop
3. Switch to the target desktop after moving the window

**Note:** Ensure you have multiple desktops configured in Mission Control (F3 or swipe up with three fingers, then click "+" to add desktops)

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

### "Permission denied" or "Not authorized"
- **Cause**: macOS accessibility permissions not granted
- **Solution**:
  1. Open System Settings → Privacy & Security → Accessibility
  2. Ensure Raycast is checked
  3. Restart Raycast if needed

### Window doesn't move / Extension seems stuck
- **Cause**: Mission Control UI timing or cursor position issues
- **Solution**:
  1. Ensure Mission Control is not already open
  2. Try running the command again
  3. Close any fullscreen windows (they can't be moved between desktops)
  4. Make sure you have the target desktop already created in Mission Control

## Technical Details

### Implementation
This extension uses **JXA (JavaScript for Automation)** with Mission Control UI scripting:

**How it works:**
1. Detects the frontmost application and window using System Events
2. Launches Mission Control to reveal all desktops and window thumbnails
3. Uses Core Graphics APIs to manipulate the cursor programmatically
4. Locates the window thumbnail and target desktop button in Mission Control
5. Simulates dragging the window thumbnail to the target desktop
6. Clicks the target desktop to switch focus
7. Restores the original cursor position

**Key Technologies:**
- **JXA**: JavaScript for Automation with Objective-C bridge
- **Core Graphics**: Native cursor manipulation via `CGEvent` APIs
- **Mission Control UI Scripting**: Accessing Dock's Mission Control interface elements
- **System Events**: Window and application detection

### Why JXA Instead of AppleScript?
- **Direct API Access**: JXA provides access to Objective-C frameworks (Cocoa, Core Graphics)
- **Cursor Control**: Can programmatically move and click the mouse, which AppleScript cannot do reliably
- **Mission Control Integration**: Only way to interact with Mission Control's UI elements programmatically
- **Universal Compatibility**: Works with all macOS applications, regardless of menu structure
- **No Setup Required**: Doesn't depend on keyboard shortcuts or application-specific menus

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

- **Fullscreen windows** cannot be moved between desktops (macOS limitation)
- **Some system dialogs** cannot be moved (security restriction)
- **Desktop numbers** are based on left-to-right ordering in Mission Control
- **Cursor manipulation**: The extension temporarily moves your cursor (it's restored afterward)
- **Timing sensitive**: Uses delays for Mission Control animations (usually 0.5-1 second total)
- **Window titles**: Windows with very long or special characters in titles may require additional handling

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
