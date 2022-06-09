import { date } from './date'

describe('AppDate', () => {
    it('should be able to set the corret date for something next year', () => {
        const result = date(28, 1, 2023)

        expect(result.getDate()).toEqual(28)
        expect(result.getMonth()).toEqual(0)
        expect(result.getFullYear()).toEqual(2023)
    })
})
