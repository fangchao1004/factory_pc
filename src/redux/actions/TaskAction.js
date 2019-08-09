export const SHOW_TASK_NUM = 'SHOW_TASK_NUM' ///展示task的数量

export function showTaskNum(num) {
    return {
        type: SHOW_TASK_NUM,
        payload: { num }
    }
}