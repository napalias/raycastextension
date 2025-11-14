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

    // Use Window menu to move to virtual desktop (Space)
    // This is the native macOS method for moving windows between Spaces
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

    -- Use Window menu to move to desktop
    tell process appName
        set frontmost to true
        delay 0.1

        -- Check if Window menu exists
        if not (exists menu bar item "Window" of menu bar 1) then
            return "error:no_window_menu"
        end if

        -- Open Window menu
        click menu bar item "Window" of menu bar 1
        delay 0.3

        set theMenu to menu "Window" of menu bar item "Window" of menu bar 1

        -- Try different menu item patterns (varies by macOS version)
        -- Sonoma/Sequoia: "Move Window to Desktop X"
        -- Earlier: "Desktop X" directly or under "Move to" submenu

        if exists menu item ("Move Window to Desktop " & targetDesktop) of theMenu then
            click menu item ("Move Window to Desktop " & targetDesktop) of theMenu
            return "success"
        end if

        -- Look for "Assign To" submenu (appears in some macOS versions)
        if exists menu item "Assign To" of theMenu then
            click menu item "Assign To" of theMenu
            delay 0.25

            set subMenu to menu 1 of menu item "Assign To" of theMenu

            -- Try different naming patterns
            if exists menu item ("Desktop " & targetDesktop) of subMenu then
                click menu item ("Desktop " & targetDesktop) of subMenu
                return "success"
            else if exists menu item (targetDesktop as string) of subMenu then
                click menu item (targetDesktop as string) of subMenu
                return "success"
            end if

            -- Close submenu if desktop not found
            key code 53
            return "error:desktop_not_in_menu"
        end if

        -- Check for "Move to" submenu
        if exists menu item "Move to" of theMenu then
            click menu item "Move to" of theMenu
            delay 0.25

            set subMenu to menu 1 of menu item "Move to" of theMenu

            -- Try different naming patterns
            if exists menu item ("Desktop " & targetDesktop) of subMenu then
                click menu item ("Desktop " & targetDesktop) of subMenu
                return "success"
            else if exists menu item (targetDesktop as string) of subMenu then
                click menu item (targetDesktop as string) of subMenu
                return "success"
            end if

            -- Close submenu if desktop not found
            key code 53
            return "error:desktop_not_in_menu"
        end if

        -- Debug: List what's actually in the menu
        set menuItemsList to ""
        repeat with menuItem in menu items of theMenu
            try
                set menuItemsList to menuItemsList & (name of menuItem) & ", "
            end try
        end repeat

        -- Close menu if no "Move to" or "Assign To" option
        key code 53
        return "error:no_move_option|" & menuItemsList
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
    } else if (result === "error:no_window_menu") {
      await showToast({
        style: Toast.Style.Failure,
        title: "No Window Menu",
        message: `This app doesn't have a Window menu.

Try manually:
1. Open Mission Control (swipe up with 3-4 fingers or press F3)
2. Drag the window to Desktop ${desktopNum} at the top`,
      });
    } else if (result === "error:desktop_not_in_menu") {
      await showToast({
        style: Toast.Style.Failure,
        title: "Desktop Not Available",
        message: `Desktop ${desktopNum} is not in the Window menu.

To fix:
1. Create Desktop ${desktopNum}: Mission Control (F3) → hover top-right → click +
2. Or assign the window to an existing desktop from the Window menu`,
      });
    } else if (result.startsWith("error:no_move_option")) {
      // Parse debug info if available
      const parts = result.split("|");
      const menuItems = parts.length > 1 ? parts[1] : "unknown";

      await showToast({
        style: Toast.Style.Failure,
        title: "Move Option Not Found",
        message: `Window menu items found: ${menuItems}

This likely means:
1. Mission Control settings need adjustment:
   System Settings → Desktop & Dock → Mission Control
   → Enable "Displays have separate Spaces"
2. Or manually move: Open Mission Control (F3) → Drag window to Desktop ${desktopNum}`,
      });
    } else {
      // Unknown error - show the actual result for debugging
      await showToast({
        style: Toast.Style.Failure,
        title: "Unknown Error",
        message: `AppleScript returned: ${result}

Please report this issue with details about:
- Which app you were moving
- Your macOS version
- Whether Desktop ${desktopNum} exists`,
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
