tell application "System Events"
    -- Get frontmost application and window
    set frontApp to first application process whose frontmost is true
    set appName to name of frontApp

    log "App name: " & appName

    -- Check for window
    if (count of windows of frontApp) = 0 then
        return "error:no_window"
    end if

    log "Window count: " & (count of windows of frontApp)

    set targetDesktop to 2

    -- Use Window menu to move to desktop
    tell process appName
        set frontmost to true
        delay 0.1

        -- Check if Window menu exists
        if not (exists menu bar item "Window" of menu bar 1) then
            return "error:no_window_menu"
        end if

        log "Window menu exists"

        -- Open Window menu
        click menu bar item "Window" of menu bar 1
        delay 0.3

        set theMenu to menu "Window" of menu bar item "Window" of menu bar 1

        -- List all menu items
        log "Menu items:"
        repeat with menuItem in menu items of theMenu
            try
                log "  - " & (name of menuItem)
            end try
        end repeat

        -- Try different menu item patterns (varies by macOS version)
        -- Sonoma/Sequoia: "Move Window to Desktop X"
        -- Earlier: "Desktop X" directly or under "Move to" submenu

        if exists menu item ("Move Window to Desktop " & targetDesktop) of theMenu then
            log "Found: Move Window to Desktop " & targetDesktop
            click menu item ("Move Window to Desktop " & targetDesktop) of theMenu
            return "success"
        end if

        -- Check for "Move to" submenu
        if exists menu item "Move to" of theMenu then
            log "Found: Move to submenu"
            click menu item "Move to" of theMenu
            delay 0.25

            set subMenu to menu 1 of menu item "Move to" of theMenu

            log "Submenu items:"
            repeat with menuItem in menu items of subMenu
                try
                    log "  - " & (name of menuItem)
                end try
            end repeat

            -- Try different naming patterns
            if exists menu item ("Desktop " & targetDesktop) of subMenu then
                log "Found: Desktop " & targetDesktop
                click menu item ("Desktop " & targetDesktop) of subMenu
                return "success"
            else if exists menu item (targetDesktop as string) of subMenu then
                log "Found: " & targetDesktop
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
