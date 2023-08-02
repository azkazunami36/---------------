//@ts-check

/**
 * 待機します。ライブラリでは使用しすぎないでください。IOや高負荷の回避におすすめです。
 * @param {number} time 時間を入力
 */
async function wait(time) { await /** @type {Promise<void>} */(new Promise(resolve => setTimeout(() => resolve(), time))) }
/**
 * httpリクエストできる関数
 * @param {string} request 
 * @param {any} send 
 * @returns 
 */
async function httpDataRequest(request, send) {
    return new Promise(resolve => {
        const xhr = new XMLHttpRequest()
        xhr.open("POST", "http://" + location.hostname + ":" + location.port + "/" + request)
        xhr.setRequestHeader("content-type", "text/plain;charset=UTF-8")
        xhr.send(send); //データを送信
        xhr.onreadystatechange = async () => { if (xhr.readyState === 4 && xhr.status === 200) resolve(xhr.responseText) } //レスポンスを返す
    })
}
/**
 * TypeScriptの型アサーション(as)の代わりに利用するものです。
 */
const assertions = {
    /**
     * @param { any } element 
     * @return { HTMLElement }
     */
    HTMLElement: (element) => {
        return element
    },
    /**
     * @param { any } element 
     * @return { HTMLInputElement }
     */
    HTMLInputElement: (element) => {
        return element
    }
}

const type = {
    /**
     * 
     * @param {string} data 
     * @returns {{
     * userno: number
     * message: string
     * } | null}
     */
    message: (data) => {
        try {
            const json = JSON.parse(data)
            if (typeof json !== "object") return null
            if (!("userno" in json && "message" in json)) return null
            if (typeof json.userno !== "number" || typeof json.message !== "string") return null
            return json
        } catch (e) {
            return null
        }
    },
    /**
     * 
     * @param {string} data 
     * @returns {{
     * userno: number
     * username: string
     * } | null}
     */
    userdata: (data) => {
        try {
            const json = JSON.parse(data)
            if (typeof json !== "object") return null
            if (!("userno" in json && "username" in json)) return null
            if (typeof json.userno !== "number" || typeof json.username !== "string") return null
            return json
        } catch (e) {
            return null
        }
    }
}

class userChatTool {
    /**
     * 
     * @param {string} name 
     */
    constructor(name) {
        this.name = name
        this.no = Date.now()
        httpDataRequest("login", JSON.stringify({
            username: this.name,
            userno: this.no
        })).then(async () => {
            await wait(20)
            this.wait()
            /**
             * @type {{
             * username: string
             * userno: number
             * }[]}
             */
            const userlist = JSON.parse(await httpDataRequest("userlist", ""))
            console.log(userlist)
            for (let i = 0; i !== userlist.length; i++) {
                this.userList[userlist[i].userno] = userlist[i].username
            }
        })
    }
    name = "null"
    no = 0
    /**
     * @type {{
     * [id: number]: string
     * }}
     */
    userList = {}
    async wait() {
        while (true) {
            const data = JSON.parse(await httpDataRequest("wait", JSON.stringify({
                userno: this.no
            })))
            console.log(data)
            if (data !== null) {
                if (data.status === "message") {
                    const msg = type.message(JSON.stringify(data.content))
                    if (msg) {
                        console.log(this.userList[msg.userno])
                        const chattext = document.getElementById("chattext")
                        const message = document.createElement("div")
                        message.className = "message"
                        const messageuserdata = document.createElement("div")
                        messageuserdata.className = "messageuserdata"
                        messageuserdata.innerText = this.userList[msg.userno] || String(msg.userno)
                        const messagedata = document.createElement("div")
                        messagedata.className = "messagedata"
                        messagedata.innerText = msg.message
                        message.appendChild(messageuserdata)
                        message.appendChild(messagedata)
                        if (chattext) chattext.appendChild(message)
                    }
                } else if (data.status === "userStatusChange") {
                    const userdata = type.userdata(JSON.stringify(data.content))
                    if (userdata) this.userList[userdata.userno] = userdata.username
                }
            }
        }
    }
    /**
     * 
     * @param {string} message 
     */
    send(message) {
        httpDataRequest("send", JSON.stringify({
            message: message,
            userno: this.no
        }))
    }
}

addEventListener("load", async () => {
    const setting = document.getElementById("setting")
    const settingtextbox = assertions.HTMLInputElement(document.getElementById("settingtextbox"))
    const settingbutton = document.getElementById("settingbutton")
    const button = document.getElementById("button")
    const textbox = assertions.HTMLInputElement(document.getElementById("textbox"))
    if (setting && settingtextbox && settingbutton && button && textbox) {
        settingbutton.addEventListener("click", () => {
            setting.style.display = "none"
            const tool = new userChatTool(settingtextbox.value)
            button.addEventListener("click", async () => {
                tool.send(textbox.value)
                textbox.value = ""
            })
        })
    }
})
