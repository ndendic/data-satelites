/**
 * Datastar Anchor Plugin - CSS Anchor Positioning Implementation
 * 
 * Uses modern CSS anchor positioning for high-performance, native positioning.
 * Automatically injects anchor-name CSS into target elements and uses anchor() 
 * function for positioned elements.
 * 
 * Features:
 * - CSS-native anchor positioning (Chrome 125+)
 * - Automatic anchor-name injection
 * - Multiple placement options
 * - Custom offset values with units
 * - Fallback for unsupported browsers
 */

interface AttributePlugin {
  type: "attribute";
  name: string;
  keyReq: "allowed" | "denied" | "starts" | "exact";
  valReq?: "allowed" | "denied" | "must";
  shouldEvaluate?: boolean;
  onLoad: (ctx: RuntimeContext) => OnRemovalFn | void;
}

interface RuntimeContext {
  el: HTMLElement;
  key: string;
  value: string;
  mods: Map<string, any>;
  effect: (fn: () => void) => () => void;
  getPath: (path: string) => any;
  mergePatch: (patch: Record<string, any>) => void;
  startBatch: () => void;
  endBatch: () => void;
}

type OnRemovalFn = () => void;

// CSS Anchor positioning support detection
const supportsCSSAnchor = (): boolean => {
  try {
    return CSS.supports('anchor-name', '--test') && CSS.supports('top', 'anchor(top)');
  } catch {
    return false;
  }
};

// Generate unique anchor name
const generateAnchorName = (targetId: string): string => {
  return `--anchor-${targetId.replace(/[^a-zA-Z0-9]/g, '-')}`;
};

// Parse placement and offset from value or separate attributes
const parseAnchorConfig = (el: HTMLElement, value: string) => {
  // Remove quotes and clean the value
  const cleanValue = value.replace(/^['"]|['"]$/g, '').trim();
  
  // Check if value contains commas (value-based syntax)
  if (cleanValue.includes(',')) {
    // Parse: "#target, placement, offset"
    const parts = cleanValue.split(',').map(part => part.trim()).filter(part => part.length > 0);
    
    const target = parts[0] || '';
    const placement = parts[1] || 'bottom';
    
    // Parse offset from third part
    let offsetValue = 8;
    let offsetUnit = 'px';
    
    if (parts[2]) {
      const offsetMatch = parts[2].match(/^(\d+(?:\.\d+)?)\s*([a-z%]*)?$/);
      if (offsetMatch) {
        offsetValue = parseFloat(offsetMatch[1]);
        offsetUnit = offsetMatch[2] || 'px';
      }
    }
    
    return { target, placement, offsetValue, offsetUnit };
  } else {
    // Attribute-based syntax: separate attributes
    const target = cleanValue || el.getAttribute('data-anchor') || '';
    const placement = el.getAttribute('data-anchor-placement') || 'bottom';
    
    const offsetAttr = el.getAttribute('data-anchor-offset') || '8';
    const offsetMatch = offsetAttr.match(/^(\d+(?:\.\d+)?)\s*([a-z%]*)?$/);
    const offsetValue = offsetMatch ? parseFloat(offsetMatch[1]) : 8;
    const offsetUnit = offsetMatch?.[2] || 'px';
    
    return { target, placement, offsetValue, offsetUnit };
  }
};

// Convert placement to CSS anchor positioning with position-try-fallbacks
const getAnchorCSS = (anchorName: string, placement: string, offsetValue: number, offsetUnit: string): Record<string, string> => {
  const offset = `${offsetValue}${offsetUnit}`;
  
  const styles: Record<string, string> = {
    position: 'absolute',
    'position-anchor': anchorName,
    'position-try-fallbacks': 'flip-inline, flip-block',
  };
  
  switch (placement) {
    case 'top':
      styles.bottom = `anchor(top)`;
      styles.left = `anchor(center)`;
      styles.marginBlock = offset;
      break;
    case 'top-start':
      styles.bottom = `anchor(top)`;
      styles.left = `anchor(left)`;
      styles.marginBlock = offset;
      break;
    case 'top-end':
      styles.bottom = `anchor(top)`;
      styles.right = `anchor(right)`;
      styles.marginBlock = offset;
      break;
    case 'bottom':
      styles.top = `anchor(bottom)`;
      styles.left = `anchor(center)`;
      styles.marginBlock = offset;
      break;
    case 'bottom-start':
      styles.top = `anchor(bottom)`;
      styles.left = `anchor(left)`;
      styles.marginBlock = offset;
      break;
    case 'bottom-end':
      styles.top = `anchor(bottom)`;
      styles.right = `anchor(right)`;
      styles.marginBlock = offset;
      break;
    case 'left':
      styles.right = `anchor(left)`;
      styles.top = `anchor(center)`;
      styles.marginInline = offset;
      break;
    case 'left-start':
      styles.right = `anchor(left)`;
      styles.top = `anchor(top)`;
      styles.marginInline = offset;
      break;
    case 'left-end':
      styles.right = `anchor(left)`;
      styles.bottom = `anchor(bottom)`;
      styles.marginInline = offset;
      break;
    case 'right':
      styles.left = `anchor(right)`;
      styles.top = `anchor(center)`;
      styles.marginInline = offset;
      break;
    case 'right-start':
      styles.left = `anchor(right)`;
      styles.top = `anchor(top)`;
      styles.marginInline = offset;
      break;
    case 'right-end':
      styles.left = `anchor(right)`;
      styles.bottom = `anchor(bottom)`;
      styles.marginInline = offset; 
      break;
    default:
      // Default to bottom
      styles.top = `anchor(bottom)`;
      styles.left = `anchor(center)`;
      styles.marginInline = offset;
  }
  
  return styles;
};

// Simple fallback positioning for browsers without CSS anchor support
const applyFallbackPositioning = (el: HTMLElement, target: HTMLElement, placement: string, offsetValue: number, offsetUnit: string): OnRemovalFn => {
  console.log('Using simple fallback positioning for', placement);
  
  const updatePosition = () => {
    const targetRect = target.getBoundingClientRect();
    
    // Convert offset to pixels
    let offsetPx = offsetValue;
    switch (offsetUnit) {
      case 'rem':
        offsetPx = offsetValue * parseFloat(getComputedStyle(document.documentElement).fontSize);
        break;
      case 'em':
        offsetPx = offsetValue * parseFloat(getComputedStyle(el).fontSize);
        break;
      case 'vw':
        offsetPx = (offsetValue / 100) * window.innerWidth;
        break;
      case 'vh':
        offsetPx = (offsetValue / 100) * window.innerHeight;
        break;
    }
    
    let x = 0, y = 0;
    
    // Calculate position based on placement (no flipping)
    switch (placement) {
      case 'top':
        x = targetRect.left + targetRect.width / 2;
        y = targetRect.top - offsetPx;
        el.style.translate = '-50% -100%';
        break;
      case 'top-start':
        x = targetRect.left;
        y = targetRect.top - offsetPx;
        el.style.translate = '0 -100%';
        break;
      case 'top-end':
        x = targetRect.right;
        y = targetRect.top - offsetPx;
        el.style.translate = '-100% -100%';
        break;
      case 'bottom':
        x = targetRect.left + targetRect.width / 2;
        y = targetRect.bottom + offsetPx;
        el.style.translate = '-50% 0';
        break;
      case 'bottom-start':
        x = targetRect.left;
        y = targetRect.bottom + offsetPx;
        el.style.translate = '0 0';
        break;
      case 'bottom-end':
        x = targetRect.right;
        y = targetRect.bottom + offsetPx;
        el.style.translate = '-100% 0';
        break;
      case 'left':
        x = targetRect.left - offsetPx;
        y = targetRect.top + targetRect.height / 2;
        el.style.translate = '-100% -50%';
        break;
      case 'left-start':
        x = targetRect.left - offsetPx;
        y = targetRect.top;
        el.style.translate = '-100% 0';
        break;
      case 'left-end':
        x = targetRect.left - offsetPx;
        y = targetRect.bottom;
        el.style.translate = '-100% -100%';
        break;
      case 'right':
        x = targetRect.right + offsetPx;
        y = targetRect.top + targetRect.height / 2;
        el.style.translate = '0 -50%';
        break;
      case 'right-start':
        x = targetRect.right + offsetPx;
        y = targetRect.top;
        el.style.translate = '0 0';
        break;
      case 'right-end':
        x = targetRect.right + offsetPx;
        y = targetRect.bottom;
        el.style.translate = '0 -100%';
        break;
      default:
        // Default to bottom
        x = targetRect.left + targetRect.width / 2;
        y = targetRect.bottom + offsetPx;
        el.style.translate = '-50% 0';
    }
    
    // Account for scroll
    x += window.scrollX;
    y += window.scrollY;
    
    el.style.position = 'absolute';
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
  };
  
  // Initial positioning
  updatePosition();
  
  // Update on scroll and resize
  const handleUpdate = () => updatePosition();
  window.addEventListener('scroll', handleUpdate, { passive: true });
  window.addEventListener('resize', handleUpdate);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('scroll', handleUpdate);
    window.removeEventListener('resize', handleUpdate);
  };
};

export default {
  type: "attribute",
  name: "anchor",
  keyReq: "exact",

  onLoad({ el, value }: RuntimeContext): OnRemovalFn | void {
    console.log('Datastar Anchor: Plugin loaded for element', el, { value });
    
    const { target, placement, offsetValue, offsetUnit } = parseAnchorConfig(el, value);
    
    if (!target) {
      console.warn('Datastar Anchor: No target specified');
      return;
    }
    
    // Find target element
    let targetElement: HTMLElement | null = null;
    if (target.startsWith('#')) {
      targetElement = document.getElementById(target.slice(1));
    } else {
      targetElement = document.querySelector(target) as HTMLElement;
    }
    
    if (!targetElement) {
      console.error('Datastar Anchor: Target element not found:', target);
      return;
    }
    
    const targetId = targetElement.id || `anchor-${Date.now()}`;
    if (!targetElement.id) {
      targetElement.id = targetId;
    }
    
    console.log('Datastar Anchor: Positioning', el, 'relative to', targetElement, {
      placement, offsetValue, offsetUnit
    });
    
    if (supportsCSSAnchor()) {
      // Generate unique anchor name
      const anchorName = generateAnchorName(targetId);
      
      // Inject anchor-name into target element
      (targetElement.style as any)['anchor-name'] = anchorName;
      
      // Apply CSS anchor positioning to the anchored element
      const anchorStyles = getAnchorCSS(anchorName, placement, offsetValue, offsetUnit);
      Object.assign(el.style, anchorStyles);
      
      // No cleanup needed for pure CSS positioning
      return;
    } else {
      console.log('Datastar Anchor: CSS anchor positioning not supported, using basic fallback');
      
      // Use simple JavaScript fallback without complex flipping
      return applyFallbackPositioning(el, targetElement, placement, offsetValue, offsetUnit);
    }
  },
} satisfies AttributePlugin;