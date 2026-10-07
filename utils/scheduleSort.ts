import moment from 'moment'

// Every job title an employee holds, falling back to the older single title on
// employee_detail for lists that don't load job_titles yet.
export function employeeJobTitles(employee: any): string {
    const titles = (employee?.job_titles ?? []).map((jobTitle: any) => jobTitle?.title).filter(Boolean)
    if (titles.length) return titles.join(', ')
    return employee?.employee_detail?.job?.title ?? ''
}

// The day whose "who starts first" order applies to a view showing start..end.
// choice: undefined follows the company default, null means the user turned it
// off, a YYYY-MM-DD string is the day picked with that day's sort icon (a picked
// day outside the view, after paging to another week, falls back to the default).
// With the company default set to first shift, today is used when visible, else
// the first day.
export function resolveFirstShiftDate(choice: string | null | undefined, start: any, end: any, company: any): string | null {
    const from = moment(start).startOf('day')
    const to = moment(end).endOf('day')

    if (typeof choice === 'string' && moment(choice).isBetween(from, to, undefined, '[]')) {
        return choice
    }
    if (choice === null || company?.duty_schedule_default_sort !== 'first_shift') {
        return null
    }

    const today = moment()
    return (today.isBetween(from, to, undefined, '[]') ? today : from).format('YYYY-MM-DD')
}
