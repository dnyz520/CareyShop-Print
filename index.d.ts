export declare function createStyle(doc: Document, cssText: string): HTMLStyleElement;
export declare function createLinkStyle(doc: Document, url: string): HTMLLinkElement;
export declare function createIFrame(parent: HTMLElement): HTMLIFrameElement;
export interface PrintCsOptions {
    /** Parent element where the printable element will be appended. */
    parent?: HTMLElement;
    /** Specifies a custom document head elements */
    headElements?: HTMLElement[];
    /** Specifies a custom document body elements */
    bodyElements?: HTMLElement[];
}
export interface PrintCsCallbackArgs {
    /** Iframe reference */
    iframe: HTMLIFrameElement;
    /** HTMLElement copy reference */
    element?: HTMLElement;
    /** Function to launch the print dialog after content was loaded */
    launchPrint: Function;
}
export declare type PrintCsCallback = (args: PrintCsCallbackArgs) => void;
/** PrintCs class that prints HTML elements in a blank document */
export default class PrintCs {
    private readonly opts;
    private readonly iframe;
    private isLoading;
    private hasEvents;
    private callback?;
    private elCopy?;
    constructor(options?: PrintCsOptions);
    /** Gets current Iframe reference */
    getIFrame(): HTMLIFrameElement;
    /** Clear current Iframe document */
    clearIFrameDocument(): void;
    /**
     * Print an HTMLElement
     *
     * @param el HTMLElement
     * @param styles Optional styles (css texts or urls) that will add to iframe document.head
     * @param scripts Optional scripts (script texts or urls) that will add to iframe document.body
     * @param callback Optional callback that will be triggered when content is ready to print
     */
    print(el: HTMLElement, styles?: string[], scripts?: string[], callback?: PrintCsCallback): void;
    /**
     * Print an URL
     *
     * @param url URL to print
     * @param callback Optional callback that will be triggered when content is ready to print
     */
    printURL(url: string, callback?: PrintCsCallback): void;
    private launchPrint;
    private addEvents;
    private onLoad;
}
export { PrintCs };
