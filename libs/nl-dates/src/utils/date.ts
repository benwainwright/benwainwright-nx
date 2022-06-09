import { AppDate } from './app-date'

export const date = (day: number, month: number, year: number) => {
    return AppDate.create(day, month, year).toDate()
}
