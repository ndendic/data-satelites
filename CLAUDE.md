# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Build commands
npm run build          # Development build with debugging to dist/src/
npm run build:prod     # Minified production build to dist/min/
npm run build:watch    # Live development with file watching
npm run clean          # Clean rebuild (removes dist/)

# Development & Testing
npm run dev            # Build + serve for testing on port 8080
npm run serve          # Serve current files on port 8080
npm run test           # Run test server
npm run test:local     # Build then run test server
```

## Project Architecture

**Data Satellites** is a TypeScript library that creates production-ready Datastar plugins (anchor positioning, data persistence, throttling utilities). This is a plugin development project targeting Datastar v1.0.0-RC.3+'s dual-plugin architecture.

### Core Plugin System
- **ES Module Based**: All plugins export as `export default PluginName` for Datastar's `load()` pattern
- **Attribute Plugins**: Handle `data-*` attributes with exact interface compliance
- **RuntimeContext Integration**: Plugins receive standardized context with signal access, effects, and cleanup
- **Type-Safe**: Uses `satisfies AttributePlugin` for compile-time validation

### Plugin Interface Requirements
```typescript
const PluginName: AttributePlugin = {
  type: "attribute",
  name: "plugin-name",
  keyReq: "exact" | "allowed" | "starts" | "denied",
  valReq?: "allowed" | "denied" | "must",
  shouldEvaluate?: boolean,
  onLoad(ctx: RuntimeContext): OnRemovalFn | void { }
} satisfies AttributePlugin;

export default PluginName; // Critical: default export required
```

### Source Code Structure
```
src/
├── anchor.ts      # CSS Anchor Positioning with modern/fallback patterns
├── persist.ts     # LocalStorage/SessionStorage signal persistence
├── throttle.ts    # Performance utilities (debounce, RAF, timer throttling)
└── Index.ts       # Reserved for future aggregation
```

### Build System (Vite)
- **Dual Output**: Development (`dist/src/`) and production (`dist/min/`) builds
- **ES2020 Target**: Modern JavaScript with broad compatibility
- **Entry Per Plugin**: Each plugin builds to separate module for selective loading
- **Terser Optimization**: Aggressive minification for production with console removal

### Signal Integration Patterns
- **Signal Access**: Use `ctx.getPath(signalName)` for reactive signal reading
- **Signal Updates**: Use `ctx.mergePatch({signal: value})` for updates
- **Batch Operations**: Wrap multiple updates in `ctx.startBatch()` / `ctx.endBatch()`
- **Reactive Effects**: Use `ctx.effect(() => {})` for signal-driven side effects

### Browser Compatibility Strategy
- **Progressive Enhancement**: Modern CSS features with JavaScript fallbacks
- **Feature Detection**: Use `CSS.supports()` for capability detection
- **Performance First**: Prefer native CSS positioning over JavaScript calculations

### Plugin Loading Pattern
```html
<script type="module">
import { load, apply } from 'https://cdn.jsdelivr.net/gh/starfederation/datastar@main/bundles/datastar.js';
import AnchorPlugin from './dist/min/anchor.min.js';
import PersistPlugin from './dist/min/persist.min.js';
load(AnchorPlugin, PersistPlugin);
apply();
</script>
```

## Plugin-Specific Implementation Details

### Anchor Plugin (`anchor.ts`)
- **CSS-First Approach**: Uses modern `anchor()` positioning with `position-try-fallbacks` for automatic flipping
- **Value Parsing**: Supports both comma-separated (`"#target, bottom, 20px"`) and attribute-based syntax
- **Placement System**: 12 placement options (top/bottom/left/right + start/center/end variants)
- **Unit Support**: px, rem, em, %, vw, vh with intelligent conversion
- **Fallback Strategy**: JavaScript positioning when CSS anchor unsupported

### Persist Plugin (`persist.ts`)
- **Storage Abstraction**: Automatic localStorage/sessionStorage selection via modifiers
- **Signal Discovery**: Scans `data-signals-*` attributes for wildcard persistence
- **Throttling Integration**: Uses throttle utilities to prevent excessive storage writes
- **Error Resilience**: Graceful handling of quota limits and storage failures

### Throttle Utilities (`throttle.ts`)
- **Multiple Strategies**: RAF (animation), timer (configurable), dynamic (per-call delay)
- **Memory Efficient**: WeakMap-based element association prevents memory leaks
- **Performance Focused**: Prevents excessive DOM updates and API calls

## Critical Development Constraints

### Datastar API Compliance
- **Version Targeting**: Built for Datastar v1.0.0-RC.3+ API surface
- **Signal Syntax**: Always use `$signalName` syntax, never `signalName` or `{signalName}`
- **No API Invention**: Never create non-existent Datastar attributes/actions

### TypeScript Requirements
- **Strict Mode**: All code must pass TypeScript strict checks
- **Interface Compliance**: Use `satisfies` for plugin interface validation
- **ES2020 Target**: Modern features with IE11+ compatibility via transpilation

### Performance Constraints
- **Minimal Bundle Size**: Each plugin should be <5KB minified
- **Zero Dependencies**: No external runtime dependencies beyond Datastar core
- **Memory Efficiency**: Use WeakMap/WeakSet for element associations
- **Event Cleanup**: Always return cleanup functions from `onLoad`

## Development Checklist

When developing plugins, ensure:
- [ ] Default export pattern (`export default PluginName`)
- [ ] Correct `keyReq`/`valReq` configuration for intended behavior
- [ ] `shouldEvaluate: false` for non-JavaScript values
- [ ] Cleanup function returned from `onLoad` when needed
- [ ] Error handling for missing DOM elements/signals
- [ ] TypeScript interface compliance with `satisfies`
- [ ] Browser compatibility testing (modern + fallback)

## Anti-Patterns to Avoid
- **Direct DOM Manipulation**: Use signals instead of `element.style.property = value`
- **Missing Error Handling**: Always handle missing elements, invalid signals
- **Memory Leaks**: Always clean up event listeners and timers
- **Synchronous Storage**: Use throttling for storage operations