export type GetDatesType =
    | 'EveryWeek'
    | 'NumberedWeekdayOfMonth'
    | 'AlternatingWeeks'
    | 'SpecificDateOfYear'
    | 'SpecificDateOfMonth'
    | 'None'

export interface ParseResult<T extends GetDatesType> {
    type: T
    dates: Date[]
}
