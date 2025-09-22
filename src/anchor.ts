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

// Convert placement to CSS anchor positioning with viewport flipping
const getAnchorCSS = (anchorName: string, placement: string, offsetValue: number, offsetUnit: string): Record<string, string> => {
  const offset = `${offsetValue}${offsetUnit}`;
  
  const styles: Record<string, string> = {
    position: 'absolute',
    'position-anchor': anchorName
  };
  
  switch (placement) {
    case 'top':
      styles.bottom = `anchor(top)`;
      styles.left = `anchor(center)`;
      styles.translate = `-50% -${offset}`;
      break;
    case 'top-start':
      styles.bottom = `anchor(top)`;
      styles.left = `anchor(left)`;
      styles.translate = `0 -${offset}`;
      break;
    case 'top-end':
      styles.bottom = `anchor(top)`;
      styles.right = `anchor(right)`;
      styles.translate = `0 -${offset}`;
      break;
    case 'bottom':
      styles.top = `anchor(bottom)`;
      styles.left = `anchor(center)`;
      styles.translate = `-50% ${offset}`;
      break;
    case 'bottom-start':
      styles.top = `anchor(bottom)`;
      styles.left = `anchor(left)`;
      styles.translate = `0 ${offset}`;
      break;
    case 'bottom-end':
      styles.top = `anchor(bottom)`;
      styles.right = `anchor(right)`;
      styles.translate = `0 ${offset}`;
      break;
    case 'left':
      styles.right = `anchor(left)`;
      styles.top = `anchor(center)`;
      styles.translate = `-${offset} -50%`;
      break;
    case 'left-start':
      styles.right = `anchor(left)`;
      styles.top = `anchor(top)`;
      styles.translate = `-${offset} 0`;
      break;
    case 'left-end':
      styles.right = `anchor(left)`;
      styles.bottom = `anchor(bottom)`;
      styles.translate = `-${offset} 0`;
      break;
    case 'right':
      styles.left = `anchor(right)`;
      styles.top = `anchor(center)`;
      styles.translate = `${offset} -50%`;
      break;
    case 'right-start':
      styles.left = `anchor(right)`;
      styles.top = `anchor(top)`;
      styles.translate = `${offset} 0`;
      break;
    case 'right-end':
      styles.left = `anchor(right)`;
      styles.bottom = `anchor(bottom)`;
      styles.translate = `${offset} 0`;
      break;
    default:
      // Default to bottom
      styles.top = `anchor(bottom)`;
      styles.left = `anchor(center)`;
      styles.translate = `-50% ${offset}`;
  }
  
  return styles;
};

// Note: CSS position-try-options removed to prevent browser compatibility issues

// Fallback positioning for browsers without CSS anchor support with viewport flipping
const applyFallbackPositioning = (el: HTMLElement, target: HTMLElement, placement: string, offsetValue: number, offsetUnit: string) => {
  console.log('Using fallback positioning with viewport flipping for', placement);
  
  const updatePosition = () => {
    const targetRect = target.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const padding = 10; // Minimum distance from viewport edge
    
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
    
    // Function to calculate position for a given placement
    const calculatePosition = (testPlacement: string) => {
      let x = 0, y = 0;
      
      switch (testPlacement) {
        case 'top':
          x = targetRect.left + (targetRect.width - elRect.width) / 2;
          y = targetRect.top - elRect.height - offsetPx;
          break;
        case 'top-start':
          x = targetRect.left;
          y = targetRect.top - elRect.height - offsetPx;
          break;
        case 'top-end':
          x = targetRect.right - elRect.width;
          y = targetRect.top - elRect.height - offsetPx;
          break;
        case 'bottom':
          x = targetRect.left + (targetRect.width - elRect.width) / 2;
          y = targetRect.bottom + offsetPx;
          break;
        case 'bottom-start':
          x = targetRect.left;
          y = targetRect.bottom + offsetPx;
          break;
        case 'bottom-end':
          x = targetRect.right - elRect.width;
          y = targetRect.bottom + offsetPx;
          break;
        case 'left':
          x = targetRect.left - elRect.width - offsetPx;
          y = targetRect.top + (targetRect.height - elRect.height) / 2;
          break;
        case 'left-start':
          x = targetRect.left - elRect.width - offsetPx;
          y = targetRect.top;
          break;
        case 'left-end':
          x = targetRect.left - elRect.width - offsetPx;
          y = targetRect.bottom - elRect.height;
          break;
        case 'right':
          x = targetRect.right + offsetPx;
          y = targetRect.top + (targetRect.height - elRect.height) / 2;
          break;
        case 'right-start':
          x = targetRect.right + offsetPx;
          y = targetRect.top;
          break;
        case 'right-end':
          x = targetRect.right + offsetPx;
          y = targetRect.bottom - elRect.height;
          break;
        default:
          // Default to bottom
          x = targetRect.left + (targetRect.width - elRect.width) / 2;
          y = targetRect.bottom + offsetPx;
      }
      
      return { x, y, placement: testPlacement };
    };
    
    // Check if position is within viewport
    const isWithinViewport = (pos: { x: number; y: number }) => {
      return pos.x >= padding && 
             pos.x + elRect.width <= viewportWidth - padding &&
             pos.y >= padding && 
             pos.y + elRect.height <= viewportHeight - padding;
    };
    
    // Try original placement first
    let finalPosition = calculatePosition(placement);
    
    // If original placement doesn't fit, try fallbacks
    if (!isWithinViewport(finalPosition)) {
      const fallbacks: Record<string, string[]> = {
        'top': ['bottom', 'left', 'right'],
        'top-start': ['bottom-start', 'top-end', 'bottom-end'],
        'top-end': ['bottom-end', 'top-start', 'bottom-start'],
        'bottom': ['top', 'left', 'right'],
        'bottom-start': ['top-start', 'bottom-end', 'top-end'],
        'bottom-end': ['top-end', 'bottom-start', 'top-start'],
        'left': ['right', 'top', 'bottom'],
        'left-start': ['right-start', 'left-end', 'right-end'],
        'left-end': ['right-end', 'left-start', 'right-start'],
        'right': ['left', 'top', 'bottom'],
        'right-start': ['left-start', 'right-end', 'left-end'],
        'right-end': ['left-end', 'right-start', 'left-start']
      };
      
      const fallbackPlacements = fallbacks[placement] || ['bottom', 'top', 'left', 'right'];
      
      for (const fallbackPlacement of fallbackPlacements) {
        const testPosition = calculatePosition(fallbackPlacement);
        if (isWithinViewport(testPosition)) {
          finalPosition = testPosition;
          console.log(`Flipped from ${placement} to ${fallbackPlacement} to stay in viewport`);
          break;
        }
      }
    }
    
    // Account for scroll
    finalPosition.x += window.scrollX;
    finalPosition.y += window.scrollY;
    
    el.style.position = 'absolute';
    el.style.left = `${finalPosition.x}px`;
    el.style.top = `${finalPosition.y}px`;
    
    // Store the actual placement used for debugging
    el.setAttribute('data-actual-placement', finalPosition.placement);
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
      console.log('Datastar Anchor: Using CSS anchor positioning with smart flipping');
      
      // Generate unique anchor name
      const anchorName = generateAnchorName(targetId);
      
      // Inject anchor-name into target element
      (targetElement.style as any)['anchor-name'] = anchorName;
      
      // Apply CSS anchor positioning to the anchored element
      const anchorStyles = getAnchorCSS(anchorName, placement, offsetValue, offsetUnit);
      Object.assign(el.style, anchorStyles);
      
      console.log('Datastar Anchor: Applied CSS anchor styles', anchorStyles);
      
      // Add intelligent flipping check - but only switch to JS fallback if really needed
      let hasFlipped = false;
      
      const checkForFlipping = () => {
        if (hasFlipped) return; // Prevent multiple flips
        
        const elRect = el.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const padding = 10;
        
        const isSignificantlyOutOfBounds = 
          elRect.right < padding || // Completely off left
          elRect.left > viewportWidth - padding || // Completely off right
          elRect.bottom < padding || // Completely off top
          elRect.top > viewportHeight - padding; // Completely off bottom
          
        if (isSignificantlyOutOfBounds) {
          console.log('Datastar Anchor: Element significantly out of bounds, switching to JS fallback with flipping');
          hasFlipped = true;
          
          // Remove CSS anchor positioning
          el.style.removeProperty('position-anchor');
          el.style.removeProperty('top');
          el.style.removeProperty('bottom');
          el.style.removeProperty('left');
          el.style.removeProperty('right');
          el.style.removeProperty('translate');
          
          // Apply JavaScript fallback with flipping
          return applyFallbackPositioning(el, targetElement, placement, offsetValue, offsetUnit);
        }
      };
      
      // Check after CSS positioning has been applied
      setTimeout(checkForFlipping, 50);
      
      // Monitor for viewport changes
      const handleResize = () => {
        if (!hasFlipped) {
          setTimeout(checkForFlipping, 50);
        }
      };
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    } else {
      console.log('Datastar Anchor: CSS anchor positioning not supported, using fallback');
      
      // Use JavaScript fallback
      return applyFallbackPositioning(el, targetElement, placement, offsetValue, offsetUnit);
    }
  },
} satisfies AttributePlugin;