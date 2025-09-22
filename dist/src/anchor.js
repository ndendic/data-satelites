const supportsCSSAnchor = () => {
  try {
    return CSS.supports("anchor-name", "--test") && CSS.supports("top", "anchor(top)");
  } catch {
    return false;
  }
};
const generateAnchorName = (targetId) => {
  return `--anchor-${targetId.replace(/[^a-zA-Z0-9]/g, "-")}`;
};
const parseAnchorConfig = (el, value) => {
  const cleanValue = value.replace(/^['"]|['"]$/g, "").trim();
  if (cleanValue.includes(",")) {
    const parts = cleanValue.split(",").map((part) => part.trim()).filter((part) => part.length > 0);
    const target = parts[0] || "";
    const placement = parts[1] || "bottom";
    let offsetValue = 8;
    let offsetUnit = "px";
    if (parts[2]) {
      const offsetMatch = parts[2].match(/^(\d+(?:\.\d+)?)\s*([a-z%]*)?$/);
      if (offsetMatch) {
        offsetValue = parseFloat(offsetMatch[1]);
        offsetUnit = offsetMatch[2] || "px";
      }
    }
    return { target, placement, offsetValue, offsetUnit };
  } else {
    const target = cleanValue || el.getAttribute("data-anchor") || "";
    const placement = el.getAttribute("data-anchor-placement") || "bottom";
    const offsetAttr = el.getAttribute("data-anchor-offset") || "8";
    const offsetMatch = offsetAttr.match(/^(\d+(?:\.\d+)?)\s*([a-z%]*)?$/);
    const offsetValue = offsetMatch ? parseFloat(offsetMatch[1]) : 8;
    const offsetUnit = offsetMatch?.[2] || "px";
    return { target, placement, offsetValue, offsetUnit };
  }
};
const getAnchorCSS = (anchorName, placement, offsetValue, offsetUnit) => {
  const offset = `${offsetValue}${offsetUnit}`;
  const styles = {
    position: "absolute",
    "position-anchor": anchorName
  };
  switch (placement) {
    case "top":
      styles.bottom = `anchor(top)`;
      styles.left = `anchor(center)`;
      styles.translate = `-50% -${offset}`;
      break;
    case "top-start":
      styles.bottom = `anchor(top)`;
      styles.left = `anchor(left)`;
      styles.translate = `0 -${offset}`;
      break;
    case "top-end":
      styles.bottom = `anchor(top)`;
      styles.right = `anchor(right)`;
      styles.translate = `0 -${offset}`;
      break;
    case "bottom":
      styles.top = `anchor(bottom)`;
      styles.left = `anchor(center)`;
      styles.translate = `-50% ${offset}`;
      break;
    case "bottom-start":
      styles.top = `anchor(bottom)`;
      styles.left = `anchor(left)`;
      styles.translate = `0 ${offset}`;
      break;
    case "bottom-end":
      styles.top = `anchor(bottom)`;
      styles.right = `anchor(right)`;
      styles.translate = `0 ${offset}`;
      break;
    case "left":
      styles.right = `anchor(left)`;
      styles.top = `anchor(center)`;
      styles.translate = `-${offset} -50%`;
      break;
    case "left-start":
      styles.right = `anchor(left)`;
      styles.top = `anchor(top)`;
      styles.translate = `-${offset} 0`;
      break;
    case "left-end":
      styles.right = `anchor(left)`;
      styles.bottom = `anchor(bottom)`;
      styles.translate = `-${offset} 0`;
      break;
    case "right":
      styles.left = `anchor(right)`;
      styles.top = `anchor(center)`;
      styles.translate = `${offset} -50%`;
      break;
    case "right-start":
      styles.left = `anchor(right)`;
      styles.top = `anchor(top)`;
      styles.translate = `${offset} 0`;
      break;
    case "right-end":
      styles.left = `anchor(right)`;
      styles.bottom = `anchor(bottom)`;
      styles.translate = `${offset} 0`;
      break;
    default:
      styles.top = `anchor(bottom)`;
      styles.left = `anchor(center)`;
      styles.translate = `-50% ${offset}`;
  }
  return styles;
};
const applyFallbackPositioning = (el, target, placement, offsetValue, offsetUnit) => {
  console.log("Using fallback positioning with viewport flipping for", placement);
  const updatePosition = () => {
    const targetRect = target.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const padding = 10;
    let offsetPx = offsetValue;
    switch (offsetUnit) {
      case "rem":
        offsetPx = offsetValue * parseFloat(getComputedStyle(document.documentElement).fontSize);
        break;
      case "em":
        offsetPx = offsetValue * parseFloat(getComputedStyle(el).fontSize);
        break;
      case "vw":
        offsetPx = offsetValue / 100 * window.innerWidth;
        break;
      case "vh":
        offsetPx = offsetValue / 100 * window.innerHeight;
        break;
    }
    const calculatePosition = (testPlacement) => {
      let x = 0, y = 0;
      switch (testPlacement) {
        case "top":
          x = targetRect.left + (targetRect.width - elRect.width) / 2;
          y = targetRect.top - elRect.height - offsetPx;
          break;
        case "top-start":
          x = targetRect.left;
          y = targetRect.top - elRect.height - offsetPx;
          break;
        case "top-end":
          x = targetRect.right - elRect.width;
          y = targetRect.top - elRect.height - offsetPx;
          break;
        case "bottom":
          x = targetRect.left + (targetRect.width - elRect.width) / 2;
          y = targetRect.bottom + offsetPx;
          break;
        case "bottom-start":
          x = targetRect.left;
          y = targetRect.bottom + offsetPx;
          break;
        case "bottom-end":
          x = targetRect.right - elRect.width;
          y = targetRect.bottom + offsetPx;
          break;
        case "left":
          x = targetRect.left - elRect.width - offsetPx;
          y = targetRect.top + (targetRect.height - elRect.height) / 2;
          break;
        case "left-start":
          x = targetRect.left - elRect.width - offsetPx;
          y = targetRect.top;
          break;
        case "left-end":
          x = targetRect.left - elRect.width - offsetPx;
          y = targetRect.bottom - elRect.height;
          break;
        case "right":
          x = targetRect.right + offsetPx;
          y = targetRect.top + (targetRect.height - elRect.height) / 2;
          break;
        case "right-start":
          x = targetRect.right + offsetPx;
          y = targetRect.top;
          break;
        case "right-end":
          x = targetRect.right + offsetPx;
          y = targetRect.bottom - elRect.height;
          break;
        default:
          x = targetRect.left + (targetRect.width - elRect.width) / 2;
          y = targetRect.bottom + offsetPx;
      }
      return { x, y, placement: testPlacement };
    };
    const isWithinViewport = (pos) => {
      return pos.x >= padding && pos.x + elRect.width <= viewportWidth - padding && pos.y >= padding && pos.y + elRect.height <= viewportHeight - padding;
    };
    let finalPosition = calculatePosition(placement);
    if (!isWithinViewport(finalPosition)) {
      const fallbacks = {
        "top": ["bottom", "left", "right"],
        "top-start": ["bottom-start", "top-end", "bottom-end"],
        "top-end": ["bottom-end", "top-start", "bottom-start"],
        "bottom": ["top", "left", "right"],
        "bottom-start": ["top-start", "bottom-end", "top-end"],
        "bottom-end": ["top-end", "bottom-start", "top-start"],
        "left": ["right", "top", "bottom"],
        "left-start": ["right-start", "left-end", "right-end"],
        "left-end": ["right-end", "left-start", "right-start"],
        "right": ["left", "top", "bottom"],
        "right-start": ["left-start", "right-end", "left-end"],
        "right-end": ["left-end", "right-start", "left-start"]
      };
      const fallbackPlacements = fallbacks[placement] || ["bottom", "top", "left", "right"];
      for (const fallbackPlacement of fallbackPlacements) {
        const testPosition = calculatePosition(fallbackPlacement);
        if (isWithinViewport(testPosition)) {
          finalPosition = testPosition;
          console.log(`Flipped from ${placement} to ${fallbackPlacement} to stay in viewport`);
          break;
        }
      }
    }
    finalPosition.x += window.scrollX;
    finalPosition.y += window.scrollY;
    el.style.position = "absolute";
    el.style.left = `${finalPosition.x}px`;
    el.style.top = `${finalPosition.y}px`;
    el.setAttribute("data-actual-placement", finalPosition.placement);
  };
  updatePosition();
  const handleUpdate = () => updatePosition();
  window.addEventListener("scroll", handleUpdate, { passive: true });
  window.addEventListener("resize", handleUpdate);
  return () => {
    window.removeEventListener("scroll", handleUpdate);
    window.removeEventListener("resize", handleUpdate);
  };
};
var anchor_default = {
  type: "attribute",
  name: "anchor",
  keyReq: "exact",
  onLoad({ el, value }) {
    console.log("Datastar Anchor: Plugin loaded for element", el, { value });
    const { target, placement, offsetValue, offsetUnit } = parseAnchorConfig(el, value);
    if (!target) {
      console.warn("Datastar Anchor: No target specified");
      return;
    }
    let targetElement = null;
    if (target.startsWith("#")) {
      targetElement = document.getElementById(target.slice(1));
    } else {
      targetElement = document.querySelector(target);
    }
    if (!targetElement) {
      console.error("Datastar Anchor: Target element not found:", target);
      return;
    }
    const targetId = targetElement.id || `anchor-${Date.now()}`;
    if (!targetElement.id) {
      targetElement.id = targetId;
    }
    console.log("Datastar Anchor: Positioning", el, "relative to", targetElement, {
      placement,
      offsetValue,
      offsetUnit
    });
    if (supportsCSSAnchor()) {
      console.log("Datastar Anchor: Using CSS anchor positioning with smart flipping");
      const anchorName = generateAnchorName(targetId);
      targetElement.style["anchor-name"] = anchorName;
      const anchorStyles = getAnchorCSS(anchorName, placement, offsetValue, offsetUnit);
      Object.assign(el.style, anchorStyles);
      console.log("Datastar Anchor: Applied CSS anchor styles", anchorStyles);
      let hasFlipped = false;
      const checkForFlipping = () => {
        if (hasFlipped) return;
        const elRect = el.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const padding = 10;
        const isSignificantlyOutOfBounds = elRect.right < padding || // Completely off left
        elRect.left > viewportWidth - padding || // Completely off right
        elRect.bottom < padding || // Completely off top
        elRect.top > viewportHeight - padding;
        if (isSignificantlyOutOfBounds) {
          console.log("Datastar Anchor: Element significantly out of bounds, switching to JS fallback with flipping");
          hasFlipped = true;
          el.style.removeProperty("position-anchor");
          el.style.removeProperty("top");
          el.style.removeProperty("bottom");
          el.style.removeProperty("left");
          el.style.removeProperty("right");
          el.style.removeProperty("translate");
          return applyFallbackPositioning(el, targetElement, placement, offsetValue, offsetUnit);
        }
      };
      setTimeout(checkForFlipping, 50);
      const handleResize = () => {
        if (!hasFlipped) {
          setTimeout(checkForFlipping, 50);
        }
      };
      window.addEventListener("resize", handleResize);
      return () => {
        window.removeEventListener("resize", handleResize);
      };
    } else {
      console.log("Datastar Anchor: CSS anchor positioning not supported, using fallback");
      return applyFallbackPositioning(el, targetElement, placement, offsetValue, offsetUnit);
    }
  }
};
export {
  anchor_default as default
};
