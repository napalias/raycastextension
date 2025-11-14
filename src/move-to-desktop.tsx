import { showToast, Toast, LaunchProps } from "@raycast/api";
import { execFileSync } from "child_process";
import { writeFileSync, unlinkSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

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

  try {

    await showToast({
      style: Toast.Style.Animated,
      title: "Moving Window",
      message: `Moving to Desktop ${desktopNum}...`,
    });

    // JXA (JavaScript for Automation) script to move window to a specific Space
    // This uses Mission Control UI scripting since macOS doesn't provide a direct API
    const jxaScript = `
#!/usr/bin/env osascript -l JavaScript

function run(argv) {
  // Import Cocoa framework for cursor manipulation
  ObjC.import('Cocoa');
  const App = Application.currentApplication();
  App.includeStandardAdditions = true;

  // Cursor manipulation helper
  const Cursor = {
    __events: {
      button: {
        left: {
          drag: $.kCGEventLeftMouseDragged,
          down: $.kCGEventLeftMouseDown,
          up: $.kCGEventLeftMouseUp,
        },
      },
      move: $.kCGEventMouseMoved,
    },
    __eventFactory(type, pos) {
      var event = $.CGEventCreateMouseEvent(
        $(),
        type,
        pos,
        $.kCGMouseButtonLeft,
      );
      $.CGEventPost($.kCGHIDEventTap, event);
      delay(0.01);
    },
    get position() {
      const screenH = $.NSScreen.mainScreen.frame.size.height;
      const pos = $.NSEvent.mouseLocation;
      return [
        parseInt(pos.x),
        screenH - Math.trunc(pos.y),
      ];
    },
    get x() {
      return Cursor.position[0];
    },
    get y() {
      return Cursor.position[1];
    },
    leftButton: {
      down([x = Cursor.x, y = Cursor.y]) {
        Cursor.__eventFactory(Cursor.__events.button.left.down, { x, y });
      },
      up([x = Cursor.x, y = Cursor.y]) {
        Cursor.__eventFactory(Cursor.__events.button.left.up, { x, y });
      },
      click([x = Cursor.x, y = Cursor.y]) {
        Cursor.leftButton.down([x, y]);
        Cursor.leftButton.up([x, y]);
      },
    },
    drag([x, y], from = [Cursor.x, Cursor.y]) {
      Cursor.leftButton.down(from);
      Cursor.__eventFactory(Cursor.__events.button.left.drag, { x, y });
      delay(0.5);
      Cursor.leftButton.up([x, y]);
    },
    move([x, y]) {
      Cursor.__eventFactory(Cursor.__events.move, { x, y });
    },
  };

  // Get frontmost application and window
  const FrontmostApp = () =>
    Application('System Events').applicationProcesses.whose({
      frontmost: true,
    })()[0];

  const FrontmostWindow = () => FrontmostApp().windows.at(0);

  // Get position of desktop broker in Mission Control
  const DesktopBrokerPosition = (desktop) => {
    // Jiggle cursor at top to reveal desktop brokers
    const restore = Cursor.position;
    Cursor.move([10, 10]);
    Cursor.move([20, 10]);
    Cursor.move(restore);

    try {
      return Application('System Events')
        .applicationProcesses.byName('Dock')
        .groups.byName('Mission Control')
        .groups.at(0)
        .groups.byName('Spaces Bar')
        .lists.at(0)
        .buttons.byName(\`Desktop \${desktop}\`)
        .properties().position;
    } catch (e) {
      throw new Error(\`Desktop \${desktop} not found. Please ensure you have \${desktop} or more virtual desktops configured in Mission Control.\`);
    }
  };

  // Get position of window broker in Mission Control
  const WindowBrokerPosition = (windowTitle) => {
    try {
      return Application('System Events')
        .applicationProcesses.byName('Dock')
        .groups.byName('Mission Control')
        .groups.at(0)
        .groups.at(0)
        .buttons.byName(windowTitle)
        .properties().position;
    } catch (e) {
      throw new Error(\`Window "\${windowTitle}" not found in Mission Control.\`);
    }
  };

  // Main script execution
  try {
    const targetDesktop = ${desktopNum};

    // Check if there's a frontmost window
    const frontApp = FrontmostApp();
    if (!frontApp) {
      throw new Error('No active application found');
    }

    const windows = frontApp.windows();
    if (windows.length === 0) {
      throw new Error('No active window found');
    }

    // Store window title and cursor position
    const windowTitle = FrontmostWindow().title();
    const restoreCursor = Cursor.position;

    // Launch Mission Control
    Application('Mission Control').launch();
    delay(0.5);

    // Get positions
    const [desktopX, desktopY] = DesktopBrokerPosition(targetDesktop);
    const [windowX, windowY] = WindowBrokerPosition(windowTitle);

    // Move cursor to top to ensure Spaces bar is visible
    Cursor.move([10, 10]);

    // Jiggle cursor over window broker to activate it
    Cursor.move([windowX + 30, windowY + 30]);
    delay(0.2);
    Cursor.move([windowX + 40, windowY + 40]);
    delay(0.2);
    Cursor.move([windowX + 30, windowY + 30]);

    // Drag window to target desktop
    Cursor.drag([desktopX + 10, desktopY + 10], [windowX + 30, windowY + 30]);
    delay(0.5);

    // Click target desktop to switch focus
    Cursor.leftButton.click([desktopX + 10, desktopY + 10]);

    // Restore cursor position
    Cursor.move(restoreCursor);

    return 'Success';
  } catch (error) {
    // Exit Mission Control if it's still open
    try {
      Application('System Events').keyCode(53); // ESC key
    } catch (e) {}

    throw error;
  }
}
`;

    // Write JXA script to temporary file
    const tmpFile = join(tmpdir(), `move-window-${Date.now()}.jxa`);
    writeFileSync(tmpFile, jxaScript);

    try {
      // Execute JXA script
      execFileSync("osascript", ["-l", "JavaScript", tmpFile], {
        encoding: "utf-8",
        timeout: 10000,
      });

      await showToast({
        style: Toast.Style.Success,
        title: "Window Moved",
        message: `Successfully moved to Desktop ${desktopNum}`,
      });
    } finally {
      // Clean up temporary file
      try {
        unlinkSync(tmpFile);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    let userMessage = errorMessage;
    if (errorMessage.includes("not found")) {
      userMessage = `Desktop ${desktopNum} not found. Please ensure you have ${desktopNum} or more virtual desktops configured in Mission Control (System Settings → Desktop & Dock → Mission Control).`;
    } else if (errorMessage.includes("No active window")) {
      userMessage = "No active window found to move.";
    }

    await showToast({
      style: Toast.Style.Failure,
      title: "Failed to Move Window",
      message: userMessage,
    });
  }
}
