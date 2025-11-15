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

    // Use Dock's right-click menu to assign window to desktop
    // This is the most reliable method that works across all macOS versions
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

    -- Find the app in the Dock
    tell dock preferences
        set autohideValue to autohide
    end tell

    tell process "Dock"
        try
            -- Find the app's icon in the Dock
            set appIcon to first UI element of list 1 whose name contains appName

            -- Right-click on the Dock icon
            perform action "AXShowMenu" of appIcon
            delay 0.3

            -- Navigate to Options > Assign To > Desktop X
            tell menu 1 of appIcon
                if exists menu item "Options" then
                    click menu item "Options"
                    delay 0.2

                    tell menu 1 of menu item "Options"
                        if exists menu item "Assign To" then
                            click menu item "Assign To"
                            delay 0.2

                            tell menu 1 of menu item "Assign To"
                                -- Try different naming patterns
                                set desktopNames to {"Desktop " & targetDesktop, "Desktop on Display " & targetDesktop, targetDesktop as string}

                                repeat with desktopName in desktopNames
                                    if exists menu item desktopName then
                                        click menu item desktopName
                                        return "success"
                                    end if
                                end repeat

                                -- Desktop not found
                                key code 53 -- Escape to close menus
                                return "error:desktop_not_found"
                            end tell
                        else
                            key code 53
                            return "error:no_assign_to"
                        end if
                    end tell
                else
                    key code 53
                    return "error:no_options"
                end if
            end tell
        on error errMsg
            return "error:dock_error|" & errMsg
        end try
    end tell
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
    } else if (result === "error:desktop_not_found") {
      await showToast({
        style: Toast.Style.Failure,
        title: "Desktop Not Found",
        message: `Desktop ${desktopNum} not found in Dock menu.

Create Desktop ${desktopNum}:
1. Open Mission Control (F3 or swipe up)
2. Hover top-right corner → Click +
3. Create desktops until you have Desktop ${desktopNum}`,
      });
    } else if (result === "error:no_assign_to") {
      await showToast({
        style: Toast.Style.Failure,
        title: "Assign To Not Available",
        message: `"Assign To" option not found in Dock menu.

Make sure "Displays have separate Spaces" is enabled:
System Settings → Desktop & Dock → Mission Control
→ Enable "Displays have separate Spaces"
→ Log out and log back in`,
      });
    } else if (result.startsWith("error:dock_error")) {
      const parts = result.split("|");
      const errorMsg = parts.length > 1 ? parts[1] : "unknown";
      await showToast({
        style: Toast.Style.Failure,
        title: "Dock Access Error",
        message: `Could not access Dock menu: ${errorMsg}

Make sure:
1. The app is in your Dock
2. Raycast has Accessibility permissions`,
      });
    } else {
      await showToast({
        style: Toast.Style.Failure,
        title: "Move Failed",
        message: `Could not move window to Desktop ${desktopNum}.

Error: ${result}

Try manually: Right-click app in Dock → Options → Assign To → Desktop ${desktopNum}`,
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
2. "Displays have separate Spaces" is enabled:
   System Settings → Desktop & Dock → Mission Control
3. The app is in your Dock
4. Raycast has Accessibility permissions`;
    }

    await showToast({
      style: Toast.Style.Failure,
      title: title,
      message: userMessage,
    });
  }
}
