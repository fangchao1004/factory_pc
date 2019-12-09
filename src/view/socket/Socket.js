import { Testuri } from '../util/HttpApi'
import io from 'socket.io-client';
var EventEmitter = require('events').EventEmitter;
export const emitter = new EventEmitter();
var webSocket;
export default props => {
    webSocket = io.connect(Testuri);
    webSocket.on('toClient', (res) => {
        emitter.emit('toClient', res);
    });
}
export function send(data) {
    webSocket.emit('toServer', data)
}
