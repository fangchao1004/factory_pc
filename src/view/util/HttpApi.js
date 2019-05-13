import Axios from 'axios';

// const Testuri1 = 'http://192.168.0.106:3009/' ///宿舍无线网络
const Testuri3 = 'http://192.168.3.119:3009/'///zg609&服务器数据库
const Testuri = Testuri3;
class HttpApi {
    /**
     * 上传的模版
     * @param {*} params 
     * @param {*} f1 
     * @param {*} f2 
     */
    static uploadSample(params, f1, f2) {
        Axios.post(Testuri + 'insert_sample', params).then(res => {
            if (f1) { f1(res) }
        }).catch(res => {
            if (f2) { f2(res) }
        })
    }
    /**
     * 获取设备表
     * @param {*} params 
     * @param {*} f1 
     * @param {*} f2 
     */
    static getDeviceInfo(params, f1, f2) {
        Axios.post(Testuri + 'find_device', params).then(res => {
            if (f1) { f1(res) }
        }).catch(res => {
            if (f2) { f2(res) }
        })
    }
    /**
     * 获取NFC表
     * @param {*} params 
     * @param {*} f1 
     * @param {*} f2 
     */
    static getNFCInfo(params, f1, f2) {
        Axios.post(Testuri + 'find_nfc', params).then(res => {
            if (f1) { f1(res) }
        }).catch(res => {
            if (f2) { f2(res) }
        })
    }
     /**
     * 获取Area表
     * @param {*} params 
     * @param {*} f1 
     * @param {*} f2 
     */
    static getAreainfo(params, f1, f2) {
        Axios.post(Testuri + 'find_area', params).then(res => {
            if (f1) { f1(res) }
        }).catch(res => {
            if (f2) { f2(res) }
        })
    }

    /**
     * 获取设备类型表
     * @param {*} params 
     * @param {*} f1 
     * @param {*} f2 
     */
    static getDeviceTypeInfo(params, f1, f2) {
        Axios.post(Testuri + 'find_device_type', params).then(res => {
            if (f1) { f1(res) }
        }).catch(res => {
            if (f2) { f2(res) }
        })
    }

    
}

export default HttpApi;