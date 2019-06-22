import Axios from 'axios';

// export const Testuri = 'http://hefeixiaomu.com:3009/'///小木服务器数据库
export const Testuri = 'http://127.0.0.1:3009/'///本地服务器测试用
class HttpApi {
    /**
     * obs操作---慎用
     * @param {*} params 
     * @param {*} f1 
     * @param {*} f2 
     */
    static obs(params, f1, f2) {
        Axios.post(Testuri + 'obs', params).then(res => {
            if (f1) { f1(res) }
        }).catch(res => {
            if (f2) { f2(res) }
        })
    }
    /**
     * 获取今天设备的巡检情况。(只要今天在的record记录中，出现了某些人
     * ，就认为他是巡检人员。就把他所对应的所有的设备记录都查询出来。
     * 例如：巡检人员 甲 ，乙
     * 所有设备 A，B
     * 就有以下情况
     * 甲 A  (1正常/2故障/null未检)  null代表今天没有记录说明未检
     * 甲 B  (1正常/2故障/null未检)  null代表今天没有记录说明未检
     * 乙 A  (1正常/2故障/null未检)  null代表今天没有记录说明未检
     * 乙 B  (1正常/2故障/null未检)  null代表今天没有记录说明未检
     * )
     * @param {*} params 
     * @param {*} f1 
     * @param {*} f2 
     */
    static getEveryUserRecordToday(params, f1, f2) {
        Axios.post(Testuri + 'getEveryUserRecordToday', params).then(res => {
            if (f1) { f1(res) }
        }).catch(res => {
            if (f2) { f2(res) }
        })
    }
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
    static getSampleInfo(params, f1, f2) {
        Axios.post(Testuri + 'find_sample', params).then(res => {
            if (f1) { f1(res) }
        }).catch(res => {
            if (f2) { f2(res) }
        })
    }
    static removeSampleInfo(params, f1, f2) {
        Axios.post(Testuri + 'remove_sample', params).then(res => {
            if (f1) { f1(res) }
        }).catch(res => {
            if (f2) { f2(res) }
        })
    }
    static getDeviceInfo(params, f1, f2) {
        Axios.post(Testuri + 'find_device', params).then(res => {
            if (f1) { f1(res) }
        }).catch(res => {
            if (f2) { f2(res) }
        })
    }
    static addDeviceInfo(params, f1, f2) {
        Axios.post(Testuri + 'insert_device', params).then(res => {
            if (f1) { f1(res) }
        }).catch(res => {
            if (f2) { f2(res) }
        })
    }
    static removeDeviceInfo(params, f1, f2) {
        Axios.post(Testuri + 'remove_device', params).then(res => {
            if (f1) { f1(res) }
        }).catch(res => {
            if (f2) { f2(res) }
        })
    }
    static getNFCInfo(params, f1, f2) {
        Axios.post(Testuri + 'find_nfc', params).then(res => {
            if (f1) { f1(res) }
        }).catch(res => {
            if (f2) { f2(res) }
        })
    }
    static getAreainfo(params, f1, f2) {
        Axios.post(Testuri + 'find_area', params).then(res => {
            if (f1) { f1(res) }
        }).catch(res => {
            if (f2) { f2(res) }
        })
    }
    static addDeviceTypeInfo(params, f1, f2) {
        Axios.post(Testuri + 'insert_device_type', params).then(res => {
            if (f1) { f1(res) }
        }).catch(res => {
            if (f2) { f2(res) }
        })
    }
    static getDeviceTypeInfo(params, f1, f2) {
        Axios.post(Testuri + 'find_device_type', params).then(res => {
            if (f1) { f1(res) }
        }).catch(res => {
            if (f2) { f2(res) }
        })
    }
    static removeDeviceTypeInfo(params, f1, f2) {
        Axios.post(Testuri + 'remove_device_type', params).then(res => {
            if (f1) { f1(res) }
        }).catch(res => {
            if (f2) { f2(res) }
        })
    }
    static updateDeviceTypeInfo(params, f1, f2) {
        Axios.post(Testuri + 'update_device_type', params).then(res => {
            if (f1) { f1(res) }
        }).catch(res => {
            if (f2) { f2(res) }
        })
    }
    static addDeviceAreaInfo(params, f1, f2) {
        Axios.post(Testuri + 'insert_area', params).then(res => {
            if (f1) { f1(res) }
        }).catch(res => {
            if (f2) { f2(res) }
        })
    }
    static getDeviceAreaInfo(params, f1, f2) {
        Axios.post(Testuri + 'find_area', params).then(res => {
            if (f1) { f1(res) }
        }).catch(res => {
            if (f2) { f2(res) }
        })
    }
    static removeDeviceAreaInfo(params, f1, f2) {
        Axios.post(Testuri + 'remove_area', params).then(res => {
            if (f1) { f1(res) }
        }).catch(res => {
            if (f2) { f2(res) }
        })
    }
    static updateDeviceAreaInfo(params, f1, f2) {
        Axios.post(Testuri + 'update_area', params).then(res => {
            if (f1) { f1(res) }
        }).catch(res => {
            if (f2) { f2(res) }
        })
    }
    static getRecordInfo(params, f1, f2) {
        Axios.post(Testuri + 'find_record', params).then(res => {
            if (f1) { f1(res) }
        }).catch(res => {
            if (f2) { f2(res) }
        })
    }
    static getUserInfo(params, f1, f2) {
        Axios.post(Testuri + 'find_user', params).then(res => {
            if (f1) { f1(res) }
        }).catch(res => {
            if (f2) { f2(res) }
        })
    }
    static addUserInfo(params, f1, f2) {
        Axios.post(Testuri + 'insert_user', params).then(res => {
            if (f1) { f1(res) }
        }).catch(res => {
            if (f2) { f2(res) }
        })
    }
    static removeUserInfo(params, f1, f2) {
        Axios.post(Testuri + 'remove_user', params).then(res => {
            if (f1) { f1(res) }
        }).catch(res => {
            if (f2) { f2(res) }
        })
    }
    static updateUserInfo(params, f1, f2) {
        Axios.post(Testuri + 'update_user', params).then(res => {
            if (f1) { f1(res) }
        }).catch(res => {
            if (f2) { f2(res) }
        })
    }
    static addUserLevel(params, f1, f2) {
        Axios.post(Testuri + 'insert_level', params).then(res => {
            if (f1) { f1(res) }
        }).catch(res => {
            if (f2) { f2(res) }
        })
    }
    static getUserLevel(params, f1, f2) {
        Axios.post(Testuri + 'find_level', params).then(res => {
            if (f1) { f1(res) }
        }).catch(res => {
            if (f2) { f2(res) }
        })
    }
    static removeUserLevel(params, f1, f2) {
        Axios.post(Testuri + 'remove_level', params).then(res => {
            if (f1) { f1(res) }
        }).catch(res => {
            if (f2) { f2(res) }
        })
    }
    static updateUserLevel(params, f1, f2) {
        Axios.post(Testuri + 'update_level', params).then(res => {
            if (f1) { f1(res) }
        }).catch(res => {
            if (f2) { f2(res) }
        })
    }
    static addUserMajor(params, f1, f2) {
        Axios.post(Testuri + 'insert_major', params).then(res => {
            if (f1) { f1(res) }
        }).catch(res => {
            if (f2) { f2(res) }
        })
    }
    static getUserMajor(params, f1, f2) {
        Axios.post(Testuri + 'find_major', params).then(res => {
            if (f1) { f1(res) }
        }).catch(res => {
            if (f2) { f2(res) }
        })
    }
    static removeUserMajor(params, f1, f2) {
        Axios.post(Testuri + 'remove_major', params).then(res => {
            if (f1) { f1(res) }
        }).catch(res => {
            if (f2) { f2(res) }
        })
    }
    static updateUserMajor(params, f1, f2) {
        Axios.post(Testuri + 'update_major', params).then(res => {
            if (f1) { f1(res) }
        }).catch(res => {
            if (f2) { f2(res) }
        })
    }
    static addTaskInfo(params, f1, f2) {
        Axios.post(Testuri + 'insert_task', params).then(res => {
            if (f1) { f1(res) }
        }).catch(res => {
            if (f2) { f2(res) }
        })
    }
    static getTaskInfo(params, f1, f2) {
        Axios.post(Testuri + 'find_task', params).then(res => {
            if (f1) { f1(res) }
        }).catch(res => {
            if (f2) { f2(res) }
        })
    }
    static removeTaskInfo(params, f1, f2) {
        Axios.post(Testuri + 'remove_task', params).then(res => {
            if (f1) { f1(res) }
        }).catch(res => {
            if (f2) { f2(res) }
        })
    }
    static updateTaskInfo(params, f1, f2) {
        Axios.post(Testuri + 'update_task', params).then(res => {
            if (f1) { f1(res) }
        }).catch(res => {
            if (f2) { f2(res) }
        })
    }
    static sendMessageToStaffs(params, f1, f2) {
        Axios.post(Testuri + 'sendMessageToStaffs', params).then(res => {
            if (f1) { f1(res) }
        }).catch(res => {
            if (f2) { f2(res) }
        })
    }
    static sendMessageToLeader(params, f1, f2) {
        Axios.post(Testuri + 'sendMessageToLeader', params).then(res => {
            if (f1) { f1(res) }
        }).catch(res => {
            if (f2) { f2(res) }
        })
    }
    static getBugInfo(params, f1, f2) {
        Axios.post(Testuri + 'find_bug', params).then(res => {
            if (f1) { f1(res) }
        }).catch(res => {
            if (f2) { f2(res) }
        })
    }
}

export default HttpApi