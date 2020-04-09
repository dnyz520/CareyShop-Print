"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var URL_LONG = /^(((http[s]?)|file):)?(\/\/)+([0-9a-zA-Z-_.=?&].+)$/;
var URL_SHORT = /^((\.|\.\.)?\/)([0-9a-zA-Z-_.=?&]+\/)*([0-9a-zA-Z-_.=?&]+)$/;
var isValidURL = function (str) { return URL_LONG.test(str) || URL_SHORT.test(str); };
const DOCUMENT = '<!DOCTYPE html><html><head><title>CareyShop</title></head><body/></html>';
function createStyle(doc, cssText) {
    var style = doc.createElement('style');
    style.type = 'text/css';
    style.appendChild(window.document.createTextNode(cssText));
    return style;
}
exports.createStyle = createStyle;
function createLinkStyle(doc, url) {
    var style = doc.createElement('link');
    style.type = 'text/css';
    style.rel = 'stylesheet';
    style.href = url;
    return style;
}
exports.createLinkStyle = createLinkStyle;
function createIFrame(parent) {
    var el = window.document.createElement('iframe');
    var css = 'visibility:hidden;position:absolute;width:0;height:0;top:-10px;left:-10px;';
    el.setAttribute('style', css);
    el.setAttribute('width', '0');
    el.setAttribute('height', '0');
    el.setAttribute('wmode', 'opaque');
    parent.appendChild(el);
    return el;
}
exports.createIFrame = createIFrame;
var DEFAULT_OPTIONS = {
    parent: window.document.body,
    headElements: [],
    bodyElements: []
};
/** PrintCs class that prints HTML elements in a blank document */
var PrintCs = /** @class */ (function () {
    function PrintCs(options) {
        this.isLoading = false;
        this.hasEvents = false;
        this.opts = Object.assign(DEFAULT_OPTIONS, (options || {}));
        this.iframe = createIFrame(this.opts.parent);
    }
    /** Gets current Iframe reference */
    PrintCs.prototype.getIFrame = function () {
        return this.iframe;
    };
    /** Clear current Iframe document */
    PrintCs.prototype.clearIFrameDocument = function () {
      const { contentWindow } = this.iframe;
      contentWindow.document.open();
      contentWindow.document.write(DOCUMENT);
      contentWindow.document.close();
    };
    /**
     * Print an HTMLElement
     *
     * @param el HTMLElement
     * @param styles Optional styles (css texts or urls) that will add to iframe document.head
     * @param scripts Optional scripts (script texts or urls) that will add to iframe document.body
     * @param callback Optional callback that will be triggered when content is ready to print
     */
    PrintCs.prototype.print = function (el, styles, scripts, callback) {
        if (this.isLoading)
            return;
        var _a = this.iframe, contentDocument = _a.contentDocument, contentWindow = _a.contentWindow;
        if (!contentDocument || !contentWindow)
            return;
        this.elCopy = el.cloneNode(true);
        if (!this.elCopy)
            return;
        this.isLoading = true;
        this.callback = callback;
        var doc = contentWindow.document;
        doc.open();
        doc.write(DOCUMENT);
        this.addEvents();
        // 1. append custom elements
        var _b = this.opts, headElements = _b.headElements, bodyElements = _b.bodyElements;
        // 1.1 append custom head elements
        if (Array.isArray(headElements)) {
            headElements.forEach(function (el) { return doc.head.appendChild(el); });
        }
        // 1.1 append custom body elements
        if (Array.isArray(bodyElements)) {
            bodyElements.forEach(function (el) { return doc.body.appendChild(el); });
        }
        // 2. append custom styles
        if (Array.isArray(styles)) {
            styles.forEach(function (value) {
                if (value) {
                    if (isValidURL(value)) {
                        doc.head.appendChild(createLinkStyle(doc, value));
                    }
                    else {
                        doc.head.appendChild(createStyle(doc, value));
                    }
                }
            });
        }
        // 3. append element copy
        doc.body.appendChild(this.elCopy);
        // 4. append custom scripts
        if (Array.isArray(scripts)) {
            scripts.forEach(function (value) {
                if (value) {
                    var script = doc.createElement('script');
                    if (isValidURL(value)) {
                        script.src = value;
                    }
                    else {
                        script.innerText = value;
                    }
                    doc.body.appendChild(script);
                }
            });
        }
        doc.close();
    };
    /**
     * Print an URL
     *
     * @param url URL to print
     * @param callback Optional callback that will be triggered when content is ready to print
     */
    PrintCs.prototype.printURL = function (url, callback) {
        if (this.isLoading)
            return;
        this.addEvents();
        this.isLoading = true;
        this.callback = callback;
        this.iframe.src = url;
    };
    PrintCs.prototype.launchPrint = function (contentWindow) {
        var result = contentWindow.document.execCommand('print', false, null);
        if (!result) {
            contentWindow.print();
        }
    };
    PrintCs.prototype.addEvents = function () {
        var _this = this;
        if (!this.hasEvents) {
            this.hasEvents = true;
            this.iframe.addEventListener('load', function () { return _this.onLoad(); }, false);
        }
    };
    PrintCs.prototype.onLoad = function () {
        var _this = this;
        if (this.iframe) {
            this.isLoading = false;
            var _a = this.iframe, contentDocument = _a.contentDocument, contentWindow_1 = _a.contentWindow;
            if (!contentDocument || !contentWindow_1)
                return;
            if (this.callback) {
                this.callback({
                    iframe: this.iframe,
                    element: this.elCopy,
                    launchPrint: function () { return _this.launchPrint(contentWindow_1); }
                });
            }
            else {
                this.launchPrint(contentWindow_1);
            }
        }
    };
    return PrintCs;
}());
exports.PrintCs = PrintCs;
exports.default = PrintCs;
