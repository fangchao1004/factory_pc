export const SHOW_BUGS_NUM = 'SHOW_BUGS_NUM' ///展示有bug的数量

export function showBugsNum(num) {
    return {
        type: SHOW_BUGS_NUM,
        payload: { num }
    }
}