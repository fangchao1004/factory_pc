export const SHOW_BUG_NUM = 'SHOW_BUG_NUM' ///展示有bug的数量

export function showBugNum(num) {
    return {
        type: SHOW_BUG_NUM,
        payload: { num }
    }
}