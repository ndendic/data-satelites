# Complete Guide to Datastar Plugin Development

## What is Datastar?

**Datastar is a lightweight (10.75KB) hypermedia framework that combines the backend reactivity of HTMX and frontend reactivity of Alpine.js into a single TypeScript-based solution, enabling developers to build real-time, server-driven web applications using declarative data-* attributes and Server-Sent Events.**

## Complete Datastar Reference

### All Datastar Attributes

#### Core Attributes (Free)

**data-signals** - Creates and manages reactive signals
- Usage: `<div data-signals="{count: 0, user: {name: 'John'}}">`
- Single: `<div data-signals-count="0">`
- Nested: `<div data-signals-user.name="'John'">`
- Remove: `<div data-signals="{temp: null}">` 
- Local (client-only): Prefix with `_` (`data-signals-_local="true"`)

**data-text** - Binds element text content to expressions
- Usage: `<span data-text="$count">` or `<div data-text="'Hello ' + $name">`

**data-bind** - Two-way data binding between signals and form elements
- Usage: `<input data-bind-username>` or `<input data-bind="email">`
- Works with: input, select, textarea, web components

**data-show** - Shows/hides elements based on boolean expressions
- Usage: `<div data-show="$isVisible" style="display: none">`

**data-class** - Conditionally adds/removes CSS classes
- Single: `<div data-class-active="$isSelected">`
- Multiple: `<div data-class="{active: $isSelected, hidden: !$isVisible}">`

**data-style** - Sets inline CSS styles reactively
- Single: `<div data-style-color="$textColor">`
- Multiple: `<div data-style="{color: $textColor, fontSize: $size + 'px'}">`

**data-attr** - Sets HTML attributes reactively
- Single: `<div data-attr-title="$tooltip">`
- Multiple: `<div data-attr="{title: $tooltip, disabled: $isDisabled}">`

**data-on** - Event listeners with expression execution
- Basic: `<button data-on-click="$count++">`
- Backend: `<button data-on-click="@post('/save')">`
- Custom events: `<div data-on-mycustomevent="handleEvent()">`
- Modifiers: `__debounce.300ms`, `__throttle.1s`, `__once`, `__prevent`, `__stop`

**data-computed** - Read-only computed signals
- Usage: `<div data-computed-fullName="$firstName + ' ' + $lastName">`

**data-effect** - Side effects when signals change
- Usage: `<div data-effect="console.log('Count:', $count)">`

**data-ref** - Creates signal references to DOM elements
- Usage: `<div data-ref-myElement>` creates `$myElement` signal

**data-indicator** - Loading state tracking for requests
- Usage: `<button data-indicator-loading>` creates `$loading` signal

**data-ignore** - Skip Datastar processing
- Usage: `<div data-ignore>` (element and children)
- Self-only: `<div data-ignore__self>` (element only)

**data-on-load** - Execute on element load
- Usage: `<div data-on-load="@get('/init')">`

**data-on-intersect** - Execute when element enters viewport
- Usage: `<div data-on-intersect="$visible = true">`
- Modifiers: `__once`, `__half`, `__full`

**data-on-interval** - Execute at regular intervals  
- Usage: `<div data-on-interval="$time = new Date()">`
- Modifiers: `__duration.1s`, `__leading`

**data-json-signals** - Debug display of signals as JSON
- Usage: `<pre data-json-signals>` (all signals)
- Filtered: `<pre data-json-signals="{include: /user/}">`

#### Pro Attributes (Commercial License)

**data-persist** - Local storage persistence
- Usage: `<div data-persist>` or `<div data-persist="{include: /user/}">`
- Session storage: `<div data-persist__session>`

**data-custom-validity** - Form validation
- Usage: `<input data-custom-validity="$age < 18 ? 'Must be 18+' : ''">`

**data-query-string** - URL parameter synchronization
- Usage: `<div data-query-string>` or `<div data-query-string="{include: /page/}">`

**data-replace-url** - Update browser URL
- Usage: `<div data-replace-url="'/page/' + $currentPage">`

**data-view-transition** - View Transition API integration
- Usage: `<div data-view-transition="'card-' + $id">`

**data-scroll-into-view** - Scroll element into viewport
- Usage: `<div data-scroll-into-view__smooth__vcenter>`

### All Datastar Actions

#### Core Actions (Free)

**@get()**, **@post()**, **@put()**, **@patch()**, **@delete()** - HTTP requests
- Usage: `@get('/endpoint')`, `@post('/save', {contentType: 'form'})`
- Options: contentType, headers, selector, retryInterval, etc.

**@setAll()** - Set multiple signals to same value
- Usage: `@setAll(true, {include: /^is/})` 

**@toggleAll()** - Toggle multiple boolean signals
- Usage: `@toggleAll({include: /^show/})`

**@peek()** - Access signal without subscribing to changes
- Usage: `@peek(() => $signalName)`

#### Pro Actions (Commercial License)

**@clipboard()** - Copy to clipboard
- Usage: `@clipboard('Hello World')` or `@clipboard($data, true)` (base64)

**@fit()** - Linear interpolation between ranges
- Usage: `@fit($value, 0, 100, 0, 255)` (map 0-100 to 0-255)

## Plugin Development Guide

### Plugin Architecture Overview

Datastar uses a dual-plugin system:

1. **Attribute Plugins**: Handle `data-*` attributes (e.g., `data-text`, `data-bind`)
2. **Action Plugins**: Handle `@` functions in expressions (e.g., `@get()`, `@post()`)

### Plugin Structure

```typescript
interface AttributePlugin {
  name: string
  type: 'Attribute'
  apply(element: HTMLElement, key: string, value: string): void
  cleanup?(element: HTMLElement): void
}

interface ActionPlugin {
  name: string  
  type: 'Action'
  execute(...args: any[]): any
}
```

### Plugin Registration Pattern

```javascript
import { load, apply } from 'datastar'

const MyCustomPlugin = {
  name: 'custom',
  type: 'Attribute',
  apply(element, key, value) {
    // Implementation
  },
  cleanup(element) {
    // Cleanup logic
  }
}

// Load plugin before DOM processing
load(MyCustomPlugin)
```

### Plugin Development Lifecycle

1. **Load Phase**: Plugins registered via `load()` function
2. **Application Phase**: `apply()` walks DOM and applies plugins
3. **Reactive Phase**: Signal changes trigger plugin re-evaluation
4. **Cleanup Phase**: Optional cleanup when elements removed

### Core Plugin Implementation Patterns

#### Attribute Plugin Example

```javascript
const AnchorPlugin = {
  name: 'anchor',
  type: 'Attribute',
  
  apply(element, key, value) {
    // Parse the expression to get target element
    const targetSelector = value
    const targetElement = document.querySelector(targetSelector)
    
    if (!targetElement) {
      console.error(`Anchor target not found: ${targetSelector}`)
      return
    }
    
    // Position element relative to target
    this.positionElement(element, targetElement, key)
    
    // Set up observers for responsive positioning
    this.setupObservers(element, targetElement)
  },
  
  positionElement(element, target, positioning) {
    // Implementation using Floating UI or custom logic
    const rect = target.getBoundingClientRect()
    
    switch(positioning) {
      case 'bottom':
        element.style.top = `${rect.bottom}px`
        element.style.left = `${rect.left}px`
        break
      case 'top':
        element.style.top = `${rect.top - element.offsetHeight}px`
        element.style.left = `${rect.left}px`
        break
      // More positioning logic...
    }
  },
  
  setupObservers(element, target) {
    // ResizeObserver for target size changes
    // MutationObserver for position changes
  },
  
  cleanup(element) {
    // Disconnect observers
    // Remove event listeners
  }
}
```

Usage:
```html
<div data-anchor-bottom="$refs.trigger">Positioned content</div>
<div data-anchor="'#my-target'">More content</div>
```

#### Action Plugin Example

```javascript
const ClipboardAction = {
  name: 'clipboard',
  type: 'Action',
  
  execute(text, isBase64 = false) {
    try {
      const content = isBase64 ? atob(text) : text
      
      if (navigator.clipboard) {
        return navigator.clipboard.writeText(content)
      } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea')
        textarea.value = content
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
        return Promise.resolve()
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      return Promise.reject(error)
    }
  }
}
```

Usage:
```html
<button data-on-click="@clipboard('Hello World!')">Copy Text</button>
<button data-on-click="@clipboard($base64Data, true)">Copy Base64</button>
```

### Signal Integration in Plugins

```javascript
const CounterPlugin = {
  name: 'counter',
  type: 'Attribute',
  
  apply(element, key, value) {
    // Access current signal value
    const currentValue = ctx.signals.value
    
    // Create reactive counter functionality
    const increment = () => {
      ctx.signals[key].value = (ctx.signals[key].value || 0) + 1
    }
    
    const decrement = () => {
      ctx.signals[key].value = Math.max(0, (ctx.signals[key].value || 0) - 1)
    }
    
    // Create controls
    const controls = this.createControls(increment, decrement)
    element.appendChild(controls)
    
    // Subscribe to signal changes
    ctx.signals[key].subscribe((newValue) => {
      this.updateDisplay(element, newValue)
    })
  },
  
  createControls(increment, decrement) {
    const container = document.createElement('div')
    
    const decrementBtn = document.createElement('button')
    decrementBtn.textContent = '-'
    decrementBtn.onclick = decrement
    
    const incrementBtn = document.createElement('button')  
    incrementBtn.textContent = '+'
    incrementBtn.onclick = increment
    
    container.appendChild(decrementBtn)
    container.appendChild(incrementBtn)
    return container
  },
  
  updateDisplay(element, value) {
    const display = element.querySelector('.counter-display') || 
                   (() => {
                     const div = document.createElement('div')
                     div.className = 'counter-display'
                     element.appendChild(div)
                     return div
                   })()
    display.textContent = value || 0
  }
}
```

### Plugin Modifier System

Implement modifier support similar to Alpine.js:

```javascript
const ModifiablePlugin = {
  name: 'tooltip',
  type: 'Attribute',
  
  apply(element, key, value) {
    const modifiers = this.parseModifiers(key)
    const config = this.getConfig(modifiers)
    
    // Apply tooltip with configuration
    this.setupTooltip(element, value, config)
  },
  
  parseModifiers(key) {
    // Parse modifiers from key like "tooltip.bottom.delay.500ms"
    const parts = key.split('.')
    return {
      position: parts.find(p => ['top', 'bottom', 'left', 'right'].includes(p)) || 'top',
      delay: this.parseDelay(parts.find(p => p.includes('ms'))) || 0,
      trigger: parts.find(p => ['hover', 'click', 'focus'].includes(p)) || 'hover'
    }
  },
  
  parseDelay(delayStr) {
    if (!delayStr) return 0
    const match = delayStr.match(/(\d+)ms/)
    return match ? parseInt(match[1]) : 0
  },
  
  getConfig(modifiers) {
    return {
      placement: modifiers.position,
      delay: modifiers.delay,
      trigger: modifiers.trigger
    }
  },
  
  setupTooltip(element, content, config) {
    // Tooltip implementation with configuration
  }
}
```

Usage:
```html
<div data-tooltip.bottom.delay.300ms.hover="'This is a tooltip'">Hover me</div>
```

### CDN Loading and Script Integration

#### Basic Loading
```html
<!DOCTYPE html>
<html>
<head>
    <script type="module" src="https://cdn.jsdelivr.net/gh/starfederation/datastar@main/bundles/datastar.js"></script>
</head>
<body>
    <div data-signals="{count: 0}">
        <span data-text="$count"></span>
        <button data-on-click="$count++">+</button>
    </div>
</body>
</html>
```

#### Plugin Loading Pattern
```html
<script type="module">
import { load } from 'https://cdn.jsdelivr.net/gh/starfederation/datastar@main/bundles/datastar.js'

// Import your custom plugins
import AnchorPlugin from './plugins/anchor.js'
import TooltipPlugin from './plugins/tooltip.js'

// Load plugins before DOM processing
load(
  AnchorPlugin,
  TooltipPlugin
)
</script>
```

#### Timing Considerations
**Critical**: Load plugins before initial DOM processing to avoid timing issues where `apply()` runs before plugins are fully loaded.

### Server-Side Integration

Datastar plugins should consider server-side rendering and SSE integration:

```javascript
const ServerAwarePlugin = {
  name: 'serveraware',
  type: 'Attribute',
  
  apply(element, key, value) {
    // Handle server-sent updates
    element.addEventListener('datastar-patch', (event) => {
      if (event.detail.selector === `#${element.id}`) {
        this.handleServerUpdate(element, event.detail.data)
      }
    })
    
    // Send plugin state to server when needed
    this.syncWithServer(element, key, value)
  },
  
  handleServerUpdate(element, serverData) {
    // Process server-sent updates specific to this plugin
  },
  
  syncWithServer(element, key, value) {
    // Send plugin state to server via signals or custom events
    ctx.signals[`_${key}_state`] = this.getPluginState(element)
  }
}
```

## Rules to Minimize AI Agent Hallucinations

### Critical Rules for AI Development

1. **NEVER invent Datastar attributes or actions**: Only use attributes and actions documented in this guide. If an attribute/action doesn't exist, use web components or custom JavaScript instead.

2. **Exact attribute naming**: Always use exact attribute names. `data-text`, not `data-txt`. `data-on-click`, not `data-onclick`.

3. **Signal syntax**: Signals ALWAYS use `$` prefix: `$mySignal`, never `mySignal` or `{mySignal}`.

4. **Action syntax**: Actions ALWAYS use `@` prefix: `@get()`, `@post()`, never `get()` or `datastar.get()`.

5. **Expression contexts**: In data-* attributes, use expressions, not JavaScript statements:
   - ✅ `data-text="$count + 1"`
   - ❌ `data-text="let x = $count + 1; return x"`

6. **No direct DOM manipulation**: Datastar plugins should use the signal system, not direct DOM manipulation:
   - ✅ `$isVisible = true` (with `data-show="$isVisible"`)
   - ❌ `element.style.display = 'block'`

7. **Pro features**: Only use Pro attributes/actions if explicitly needed and licensed:
   - Free: `data-signals`, `data-text`, `data-bind`, `@get()`, `@post()`
   - Pro: `data-persist`, `data-custom-validity`, `@clipboard()`, `@fit()`

8. **Server-first philosophy**: Prefer server-side logic over client-side complexity. Use Datastar for reactive UI, not business logic.

9. **Module loading**: Always use `type="module"` for script tags when loading Datastar or plugins.

10. **Signal naming restrictions**: Signal names cannot contain double underscores (`__`). Use single underscore for local signals (`_localSignal`).

### Validation Checklist for AI Agents

Before generating Datastar code, verify:

- [ ] All attributes exist in the complete reference above
- [ ] All actions exist in the complete reference above  
- [ ] Signals use `$` prefix in expressions
- [ ] Actions use `@` prefix in function calls
- [ ] No invented modifiers (only documented ones like `__debounce.300ms`)
- [ ] Pro features clearly marked if used
- [ ] Script tags include `type="module"`
- [ ] Complex logic moved to server-side or web components
- [ ] Signal names follow naming conventions

### Error Prevention Patterns

**Instead of inventing attributes**:
```html
<!-- ❌ Don't invent -->
<div data-fade-in="$isVisible">

<!-- ✅ Use existing attributes -->
<div data-style="{opacity: $isVisible ? 1 : 0, transition: 'opacity 0.3s'}">
```

**Instead of complex expressions**:
```html
<!-- ❌ Too complex -->
<div data-text="$items.filter(i => i.active).map(i => i.name.toUpperCase()).join(', ')">

<!-- ✅ Use computed signals -->
<div data-computed-activeNames="$items.filter(i => i.active).map(i => i.name.toUpperCase()).join(', ')">
<div data-text="$activeNames">
```

## Best Practices and Common Pitfalls

### Best Practices

1. **Start simple**: Begin with basic attributes (`data-signals`, `data-text`, `data-bind`) before advanced features.

2. **Server-driven state**: Let the backend manage state. Use Datastar for reactive UI updates.

3. **Semantic HTML**: Use proper HTML elements and enhance with Datastar attributes.

4. **Progressive enhancement**: Ensure basic functionality works without JavaScript.

5. **Signal organization**: Group related signals in objects:
   ```html
   <div data-signals="{user: {name: 'John', email: 'john@example.com'}}">
   ```

6. **Error handling**: Always handle potential errors in expressions:
   ```html
   <div data-text="$user?.name || 'Anonymous'">
   ```

7. **Performance**: Use `data-ignore` to skip third-party widget processing.

### Common Pitfalls

1. **Missing IDs**: Server updates require element IDs:
   ```html
   <!-- ❌ Server can't target -->
   <div>Content</div>
   
   <!-- ✅ Server can target -->
   <div id="content">Content</div>
   ```

2. **Signal definition order**: Define signals before using them:
   ```html
   <!-- ❌ Wrong order -->
   <span data-text="$count">
   <div data-signals-count="0">
   
   <!-- ✅ Correct order -->
   <div data-signals-count="0">
   <span data-text="$count">
   ```

3. **Conflicting libraries**: Use `data-ignore` to prevent conflicts:
   ```html
   <!-- ✅ Prevents conflicts -->
   <div data-ignore>
     <!-- Third-party widget -->
   </div>
   ```

4. **Over-engineering**: Avoid complex client-side logic. Move it to the server or web components.

5. **Missing `style="display: none"`**: For elements using `data-show`, add initial hidden style:
   ```html
   <!-- ✅ Prevents flash of unstyled content -->
   <div data-show="$isVisible" style="display: none">
   ```

6. **Plugin timing**: Load custom plugins before DOM processing to avoid initialization issues.

This comprehensive guide provides everything needed to understand, use, and develop Datastar plugins effectively. Remember: Datastar's power comes from simplicity. When something seems hard, you're probably working too hard—step back and use simpler patterns.