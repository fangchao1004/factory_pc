/**
 * rootReducer是多个xxx-reducer的一个集合。
 * 
 * store和reducer之间的关联性就体现在此处。
 * 这就是为什么 store.dispatch({type:'ADD',payload:{A,B,C}})后，
 * xxx-reducer.js文件中的function会被触发，从而对state进行操作
 */
import { createStore } from "redux";
import { composeWithDevTools } from 'redux-devtools-extension';
import RootReducer from '../reducers/RootReducer';

// const store = createStore(rootReducer);

///支持ReduxDevTools，谷歌插件，更方便的查看store变化
const Store = createStore(RootReducer, composeWithDevTools());

export default Store;

/**
 * redux 用法
 * 派发
 * Store.dispatch(showBugsNum(8)) ///类似与派发事件 showBugsNum 是在BugAction中 定义的方法 , 内部参数 自定义 注意个数和顺序
 * 
 * 监听。类初始化时
 * let unsubscribe = Store.subscribe(() => {
 *  console.log("获取store中的state:", store.getState())
 * });
 * 
 * 移除监听 类被销毁时
 * unsubscribe();
 * 
 */