# Datastar Anchor Plugin

The **Datastar Anchor Plugin** provides intelligent positioning for elements relative to anchor elements, similar to Alpine.js anchor functionality. It's perfect for tooltips, popovers, dropdowns, context menus, and any UI element that needs to be positioned relative to another element.

## Features

- 🎯 **12 positioning combinations** with precise alignment control
- 🔄 **Automatic viewport flipping** when elements would overflow screen edges
- 📐 **Custom offset support** for fine-tuned positioning
- 📱 **Responsive repositioning** on window resize and DOM changes
- ⚡ **Datastar integration** with reactive signal support
- 🧩 **Floating UI powered** for reliable cross-browser positioning

## Basic Usage

Add `data-anchor-{position}` attributes to elements you want to position relative to an anchor:

```html
<!-- Basic positioning -->
<button id="my-button">Click me</button>
<div data-anchor-top="'#my-button'">
  This tooltip appears above the button
</div>
```

## Position Options

### Primary Positions

| Attribute | Description | Alignment |
|-----------|-------------|-----------|
| `data-anchor-top` | Above the anchor | Center |
| `data-anchor-bottom` | Below the anchor | Center |
| `data-anchor-left` | Left of the anchor | Center |
| `data-anchor-right` | Right of the anchor | Center |

### Start/End Alignment

Add `-start` or `-end` suffixes for precise alignment:

| Attribute | Description | Alignment |
|-----------|-------------|-----------|
| `data-anchor-top-start` | Above, left-aligned | Start edge |
| `data-anchor-top-end` | Above, right-aligned | End edge |
| `data-anchor-bottom-start` | Below, left-aligned | Start edge |
| `data-anchor-bottom-end` | Below, right-aligned | End edge |
| `data-anchor-left-start` | Left, top-aligned | Start edge |
| `data-anchor-left-end` | Left, bottom-aligned | End edge |
| `data-anchor-right-start` | Right, top-aligned | Start edge |
| `data-anchor-right-end` | Right, bottom-aligned | End edge |

## Custom Offsets

Add pixel offsets using the `-offset-{px}` modifier:

```html
<!-- 20px offset from the anchor -->
<div data-anchor-top-offset-20="'#anchor'">Tooltip with 20px spacing</div>

<!-- Combine with alignment -->
<div data-anchor-bottom-start-offset-15="'#anchor'">Bottom-left with 15px offset</div>
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
    opacity: 0;
    transition: opacity 0.2s;
    pointer-events: none;
    z-index: 1000;
  }
  
  .tooltip.visible {
    opacity: 1;
  }
</style>

<button id="save-btn" 
        data-on-mouseenter="$showTooltip = true"
        data-on-mouseleave="$showTooltip = false">
  Save Document
</button>

<div data-anchor-top="'#save-btn'" 
     data-class="$showTooltip ? 'tooltip visible' : 'tooltip'">
  Save your changes (Ctrl+S)
</div>
```

### Dropdown Menu

```html
<button id="menu-trigger" 
        data-on-click="$menuOpen = !$menuOpen">
  Options ▼
</button>

<div data-anchor-bottom-start="'#menu-trigger'"
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

### Context Menu

```html
<div id="content-area" 
     data-on-contextmenu.prevent="$contextMenu = {x: $event.clientX, y: $event.clientY, show: true}">
  Right-click anywhere in this area
</div>

<div data-anchor-right-start="'#content-area'"
     data-show="$contextMenu?.show"
     class="context-menu">
  <button data-on-click="$contextMenu.show = false">Copy</button>
  <button data-on-click="$contextMenu.show = false">Paste</button>
  <button data-on-click="$contextMenu.show = false">Delete</button>
</div>
```

### Popover with Rich Content

```html
<button id="info-btn" 
        data-on-click="$infoOpen = !$infoOpen">
  ℹ️ More Info
</button>

<div data-anchor-bottom-end-offset-10="'#info-btn'"
     data-show="$infoOpen"
     class="popover">
  <div class="popover-header">
    <h4>Additional Information</h4>
    <button data-on-click="$infoOpen = false">×</button>
  </div>
  <div class="popover-body">
    <p>This is a detailed explanation of the feature.</p>
    <ul>
      <li>Benefit 1</li>
      <li>Benefit 2</li>
      <li>Benefit 3</li>
    </ul>
  </div>
</div>

<style>
  .popover {
    background: white;
    border: 1px solid #ddd;
    border-radius: 6px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    max-width: 300px;
    z-index: 1000;
  }
  
  .popover-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid #eee;
  }
  
  .popover-body {
    padding: 16px;
  }
</style>
```

## Advanced Usage

### Multiple Anchored Elements

```html
<div id="toolbar">
  <button id="btn1">Action 1</button>
  <button id="btn2">Action 2</button>
  <button id="btn3">Action 3</button>
</div>

<!-- Each tooltip anchored to different buttons -->
<div data-anchor-top="'#btn1'" data-show="$tooltip1" class="tooltip">Action 1 tooltip</div>
<div data-anchor-top="'#btn2'" data-show="$tooltip2" class="tooltip">Action 2 tooltip</div>
<div data-anchor-top="'#btn3'" data-show="$tooltip3" class="tooltip">Action 3 tooltip</div>
```

### Dynamic Anchor Targets

```html
<div data-anchor-bottom="$currentAnchor" 
     data-show="$dynamicTooltip"
     class="tooltip">
  Dynamic tooltip content: <span data-text="$tooltipText"></span>
</div>

<script>
  // Change anchor target dynamically
  document.addEventListener('click', (e) => {
    if (e.target.dataset.tooltip) {
      window.datastar.signals.$currentAnchor.value = `#${e.target.id}`;
      window.datastar.signals.$tooltipText.value = e.target.dataset.tooltip;
      window.datastar.signals.$dynamicTooltip.value = true;
    }
  });
</script>
```

### Responsive Positioning

```html
<!-- Position changes based on screen size -->
<div data-anchor-top="'#anchor'" 
     data-class="$isMobile ? 'mobile-tooltip' : 'desktop-tooltip'"
     class="responsive-tooltip">
  Responsive tooltip
</div>

<style>
  .mobile-tooltip {
    position: fixed;
    bottom: 20px;
    left: 20px;
    right: 20px;
    /* Override positioning on mobile */
    top: auto !important;
    transform: none !important;
  }
</style>
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

The plugin automatically flips positions when elements would overflow:

- `top` → `bottom` when hitting top edge
- `bottom` → `top` when hitting bottom edge  
- `left` → `right` when hitting left edge
- `right` → `left` when hitting right edge

### Responsive Updates

Positions are automatically recalculated when:

- Window is resized
- DOM structure changes
- Anchor element moves or changes size

## Common Patterns

### Hover Tooltips

```html
<span data-tooltip="Information about this item"
      data-on-mouseenter="$showTooltip = true"
      data-on-mouseleave="$showTooltip = false">
  Hover me
</span>

<div data-anchor-top="'[data-tooltip]'" 
     data-show="$showTooltip"
     data-text="$event?.target?.dataset?.tooltip"
     class="tooltip">
</div>
```

### Click Popovers

```html
<button data-on-click="$showPopover = !$showPopover">
  Toggle Popover
</button>

<div data-anchor-bottom-start="'button'" 
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

<div data-anchor-right-start-offset-10="'#email'"
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

## Browser Support

- Modern browsers with ES2020 support
- Floating UI compatibility (IE11+ with polyfills)
- CSS transforms and transitions support recommended

## Performance Notes

- Positioning calculations are optimized and cached
- Only visible elements are processed
- Resize events are throttled for better performance
- Use `data-show` to conditionally render elements for best performance

---

This documentation covers the core functionality of the Datastar Anchor Plugin. For advanced customization and integration patterns, refer to the plugin source code and examples.