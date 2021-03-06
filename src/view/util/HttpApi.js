import Axios from 'axios'
import moment from 'moment';

export const Testuri = 'http://ixiaomu.cn:3008/'///小木服务器数据库 3008正式 3010测试
const TesturiM = 'http://ixiaomu.cn:3099/'
// export const Testuri = 'http://localhost:3008/' ///本地服务器测试用
// export const Testuri = 'http://localhost:2019/'///本地服务器测试用 socket.io 服务测试
export const environmentIsTest = Testuri === 'http://ixiaomu.cn:3010/' ///是不是测试环境

export const TesturiForss = 'http://ixiaomu.cn:3007/' ///小木服务器数据库 sql server 服务独立地址 消费机
// export const TesturiForss = 'http://localhost:3007/'///本地服务器测试用 sql server 服务独立地址 消费机
// export const TesturiForss = 'http://192.168.3.171:3007/'///本地服务器测试用 sql server 服务独立地址 消费机

export const TesturiForcar = 'http://ixiaomu.cn:3006/' ///小木服务器数据库 mysql server 服务独立地址 车辆信息
// export const TesturiForcar = 'http://localhost:3006/'///本地服务器测试用

export const TesturiForks = 'http://ixiaomu.cn:3005/' ///小木服务器数据库 mysql server 服务独立地址 考勤信息
export const TesturiForAccess = 'http://60.174.196.158:3004/' ///60服务器数据库 mysql server 服务独立地址 门禁信息
class HttpApi {
    static verify(params) {
        return Axios.post(Testuri + 'verify', params)
    }
    static listPCLoginLog(params) {
        return Axios.post(Testuri + 'listPCLoginLog', params)
    }
    /**
     * obs操作---慎用
     * @param {*} params
     * @param {*} f1
     * @param {*} f2
     */
    static obs(params, f1, f2) {
        if (f1) {
            return Axios.post(Testuri + 'obs', params)
                .then(res => {
                    if (f1) {
                        f1(res)
                    }
                })
                .catch(res => {
                    if (f2) {
                        f2(res)
                    }
                })
        } else {
            return Axios.post(Testuri + 'obs', params)
        }
    }

    /**
     * obs操作---慎用  操作 sql server 消费机
     * @param {*} params
     * @param {*} f1
     * @param {*} f2
     */
    static obsForss(params, f1, f2) {
        Axios.post(TesturiForss + 'obs', params)
            .then(res => {
                if (f1) {
                    f1(res)
                }
            })
            .catch(res => {
                if (f2) {
                    f2(res)
                }
            })
    }

    /**
     * obs操作---慎用  操作 mysql 车辆
     * @param {*} params
     * @param {*} f1
     * @param {*} f2
     */
    static obsForcar(params, f1, f2) {
        Axios.post(TesturiForcar + 'obs', params)
            .then(res => {
                if (f1) {
                    f1(res)
                }
            })
            .catch(res => {
                if (f2) {
                    f2(res)
                }
            })
    }

    /**
     * obs操作---慎用  操作 mysql 考勤
     * @param {*} params
     * @param {*} f1
     * @param {*} f2
     */
    static obsForks(params, f1, f2) {
        Axios.post(TesturiForks + 'obs', params)
            .then(res => {
                if (f1) {
                    f1(res)
                }
            })
            .catch(res => {
                if (f2) {
                    f2(res)
                }
            })
    }

    /**
    * obs操作---慎用  操作 mysql 门禁
    * @param {*} params
    */
    static obsForAccess(params) {
        return Axios.post(TesturiForAccess + 'obs', params)
    }
    /**
     * 获取今天巡检点的巡检情况。(只要今天在的record记录中，出现了某些人
     * ，就认为他是巡检人员。就把他所对应的所有的巡检点记录都查询出来。
     * 例如：巡检人员 甲 ，乙
     * 所有巡检点 A，B
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
        Axios.post(Testuri + 'getEveryUserRecordToday', params)
            .then(res => {
                if (f1) {
                    f1(res)
                }
            })
            .catch(res => {
                if (f2) {
                    f2(res)
                }
            })
    }
    /**
     * 上传的模版
     * @param {*} params
     * @param {*} f1
     * @param {*} f2
     */
    static uploadSample(params, f1, f2) {
        Axios.post(Testuri + 'insert_sample', params)
            .then(res => {
                if (f1) {
                    f1(res)
                }
            })
            .catch(res => {
                if (f2) {
                    f2(res)
                }
            })
    }
    static getSampleInfo(params, f1, f2) {
        Axios.post(Testuri + 'find_sample', params)
            .then(res => {
                if (f1) {
                    f1(res)
                }
            })
            .catch(res => {
                if (f2) {
                    f2(res)
                }
            })
    }
    static updateSampleInfo(params, f1, f2) {
        Axios.post(Testuri + 'update_sample', params)
            .then(res => {
                if (f1) {
                    f1(res)
                }
            })
            .catch(res => {
                if (f2) {
                    f2(res)
                }
            })
    }
    static removeSampleInfo(params, f1, f2) {
        Axios.post(Testuri + 'remove_sample', params)
            .then(res => {
                if (f1) {
                    f1(res)
                }
            })
            .catch(res => {
                if (f2) {
                    f2(res)
                }
            })
    }
    static getDeviceInfo(params, f1, f2) {
        Axios.post(Testuri + 'find_device', params)
            .then(res => {
                if (f1) {
                    f1(res)
                }
            })
            .catch(res => {
                if (f2) {
                    f2(res)
                }
            })
    }
    static addDeviceInfo(params, f1, f2) {
        Axios.post(Testuri + 'insert_device', params)
            .then(res => {
                if (f1) {
                    f1(res)
                }
            })
            .catch(res => {
                if (f2) {
                    f2(res)
                }
            })
    }
    static removeDeviceInfo(params, f1, f2) {
        Axios.post(Testuri + 'remove_device', params)
            .then(res => {
                if (f1) {
                    f1(res)
                }
            })
            .catch(res => {
                if (f2) {
                    f2(res)
                }
            })
    }
    static getNFCInfo(params, f1, f2) {
        Axios.post(Testuri + 'find_nfc', params)
            .then(res => {
                if (f1) {
                    f1(res)
                }
            })
            .catch(res => {
                if (f2) {
                    f2(res)
                }
            })
    }
    static getAreainfo(params, f1, f2) {
        Axios.post(Testuri + 'find_area', params)
            .then(res => {
                if (f1) {
                    f1(res)
                }
            })
            .catch(res => {
                if (f2) {
                    f2(res)
                }
            })
    }
    static addDeviceTypeInfo(params, f1, f2) {
        Axios.post(Testuri + 'insert_device_type', params)
            .then(res => {
                if (f1) {
                    f1(res)
                }
            })
            .catch(res => {
                if (f2) {
                    f2(res)
                }
            })
    }
    static getDeviceTypeInfo(params, f1, f2) {
        Axios.post(Testuri + 'find_device_type', params)
            .then(res => {
                if (f1) {
                    f1(res)
                }
            })
            .catch(res => {
                if (f2) {
                    f2(res)
                }
            })
    }
    static removeDeviceTypeInfo(params, f1, f2) {
        Axios.post(Testuri + 'remove_device_type', params)
            .then(res => {
                if (f1) {
                    f1(res)
                }
            })
            .catch(res => {
                if (f2) {
                    f2(res)
                }
            })
    }
    static updateDeviceTypeInfo(params, f1, f2) {
        Axios.post(Testuri + 'update_device_type', params)
            .then(res => {
                if (f1) {
                    f1(res)
                }
            })
            .catch(res => {
                if (f2) {
                    f2(res)
                }
            })
    }
    static updateDeviceInfo(params, f1, f2) {
        Axios.post(Testuri + 'update_device', params)
            .then(res => {
                if (f1) {
                    f1(res)
                }
            })
            .catch(res => {
                if (f2) {
                    f2(res)
                }
            })
    }
    static addDeviceAreaInfo(params, f1, f2) {
        Axios.post(Testuri + 'insert_area', params)
            .then(res => {
                if (f1) {
                    f1(res)
                }
            })
            .catch(res => {
                if (f2) {
                    f2(res)
                }
            })
    }
    static getDeviceAreaInfo(params, f1, f2) {
        Axios.post(Testuri + 'find_area', params)
            .then(res => {
                if (f1) {
                    f1(res)
                }
            })
            .catch(res => {
                if (f2) {
                    f2(res)
                }
            })
    }
    static removeDeviceAreaInfo(params, f1, f2) {
        Axios.post(Testuri + 'remove_area', params)
            .then(res => {
                if (f1) {
                    f1(res)
                }
            })
            .catch(res => {
                if (f2) {
                    f2(res)
                }
            })
    }
    static updateDeviceAreaInfo(params, f1, f2) {
        Axios.post(Testuri + 'update_area', params)
            .then(res => {
                if (f1) {
                    f1(res)
                }
            })
            .catch(res => {
                if (f2) {
                    f2(res)
                }
            })
    }
    static getRecordInfo(params, f1, f2) {
        Axios.post(Testuri + 'find_record', params)
            .then(res => {
                if (f1) {
                    f1(res)
                }
            })
            .catch(res => {
                if (f2) {
                    f2(res)
                }
            })
    }
    static insertRecordInfo(params, f1, f2) {
        Axios.post(Testuri + 'insert_record', params)
            .then(res => {
                if (f1) {
                    f1(res)
                }
            })
            .catch(res => {
                if (f2) {
                    f2(res)
                }
            })
    }
    static getUserInfo(params, f1, f2) {
        if (f1) {
            return Axios.post(Testuri + 'find_user', params)
                .then(res => {
                    if (f1) {
                        f1(res)
                    }
                })
                .catch(res => {
                    if (f2) {
                        f2(res)
                    }
                })
        } else {
            return Axios.post(Testuri + 'find_user', params)
        }
    }
    static addUserInfo(params, f1, f2) {
        Axios.post(Testuri + 'insert_user', params)
            .then(res => {
                if (f1) {
                    f1(res)
                }
            })
            .catch(res => {
                if (f2) {
                    f2(res)
                }
            })
    }
    static removeUserInfo(params, f1, f2) {
        Axios.post(Testuri + 'remove_user', params)
            .then(res => {
                if (f1) {
                    f1(res)
                }
            })
            .catch(res => {
                if (f2) {
                    f2(res)
                }
            })
    }
    static updateUserInfo(params, f1, f2) {
        if (f1) {
            return Axios.post(Testuri + 'update_user', params)
                .then(res => {
                    if (f1) {
                        f1(res)
                    }
                })
                .catch(res => {
                    if (f2) {
                        f2(res)
                    }
                })
        } else {
            return Axios.post(Testuri + 'update_user', params)
        }
    }
    static addUserLevel(params, f1, f2) {
        Axios.post(Testuri + 'insert_level', params)
            .then(res => {
                if (f1) {
                    f1(res)
                }
            })
            .catch(res => {
                if (f2) {
                    f2(res)
                }
            })
    }
    static getUserLevel(params, f1, f2) {
        if (f1) {
            Axios.post(Testuri + 'find_level', params)
                .then(res => {
                    if (f1) {
                        f1(res)
                    }
                })
                .catch(res => {
                    if (f2) {
                        f2(res)
                    }
                })
        } else {
            return Axios.post(Testuri + 'find_level')
        }
    }
    static removeUserLevel(params, f1, f2) {
        Axios.post(Testuri + 'remove_level', params)
            .then(res => {
                if (f1) {
                    f1(res)
                }
            })
            .catch(res => {
                if (f2) {
                    f2(res)
                }
            })
    }
    static updateUserLevel(params, f1, f2) {
        Axios.post(Testuri + 'update_level', params)
            .then(res => {
                if (f1) {
                    f1(res)
                }
            })
            .catch(res => {
                if (f2) {
                    f2(res)
                }
            })
    }
    static addUserMajor(params, f1, f2) {
        Axios.post(Testuri + 'insert_major', params)
            .then(res => {
                if (f1) {
                    f1(res)
                }
            })
            .catch(res => {
                if (f2) {
                    f2(res)
                }
            })
    }
    static getUserMajor(params, f1, f2) {
        Axios.post(Testuri + 'find_major', params)
            .then(res => {
                if (f1) {
                    f1(res)
                }
            })
            .catch(res => {
                if (f2) {
                    f2(res)
                }
            })
    }
    static removeUserMajor(params, f1, f2) {
        Axios.post(Testuri + 'remove_major', params)
            .then(res => {
                if (f1) {
                    f1(res)
                }
            })
            .catch(res => {
                if (f2) {
                    f2(res)
                }
            })
    }
    static updateUserMajor(params, f1, f2) {
        Axios.post(Testuri + 'update_major', params)
            .then(res => {
                if (f1) {
                    f1(res)
                }
            })
            .catch(res => {
                if (f2) {
                    f2(res)
                }
            })
    }
    static addTaskInfo(params, f1, f2) {
        Axios.post(Testuri + 'insert_task', params)
            .then(res => {
                if (f1) {
                    f1(res)
                }
            })
            .catch(res => {
                if (f2) {
                    f2(res)
                }
            })
    }
    static getTaskInfo(params, f1, f2) {
        if (f1) {
            return Axios.post(Testuri + 'find_task', params)
                .then(res => {
                    if (f1) {
                        f1(res)
                    }
                })
                .catch(res => {
                    if (f2) {
                        f2(res)
                    }
                })
        } else {
            return Axios.post(Testuri + 'find_task', params)
        }
    }
    static updateTaskInfo(params, f1, f2) {
        if (f1) {
            return Axios.post(Testuri + 'update_task', params)
                .then(res => {
                    if (f1) {
                        f1(res)
                    }
                })
                .catch(res => {
                    if (f2) {
                        f2(res)
                    }
                })
        } else {
            return Axios.post(Testuri + 'update_task', params)
        }
    }
    static sendMessageToStaffs(params, f1, f2) {
        Axios.post(Testuri + 'sendMessageToStaffs', params)
            .then(res => {
                if (f1) {
                    f1(res)
                }
            })
            .catch(res => {
                if (f2) {
                    f2(res)
                }
            })
    }
    /**
     * 独立的短信督促提醒，手动点击触发
     */
    static sendMessageToNoticeNew(params, f1, f2) {
        Axios.post(Testuri + 'sendMessageToNoticeNew', params)
            .then(res => {
                if (f1) {
                    f1(res)
                }
            })
            .catch(res => {
                if (f2) {
                    f2(res)
                }
            })
    }
    static pushnotice(params, f1, f2) {
        Axios.post(Testuri + 'push_notice', params)
            .then(res => {
                if (f1) {
                    f1(res)
                }
            })
            .catch(res => {
                if (f2) {
                    f2(res)
                }
            })
    }
    static sendMessageToLeader(params, f1, f2) {
        Axios.post(Testuri + 'sendMessageToLeader', params)
            .then(res => {
                if (f1) {
                    f1(res)
                }
            })
            .catch(res => {
                if (f2) {
                    f2(res)
                }
            })
    }
    static getBugInfo(params, f1, f2) {
        Axios.post(Testuri + 'find_bug', params)
            .then(res => {
                if (f1) {
                    f1(res)
                }
            })
            .catch(res => {
                if (f2) {
                    f2(res)
                }
            })
    }
    static updateBugInfo(params, f1, f2) {
        Axios.post(Testuri + 'update_bug', params)
            .then(res => {
                if (f1) {
                    f1(res)
                }
            })
            .catch(res => {
                if (f2) {
                    f2(res)
                }
            })
    }
    static addBugInfo(params, f1, f2) {
        Axios.post(Testuri + 'insert_bug', params)
            .then(res => {
                if (f1) {
                    f1(res)
                }
            })
            .catch(res => {
                if (f2) {
                    f2(res)
                }
            })
    }
    static addBugLevel(params, f1, f2) {
        Axios.post(Testuri + 'insert_bug_level', params)
            .then(res => {
                if (f1) {
                    f1(res)
                }
            })
            .catch(res => {
                if (f2) {
                    f2(res)
                }
            })
    }
    static getBugLevel(params, f1, f2) {
        if (f1) {
            return Axios.post(Testuri + 'find_bug_level', params)
                .then(res => {
                    if (f1) {
                        f1(res)
                    }
                })
                .catch(res => {
                    if (f2) {
                        f2(res)
                    }
                })
        } else {
            return Axios.post(Testuri + 'find_bug_level', params)
        }
    }
    static removeBugLevel(params, f1, f2) {
        Axios.post(Testuri + 'remove_bug_level', params)
            .then(res => {
                if (f1) {
                    f1(res)
                }
            })
            .catch(res => {
                if (f2) {
                    f2(res)
                }
            })
    }
    static updateBugLevel(params, f1, f2) {
        Axios.post(Testuri + 'update_bug_level', params)
            .then(res => {
                if (f1) {
                    f1(res)
                }
            })
            .catch(res => {
                if (f2) {
                    f2(res)
                }
            })
    }
    /**
     * 操作sql server 部分接口
     * *******************************************************
     * *******************************************************
     */
    static getAllTransactionInfo(params, f1, f2) {
        Axios.post(TesturiForss + 'getAllTransactionInfo', params)
            .then(res => {
                if (f1) {
                    f1(res)
                }
            })
            .catch(res => {
                if (f2) {
                    f2(res)
                }
            })
    }
    static getSomeOneTransactionInfo(params, f1, f2) {
        Axios.post(TesturiForss + 'getSomeOneTransactionInfo', params)
            .then(res => {
                if (f1) {
                    f1(res)
                }
            })
            .catch(res => {
                if (f2) {
                    f2(res)
                }
            })
    }

    /**
     * 获取一二三级 区域数据
     * 需要后续数据结构的转换 才能成为树形结构
     */
    static getArea123Info(area0_id) {
        return new Promise((resolve, reject) => {
            let sql = `select area_1.order_key,area_1.id as area1_id , area_1.name as area1_name, area_2.id as area2_id ,area_2.name as area2_name,area_3.id as area3_id,area_3.name as area3_name from area_1
            left join (select * from area_2 where effective = 1)area_2 on area_1.id = area_2.area1_id
            left join (select * from area_3 where effective = 1)area_3 on area_2.id = area_3.area2_id
            where area_1.effective = 1 and area_1.area0_id = ${area0_id}
            order by area_1.order_key,area_1.id`
            HttpApi.obs({ sql }, res => {
                let result = []
                if (res.data.code === 0) {
                    result = res.data.data
                }
                resolve(result)
            })
        })
    }

    /**
     * 获取一个巡检点的所有record
     * @param {*} device_id
     */
    static getOneDeviceAllRecords(device_id) {
        return new Promise((resolve, reject) => {
            let one_year_ago = moment().add(-1, 'year').startOf('day').format('YYYY-MM-DD HH:mm:ss')
            let current = moment().format('YYYY-MM-DD HH:mm:ss')
            let sql = `select rds.*,us.name as user_name,des.name as device_name,dts.name as device_type_name from records rds 
        left join (select * from users where effective = 1) us on us.id = rds.user_id
        left join (select * from devices where effective = 1) des on des.id = rds.device_id 
        left join (select * from device_types where effective = 1) dts on dts.id = rds.device_type_id 
        where device_id = "${device_id}" and rds.effective = 1 and rds.createdAt >= '${one_year_ago}' and rds.createdAt <= '${current}' order by rds.id desc
        `
            let result = []
            HttpApi.obs({ sql }, res => {
                if (res.data.code === 0) {
                    result = res.data.data
                }
                resolve(result)
            })
        })
    }

    static getSampleWithSchemeInfo(params, f1, f2) {
        Axios.post(Testuri + 'getSampleWithSchemeInfo', params)
            .then(res => {
                if (f1) {
                    f1(res)
                }
            })
            .catch(res => {
                if (f2) {
                    f2(res)
                }
            })
    }

    static getArea0123Info() {
        return new Promise((resolve, reject) => {
            let sql = `select area_0.id as area0_id , area_0.name as area0_name, area_1.id as area1_id , area_1.name as area1_name, area_2.id as area2_id ,area_2.name as area2_name,area_3.id as area3_id,area_3.name as area3_name ,area_1.order_key 
            from area_0
            left join (select * from area_1 where effective = 1)area_1 on area_0.id = area_1.area0_id
            left join (select * from area_2 where effective = 1)area_2 on area_1.id = area_2.area1_id
            left join (select * from area_3 where effective = 1)area_3 on area_2.id = area_3.area2_id
            where area_0.effective = 1
            order by area_0.id,area_1.order_key,area_1.id`
            HttpApi.obs({ sql }, res => {
                let result = []
                if (res.data.code === 0) {
                    result = res.data.data
                }
                resolve(result)
            })
        })
    }

    static getUnreadBugByMajorAndBugStatus(params, f1, f2) {
        let temp = ''
        if (params.major_all) {
            temp = `and bugs.major_id in (${params.major_all})`
        }
        return new Promise((resolve, reject) => {
            let sql = `select bugs.*,users.name as user_name,temp.des as tag_des from bugs
            left join (select * from users where effective = 1) users on users.id = bugs.user_id 
            left join (
                select bug_step_log.bug_id,bug_tag_status.des from bug_step_log 
                left join bug_tag_status on bug_tag_status.id = bug_step_log.tag_id
                where bug_step_log.id in
                (select max(bug_step_log.id)  from bug_step_log
                group by bug_step_log.bug_id)
            ) temp on temp.bug_id = bugs.id
            where bugs.effective = 1 and bugs.status in (${params.status_all}) and bugs.isread = 0 ${temp}
            order by bugs.id desc`
            let result = []
            HttpApi.obs({ sql }, res => {
                if (res.data.code === 0) {
                    result = res.data.data
                }
                resolve(result)
            })
        })
    }

    static getMonitorData = (time_type = 1) => {
        return Axios.post(TesturiM + 'getMonitorData', { time_type })
    }
    static getMonitorLevel = () => {
        let sql = `select * from monitor_level`
        return Axios.post(Testuri + 'obs', { sql })
    }
    static updateMonitorLevel = params => {
        let sql = `update monitor_level set min = ${params.min},max = ${params.max},count = ${params.count} where monitor_level.key = ${params.key}`
        return Axios.post(Testuri + 'obs', { sql })
    }
    static getBugListAboutMe = major_id_all => {
        let sql = `select bugs.*,des.name as device_name,urs.name as user_name,mjs.name as major_name,
        area_1.name as area1_name,area_1.id as area1_id,
        area_2.name as area2_name,area_2.id as area3_id,
        area_3.name as area3_name,area_3.id as area3_id,
        concat_ws('/',area_1.name,area_2.name,area_3.name) as area_name,
        tmp_freeze_table.freeze_id as bug_freeze_id,
        tmp_freeze_table.freeze_des as bug_freeze_des,
        tmp_freeze_table.major_id as bug_step_major_id,
        tmp_freeze_table.tag_id as bug_step_tag_id,
        bsd.duration_time as bsd_duration_time,
        bld.duration_time as bld_duration_time
        from bugs
        left join (select * from bug_level_duration where effective = 1) bld on bld.level_value = bugs.buglevel
        left join (select * from bug_status_duration where effective = 1) bsd on bsd.status = bugs.status
        left join (select * from devices where effective = 1) des on bugs.device_id = des.id
        left join (select * from users where effective = 1) urs on bugs.user_id = urs.id
        left join (select * from majors where effective = 1) mjs on bugs.major_id = mjs.id
        left join (select * from area_3 where effective = 1) area_3 on des.area_id = area_3.id
        left join (select * from area_2 where effective = 1) area_2 on area_3.area2_id = area_2.id
        left join (select * from area_1 where effective = 1) area_1 on area_2.area1_id = area_1.id
        left join (select t2.*,bug_tag_status.des as tag_des,bug_freeze_status.des as freeze_des 
                   from (select bug_id,max(id) as max_id from bug_step_log where effective = 1 group by bug_id) t1
                    left join (select * from bug_step_log where effective = 1) t2 on t2.id = t1.max_id
                    left join (select * from bug_tag_status where effective = 1) bug_tag_status on bug_tag_status.id = t2.tag_id
                    left join (select * from bug_freeze_status where effective = 1) bug_freeze_status on bug_freeze_status.id = t2.freeze_id
                    ) tmp_freeze_table on tmp_freeze_table.bug_id = bugs.id
        where bugs.status != 4 and bugs.major_id in (${major_id_all}) and bugs.effective = 1 order by bugs.id desc`
        return Axios.post(Testuri + 'obs', { sql })
    }
    static getBugStepLogList = bugId => {
        let sql = `select bug_step_log.*,users.name as user_name,bug_tag_status.des as tag_des,majors.name as major_name,bug_freeze_status.des as freeze_des from bug_step_log 
        left join (select * from users where effective = 1) users on users.id = bug_step_log.user_id
        left join (select * from majors where effective = 1) majors on majors.id = bug_step_log.major_id
        left join (select * from bug_tag_status where effective = 1) bug_tag_status on bug_tag_status.id = bug_step_log.tag_id
        left join (select * from bug_freeze_status where effective = 1) bug_freeze_status on bug_freeze_status.id = bug_step_log.freeze_id
        where bug_step_log.effective = 1 and bug_step_log.bug_id = ${bugId}`
        return Axios.post(Testuri + 'obs', { sql })
    }
}

export default HttpApi
