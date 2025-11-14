# Window Display Mover Extension - Implementation Plan

## Project Overview

**Extension Name**: Window Display Mover
**Purpose**: Move the current active window to a specified display using a simple Raycast command
**Command Format**: `display [Virtual Display Number]`

## Language & Technology Stack

### Primary Language: TypeScript

**Why TypeScript?**
- ✅ Required by Raycast (not optional)
- ✅ Built-in type safety reduces bugs
- ✅ Excellent IDE support with autocomplete
- ✅ React-based UI with TypeScript types
- ✅ Official `@raycast/api` package fully typed

### Framework: React
- Raycast extensions use React components
- Hooks-based state management
- Declarative UI patterns

## Implementation Approaches

We have two main approaches to implement this functionality:

### Approach 1: Native Raycast Window Management API (Recommended for Pro Users)

**Pros:**
- ✅ Clean, native TypeScript implementation
- ✅ Type-safe API
- ✅ Better error handling
- ✅ More reliable
- ✅ Official Raycast support

**Cons:**
- ❌ Requires Raycast Pro subscription
- ❌ Need to check access with `environment.canAccess(WindowManagement)`

**Key APIs:**
```typescript
import { getActiveWindow, setWindowBounds, environment } from "@raycast/api";

// Get current active window
const window = await getActiveWindow();

// Move to specific display
await setWindowBounds(window, {
  desktopId: displayNumber,
  // Optional: maintain size and relative position
});
```

### Approach 2: AppleScript/Shell Script (Universal Compatibility)

**Pros:**
- ✅ Works without Raycast Pro
- ✅ Full control over window positioning
- ✅ Can customize behavior extensively

**Cons:**
- ❌ Less elegant (shell execution from TypeScript)
- ❌ Requires AppleScript knowledge
- ❌ Potential permission issues
- ❌ Error handling more complex

**Implementation:**
```typescript
import { runAppleScript } from "@raycast/utils";

const script = `
tell application "System Events"
  set frontApp to name of first application process whose frontmost is true
  tell process frontApp
    set windowPosition to position of window 1
    -- Calculate new position based on display bounds
    set position of window 1 to {newX, newY}
  end tell
end tell
`;

await runAppleScript(script);
```

## Recommended Implementation Plan

### Phase 1: Project Setup

**Files to Create:**

```
raycastextension/
├── src/
│   ├── move-to-display.tsx        # Main command file
│   ├── utils/
│   │   ├── display-manager.ts     # Display management logic
│   │   └── window-bounds.ts       # Calculate window positions
│   └── types.ts                   # TypeScript type definitions
├── assets/
│   ├── command-icon.png           # Command icon (display/monitor icon)
│   └── extension-icon.png         # Extension icon
├── package.json                   # Extension manifest
├── tsconfig.json                  # TypeScript config
└── README.md                      # User documentation
```

**Dependencies:**
```json
{
  "dependencies": {
    "@raycast/api": "^1.82.0",
    "@raycast/utils": "^1.16.0"
  },
  "devDependencies": {
    "@raycast/eslint-config": "^1.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0",
    "typescript": "^5.0.0"
  }
}
```

### Phase 2: Package.json Configuration

```json
{
  "$schema": "https://www.raycast.com/schemas/extension.json",
  "name": "window-display-mover",
  "title": "Window Display Mover",
  "description": "Move active windows between displays with simple commands",
  "icon": "extension-icon.png",
  "author": "napalias",
  "categories": [
    "Productivity",
    "System"
  ],
  "license": "MIT",
  "commands": [
    {
      "name": "move-to-display",
      "title": "Move to Display",
      "description": "Move the active window to a specific display",
      "mode": "no-view",
      "arguments": [
        {
          "name": "displayNumber",
          "placeholder": "Display Number",
          "type": "text",
          "required": true
        }
      ]
    }
  ],
  "scripts": {
    "build": "ray build -e dist",
    "dev": "ray develop",
    "fix-lint": "ray lint --fix",
    "lint": "ray lint"
  }
}
```

**Key Points:**
- `mode: "no-view"` - Command executes immediately without opening a UI
- `arguments` - Accepts the display number as input
- User types: `display 2` to move window to display #2

### Phase 3: Core Implementation

#### Option A: Using Raycast Window Management API

**File: `src/move-to-display.tsx`**

```typescript
import { showToast, Toast, LaunchProps, environment, getActiveWindow, setWindowBounds } from "@raycast/api";
import { getDisplays } from "./utils/display-manager";

interface Arguments {
  displayNumber: string;
}

export default async function Command(props: LaunchProps<{ arguments: Arguments }>) {
  const { displayNumber } = props.arguments;

  try {
    // Validate display number
    const displayNum = parseInt(displayNumber, 10);
    if (isNaN(displayNum) || displayNum < 1) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Invalid Display Number",
        message: "Please enter a valid display number (1, 2, 3, etc.)",
      });
      return;
    }

    // Check if Window Management API is available
    if (!environment.canAccess(environment.FeatureSet.WindowManagement)) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Raycast Pro Required",
        message: "Window Management API requires Raycast Pro",
      });
      return;
    }

    // Get active window
    const activeWindow = await getActiveWindow();
    if (!activeWindow) {
      await showToast({
        style: Toast.Style.Failure,
        title: "No Active Window",
        message: "No window is currently active",
      });
      return;
    }

    // Get available displays
    const displays = await getDisplays();
    const targetDisplay = displays.find(d => d.id === displayNum);

    if (!targetDisplay) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Display Not Found",
        message: `Display ${displayNum} is not available. Available displays: ${displays.map(d => d.id).join(", ")}`,
      });
      return;
    }

    // Move window to target display
    await setWindowBounds(activeWindow, {
      desktopId: targetDisplay.id,
      // Maintain relative position on new display
      x: targetDisplay.bounds.x + 100,
      y: targetDisplay.bounds.y + 100,
      width: activeWindow.bounds.width,
      height: activeWindow.bounds.height,
    });

    await showToast({
      style: Toast.Style.Success,
      title: "Window Moved",
      message: `Moved to Display ${displayNum}`,
    });
  } catch (error) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Failed to Move Window",
      message: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
}
```

#### Option B: Using AppleScript (No Pro Required)

**File: `src/move-to-display.tsx`**

```typescript
import { showToast, Toast, LaunchProps } from "@raycast/api";
import { runAppleScript } from "@raycast/utils";

interface Arguments {
  displayNumber: string;
}

export default async function Command(props: LaunchProps<{ arguments: Arguments }>) {
  const { displayNumber } = props.arguments;

  try {
    // Validate display number
    const displayNum = parseInt(displayNumber, 10);
    if (isNaN(displayNum) || displayNum < 1) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Invalid Display Number",
        message: "Please enter a valid display number (1, 2, 3, etc.)",
      });
      return;
    }

    // AppleScript to get display bounds and move window
    const script = `
      use framework "Foundation"
      use framework "AppKit"
      use scripting additions

      -- Get all screens
      set allScreens to current application's NSScreen's screens()
      set screenCount to count of allScreens

      -- Validate display number
      if ${displayNum} > screenCount then
        return "Error: Display ${displayNum} not found. Available displays: 1 to " & screenCount
      end if

      -- Get target screen (0-indexed in Cocoa)
      set targetScreen to item ${displayNum} of allScreens
      set targetFrame to targetScreen's frame()
      set targetX to (item 1 of item 1 of targetFrame) as integer
      set targetY to (item 2 of item 1 of targetFrame) as integer
      set targetWidth to (item 1 of item 2 of targetFrame) as integer
      set targetHeight to (item 2 of item 2 of targetFrame) as integer

      -- Get frontmost application and window
      tell application "System Events"
        set frontApp to name of first application process whose frontmost is true
        tell process frontApp
          if (count of windows) = 0 then
            return "Error: No active window found"
          end if

          -- Get current window bounds
          set windowBounds to position of window 1
          set windowSize to size of window 1
          set windowWidth to item 1 of windowSize
          set windowHeight to item 2 of windowSize

          -- Calculate new position (centered on target display with offset)
          set newX to targetX + 100
          set newY to targetY + 100

          -- Move window to new display
          set position of window 1 to {newX, newY}

          return "Success: Window moved to Display ${displayNum}"
        end tell
      end tell
    `;

    const result = await runAppleScript(script);

    if (result.includes("Error:")) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to Move Window",
        message: result.replace("Error: ", ""),
      });
    } else {
      await showToast({
        style: Toast.Style.Success,
        title: "Window Moved",
        message: `Moved to Display ${displayNum}`,
      });
    }
  } catch (error) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Failed to Move Window",
      message: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
}
```

**File: `src/utils/display-manager.ts`**

```typescript
import { runAppleScript } from "@raycast/utils";

export interface Display {
  id: number;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  isPrimary: boolean;
}

export async function getDisplays(): Promise<Display[]> {
  const script = `
    use framework "Foundation"
    use framework "AppKit"

    set allScreens to current application's NSScreen's screens()
    set mainScreen to current application's NSScreen's mainScreen()
    set displayInfo to {}

    repeat with i from 1 to count of allScreens
      set currentScreen to item i of allScreens
      set screenFrame to currentScreen's frame()
      set x to (item 1 of item 1 of screenFrame) as integer
      set y to (item 2 of item 1 of screenFrame) as integer
      set w to (item 1 of item 2 of screenFrame) as integer
      set h to (item 2 of item 2 of screenFrame) as integer
      set isPrimary to (currentScreen is mainScreen)

      set end of displayInfo to {id:i, x:x, y:y, width:w, height:h, primary:isPrimary}
    end repeat

    return displayInfo as text
  `;

  const result = await runAppleScript(script);

  // Parse result and convert to Display objects
  // Note: This is simplified - actual parsing would be more robust
  const displays: Display[] = [];

  // Parse the AppleScript result
  // Format: {id:1, x:0, y:0, width:1920, height:1080, primary:true}

  return displays;
}
```

**File: `src/types.ts`**

```typescript
export interface WindowBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DisplayInfo {
  id: number;
  name: string;
  bounds: WindowBounds;
  isPrimary: boolean;
}

export interface MoveWindowOptions {
  displayId: number;
  centerWindow?: boolean;
  maintainSize?: boolean;
}
```

### Phase 4: Testing Strategy

**Test Cases:**

1. **Valid Display Numbers**
   - [ ] Move window to Display 1
   - [ ] Move window to Display 2
   - [ ] Move window to Display 3 (if available)

2. **Invalid Inputs**
   - [ ] Non-numeric input (e.g., "abc")
   - [ ] Negative numbers (e.g., "-1")
   - [ ] Zero (e.g., "0")
   - [ ] Display number that doesn't exist (e.g., "99")

3. **Edge Cases**
   - [ ] No active window
   - [ ] Fullscreen window
   - [ ] Minimized window
   - [ ] Window that can't be moved (system dialogs)
   - [ ] Single display setup

4. **Error Scenarios**
   - [ ] Raycast Pro not available (for Approach 1)
   - [ ] AppleScript permissions denied (for Approach 2)
   - [ ] Network/system lag

### Phase 5: User Experience Enhancements

**Optional Improvements:**

1. **List All Displays Command**
   - Add a second command to show all available displays
   - Display number, resolution, and name

2. **Smart Display Selection**
   - Remember last used display per application
   - Suggest next display in sequence

3. **Keyboard Shortcuts**
   - Add hotkey support for common displays (e.g., ⌘⌥1 for Display 1)

4. **Visual Feedback**
   - Show display name in success toast
   - Brief highlight/flash on target display

5. **Configuration Options**
   - Window positioning preference (center, top-left, maintain relative position)
   - Animation speed (if supported)

### Phase 6: Documentation

**README.md Content:**

```markdown
# Window Display Mover

Move your active window to any display with a simple command.

## Features

- 🖥️ Move windows between displays instantly
- ⚡ Simple command: just type `display [number]`
- ✅ Works with all macOS applications
- 🎯 Intelligent window positioning

## Usage

1. Open Raycast (⌘ Space or your configured hotkey)
2. Type: `display 2` (replace 2 with your target display number)
3. Press Enter

Your active window will instantly move to the specified display!

## Display Numbers

- Display 1 = Primary display
- Display 2 = First secondary display
- Display 3 = Second secondary display
- etc.

## Requirements

- macOS 11.0 or later
- Raycast 1.50.0 or later
- For native API: Raycast Pro (optional)

## Permissions

On first use, macOS may ask for:
- Accessibility permissions
- Screen Recording permissions

Grant these to allow window management.

## Troubleshooting

**"Display not found"**
- Check your display number
- Ensure the display is connected and active

**"No active window"**
- Click on a window to make it active
- Some system windows cannot be moved

**"Permission denied"**
- Check System Preferences → Security & Privacy → Accessibility
- Ensure Raycast has necessary permissions

## License

MIT
```

## Recommended Approach

**I recommend starting with Approach B (AppleScript)** for these reasons:

1. ✅ **Universal compatibility** - works without Raycast Pro
2. ✅ **More control** - can customize behavior extensively
3. ✅ **Proven solution** - AppleScript window management is well-established
4. ✅ **Easier testing** - can test without Pro subscription

**Migration Path:**
- Start with AppleScript implementation
- Later add Raycast Window Management API as an optional premium feature
- Detect Pro availability and use native API when possible

## Development Timeline

**Estimated Time: 4-6 hours**

1. **Setup** (30 min)
   - Initialize project structure
   - Configure package.json
   - Install dependencies

2. **Core Implementation** (2-3 hours)
   - Write main command
   - Implement AppleScript logic
   - Add error handling
   - Create display detection

3. **Testing** (1-2 hours)
   - Test all display scenarios
   - Test error cases
   - Test with different applications

4. **Polish** (30-60 min)
   - Improve error messages
   - Add user feedback
   - Write documentation

5. **Final Review** (30 min)
   - Code review
   - Lint and format
   - Test installation

## Success Criteria

- [ ] User can type "display 2" and active window moves to Display 2
- [ ] Clear error messages for invalid inputs
- [ ] Works with all standard macOS applications
- [ ] Handles edge cases gracefully
- [ ] Code passes linting
- [ ] Documentation is clear and complete

## Next Steps

1. Review this plan
2. Decide on implementation approach (A or B)
3. Set up project structure
4. Begin implementation
5. Test thoroughly
6. Document usage

---

**Created**: 2025-11-14
**Status**: Planning Complete - Ready for Implementation
