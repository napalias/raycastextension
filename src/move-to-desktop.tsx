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

    // Use keyboard shortcuts to move window to virtual desktop
    // This requires Mission Control keyboard shortcuts to be enabled
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

    -- Use keyboard shortcut: Control + Option + Desktop Number
    -- This requires "Move window to Desktop X" to be enabled in:
    -- System Settings → Keyboard → Keyboard Shortcuts → Mission Control

    -- Key codes for numbers: 1=18, 2=19, 3=20, 4=21, 5=23, 6=22, 7=26, 8=28, 9=25
    set keyCodes to {18, 19, 20, 21, 23, 22, 26, 28, 25}

    if targetDesktop ≥ 1 and targetDesktop ≤ 9 then
        set theKeyCode to item targetDesktop of keyCodes

        -- Press Control + Option + Number to move window
        tell application "System Events"
            key code theKeyCode using {control down, option down}
        end tell

        delay 0.3
        return "success"
    else
        return "error:invalid_desktop"
    end if
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

1. System Settings → Keyboard
2. Keyboard Shortcuts → Mission Control
3. Enable: "Move window to Desktop ${desktopNum}"
   (or enable all "Move window to Desktop 1, 2, 3...")

Then create Desktop ${desktopNum} if it doesn't exist:
- Open Mission Control (F3)
- Hover top-right → Click +

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
1. Desktop ${desktopNum} exists (check Mission Control)
2. The app has a Window menu
3. Raycast has Accessibility permissions`;
    }

    await showToast({
      style: Toast.Style.Failure,
      title: title,
      message: userMessage,
    });
  }
}
