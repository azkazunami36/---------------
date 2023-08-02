function replaces(string: string, num: number, replaceStr: string) {
    const start = string.slice(0, num)
    const end = string.slice(num + replaceStr.length, string.length)
    return start + replaceStr + end
}
console.log(replaces("にゃぱいじゃん！", 2, "あんこ"))