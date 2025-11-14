import { showToast, Toast, LaunchProps } from "@raycast/api";
import { runAppleScript } from "@raycast/utils";

interface Arguments {
  desktopNumber: string;
}

export default async function Command(
  props: LaunchProps<{ arguments: Arguments }>,
) {
  const { desktopNumber } = props.arguments;

  try {
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

    // AppleScript to move window to a specific desktop (Space)
    const script = `
      use framework "Foundation"
      use scripting additions

      tell application "System Events"
        -- Get frontmost application
        set frontApp to name of first application process whose frontmost is true

        tell process frontApp
          if (count of windows) = 0 then
            return "Error: No active window found"
          end if

          -- Get the frontmost window
          set theWindow to window 1

          -- Try to move window to desktop using Window menu
          try
            -- Click on Window menu if it exists
            tell menu bar 1
              try
                set windowMenu to menu "Window" of menu bar item "Window"
              on error
                return "Error: This application does not support moving windows to desktops via Window menu"
              end try

              try
                -- Look for "Move to" submenu
                set moveToMenu to menu "Move to" of menu item "Move to" of windowMenu

                -- Get all menu items (desktops)
                set desktopMenuItems to menu items of moveToMenu

                -- Check if desktop exists
                if ${desktopNum} > (count of desktopMenuItems) then
                  return "Error: Desktop ${desktopNum} not found. Available desktops: 1 to " & (count of desktopMenuItems)
                end if

                -- Click on the target desktop
                click menu item ${desktopNum} of moveToMenu

                return "Success: Window moved to Desktop ${desktopNum}"
              on error errMsg
                return "Error: Could not access Move to menu - " & errMsg
              end try
            end tell
          on error errMsg
            -- If Window menu approach fails, try keyboard shortcut approach
            try
              -- Activate the window first
              set frontmost to true

              -- Use Control+Number to switch to desktop and bring window
              -- This requires "Displays have separate Spaces" to be disabled
              -- and keyboard shortcuts to be enabled in System Preferences

              -- First, we'll try using Mission Control shortcuts
              tell application "System Events"
                -- Press Control+Desktop Number to move to that desktop with the window
                key code (18 + ${desktopNum - 1}) using control down
              end tell

              delay 0.3

              return "Success: Switched to Desktop ${desktopNum} with window"
            on error errMsg2
              return "Error: Unable to move window. Please enable Mission Control keyboard shortcuts in System Preferences → Keyboard → Shortcuts → Mission Control. Error: " & errMsg2
            end try
          end try
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
        message: `Moved to Desktop ${desktopNum}`,
      });
    }
  } catch (error) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Failed to Move Window",
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
}
