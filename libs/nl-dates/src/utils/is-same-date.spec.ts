import { isSameDate } from './is-same-date'

describe('is same date', () => {
    it('returns true when passed two of the same date', () => {
        const date = new Date()

        const result = isSameDate(date, date)
        expect(result).toBeTruthy()
    })

    it('returns true when passed two identical dates', () => {
        const date = new Date()
        const dateTwo = new Date(date.valueOf())

        const result = isSameDate(date, dateTwo)
        expect(result).toBeTruthy()
    })

    it('returns true when passed different dates with same actual day', () => {
        const date = new Date(1_654_173_390_000)
        const dateTwo = new Date(1_654_163_455_000)

        const result = isSameDate(date, dateTwo)
        expect(result).toBeTruthy()
    })

    it('returns false when passed two completely different dates', () => {
        const date = new Date(1_654_173_390_000)
        const dateTwo = new Date(1_625_133_055_000)

        const result = isSameDate(date, dateTwo)
        expect(result).toBeFalsy()
    })
})
