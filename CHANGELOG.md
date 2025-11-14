# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial implementation of Window Display Mover extension
- Move active window to any display with `display [number]` command
- AppleScript-based window management for universal compatibility
- Automatic display detection and validation
- Clear success and error notifications
- Support for unlimited number of displays
- Comprehensive error handling
- User documentation and troubleshooting guide

### Implementation Details
- TypeScript with React for type-safe development
- AppleScript with NSScreen framework for display management
- System Events for window manipulation
- No Raycast Pro required

## [1.0.0] - 2025-11-14

### Added
- Initial release of Window Display Mover
- Basic command: `display [number]`
- Support for multiple displays
- Error handling and validation
- Toast notifications for feedback
- Documentation and setup guides
