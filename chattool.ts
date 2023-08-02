import express from "express"
import fs from "fs"
import EventEmitter from "events"

/**
* 拡張子と名前で分割します。
*/
function splitExt(name: string) {
    const splitedName = name.split(".")
    const extension = splitedName[splitedName.length - 1]
    return {
        filename: name.slice(0, -(extension.length + 1)),
        extension: extension
    }
}
/**
 * 待機します。ライブラリでは使用しすぎないでください。IOや高負荷の回避におすすめです。
 * @param time 時間を入力
 */
async function wait(time: number) { await new Promise<void>(resolve => setTimeout(() => resolve(), time)) }
interface message {
    userno: number
    message: string
}
interface wait {
    userno: number
}
/**
 * POSTでwaitの返答をする際に使用します。
 */
interface waitreply {
    /**
     * 返答内容の目次です。
     */
    status: "message" | "userStatusChange"
    /**
     * 必要な場合は内容にメッセージを入れ、返します。
     */
    content?: message | userdata
}
interface userdata {
    username: string
    userno: number
}
const type = {
    message: (data: string) => {
        try {
            const json = JSON.parse(data)
            if (typeof json !== "object") return null
            if (!("userno" in json && "message" in json)) return null
            if (typeof json.userno !== "number" || typeof json.message !== "string") return null
            return json as message
        } catch (e) {
            return null
        }
    },
    wait: (data: string) => {
        try {
            const json = JSON.parse(data)
            if (typeof json !== "object") return null
            if (!("userno" in json)) return null
            if (typeof json.userno !== "number") return null
            return json as wait
        } catch (e) {
            return null
        }
    },
    userdata: (data: string) => {
        try {
            const json = JSON.parse(data)
            if (typeof json !== "object") return null
            if (!("userno" in json && "username" in json)) return null
            if (typeof json.userno !== "number" || typeof json.username !== "string") return null
            return json as userdata
        } catch (e) {
            return null
        }
    }
}

/**
 * これらのイベントが利用できます。
 */
interface chatToolEvents {
    operation: [waitreply]
    error: [Error]
}
/**
 * ChatToolのメイン
 */
declare interface chatTool {
    on<K extends keyof chatToolEvents>(s: K, listener: (...args: chatToolEvents[K]) => any): this
    off<K extends keyof chatToolEvents>(s: K, listener: (...args: chatToolEvents[K]) => any): this
    emit<K extends keyof chatToolEvents>(eventName: K, ...args: chatToolEvents[K]): boolean
}
class chatTool extends EventEmitter {
    constructor() {
        super()
        this.#app = express()
        this.#app.get("*", (req, res) => this.get(req, res))
        this.#app.post("*", (req, res) => this.post(req, res))
        this.#app.listen("81", () => { console.log("準備OK") })
    }
    #app: express.Express
    userList: {
        username: string,
        userno: number
    }[] = []
    async get(req: express.Request, res: express.Response) {
        const url = (req.url === "/") ? "/index.html" : req.url
        if (fs.existsSync("./src" + url)) {
            const contentType = (() => {
                switch (splitExt(url).extension) {
                    case "html": return "text/html"
                    case "css": return "text/css"
                    case "js": return "text/javascript"
                    case "json": return "application/json"
                }
            })()
            res.header("Content-Type", contentType + ";charset=utf-8")
            res.end(fs.readFileSync("./src" + url))
        }
        else {
            res.header(404)
            res.end()
        }
    }
    async post(req: express.Request, res: express.Response) {
        let data = ""
        req.on("data", chunk => data += chunk)
        req.on("end", async () => {
            switch (req.url) {
                case "/wait": {
                    const posteddata = type.wait(data)
                    if (posteddata) {
                        const data = await new Promise<waitreply | null>(resolve => {
                            const e = this
                            function a(data: waitreply) { d(data) }
                            function d(data: waitreply | null) {
                                e.off("operation", a)
                                resolve(data)
                            }
                            e.on("operation", a)
                            wait(1000).then(() => d(null))
                        })
                        res.end(JSON.stringify(data))
                    } else {
                        res.end()
                    }
                    break
                }
                case "/send": {
                    const posteddata = type.message(data)
                    if (posteddata) {
                        this.emit("operation", {
                            status: "message",
                            content: posteddata
                        })
                    }
                    res.end()
                    break
                }
                case "/login": {
                    const posteddata = type.userdata(data)
                    console.log(posteddata)
                    if (posteddata) {
                        this.userList.push(posteddata)
                        this.emit("operation", {
                            status: "userStatusChange",
                            content: posteddata
                        })
                        res.end(JSON.stringify(posteddata))
                    }
                    break
                }
                case "/logout": {
                    const posteddata = type.userdata(data)
                    res.end()
                    break
                }
                case "/userlist": {
                    res.end(JSON.stringify(this.userList))
                }
            }
        })
    }
}

const tool = new chatTool()
