import { SHOW_BUG_NUM } from '../actions/BugAction';

const initialState = {
    bugNum: 0,
}

export default function (state = initialState, action) {
    switch (action.type) {
        case SHOW_BUG_NUM: {
            return {
                bugNum: action.payload.num
            }
        }

        default:
            return state;
    }
}