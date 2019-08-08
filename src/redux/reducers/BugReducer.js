import { SHOW_BUGS_NUM } from '../actions/BugAction';

const initialState = {
    bugsNum: 0,
}

export default function (state = initialState, action) {
    switch (action.type) {
        case SHOW_BUGS_NUM: {
            return {
                bugsNum: action.payload.num
            }
        }

        default:
            return state;
    }
}