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

        -- Close menu if no "Move to" option
        key code 53
        return "error:no_move_option"
    end tell
end tell
`;

    const result = execSync(`osascript -e ${JSON.stringify(appleScript)}`, {
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
    } else if (result === "error:no_move_option") {
      await showToast({
        style: Toast.Style.Failure,
        title: "Move Option Not Found",
        message: `This app's Window menu doesn't have "Move to" option.

Try manually:
1. Open Mission Control (F3)
2. Drag window to Desktop ${desktopNum}`,
      });
    } else {
      throw new Error(result);
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);

    let userMessage = errorMessage;

    if (errorMessage.toLowerCase().includes("accessibility") || errorMessage.toLowerCase().includes("not authorized")) {
      userMessage = `Accessibility permission required.

Enable for Raycast:
System Settings → Privacy & Security → Accessibility → Add Raycast`;
    }

    await showToast({
      style: Toast.Style.Failure,
      title: "Move Failed",
      message: userMessage,
    });
  }
}
