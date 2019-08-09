import { combineReducers } from 'redux';
import BugReducer from './BugReducer';
import TaskReducer from './TaskReducer';

///将多个单独的reducer整合成一个对象表单
const allReducers = {
  bug: BugReducer,
  task: TaskReducer,
}
///combineReducers 整合这个对象表单,形成一个根Reducer
const rootReducer = combineReducers(allReducers);

export default rootReducer;