# Datastar Anchor Plugin

The **Datastar Anchor Plugin** provides modern CSS anchor positioning for elements relative to anchor elements using native browser features. It's perfect for tooltips, popovers, dropdowns, context menus, and any UI element that needs to be positioned relative to another element.

## Features

- 🎯 **12 positioning combinations** with precise alignment control
- 🚀 **Modern CSS anchor positioning** using native `anchor()` functions
- 🔄 **Automatic viewport flipping** with `position-try-options` in supporting browsers
- 📐 **Flexible offset support** with multiple units (px, rem, em, %, vw, vh)
- 📱 **Responsive repositioning** on window resize and scroll
- ⚡ **Datastar integration** with reactive signal support
- 🔧 **Intelligent fallback** for browsers without CSS anchor support
- 📦 **Minimal bundle size** - 9.53 kB (2.10 kB gzipped)

## Basic Usage

Use the `data-anchor` attribute with value-based syntax to position elements relative to an anchor:

```html
<!-- Basic positioning -->
<button id="my-button">Click me</button>
<div data-anchor="'#my-button, top, 8px'" data-show="$tooltipVisible">
  This tooltip appears above the button
</div>

<!-- Alternative attribute-based syntax -->
<div data-anchor="my-button" 
     data-anchor-placement="bottom" 
     data-anchor-offset="20px"
     data-show="$tooltipVisible">
  This tooltip appears below the button
</div>
```

## Syntax Options

### Value-Based Syntax (Recommended)

Use comma-separated values in the `data-anchor` attribute:

```html
data-anchor="'#target-id, placement, offset'"
```

| Placement | Description | Alignment |
|-----------|-------------|-----------|
| `top` | Above the anchor | Center |
| `bottom` | Below the anchor | Center |
| `left` | Left of the anchor | Center |
| `right` | Right of the anchor | Center |
| `top-start` | Above, left-aligned | Start edge |
| `top-end` | Above, right-aligned | End edge |
| `bottom-start` | Below, left-aligned | Start edge |
| `bottom-end` | Below, right-aligned | End edge |
| `left-start` | Left, top-aligned | Start edge |
| `left-end` | Left, bottom-aligned | End edge |
| `right-start` | Right, top-aligned | Start edge |
| `right-end` | Right, bottom-aligned | End edge |

### Attribute-Based Syntax

Use separate attributes for configuration:

```html
data-anchor="target-id"
data-anchor-placement="placement"
data-anchor-offset="offset"
```

## Offset Support

The plugin supports multiple units for offsets:

| Unit | Description | Example |
|------|-------------|---------|
| `px` | Pixels (default) | `20px` or `20` |
| `rem` | Root em units | `2rem` |
| `em` | Em units | `1.5em` |
| `%` | Percentage | `10%` |
| `vw` | Viewport width | `5vw` |
| `vh` | Viewport height | `3vh` |

```html
<!-- Different offset units -->
<div data-anchor="'#anchor, top, 20px'">20 pixels offset</div>
<div data-anchor="'#anchor, bottom, 2rem'">2rem offset</div>
<div data-anchor="'#anchor, left, 1.5em'">1.5em offset</div>
<div data-anchor="'#anchor, right, 5vh'">5vh offset</div>

<!-- Default offset (8px) -->
<div data-anchor="'#anchor, top'">Default offset</div>
```

## Complete Examples

### Tooltip System

```html
<style>
  .tooltip {
    background: #333;
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 14px;
    white-space: nowrap;
    z-index: 1000;
    width: max-content;
  }
</style>

<button id="save-btn" 
        data-on-mouseenter="$showTooltip = true"
        data-on-mouseleave="$showTooltip = false">
  Save Document
</button>

<div data-anchor="'#save-btn, top, 10px'" 
     data-show="$showTooltip"
     class="tooltip">
  Save your changes (Ctrl+S)
</div>
```

### Dropdown Menu

```html
<button id="menu-trigger" 
        data-on-click="$menuOpen = !$menuOpen">
  Options ▼
</button>

<div data-anchor="'#menu-trigger, bottom-start, 5px'"
     data-show="$menuOpen"
     class="dropdown-menu">
  <a href="#" data-on-click="$menuOpen = false">Edit</a>
  <a href="#" data-on-click="$menuOpen = false">Delete</a>
  <a href="#" data-on-click="$menuOpen = false">Share</a>
</div>

<style>
  .dropdown-menu {
    background: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    min-width: 150px;
    z-index: 1000;
  }
  
  .dropdown-menu a {
    display: block;
    padding: 8px 16px;
    text-decoration: none;
    color: #333;
  }
  
  .dropdown-menu a:hover {
    background: #f5f5f5;
  }
</style>
```

### Popover

```html
<button id="info-btn" 
        data-on-click="$infoOpen = !$infoOpen">
  ℹ️ More Info
</button>

<div data-anchor="'#info-btn, bottom-end, 10px'"
     data-show="$infoOpen"
     class="popover">
  <div class="popover-header">
    <h4>Additional Information</h4>
    <button data-on-click="$infoOpen = false">×</button>
  </div>
  <div class="popover-body">
    <p>This is a detailed explanation of the feature.</p>
  </div>
</div>
```

## How It Works

### CSS Anchor Positioning (Modern Browsers)

For browsers that support CSS anchor positioning, the plugin uses native features:

1. **Anchor Name Injection**: The target element gets `anchor-name: --anchor-{id}`
2. **Position Anchor**: The tooltip gets `position-anchor: --anchor-{id}`
3. **Anchor Functions**: Positioning uses `anchor(top)`, `anchor(bottom)`, etc.
4. **Position Try Options**: Automatic flipping with `position-try-options`

```css
/* Generated CSS for modern browsers */
#target-button {
  anchor-name: --anchor-target-button;
}

.tooltip {
  position: absolute;
  position-anchor: --anchor-target-button;
  bottom: anchor(top);
  left: anchor(center);
  translate: -50% -10px;
  position-try-options: flip-bottom, flip-left, flip-right;
}
```

### JavaScript Fallback (Legacy Browsers)

For browsers without CSS anchor support, the plugin calculates positions using JavaScript:

- Uses `getBoundingClientRect()` for precise positioning
- Handles scroll offset calculations
- Updates positions on resize and scroll events
- Simple positioning without complex flipping

## Advanced Usage

### Multiple Anchored Elements

```html
<div id="toolbar">
  <button id="btn1">Action 1</button>
  <button id="btn2">Action 2</button>
  <button id="btn3">Action 3</button>
</div>

<!-- Each tooltip anchored to different buttons -->
<div data-anchor="'#btn1, top'" data-show="$tooltip1" class="tooltip">Action 1 tooltip</div>
<div data-anchor="'#btn2, top'" data-show="$tooltip2" class="tooltip">Action 2 tooltip</div>
<div data-anchor="'#btn3, top'" data-show="$tooltip3" class="tooltip">Action 3 tooltip</div>
```

### Dynamic Anchor Targets

```html
<div data-anchor="$currentAnchor" 
     data-show="$dynamicTooltip"
     class="tooltip">
  Dynamic tooltip content: <span data-text="$tooltipText"></span>
</div>

<script>
  // Change anchor target dynamically
  document.addEventListener('click', (e) => {
    if (e.target.dataset.tooltip) {
      window.datastar.signals.$currentAnchor.value = `'#${e.target.id}, bottom, 10px'`;
      window.datastar.signals.$tooltipText.value = e.target.dataset.tooltip;
      window.datastar.signals.$dynamicTooltip.value = true;
    }
  });
</script>
```

### Edge Case Testing

```html
<!-- Test viewport boundaries -->
<button id="edge-test" style="position: fixed; top: 10px; right: 10px;">
  Edge Test
</button>

<!-- These will automatically flip to stay in viewport -->
<div data-anchor="'#edge-test, right, 20px'" data-show="$edgeTest" class="tooltip">
  Should flip to left!
</div>
<div data-anchor="'#edge-test, top, 20px'" data-show="$edgeTest" class="tooltip">
  Should flip to bottom!
</div>
```

## Positioning Reference

### Visual Guide

```text
     top-start    top    top-end
          ↖       ↑        ↗
    left-start ←  📦  → right-start
    left       ←  📦  → right
    left-end   ←  📦  → right-end
          ↙       ↓        ↘
   bottom-start bottom bottom-end
```

### Alignment Behavior

- **Start alignment**: Left edge for top/bottom, top edge for left/right
- **End alignment**: Right edge for top/bottom, bottom edge for left/right
- **Default (no suffix)**: Center alignment

## Styling Best Practices

### Z-Index Management

```css
.tooltip, .popover, .dropdown {
  z-index: 1000; /* Ensure elements appear above other content */
}

.modal {
  z-index: 2000; /* Modals should be above tooltips */
}
```

### Smooth Transitions

```css
.anchored-element {
  transition: opacity 0.2s ease-in-out;
  opacity: 0;
}

.anchored-element.visible {
  opacity: 1;
}
```

### Responsive Design

```css
@media (max-width: 768px) {
  .tooltip {
    max-width: calc(100vw - 32px);
    font-size: 12px;
  }
}
```

## Automatic Features

### Viewport Flipping

**Modern Browsers (CSS Anchor Support):**
- Uses native `position-try-options` for automatic flipping
- Browsers handle flipping automatically based on viewport boundaries

**Legacy Browsers (JavaScript Fallback):**
- No automatic flipping to keep implementation simple
- Elements position exactly as specified

### Responsive Updates

Positions are automatically recalculated when:

- Window is resized (both CSS and JS modes)
- Page is scrolled (JS fallback mode)
- Anchor element changes size or position

## Common Patterns

### Hover Tooltips

```html
<button id="hover-btn"
        data-on-mouseenter="$showTooltip = true"
        data-on-mouseleave="$showTooltip = false">
  Hover me
</button>

<div data-anchor="'#hover-btn, top, 10px'" 
     data-show="$showTooltip"
     class="tooltip">
  Information about this item
</div>
```

### Click Popovers

```html
<button id="popover-btn" 
        data-on-click="$showPopover = !$showPopover">
  Toggle Popover
</button>

<div data-anchor="'#popover-btn, bottom-start, 5px'" 
     data-show="$showPopover"
     class="popover">
  Popover content here
</div>
```

### Form Field Errors

```html
<input type="email" 
       id="email" 
       data-on-blur="validateEmail($event.target.value)">

<div data-anchor="'#email, right-start, 10px'"
     data-show="$emailError"
     data-text="$emailErrorMessage"
     class="error-tooltip">
</div>
```

## Troubleshooting

### Common Issues

1. **Element not positioning**: Ensure the target selector is valid and the element exists
2. **Tooltip appears in wrong place**: Check that anchor element has proper positioning context
3. **Flickering on resize**: Add debouncing to resize handlers if needed
4. **Z-index issues**: Ensure anchored elements have appropriate z-index values

### Debug Tips

```html
<!-- Add debug attributes to see positioning info -->
<div data-anchor-top="'#anchor'" 
     data-debug="true"
     class="tooltip">
  Debug tooltip
</div>
```

The plugin logs positioning information to the browser console when debug mode is enabled.

## Installation

### CDN (Production)

```html
<script type="module" src="https://cdn.jsdelivr.net/gh/username/data-satellites@latest/dist/min/anchor.min.js"></script>
```

### Local Build

```bash
npm install
npm run build:prod
```

Then include the built file:

```html
<script type="module" src="./dist/min/anchor.min.js"></script>
```

## Browser Support

### CSS Anchor Positioning (Recommended)
- **Chrome**: 125+ (full support)
- **Firefox**: 126+ (partial support)
- **Safari**: Experimental support
- **Edge**: 125+ (Chromium-based)

### JavaScript Fallback (All Browsers)
- **All modern browsers** with ES2020 support
- **Legacy browsers** with basic JavaScript support
- No external dependencies required

## Performance Notes

- **Modern browsers**: Native CSS performance with zero JavaScript overhead
- **Legacy browsers**: Lightweight JavaScript positioning (minimal performance impact)
- **Bundle size**: 9.53 kB total (2.10 kB gzipped)
- **Zero dependencies**: Self-contained plugin
- Use `data-show` to conditionally render elements for best performance

## Technical Details

- **Plugin Type**: Datastar AttributePlugin
- **Lifecycle**: Compatible with Datastar v1.0.0-RC.3+
- **CSS Features**: Uses `anchor-name`, `position-anchor`, `anchor()`, `position-try-options`
- **Fallback**: JavaScript positioning with `getBoundingClientRect()`
- **Build System**: Vite with Terser optimization

---

This documentation covers the complete functionality of the Datastar Anchor Plugin. For more examples and advanced patterns, see the demo files included with the plugin.