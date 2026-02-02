# Modern Navigations

Advanced cursor navigation for identifiers (CamelCase, snake_case, kebab-case) in code editors and project file trees.

## What It Does

Replaces the default **Ctrl+Left/Right** (Windows & Linux) and **Option+Left/Right** (macOS) behavior with modern word navigation that understands identifier structure.

### Supported Identifier Types

| Type          | Example                  | Segments                        |
| ------------- | ------------------------ | ------------------------------- |
| CamelCase     | `mySuperCoolVariable`    | my \| Super \| Cool \| Variable |
| PascalCase    | `MySuperCoolVariable`    | My \| Super \| Cool \| Variable |
| Abbreviations | `parseHTTPResponse`      | parse \| HTTP \| Response       |
| snake_case    | `my_super_cool_variable` | my \| super \| cool \| variable |
| kebab-case    | `my-super-cool-variable` | my \| super \| cool \| variable |

Consecutive uppercase letters (e.g. `HTTP`, `URL`) are treated as one segment.

### Before / After

**Before (default):** Cursor jumps by "classic" word boundaries (spaces, punctuation).

```
mySuperCoolVariable
^  ^    ^   ^
```

**After (Modern Navigations):** Cursor stops at logical identifier segments.

```
my|Super|Cool|Variable
^  ^     ^    ^
```

### Cursor Position Rules

- **At word start** → Right: next segment start; Left: previous word end
- **Inside segment** → Right: next segment start (or word end); Left: current segment start
- **On separator (\_ or -)** → Right: end of right segment; Left: start of left segment

If the current word has no internal segments, falls back to default IDE word navigation.

## Keybindings

| Action                  | Windows/Linux | macOS        |
| ----------------------- | ------------- | ------------ |
| Modern Navigation Left  | Ctrl+Left     | Option+Left  |
| Modern Navigation Right | Ctrl+Right    | Option+Right |

Keybindings can be rebound in IDE settings.

## Settings

### File Extensions Filter

Restrict modern navigation to specific file types.

- **Empty** = works in all files
- **Example:** `["*.jsx", "*.c"]` = only in JSX and C files

### Project Files Navigation

Use modern navigation for folder and file names in Project/File tree view. Enabled by default.

## Supported IDEs

- **VS Code** (extension)

## Installation

### VS Code

1. Open Extensions (Ctrl+Shift+X / Cmd+Shift+X)
2. Search for "Modern Navigations"
3. Install

Or install from VSIX: build with `npm run compile` in the `vscode/` folder, then install the generated package.

#### In progress

```
**JetBrains IDEs** (CLion, IntelliJ IDEA, PyCharm, WebStorm, etc.)

### JetBrains

1. Open Settings → Plugins
2. Search for "Modern Navigations"
3. Install

Or install from disk: build the plugin in the `jetbrains/` folder with Gradle, then install the generated ZIP.
```
