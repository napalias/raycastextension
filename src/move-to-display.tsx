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

    // Show loading toast
    await showToast({
      style: Toast.Style.Animated,
      title: "Moving Window...",
      message: `Moving to Display ${displayNum}`,
    });

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
        return "ERROR|Display ${displayNum} not found. Available displays: 1 to " & screenCount
      end if

      -- Get target screen (0-indexed in Cocoa, so subtract 1)
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
            return "ERROR|No active window found in " & frontApp
          end if

          -- Get current window bounds
          try
            set currentPos to position of window 1
            set currentSize to size of window 1
            set windowWidth to item 1 of currentSize
            set windowHeight to item 2 of currentSize

            -- Calculate new position
            -- Place window with some offset from top-left of target display
            set offsetX to 100
            set offsetY to 100

            -- Ensure window fits on screen
            if windowWidth > (targetWidth - offsetX) then
              set offsetX to 50
            end if

            if windowHeight > (targetHeight - offsetY) then
              set offsetY to 50
            end if

            -- Calculate new position
            -- Note: macOS coordinate system has origin at bottom-left
            -- NSScreen gives us the frame, but we need to adjust for menu bar
            set newX to targetX + offsetX
            set newY to targetY + offsetY

            -- Move window to new display
            set position of window 1 to {newX, newY}

            return "SUCCESS|Window moved to Display ${displayNum}"
          on error errMsg
            return "ERROR|Failed to move window: " & errMsg
          end try
        end tell
      end tell
    `;

    const result = await runAppleScript(script);

    // Parse result
    const [status, message] = result.split("|");

    if (status === "ERROR") {
      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to Move Window",
        message: message || "Unknown error occurred",
      });
    } else {
      await showToast({
        style: Toast.Style.Success,
        title: "Window Moved",
        message: `Successfully moved to Display ${displayNum}`,
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
