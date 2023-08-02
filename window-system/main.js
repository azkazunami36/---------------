//@ts-check

/**
 * @param { any } element 
 * @return { HTMLElement }
 */
function assertionHTMLElement(element) {
    return element
}
class windowDrag {
    /**
     * window-barとwindow-main子要素が入ったElementを入力してください。
     * @param {HTMLElement} window 
     */
    constructor(window) {
        this.element = window
        window.addEventListener("mousedown", e => {
            const target = assertionHTMLElement(e.target)
            if (target.className === "window-bar") {
                this.draging.is = true
                this.draging.mouseX = e.clientX - target.getBoundingClientRect().left
                this.draging.mouseY = e.clientY - target.getBoundingClientRect().top
            }
        })
        window.addEventListener("mouseup", e => {
            const target = assertionHTMLElement(e.target)
            if (target.className === "window-bar") {
                this.draging.is = false
            }
        })
        addEventListener("mousemove", e => {
            if (this.draging.is && this.element) {
                this.element.style.left = String(e.clientX - this.draging.mouseX) + "px"
                this.element.style.top = String(e.clientY - this.draging.mouseY) + "px"
            }
        })
    }
    /**
     * @type { HTMLElement | null }
     */
    element = null
    /**
     * ドラッグ中のデータです。
     */
    draging = {
        /**
         * ドラッグ中のElementです。
         */
        is: false,
        /**
         * ウィンドウの左上を基準にするためのデータです。
         * leftと関連します。
         */
        mouseX: 0,
        /**
         * ウィンドウの左上を基準にするためのデータです。
         */
        mouseY: 0
    }
}
addEventListener("load", () => {
    const window1 = document.getElementById("window1")
    if (window1) {
        const d = new windowDrag(window1)
    }
})