# CLAUDE.md - AI Assistant Guide for Raycast Extension Development

## Project Overview

This repository contains a Raycast extension. Raycast is a macOS productivity application that allows users to control their tools with a few keystrokes. Extensions enhance Raycast with custom commands, integrations, and workflows.

**Repository**: napalias/raycastextension
**Current Status**: Empty repository - ready for initial extension development

## Codebase Structure

A typical Raycast extension follows this structure:

```
raycastextension/
├── src/                    # Source code directory
│   ├── index.tsx          # Main entry point (for single command)
│   ├── *.tsx              # Command files (for multiple commands)
│   ├── components/        # Reusable React components
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Utility functions
│   └── types.ts           # TypeScript type definitions
├── assets/                # Icons and images
│   ├── command-icon.png   # Command-specific icons
│   └── extension-icon.png # Extension icon
├── package.json           # Extension manifest and dependencies
├── tsconfig.json          # TypeScript configuration
├── README.md              # Extension documentation
└── CHANGELOG.md           # Version history
```

## Package.json Structure

The `package.json` file serves as the extension manifest and must include:

```json
{
  "$schema": "https://www.raycast.com/schemas/extension.json",
  "name": "extension-name",
  "title": "Extension Title",
  "description": "Extension description",
  "icon": "extension-icon.png",
  "author": "author-name",
  "categories": ["Productivity"],
  "license": "MIT",
  "commands": [
    {
      "name": "command-name",
      "title": "Command Title",
      "description": "Command description",
      "mode": "view"
    }
  ],
  "dependencies": {
    "@raycast/api": "^1.0.0"
  },
  "devDependencies": {
    "@raycast/eslint-config": "^1.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0",
    "typescript": "^5.0.0"
  },
  "scripts": {
    "build": "ray build -e dist",
    "dev": "ray develop",
    "fix-lint": "ray lint --fix",
    "lint": "ray lint",
    "publish": "npx @raycast/api@latest publish"
  }
}
```

## Development Workflows

### Initial Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Development Mode**
   ```bash
   npm run dev
   ```
   This watches for changes and hot-reloads the extension in Raycast.

3. **Build for Production**
   ```bash
   npm run build
   ```

### Testing Workflow

- Test extensions directly in Raycast during development
- Use `console.log()` for debugging (visible in Raycast Developer Console)
- Use `npm run lint` to check for code quality issues
- Run `npm run fix-lint` to auto-fix linting issues

### Publishing Workflow

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Run `npm run build` to ensure it compiles
4. Run `npm run publish` to publish to Raycast Store

## Key Conventions for AI Assistants

### 1. TypeScript Best Practices

- **Always use TypeScript**: Raycast extensions must be written in TypeScript
- **Strict typing**: Enable strict mode in `tsconfig.json`
- **Type imports**: Import types from `@raycast/api`
- **Avoid `any`**: Use proper types or `unknown` if type is truly unknown

### 2. Component Structure

```typescript
import { List, ActionPanel, Action } from "@raycast/api";
import { useState } from "react";

export default function Command() {
  const [searchText, setSearchText] = useState("");

  return (
    <List
      searchText={searchText}
      onSearchTextChange={setSearchText}
      searchBarPlaceholder="Search..."
    >
      <List.Item
        title="Item Title"
        subtitle="Subtitle"
        accessories={[{ text: "Accessory" }]}
        actions={
          <ActionPanel>
            <Action.OpenInBrowser url="https://example.com" />
          </ActionPanel>
        }
      />
    </List>
  );
}
```

### 3. Raycast API Patterns

#### Common Components
- `<List>` - Display searchable lists
- `<Detail>` - Show detailed markdown content
- `<Form>` - Create input forms
- `<Grid>` - Display items in a grid layout

#### Common Actions
- `Action.OpenInBrowser` - Open URLs
- `Action.CopyToClipboard` - Copy text
- `Action.Push` - Navigate to another view
- `Action.ShowToast` - Show notifications

#### Hooks
- `useNavigation()` - Navigate between views
- `useCachedState()` - Persist state between sessions
- `useLocalStorage()` - Store data locally
- `useFetch()` - Fetch data from APIs

### 4. Error Handling

```typescript
import { showToast, Toast } from "@raycast/api";

async function fetchData() {
  try {
    const response = await fetch("https://api.example.com/data");
    const data = await response.json();
    return data;
  } catch (error) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Failed to fetch data",
      message: error instanceof Error ? error.message : "Unknown error",
    });
    throw error;
  }
}
```

### 5. Performance Best Practices

- **Lazy loading**: Load data progressively for large lists
- **Caching**: Use `useCachedState` for frequently accessed data
- **Debouncing**: Debounce search inputs to reduce API calls
- **Pagination**: Implement pagination for large datasets

### 6. File Naming Conventions

- **Commands**: Use descriptive names like `search-recipes.tsx`, `create-task.tsx`
- **Components**: PascalCase for component files: `TaskList.tsx`, `RecipeDetail.tsx`
- **Utils**: kebab-case for utility files: `api-client.ts`, `date-utils.ts`
- **Types**: Use `types.ts` or `*.types.ts` for type definitions

### 7. Icon Guidelines

- **Extension icon**: 512x512px PNG with rounded corners
- **Command icons**: 512x512px PNG, simple and recognizable
- **SF Symbols**: Use built-in SF Symbols when possible via `Icon` enum

### 8. Code Organization

```typescript
// 1. External imports
import { List, ActionPanel, Action } from "@raycast/api";
import { useState, useEffect } from "react";

// 2. Internal imports
import { fetchData } from "./utils/api";
import { Task } from "./types";

// 3. Types/Interfaces
interface TaskListProps {
  projectId: string;
}

// 4. Component
export default function TaskList({ projectId }: TaskListProps) {
  // Component implementation
}

// 5. Helper functions (if needed)
function formatDate(date: Date): string {
  // Implementation
}
```

### 9. Environment Variables and Preferences

Use Raycast preferences for configuration:

```json
{
  "preferences": [
    {
      "name": "apiKey",
      "type": "password",
      "required": true,
      "title": "API Key",
      "description": "Your API key"
    },
    {
      "name": "baseUrl",
      "type": "textfield",
      "required": false,
      "title": "Base URL",
      "description": "Custom base URL",
      "default": "https://api.example.com"
    }
  ]
}
```

Access preferences:

```typescript
import { getPreferenceValues } from "@raycast/api";

interface Preferences {
  apiKey: string;
  baseUrl?: string;
}

const preferences = getPreferenceValues<Preferences>();
```

### 10. Common Anti-Patterns to Avoid

❌ **Don't**:
- Use `any` type without good reason
- Forget error handling for async operations
- Hardcode API keys or secrets in code
- Create deeply nested component structures
- Ignore accessibility (always provide meaningful titles/descriptions)
- Use synchronous blocking operations
- Forget to handle loading states

✅ **Do**:
- Use proper TypeScript types
- Handle errors gracefully with toast notifications
- Use Raycast preferences for configuration
- Keep components focused and reusable
- Provide clear user feedback for all actions
- Use async/await for asynchronous operations
- Show loading indicators during data fetching

## API Integration Patterns

### REST API Integration

```typescript
import { showToast, Toast } from "@raycast/api";

class APIClient {
  private baseURL: string;
  private apiKey: string;

  constructor(baseURL: string, apiKey: string) {
    this.baseURL = baseURL;
    this.apiKey = apiKey;
  }

  async get<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "API Error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }
}
```

### OAuth Integration

Use `@raycast/utils` for OAuth:

```typescript
import { OAuth } from "@raycast/api";

const client = new OAuth.PKCEClient({
  redirectMethod: OAuth.RedirectMethod.Web,
  providerName: "Service Name",
  providerIcon: "service-icon.png",
  providerId: "service",
  description: "Connect your Service account",
});

export async function authorize() {
  const tokenSet = await client.getTokens();
  if (tokenSet?.accessToken) {
    return tokenSet.accessToken;
  }

  const authRequest = await client.authorizationRequest({
    endpoint: "https://service.com/oauth/authorize",
    clientId: "your-client-id",
    scope: "read write",
  });

  const { authorizationCode } = await client.authorize(authRequest);

  const tokens = await client.exchangeAuthorizationCode(authorizationCode, {
    endpoint: "https://service.com/oauth/token",
    clientId: "your-client-id",
  });

  return tokens.access_token;
}
```

## Testing Guidelines

### Manual Testing Checklist

- [ ] All commands load without errors
- [ ] Search functionality works correctly
- [ ] All actions execute as expected
- [ ] Error states display helpful messages
- [ ] Loading states show appropriate indicators
- [ ] Keyboard navigation works smoothly
- [ ] Icons and images display correctly
- [ ] Extension works with large datasets
- [ ] Preferences are respected and validated
- [ ] Toast notifications are clear and helpful

### Edge Cases to Test

- Empty states (no data available)
- Network failures
- Invalid API responses
- Rate limiting
- Very long text/titles
- Special characters in input
- Concurrent operations
- Missing permissions

## Accessibility Considerations

- Provide clear, descriptive titles for all items
- Include helpful subtitles for context
- Use appropriate icons that convey meaning
- Provide keyboard shortcuts for common actions
- Show clear feedback for all user actions
- Handle empty states gracefully
- Use semantic action types (Primary, Destructive, etc.)

## Security Best Practices

1. **Never commit secrets**: Use Raycast preferences for API keys
2. **Validate input**: Always validate and sanitize user input
3. **HTTPS only**: Only connect to HTTPS endpoints
4. **Token storage**: Use secure storage for sensitive tokens
5. **Rate limiting**: Implement rate limiting for API calls
6. **Error messages**: Don't expose sensitive data in error messages

## Git Workflow for This Repository

### Branch Strategy

- **Development branch**: `claude/claude-md-mhyw6de0n3dfiioa-011yXQnKvMU8uB6EpBzJwMGY`
- All development work should be done on feature branches starting with `claude/`

### Commit Message Format

```
<type>: <subject>

<body>

<footer>
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Example:
```
feat: Add search command for recipes

- Implemented recipe search with filtering
- Added caching for better performance
- Integrated with Recipe API

Closes #123
```

### Push Commands

Always push to the designated branch:
```bash
git push -u origin claude/claude-md-mhyw6de0n3dfiioa-011yXQnKvMU8uB6EpBzJwMGY
```

## Resources

### Official Documentation
- [Raycast API Documentation](https://developers.raycast.com/api-reference)
- [Raycast Extension Examples](https://github.com/raycast/extensions)
- [Raycast Developer Guide](https://developers.raycast.com/)

### Useful Extensions to Study
- [GitHub](https://github.com/raycast/extensions/tree/main/extensions/github)
- [Jira](https://github.com/raycast/extensions/tree/main/extensions/jira)
- [Linear](https://github.com/raycast/extensions/tree/main/extensions/linear)

### TypeScript Resources
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

## Quick Reference

### Essential Imports

```typescript
// Core components
import { List, Detail, Form, Grid, ActionPanel, Action } from "@raycast/api";

// Hooks
import { useState, useEffect } from "react";
import { useNavigation, useCachedState, useFetch } from "@raycast/api";

// Utilities
import { showToast, Toast, getPreferenceValues, Clipboard } from "@raycast/api";

// Icons
import { Icon, Color } from "@raycast/api";
```

### Common Command Structures

**List Command**:
```typescript
export default function Command() {
  return (
    <List>
      <List.Item title="Item" actions={<ActionPanel>...</ActionPanel>} />
    </List>
  );
}
```

**Detail Command**:
```typescript
export default function Command() {
  const markdown = "# Hello\n\nThis is markdown content";
  return <Detail markdown={markdown} />;
}
```

**Form Command**:
```typescript
export default function Command() {
  return (
    <Form actions={<ActionPanel>...</ActionPanel>}>
      <Form.TextField id="name" title="Name" />
      <Form.TextArea id="description" title="Description" />
    </Form>
  );
}
```

## AI Assistant Workflow Checklist

When working on this Raycast extension, follow this workflow:

1. **Before Writing Code**
   - [ ] Understand the command requirements
   - [ ] Check existing code patterns in the repository
   - [ ] Review Raycast API documentation for relevant components
   - [ ] Plan component structure and data flow

2. **During Development**
   - [ ] Use TypeScript with proper types
   - [ ] Follow the file naming conventions
   - [ ] Implement error handling for all async operations
   - [ ] Add loading states for data fetching
   - [ ] Include helpful toast notifications
   - [ ] Follow the code organization structure

3. **Before Committing**
   - [ ] Run `npm run lint` to check for issues
   - [ ] Fix any linting errors with `npm run fix-lint`
   - [ ] Test the command in Raycast
   - [ ] Verify error handling works
   - [ ] Check accessibility (titles, descriptions)
   - [ ] Update documentation if needed

4. **Committing Changes**
   - [ ] Write descriptive commit messages
   - [ ] Reference relevant issues
   - [ ] Push to the correct branch

---

**Last Updated**: 2025-11-14
**Repository Status**: Initial setup - empty repository ready for development
