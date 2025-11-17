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

    // Strategy: Get current desktop, calculate difference, move relatively
    // This uses macOS Mission Control shortcuts that actually work
    const appleScript = `
tell application "System Events"
    -- Get frontmost application
    set frontApp to first application process whose frontmost is true
    set appName to name of frontApp

    -- Check for window
    if (count of windows of frontApp) = 0 then
        return "error:no_window"
    end if

    set targetDesktop to ${desktopNum}

    -- Get current desktop/space number using Mission Control
    tell application "System Events"
        tell process "ControlCenter"
            -- This will give us the current space
        end tell
    end tell

    -- Use a simple approach: Get current space from do shell script
    try
        set currentSpace to do shell script "python3 -c \\"
import Quartz
activeSpace = Quartz.CGSGetActiveSpace(Quartz.CGSMainConnectionID())
spaces = Quartz.CGSCopySpacesForWindows(Quartz.CGSMainConnectionID(), 0xFFFF)
spaceIndex = 1
for i, space in enumerate(spaces):
    if space == activeSpace:
        spaceIndex = i + 1
        break
print(spaceIndex)
\\""
        set currentDesktopNum to currentSpace as integer
    on error
        -- If we can't get current desktop, assume we're on desktop 1
        set currentDesktopNum to 1
    end try

    -- Calculate how many times to move
    set moveCount to targetDesktop - currentDesktopNum

    -- Make sure app is frontmost
    tell process appName
        set frontmost to true
    end tell
    delay 0.2

    -- Move window left or right based on direction
    if moveCount > 0 then
        -- Move right
        repeat moveCount times
            key code 124 using {control down, shift down} -- Right arrow
            delay 0.2
        end repeat
    else if moveCount < 0 then
        -- Move left
        repeat (-moveCount) times
            key code 123 using {control down, shift down} -- Left arrow
            delay 0.2
        end repeat
    end if

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
    } else {
      await showToast({
        style: Toast.Style.Failure,
        title: "Move Failed",
        message: `Could not move window to Desktop ${desktopNum}.

Error: ${result}

Make sure:
1. Desktop ${desktopNum} exists (create in Mission Control)
2. Keyboard shortcuts are enabled in System Settings`,
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
   → Enable "Move window one space left" and "Move window one space right"
3. Raycast has Accessibility permissions`;
    }

    await showToast({
      style: Toast.Style.Failure,
      title: title,
      message: userMessage,
    });
  }
}
