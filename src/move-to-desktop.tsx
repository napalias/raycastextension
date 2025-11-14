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

    // Ultra-simple AppleScript that uses Window menu with clear error reporting
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

    -- Try Window menu approach
    tell process appName
        if exists menu bar item "Window" of menu bar 1 then
            click menu bar item "Window" of menu bar 1
            delay 0.4

            -- Look for direct menu item
            set menuItemFound to false
            set theMenu to menu "Window" of menu bar item "Window" of menu bar 1

            -- Try exact match first
            repeat with menuItemName in {"Move to Desktop " & targetDesktop, "Desktop " & targetDesktop}
                if exists menu item menuItemName of theMenu then
                    click menu item menuItemName of theMenu
                    return "success"
                end if
            end repeat

            -- Look for "Move to" submenu
            if exists menu item "Move to" of theMenu then
                click menu item "Move to" of theMenu
                delay 0.3

                -- Try to click on the desktop item in submenu
                try
                    click menu item ("Desktop " & targetDesktop) of menu 1 of menu item "Move to" of theMenu
                    return "success"
                on error
                    try
                        click menu item (targetDesktop as string) of menu 1 of menu item "Move to" of theMenu
                        return "success"
                    end try
                end try
            end if

            -- Menu items not found, close menu
            key code 53
            return "error:menu_not_found"
        else
            return "error:no_menu"
        end if
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
        message: "Please focus a window first and try again",
      });
    } else if (result === "error:no_menu") {
      await showToast({
        style: Toast.Style.Failure,
        title: "Window Menu Not Available",
        message: `This app doesn't have a Window menu.

Alternative: Manually drag the window to Desktop ${desktopNum}:
1. Open Mission Control (F3)
2. Drag the window to Desktop ${desktopNum} at the top`,
      });
    } else if (result === "error:menu_not_found") {
      await showToast({
        style: Toast.Style.Failure,
        title: "Desktop Not in Menu",
        message: `Desktop ${desktopNum} not found in Window menu.

Possible reasons:
• You may not have ${desktopNum} desktops configured
• The app may not support window movement
• Try manually: Mission Control (F3) → Drag window to Desktop ${desktopNum}`,
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
