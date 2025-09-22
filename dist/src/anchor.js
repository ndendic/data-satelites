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
    "position-anchor": anchorName,
    "position-try-options": getPositionTryOptions(placement)
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
const getPositionTryOptions = (placement) => {
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
  return fallbackPlacements.map((p) => `flip-${p}`).join(", ");
};
const applyFallbackPositioning = (el, target, placement, offsetValue, offsetUnit) => {
  console.log("Using simple fallback positioning for", placement);
  const updatePosition = () => {
    const targetRect = target.getBoundingClientRect();
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
    let x = 0, y = 0;
    switch (placement) {
      case "top":
        x = targetRect.left + targetRect.width / 2;
        y = targetRect.top - offsetPx;
        el.style.translate = "-50% -100%";
        break;
      case "top-start":
        x = targetRect.left;
        y = targetRect.top - offsetPx;
        el.style.translate = "0 -100%";
        break;
      case "top-end":
        x = targetRect.right;
        y = targetRect.top - offsetPx;
        el.style.translate = "-100% -100%";
        break;
      case "bottom":
        x = targetRect.left + targetRect.width / 2;
        y = targetRect.bottom + offsetPx;
        el.style.translate = "-50% 0";
        break;
      case "bottom-start":
        x = targetRect.left;
        y = targetRect.bottom + offsetPx;
        el.style.translate = "0 0";
        break;
      case "bottom-end":
        x = targetRect.right;
        y = targetRect.bottom + offsetPx;
        el.style.translate = "-100% 0";
        break;
      case "left":
        x = targetRect.left - offsetPx;
        y = targetRect.top + targetRect.height / 2;
        el.style.translate = "-100% -50%";
        break;
      case "left-start":
        x = targetRect.left - offsetPx;
        y = targetRect.top;
        el.style.translate = "-100% 0";
        break;
      case "left-end":
        x = targetRect.left - offsetPx;
        y = targetRect.bottom;
        el.style.translate = "-100% -100%";
        break;
      case "right":
        x = targetRect.right + offsetPx;
        y = targetRect.top + targetRect.height / 2;
        el.style.translate = "0 -50%";
        break;
      case "right-start":
        x = targetRect.right + offsetPx;
        y = targetRect.top;
        el.style.translate = "0 0";
        break;
      case "right-end":
        x = targetRect.right + offsetPx;
        y = targetRect.bottom;
        el.style.translate = "0 -100%";
        break;
      default:
        x = targetRect.left + targetRect.width / 2;
        y = targetRect.bottom + offsetPx;
        el.style.translate = "-50% 0";
    }
    x += window.scrollX;
    y += window.scrollY;
    el.style.position = "absolute";
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
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
      console.log("Datastar Anchor: Using CSS anchor positioning with position-try-options");
      const anchorName = generateAnchorName(targetId);
      targetElement.style["anchor-name"] = anchorName;
      const anchorStyles = getAnchorCSS(anchorName, placement, offsetValue, offsetUnit);
      Object.assign(el.style, anchorStyles);
      console.log("Datastar Anchor: Applied CSS anchor styles with position-try-options", anchorStyles);
      return;
    } else {
      console.log("Datastar Anchor: CSS anchor positioning not supported, using basic fallback");
      return applyFallbackPositioning(el, targetElement, placement, offsetValue, offsetUnit);
    }
  }
};
export {
  anchor_default as default
};
