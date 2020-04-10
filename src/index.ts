const URL_LONG = /^(((http[s]?)|file):)?(\/\/)+([0-9a-zA-Z-_.=?&].+)$/
const URL_SHORT = /^((\.|\.\.)?\/)([0-9a-zA-Z-_.=?&]+\/)*([0-9a-zA-Z-_.=?&]+)$/
const isValidURL = (str: string) => URL_LONG.test(str) || URL_SHORT.test(str)

export function createStyle (doc: Document, cssText: string) {
  const style: HTMLStyleElement = doc.createElement('style')

  style.type = 'text/css'
  style.appendChild(window.document.createTextNode(cssText))

  return style
}

export function createLinkStyle (doc: Document, url: string) {
  const style: HTMLLinkElement = doc.createElement('link')

  style.type = 'text/css'
  style.rel = 'stylesheet'
  style.href = url

  return style
}

export function createIFrame (parent: HTMLElement) {
  const el: HTMLIFrameElement = window.document.createElement('iframe')
  const css = 'visibility:hidden;position:absolute;width:0;height:0;top:-10px;left:-10px;'

  el.setAttribute('style', css)
  el.setAttribute('width', '0')
  el.setAttribute('height', '0')
  el.setAttribute('wmode', 'opaque')

  parent.appendChild(el)

  return el
}

export interface PrintCSOptions {
  /** Parent element where the printable element will be appended. */
  parent?: HTMLElement
  /** Specifies a custom document head elements */
  headElements?: HTMLElement[]
  /** Specifies a custom document body elements */
  bodyElements?: HTMLElement[]
}

export interface PrintCSCallbackArgs {
  /** Iframe reference */
  iframe: HTMLIFrameElement
  /** HTMLElement copy reference */
  element?: HTMLElement
  /** Function to launch the print dialog after content was loaded */
  launchPrint: Function
}

export type PrintCSCallback = (args: PrintCSCallbackArgs) => void

const DEFAULT_OPTIONS: PrintCSOptions = {
  parent: window.document.body,
  headElements: [],
  bodyElements: []
}

/** PrintCS class that prints HTML elements in a blank document */
export default class PrintCS {
  private readonly opts: Required<PrintCSOptions>
  private readonly iframe: HTMLIFrameElement
  private isLoading = false
  private hasEvents = false
  private callback?: PrintCSCallback
  private elCopy?: HTMLElement

  constructor (options?: PrintCSOptions) {
    this.opts = Object.assign(DEFAULT_OPTIONS, (options || {})) as Required<PrintCSOptions>
    this.iframe = createIFrame(this.opts.parent)
  }

  /** Gets current Iframe reference */
  getIFrame () {
    return this.iframe
  }

  /**
   * Print an HTMLElement
   *
   * @param el HTMLElement
   * @param styles Optional styles (css texts or urls) that will add to iframe document.head
   * @param scripts Optional scripts (script texts or urls) that will add to iframe document.body
   * @param callback Optional callback that will be triggered when content is ready to print
   */
  print (el: HTMLElement, styles?: string[], scripts?: string[], callback?: PrintCSCallback) {
    if (this.isLoading) return

    const { contentDocument, contentWindow } = this.iframe

    if (!contentDocument || !contentWindow) return

    this.elCopy = el.cloneNode(true) as HTMLElement

    if (!this.elCopy) return

    this.isLoading = true
    this.callback = callback

    const doc = contentWindow.document

    doc.open()
    doc.write('<!DOCTYPE html><html lang="zh"><head><title>CareyShop</title></head><body/></html>')

    this.addEvents()

    // 1. append custom elements
    const { headElements, bodyElements } = this.opts

    // 1.1 append custom head elements
    if (Array.isArray(headElements)) {
      headElements.forEach((el) => doc.head.appendChild(el))
    }

    // 1.1 append custom body elements
    if (Array.isArray(bodyElements)) {
      bodyElements.forEach((el) => doc.body.appendChild(el))
    }

    // 2. append custom styles
    if (Array.isArray(styles)) {
      styles.forEach((value) => {
        if (value) {
          if (isValidURL(value)) {
            doc.head.appendChild(createLinkStyle(doc, value))
          } else {
            doc.head.appendChild(createStyle(doc, value))
          }
        }
      })
    }

    // 3. append element copy
    doc.body.appendChild(this.elCopy)

    // 4. append custom scripts
    if (Array.isArray(scripts)) {
      scripts.forEach((value) => {
        if (value) {
          const script = doc.createElement('script')

          if (isValidURL(value)) {
            script.src = value
          } else {
            script.innerText = value
          }

          doc.body.appendChild(script)
        }
      })
    }

    doc.close()
  }

  /**
   * Print an URL
   *
   * @param url URL to print
   * @param callback Optional callback that will be triggered when content is ready to print
   */
  printURL (url: string, callback?: PrintCSCallback) {
    if (this.isLoading) return

    this.addEvents()
    this.isLoading = true
    this.callback = callback
    this.iframe.src = url
  }

  private launchPrint (contentWindow: Window) {
    const result = contentWindow.document.execCommand('print', false, null)

    if (!result) {
      contentWindow.print()
    }
  }

  private addEvents () {
    if (!this.hasEvents) {
      this.hasEvents = true
      this.iframe.addEventListener('load', () => this.onLoad(), false)
    }
  }

  private onLoad () {
    if (this.iframe) {
      this.isLoading = false

      const { contentDocument, contentWindow } = this.iframe

      if (!contentDocument || !contentWindow) return

      if (this.callback) {
        this.callback({
          iframe: this.iframe,
          element: this.elCopy,
          launchPrint: () => this.launchPrint(contentWindow)
        })
      } else {
        this.launchPrint(contentWindow)
      }
    }
  }
}

export { PrintCS }
