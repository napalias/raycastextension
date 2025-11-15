import { showToast, Toast, LaunchProps, closeMainWindow } from "@raycast/api";
import { execSync } from "child_process";

interface Arguments {
  desktopNumber: string;
}

export default async function Command(
  props: LaunchProps<{ arguments: Arguments }>,
) {
  const { desktopNumber } = props.arguments;

  // Validate desktop number
  const desktopNum = parseInt(desktopNumber, 10);
  if (isNaN(desktopNum) || desktopNum < 1) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Invalid Desktop Number",
      message: "Please enter a valid desktop number (1, 2, 3, etc.)",
    });
    return;
  }

  // Close Raycast window immediately so it doesn't interfere
  await closeMainWindow();

  try {
    await showToast({
      style: Toast.Style.Animated,
      title: "Moving Window",
      message: `Moving to Desktop ${desktopNum}...`,
    });

    // Use keyboard shortcuts to move window left/right between desktops
    // This uses "Move window one space left/right" shortcuts
    const appleScript = `
tell application "System Events"
    -- Get frontmost application and window
    set frontApp to first application process whose frontmost is true
    set appName to name of frontApp

    -- Check for window
    if (count of windows of frontApp) = 0 then
        return "error:no_window"
    end if

    set targetDesktop to ${desktopNum}

    -- Make sure the app is frontmost
    tell process appName
        set frontmost to true
    end tell

    delay 0.2

    -- Strategy: Move to Desktop 1 first (by going left repeatedly)
    -- Then move right (targetDesktop - 1) times

    -- Move to Desktop 1 by pressing left arrow 10 times
    -- (more than enough to reach desktop 1 from any desktop)
    repeat 10 times
        tell application "System Events"
            -- Control + Left Arrow = move window one space left
            key code 123 using {control down}
        end tell
        delay 0.15
    end repeat

    -- Now we're at Desktop 1, move right to target desktop
    if targetDesktop > 1 then
        repeat (targetDesktop - 1) times
            tell application "System Events"
                -- Control + Right Arrow = move window one space right
                key code 124 using {control down}
            end tell
            delay 0.15
        end repeat
    end if

    delay 0.3
    return "success"
end tell
`;

    // Pass the AppleScript via stdin to handle multi-line scripts properly
    const result = execSync(`osascript`, {
      input: appleScript,
      encoding: "utf-8",
      timeout: 10000,
    }).trim();

    if (result === "success") {
      await showToast({
        style: Toast.Style.Success,
        title: "Window Moved",
        message: `Moved to Desktop ${desktopNum}`,
      });
    } else if (result === "error:no_window") {
      await showToast({
        style: Toast.Style.Failure,
        title: "No Window Found",
        message: "The frontmost app has no windows to move",
      });
    } else if (result === "error:invalid_desktop") {
      await showToast({
        style: Toast.Style.Failure,
        title: "Invalid Desktop Number",
        message: "Desktop number must be between 1 and 9",
      });
    } else {
      // Unknown error - likely the keyboard shortcut didn't work
      await showToast({
        style: Toast.Style.Failure,
        title: "Move Failed - Setup Required",
        message: `Enable Mission Control keyboard shortcuts:

1. System Settings → Keyboard → Keyboard Shortcuts
2. Click "Mission Control" on the left
3. Enable these (with default shortcuts):
   ✅ Move left a space (^←)
   ✅ Move right a space (^→)

Then create Desktop ${desktopNum} if it doesn't exist:
- Open Mission Control (F3)
- Hover top-right → Click + to create desktops

Alternative: Manually drag window in Mission Control`,
      });
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);

    console.error("Move failed with error:", errorMessage);

    let userMessage = errorMessage;
    let title = "Move Failed";

    if (
      errorMessage.toLowerCase().includes("accessibility") ||
      errorMessage.toLowerCase().includes("not authorized") ||
      errorMessage.toLowerCase().includes("not allowed assistive")
    ) {
      title = "Accessibility Permission Required";
      userMessage = `Raycast needs Accessibility permission to move windows.

Enable it:
System Settings → Privacy & Security → Accessibility → Enable Raycast`;
    } else if (errorMessage.toLowerCase().includes("connection is invalid")) {
      title = "App Not Available";
      userMessage = "The frontmost app is not available or has no windows.";
    } else {
      // Show the full error for debugging
      userMessage = `Error: ${errorMessage}

Trying to move window to Desktop ${desktopNum}. Make sure:
1. Desktop ${desktopNum} exists (check Mission Control - press F3)
2. Keyboard shortcuts are enabled:
   System Settings → Keyboard → Keyboard Shortcuts → Mission Control
   → Enable "Move left a space" and "Move right a space"
3. Raycast has Accessibility permissions`;
    }

    await showToast({
      style: Toast.Style.Failure,
      title: title,
      message: userMessage,
    });
  }
}
