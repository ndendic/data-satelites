# Data Satellites - Datastar Plugin Library

## Project Overview

**Data Satellites** is a TypeScript library that provides production-ready Datastar plugins for anchor positioning, data persistence, and throttling utilities. This is a plugin development project that creates ES modules compatible with Datastar v1.0.0-RC.3+'s dual-plugin architecture.

## Core Architecture

### Plugin System Architecture
- **Dual Plugin Types**: Attribute plugins (`data-*`) and Action plugins (`@*`)
- **ES Module Based**: All plugins export as default ES modules for `import`/`load()` pattern
- **RuntimeContext Integration**: Plugins receive standardized context with signal access, effects, and cleanup
- **Type-Safe**: Uses `satisfies AttributePlugin` for compile-time validation

### Key Components
```
src/
├── anchor.ts      # CSS Anchor Positioning plugin with modern/fallback patterns
├── persist.ts     # LocalStorage/SessionStorage signal persistence
├── throttle.ts    # Performance utilities (debounce, RAF, timer throttling)
└── Index.ts       # Empty - reserved for future aggregation
```

## Development Patterns

### Plugin Interface Compliance
All plugins must implement exact interface structure:
```typescript
const PluginName: AttributePlugin = {
  type: "attribute",
  name: "plugin-name",
  keyReq: "exact" | "allowed" | "starts" | "denied",
  valReq?: "allowed" | "denied" | "must", 
  shouldEvaluate?: boolean,
  onLoad(ctx: RuntimeContext): OnRemovalFn | void { }
} satisfies AttributePlugin;

export default PluginName; // Critical: default export
```

### Signal Integration Patterns
- **Signal Access**: Use `ctx.getPath(signalName)` for reactive signal reading
- **Signal Updates**: Use `ctx.mergePatch({signal: value})` for updates
- **Batch Operations**: Wrap multiple updates in `ctx.startBatch()` / `ctx.endBatch()`
- **Reactive Effects**: Use `ctx.effect(() => {})` for signal-driven side effects

### Browser Compatibility Strategy
- **Progressive Enhancement**: Modern CSS features with JavaScript fallbacks
- **Feature Detection**: Use `CSS.supports()` for capability detection
- **Graceful Degradation**: Fallback implementations for older browsers
- **Performance First**: Prefer native CSS positioning over JavaScript calculations

## Build System & Workflows

### Vite Configuration
- **Dual Output**: Development (`dist/src/`) and production (`dist/min/`) builds
- **ES2020 Target**: Modern JavaScript with broad compatibility
- **Terser Optimization**: Aggressive minification for production with console removal
- **Entry Per Plugin**: Each plugin builds to separate module for selective loading

### Critical Build Commands
```bash
npm run build        # Development build with debugging
npm run build:prod   # Minified production build
npm run build:watch  # Live development with file watching
npm run dev          # Build + serve for testing
npm run clean        # Clean rebuild
```

### Testing Strategy
- **Demo-Driven**: `demo-complete.html` provides comprehensive feature testing
- **CDN Integration**: Tests real-world CDN loading patterns
- **Multi-Browser**: Tests modern CSS anchor + fallback scenarios
- **Scroll/Resize**: Validates positioning under dynamic conditions

## Plugin-Specific Conventions

### Anchor Plugin (`anchor.ts`)
- **CSS-First Approach**: Uses modern `anchor()` positioning with `position-try-options` for automatic flipping
- **Value Parsing**: Supports both comma-separated (`"#target, bottom, 20px"`) and attribute-based syntax
- **Placement System**: 12 placement options (top/bottom/left/right + start/center/end variants)
- **Unit Support**: px, rem, em, %, vw, vh with intelligent conversion
- **Fallback Strategy**: JavaScript positioning when CSS anchor unsupported

### Persist Plugin (`persist.ts`)
- **Storage Abstraction**: Automatic localStorage/sessionStorage selection via modifiers
- **Signal Discovery**: Scans `data-signals-*` attributes for wildcard persistence
- **Throttling Integration**: Uses throttle utilities to prevent excessive storage writes
- **Error Resilience**: Graceful handling of quota limits and storage failures
- **Batch Loading**: Efficient signal restoration on plugin initialization

### Throttle Utilities (`throttle.ts`)
- **Multiple Strategies**: RAF (animation), timer (configurable), dynamic (per-call delay)
- **Memory Efficient**: WeakMap-based element association prevents memory leaks
- **Performance Focused**: Prevents excessive DOM updates and API calls
- **Debounce Support**: Separate debouncing for search/input scenarios

## Integration Patterns

### CDN Loading Pattern
```html
<script type="module">
import { load, apply } from 'https://cdn.jsdelivr.net/gh/starfederation/datastar@main/bundles/datastar.js';
import AnchorPlugin from 'https://cdn.jsdelivr.net/gh/ndendic/data-satellites@master/dist/min/anchor.min.js';
load(AnchorPlugin);
apply();
</script>
```

### Local Development Pattern  
```html
<script type="module">
import AnchorPlugin from './dist/src/anchor.js';
import PersistPlugin from './dist/src/persist.js';
load(AnchorPlugin, PersistPlugin);
apply();
</script>
```

## Critical Constraints

### Datastar API Compliance
- **Version Targeting**: Built for Datastar v1.0.0-RC.3+ API surface
- **No API Invention**: Never create non-existent Datastar attributes/actions
- **Signal Syntax**: Always use `$signalName` syntax, never `signalName` or `{signalName}`
- **Expression Context**: Attributes take expressions, not JavaScript statements

### TypeScript Requirements
- **Strict Mode**: All code must pass TypeScript strict checks
- **Interface Compliance**: Use `satisfies` for plugin interface validation
- **ES2020 Target**: Modern features with IE11+ compatibility via transpilation
- **Declaration Files**: Generate `.d.ts` for TypeScript consumption

### Performance Constraints
- **Minimal Bundle Size**: Each plugin should be <5KB minified
- **Zero Dependencies**: No external runtime dependencies beyond Datastar core
- **Memory Efficiency**: Use WeakMap/WeakSet for element associations
- **Event Cleanup**: Always return cleanup functions from `onLoad`

## Error Prevention

### Plugin Development Checklist
- [ ] Default export pattern (`export default PluginName`)
- [ ] Correct `keyReq`/`valReq` configuration for intended behavior
- [ ] `shouldEvaluate: false` for non-JavaScript values
- [ ] Cleanup function returned from `onLoad` when needed
- [ ] Error handling for missing DOM elements/signals
- [ ] TypeScript interface compliance with `satisfies`
- [ ] Browser compatibility testing (modern + fallback)

### Common Anti-Patterns to Avoid
- **Direct DOM Manipulation**: Use signals instead of `element.style.property = value`
- **Missing Error Handling**: Always handle missing elements, invalid signals
- **Memory Leaks**: Always clean up event listeners and timers
- **Synchronous Storage**: Use throttling for storage operations
- **Hard Dependencies**: Avoid requiring specific HTML structure beyond target elements

This codebase demonstrates production-ready Datastar plugin patterns with emphasis on performance, browser compatibility, and developer experience.