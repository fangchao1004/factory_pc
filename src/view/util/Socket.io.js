import io from "socket.io-client"
import moment from 'moment'

var socket = io('ws://localhost:2019/'); //连接地址 这里为本地服务地址

socket.on("from_server", (msg) => {
    switch (msg.type) {
        case 'type1':
            console.log('type1:',msg.data); 
            break;
        default:
            break;
    }
})

/**
 * 封装
 * @param {String} eventName  事件名
 * @param {*} param 参数
 */
export function sendMessToS(param = {}, eventName = 'to_server') {
    socket.emit(eventName, param)
}

export function messageFormat(content = {}, to = 'server') {
    let storage = window.localStorage;
    let localUserInfo = storage.getItem('userinfo');
    let from = localUserInfo ? JSON.parse(localUserInfo).id : ''
    return {
        from,
        to,
        content,
        timestamp: moment().format('YYYY-MM-DD HH:mm:ss')
    }
}

