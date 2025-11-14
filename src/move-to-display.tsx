import { showToast, Toast, LaunchProps } from "@raycast/api";
import { runAppleScript } from "@raycast/utils";

interface Arguments {
  displayNumber: string;
}

export default async function Command(
  props: LaunchProps<{ arguments: Arguments }>,
) {
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
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
}
