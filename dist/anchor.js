/**
 * Datastar Anchor Plugin
 *
 * Inspired by Alpine.js anchor plugin, provides intelligent positioning
 * of elements relative to anchor elements with viewport-aware flipping.
 *
 * Features:
 * - Anchor by element ID reference
 * - Multiple position options (top, bottom, left, right, etc.)
 * - Configurable offset
 * - Automatic viewport boundary detection and flipping
 * - Responsive positioning on scroll/resize
 *
 * Usage Examples:
 * <div data-anchor="'#myButton'">Basic anchoring</div>
 * <div data-anchor-bottom="'#trigger'">Bottom positioned</div>
 * <div data-anchor-top-offset-20="'#target'">Top with 20px offset</div>
 */
// Simple Floating UI-inspired positioning implementation
class FloatingUICore {
    static computePosition(reference, floating, options = {}) {
        const { placement = 'bottom', offset = 0 } = options;
        const refRect = reference.getBoundingClientRect();
        const floatingRect = floating.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        let x = 0;
        let y = 0;
        let finalPlacement = placement;
        // Calculate base position
        switch (placement) {
            case 'top':
                x = refRect.left + (refRect.width - floatingRect.width) / 2;
                y = refRect.top - floatingRect.height - offset;
                break;
            case 'top-start':
                x = refRect.left;
                y = refRect.top - floatingRect.height - offset;
                break;
            case 'top-end':
                x = refRect.right - floatingRect.width;
                y = refRect.top - floatingRect.height - offset;
                break;
            case 'bottom':
                x = refRect.left + (refRect.width - floatingRect.width) / 2;
                y = refRect.bottom + offset;
                break;
            case 'bottom-start':
                x = refRect.left;
                y = refRect.bottom + offset;
                break;
            case 'bottom-end':
                x = refRect.right - floatingRect.width;
                y = refRect.bottom + offset;
                break;
            case 'left':
                x = refRect.left - floatingRect.width - offset;
                y = refRect.top + (refRect.height - floatingRect.height) / 2;
                break;
            case 'left-start':
                x = refRect.left - floatingRect.width - offset;
                y = refRect.top;
                break;
            case 'left-end':
                x = refRect.left - floatingRect.width - offset;
                y = refRect.bottom - floatingRect.height;
                break;
            case 'right':
                x = refRect.right + offset;
                y = refRect.top + (refRect.height - floatingRect.height) / 2;
                break;
            case 'right-start':
                x = refRect.right + offset;
                y = refRect.top;
                break;
            case 'right-end':
                x = refRect.right + offset;
                y = refRect.bottom - floatingRect.height;
                break;
            default:
                finalPlacement = 'bottom';
                x = refRect.left + (refRect.width - floatingRect.width) / 2;
                y = refRect.bottom + offset;
        }
        // Viewport boundary detection and flipping
        const padding = 5; // Minimum distance from viewport edge
        // Check if element would go outside viewport and flip if needed
        if (x < padding) {
            // Element goes off left edge
            if (finalPlacement.includes('left')) {
                // Flip to right
                finalPlacement = finalPlacement.replace('left', 'right');
                x = refRect.right + offset;
            }
            else {
                x = padding;
            }
        }
        else if (x + floatingRect.width > viewportWidth - padding) {
            // Element goes off right edge
            if (finalPlacement.includes('right')) {
                // Flip to left
                finalPlacement = finalPlacement.replace('right', 'left');
                x = refRect.left - floatingRect.width - offset;
            }
            else {
                x = viewportWidth - floatingRect.width - padding;
            }
        }
        if (y < padding) {
            // Element goes off top edge
            if (finalPlacement.includes('top')) {
                // Flip to bottom
                finalPlacement = finalPlacement.replace('top', 'bottom');
                y = refRect.bottom + offset;
            }
            else {
                y = padding;
            }
        }
        else if (y + floatingRect.height > viewportHeight - padding) {
            // Element goes off bottom edge
            if (finalPlacement.includes('bottom')) {
                // Flip to top
                finalPlacement = finalPlacement.replace('bottom', 'top');
                y = refRect.top - floatingRect.height - offset;
            }
            else {
                y = viewportHeight - floatingRect.height - padding;
            }
        }
        // Account for scroll position
        x += window.scrollX;
        y += window.scrollY;
        return { x, y };
    }
}
// Auto-update functionality for responsive positioning
class AutoUpdate {
    constructor(reference, floating, updateCallback) {
        this.reference = reference;
        this.floating = floating;
        this.updateCallback = updateCallback;
        this.cleanup = null;
        this.startUpdating();
    }
    startUpdating() {
        const updatePosition = () => this.updateCallback();
        // Listen for various events that might affect positioning
        window.addEventListener('scroll', updatePosition, { passive: true });
        window.addEventListener('resize', updatePosition);
        // Use ResizeObserver for more granular updates if available
        let resizeObserver = null;
        if (window.ResizeObserver) {
            resizeObserver = new ResizeObserver(updatePosition);
            resizeObserver.observe(this.reference);
            resizeObserver.observe(this.floating);
        }
        // Use MutationObserver to watch for layout changes
        let mutationObserver = null;
        if (window.MutationObserver) {
            mutationObserver = new MutationObserver(updatePosition);
            mutationObserver.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['style', 'class']
            });
        }
        this.cleanup = () => {
            window.removeEventListener('scroll', updatePosition);
            window.removeEventListener('resize', updatePosition);
            if (resizeObserver) {
                resizeObserver.disconnect();
            }
            if (mutationObserver) {
                mutationObserver.disconnect();
            }
        };
    }
    destroy() {
        if (this.cleanup) {
            this.cleanup();
            this.cleanup = null;
        }
    }
}
// Datastar Anchor Plugin Implementation
const AnchorPlugin = {
    name: 'anchor',
    type: 'Attribute',
    // Track auto-update instances for cleanup
    autoUpdateInstances: new WeakMap(),
    apply(element, key, value) {
        try {
            // Parse modifiers from the key (e.g., "anchor-bottom-offset-10")
            const options = this.parseModifiers(key);
            // Get the target element from the expression
            const targetSelector = this.evaluateExpression(value);
            if (!targetSelector) {
                console.warn('Datastar Anchor: No target selector provided');
                return;
            }
            // Find the reference element
            const targetElement = this.findTargetElement(targetSelector);
            if (!targetElement) {
                console.error(`Datastar Anchor: Target element not found: ${targetSelector}`);
                return;
            }
            // Ensure element is positioned
            this.prepareFloatingElement(element);
            // Position the element initially
            this.positionElement(element, targetElement, options);
            // Set up auto-update for responsive positioning
            this.setupAutoUpdate(element, targetElement, options);
        }
        catch (error) {
            console.error('Datastar Anchor: Error applying plugin:', error);
        }
    },
    cleanup(element) {
        // Clean up auto-update instance
        const autoUpdate = this.autoUpdateInstances.get(element);
        if (autoUpdate) {
            autoUpdate.destroy();
            this.autoUpdateInstances.delete(element);
        }
    },
    parseModifiers(key) {
        const parts = key.split('-');
        // Order positions by specificity (longer matches first)
        const positions = [
            'top-start', 'top-end', 'bottom-start', 'bottom-end',
            'left-start', 'left-end', 'right-start', 'right-end',
            'top', 'bottom', 'left', 'right'
        ];
        // Find placement - prioritize more specific matches
        let placement = 'bottom'; // default
        for (const position of positions) {
            if (key.includes(position)) {
                placement = position;
                break;
            }
        }
        // Find offset value
        let offsetValue = 10; // default
        const offsetIndex = parts.findIndex(part => part === 'offset');
        if (offsetIndex !== -1 && parts[offsetIndex + 1]) {
            const parsedOffset = parseInt(parts[offsetIndex + 1], 10);
            if (!isNaN(parsedOffset)) {
                offsetValue = parsedOffset;
            }
        }
        return { placement, offsetValue };
    },
    evaluateExpression(value) {
        // Simple expression evaluation - in a real Datastar context,
        // this would integrate with the signal system
        if (value.startsWith("'") && value.endsWith("'")) {
            return value.slice(1, -1);
        }
        // For signal references like $triggerRef, this would need
        // integration with Datastar's signal system
        if (value.startsWith('$')) {
            console.warn('Datastar Anchor: Signal references not yet implemented');
            return null;
        }
        return value;
    },
    findTargetElement(selector) {
        if (selector.startsWith('#')) {
            return document.getElementById(selector.slice(1));
        }
        return document.querySelector(selector);
    },
    prepareFloatingElement(element) {
        // Ensure the element can be positioned
        const style = element.style;
        style.position = 'absolute';
        style.top = '0';
        style.left = '0';
        style.width = 'max-content';
        style.zIndex = '1000';
    },
    positionElement(element, target, options) {
        const position = FloatingUICore.computePosition(target, element, {
            placement: options.placement,
            offset: options.offsetValue
        });
        // Apply the calculated position
        element.style.left = `${position.x}px`;
        element.style.top = `${position.y}px`;
    },
    setupAutoUpdate(element, target, options) {
        // Clean up any existing auto-update
        this.cleanup(element);
        // Create new auto-update instance
        const autoUpdate = new AutoUpdate(target, element, () => {
            this.positionElement(element, target, options);
        });
        this.autoUpdateInstances.set(element, autoUpdate);
    }
};
// Export for module systems
export default AnchorPlugin;
// Also support direct script inclusion
if (typeof window !== 'undefined') {
    // @ts-ignore - Global Datastar integration
    if (window.datastar && window.datastar.load) {
        // @ts-ignore
        window.datastar.load(AnchorPlugin);
    }
    else {
        // @ts-ignore - Make available globally
        window.DatastarAnchorPlugin = AnchorPlugin;
    }
}
//# sourceMappingURL=anchor.js.map