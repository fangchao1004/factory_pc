import { SHOW_TASK_NUM } from '../actions/TaskAction';

const initialState = {
    taskNum: 0,
}

export default function (state = initialState, action) {
    switch (action.type) {
        case SHOW_TASK_NUM: {
            return {
                taskNum: action.payload.num
            }
        }

        default:
            return state;
    }
}