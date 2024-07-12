export function generateRandomNumber(digits) {
    const min = Math.pow(10, digits - 1)
    const max = Math.pow(10, digits) -1
    return Math.floor(Math.random() * (min - max + 1)) + min
}