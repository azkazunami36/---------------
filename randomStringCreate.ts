function replaces(string: string, num: number, replaceStr: string) {
    const start = string.slice(0, num)
    const end = string.slice(num + replaceStr.length, string.length)
    return start + replaceStr + end
}
/**
 * ランダムな英数字の文字列を生成可能です。
 * @param length 文字列の長さを入力します。
 * @param option 様々なオプションをつけることが出来ます。
 */
function randomStringCreate(length: number, option: {
    /**
     * 小文字の英字を含めるかを決めます。
     */
    str?: boolean
    /**
     * 大文字の英字を含めるかを決めます。
     */
    num?: boolean
    /**
     * 数字を含めるかを決めます。
     */
    upstr?: boolean
    /**
     * ランダム文字列に含めたい文字を文字列で入力します。
     */
    originalString?: string
    /**
     * 特定の個所に特定の文字列を置きたい場合に指定でき、複数個所を指定することが出来ます。
     * 場合によっては指定した文字列の長さを超える可能性があります。
     */
    setStr?: {
        /**
         * どこの箇所を置き換えるかを指定します。0からカウントされます。
         */
        setNum: number
        /**
         * 何の文字にするかを指定します。１文字推奨です。
         */
        string: string
    }[]
}) {
    const str = "abcdefghijklmnopqrstuvwxyz"
    const num = "0123456789"
    const upstr = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    let conster = ""
    if (option.str) conster += str
    if (option.num) conster += num
    if (option.upstr) conster += upstr
    if (option.originalString) conster += option.originalString
    if (conster === "") return
    let string = ""
    for (let i = 0; i !== length; i++) string += conster[Math.floor(Math.random() * conster.length)]
    if (option.setStr) for (let i = 0; i !== option.setStr.length; i++) string = replaces(string, option.setStr[i].setNum, option.setStr[i].string)
    return string
}
for (let i = 0; i !== 5; i++) {
    console.log(randomStringCreate(72, {
        str: true,
        num: true,
        upstr: true,
        setStr: [
            {
                setNum: 26,
                string: "."
            },
            {
                setNum: 33,
                string: "."
            }
        ]
    }))
}