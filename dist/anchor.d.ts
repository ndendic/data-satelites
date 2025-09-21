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
interface AnchorOptions {
    placement: string;
    offsetValue: number;
}
declare class AutoUpdate {
    private reference;
    private floating;
    private updateCallback;
    private cleanup;
    constructor(reference: HTMLElement, floating: HTMLElement, updateCallback: () => void);
    private startUpdating;
    destroy(): void;
}
declare const AnchorPlugin: {
    name: string;
    type: "Attribute";
    autoUpdateInstances: WeakMap<HTMLElement, AutoUpdate>;
    apply(element: HTMLElement, key: string, value: string): void;
    cleanup(element: HTMLElement): void;
    parseModifiers(key: string): AnchorOptions;
    evaluateExpression(value: string): string | null;
    findTargetElement(selector: string): HTMLElement | null;
    prepareFloatingElement(element: HTMLElement): void;
    positionElement(element: HTMLElement, target: HTMLElement, options: AnchorOptions): void;
    setupAutoUpdate(element: HTMLElement, target: HTMLElement, options: AnchorOptions): void;
};
export default AnchorPlugin;
//# sourceMappingURL=anchor.d.ts.map