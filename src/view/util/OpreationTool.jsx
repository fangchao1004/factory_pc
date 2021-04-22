////////////////////// 维修人员处理

import { message } from "antd";
import HttpApi from "./HttpApi";
import moment from 'moment'

const storage = window.localStorage;
var localUserInfo;
/**
 *消缺流程代码封装
 */
////////////////////// 维修人员处理
export async function exchangeBugMajorByRepair(v, currentRecord, initCallback) {
    localUserInfo = storage.getItem('userinfo');
    let remark = v.remarkText;
    let bug_id = currentRecord.id;
    let user_id = JSON.parse(localUserInfo).id;
    let major_id = v.selectMajorId;
    let sql_1 = `INSERT INTO bug_step_log(bug_id,tag_id,major_id,user_id,remark,createdAt,platform) VALUES(${bug_id},1,${major_id},${user_id},'${remark}','${moment().format('YYYY-MM-DD HH:mm:ss')}',1)`
    let res_1 = await HttpApi.obs({ sql: sql_1 })
    if (res_1.data.code === 0) {
        let sql_2 = `update bugs set isread = 0,status = 6,last_status_time='${moment().format('YYYY-MM-DD HH:mm:ss')}' where id = ${bug_id} `;
        let res_2 = await HttpApi.obs({ sql: sql_2 })
        if (res_2.data.code === 0) {
            message.success('申请转专业成功');
            initCallback();
        } else { message.error('申请转专业失败') }
    } else { message.error('申请转专业失败') }
}
export async function freezeBugStepByRepair(v, currentRecord, initCallback) {
    localUserInfo = storage.getItem('userinfo');
    let remark = v.remarkText;
    let freeze_id = v.selectFreezeId;
    let bug_id = currentRecord.id;
    let user_id = JSON.parse(localUserInfo).id;
    let sql_1 = `INSERT INTO bug_step_log(freeze_id,bug_id,tag_id,user_id,remark,createdAt,platform) VALUES(${freeze_id},${bug_id},2,${user_id},'${remark}','${moment().format('YYYY-MM-DD HH:mm:ss')}',1)`
    let res_1 = await HttpApi.obs({ sql: sql_1 })
    if (res_1.data.code === 0) {
        let sql_2 = `update bugs set isread = 0,status = 7,last_status_time='${moment().format('YYYY-MM-DD HH:mm:ss')}' where id = ${bug_id} `;
        let res_2 = await HttpApi.obs({ sql: sql_2 })
        if (res_2.data.code === 0) {
            message.success('申请挂起成功');
            initCallback();
        } else { message.error('申请挂起失败') }
    } else { message.error('申请挂起失败') }
}
export async function fixCompleteByRepair(v, currentRecord, initCallback) {
    localUserInfo = storage.getItem('userinfo');
    let remark = v.remarkText;
    let bug_id = currentRecord.id;
    let user_id = JSON.parse(localUserInfo).id;
    let sql_1 = `INSERT INTO bug_step_log(bug_id,tag_id,user_id,remark,createdAt,platform) VALUES(${bug_id},4,${user_id},'${remark}','${moment().format('YYYY-MM-DD HH:mm:ss')}',1)`
    let res_1 = await HttpApi.obs({ sql: sql_1 })
    if (res_1.data.code === 0) {
        let sql_2 = `update bugs set isread = 0,status = 2,last_status_time='${moment().format('YYYY-MM-DD HH:mm:ss')}' where id = ${bug_id} `;
        let res_2 = await HttpApi.obs({ sql: sql_2 })
        if (res_2.data.code === 0) {
            message.success('完成维修');
            initCallback();
        } else { message.error('维修失败') }
    } else { message.error('操作失败') }
}
export async function dontNeedfixByRepair(v, currentRecord, initCallback) {
    localUserInfo = storage.getItem('userinfo');
    let remark = v.remarkText;
    let bug_id = currentRecord.id;
    let user_id = JSON.parse(localUserInfo).id;
    let sql_1 = `INSERT INTO bug_step_log (bug_id,tag_id,user_id,remark,createdAt,platform) VALUES (${bug_id},16,${user_id},'${remark}','${moment().format('YYYY-MM-DD HH:mm:ss')}',1)`
    let res_1 = await HttpApi.obs({ sql: sql_1 })
    if (res_1.data.code === 0) {
        let sql_2 = `update bugs set isread = 0,status = 2,last_status_time='${moment().format('YYYY-MM-DD HH:mm:ss')}' where id = ${bug_id}`;
        let res_2 = await HttpApi.obs({ sql: sql_2 })
        if (res_2.data.code === 0) {
            message.success('维修人员认为无需维修');
            initCallback();
        } else { message.error('维修人员认为无需维修操作失败') }
    } else { message.error('维修人员认为无需维修操作失败') }
}
/////////////// 运行处理
export async function completeByRunner(v, currentRecord, initCallback) {
    localUserInfo = storage.getItem('userinfo');
    let remark = v.remarkText;
    let bug_id = currentRecord.id;
    let user_id = JSON.parse(localUserInfo).id;
    let sql_1 = `INSERT INTO bug_step_log(bug_id,tag_id,user_id,remark,createdAt,platform) VALUES(${bug_id},6,${user_id},'${remark}','${moment().format('YYYY-MM-DD HH:mm:ss')}',1)`
    let res_1 = await HttpApi.obs({ sql: sql_1 })
    if (res_1.data.code === 0) {
        let sql_2 = `update bugs set status = 4,last_status_time='${moment().format('YYYY-MM-DD HH:mm:ss')}' where id = ${bug_id} `;
        let res_2 = await HttpApi.obs({ sql: sql_2 })
        if (res_2.data.code === 0) {
            message.success('运行验收操作成功'); initCallback();
            changeRecordData(bug_id);
        } else { message.error('运行验收操作失败') }
    } else { message.error('运行验收操作失败') }
}
export async function goBackEngineerByRunner(v, currentRecord, initCallback) {
    localUserInfo = storage.getItem('userinfo');
    let remark = v.remarkText;
    let bug_id = currentRecord.id;
    let user_id = JSON.parse(localUserInfo).id;
    let sql_1 = `INSERT INTO bug_step_log(bug_id,tag_id,user_id,remark,createdAt,platform) VALUES(${bug_id},8,${user_id},'${remark}','${moment().format('YYYY-MM-DD HH:mm:ss')}',1)`
    let res_1 = await HttpApi.obs({ sql: sql_1 })
    if (res_1.data.code === 0) {
        let sql_2 = `update bugs set isread = 0,status = 2,last_status_time='${moment().format('YYYY-MM-DD HH:mm:ss')}' where id = ${bug_id} `;
        let res_2 = await HttpApi.obs({ sql: sql_2 })
        if (res_2.data.code === 0) { message.success('运行打回操作成功'); initCallback(); } else { message.error('运行打回操作失败') }
    }
}

////////////////////// 专工处理
export async function exchangeBugMajorByEngineer(v, currentRecord, initCallback) {
    localUserInfo = storage.getItem('userinfo');
    let remark = v.remarkText;
    let bug_id = currentRecord.id;
    let user_id = JSON.parse(localUserInfo).id;
    let major_id = v.selectMajorId;
    let sql_1 = `INSERT INTO bug_step_log(bug_id,tag_id,major_id,user_id,remark,createdAt,platform) VALUES(${bug_id},3,${major_id},${user_id},'${remark}','${moment().format('YYYY-MM-DD HH:mm:ss')}',1)`
    let res_1 = await HttpApi.obs({ sql: sql_1 })
    if (res_1.data.code === 0) {
        let sql_2 = `update bugs set isread = 0,major_id = ${major_id},status = 0,last_status_time='${moment().format('YYYY-MM-DD HH:mm:ss')}' where id = ${bug_id} `;
        let res_2 = await HttpApi.obs({ sql: sql_2 })
        if (res_2.data.code === 0) { message.success('转专业成功'); initCallback(); } else { message.error('转专业失败') }
    }
}
export async function freezeBugStepByEngineer(v, currentRecord, initCallback) {
    localUserInfo = storage.getItem('userinfo');
    let remark = v.remarkText;
    let bug_id = currentRecord.id;
    let user_id = JSON.parse(localUserInfo).id;
    let freeze_id = v.selectFreezeId;
    let sql_1 = `INSERT INTO bug_step_log(freeze_id,bug_id,tag_id,user_id,remark,createdAt,platform) VALUES(${freeze_id},${bug_id},15,${user_id},'${remark}','${moment().format('YYYY-MM-DD HH:mm:ss')}',1)`
    let res_1 = await HttpApi.obs({ sql: sql_1 })
    if (res_1.data.code === 0) {
        let sql_2 = `update bugs set isread = 0,status = 5,last_status_time='${moment().format('YYYY-MM-DD HH:mm:ss')}' where id = ${bug_id} `;
        let res_2 = await HttpApi.obs({ sql: sql_2 })
        if (res_2.data.code === 0) { message.success('挂起成功'); initCallback(); } else { message.error('挂起失败') }
    } else { message.error('挂起失败') }
}
export async function goBackStartByEngineer(v, currentRecord, initCallback) {
    localUserInfo = storage.getItem('userinfo');
    let remark = v.remarkText;
    let bug_id = currentRecord.id;
    let user_id = JSON.parse(localUserInfo).id;
    let sql_1 = `INSERT INTO bug_step_log(bug_id,tag_id,user_id,remark,createdAt,platform) VALUES(${bug_id},9,${user_id},'${remark}','${moment().format('YYYY-MM-DD HH:mm:ss')}',1)`
    let res_1 = await HttpApi.obs({ sql: sql_1 })
    if (res_1.data.code === 0) {
        let sql_2 = `update bugs set isread = 0,status = 0,last_status_time='${moment().format('YYYY-MM-DD HH:mm:ss')}' where id = ${bug_id} `;
        let res_2 = await HttpApi.obs({ sql: sql_2 })
        if (res_2.data.code === 0) { message.success('恢复维修流程成功'); initCallback(); } else { message.error('恢复维修流程失败') }
    } else { message.error('恢复维修流程失败') }
}
export async function completeByEngineer(v, currentRecord, initCallback) {
    localUserInfo = storage.getItem('userinfo');
    let remark = v.remarkText;
    let bug_id = currentRecord.id;
    let user_id = JSON.parse(localUserInfo).id;
    let sql_1 = `INSERT INTO bug_step_log(bug_id,tag_id,user_id,remark,createdAt,platform) VALUES(${bug_id},5,${user_id},'${remark}','${moment().format('YYYY-MM-DD HH:mm:ss')}',1)`
    console.log('sql_1:', sql_1)
    let res_1 = await HttpApi.obs({ sql: sql_1 })
    if (res_1.data.code === 0) {
        let sql_2 = `update bugs set isread = 0,status = 3,last_status_time='${moment().format('YYYY-MM-DD HH:mm:ss')}' where id = ${bug_id} `;
        let res_2 = await HttpApi.obs({ sql: sql_2 })
        if (res_2.data.code === 0) { message.success('专工完成验收'); initCallback(); } else { message.error('专工验收操作失败') }
    } else { message.error('专工验收操作失败') }
}
export async function goBackFixByEngineer(v, currentRecord, initCallback) {
    localUserInfo = storage.getItem('userinfo');
    let remark = v.remarkText;
    let bug_id = currentRecord.id;
    let user_id = JSON.parse(localUserInfo).id;
    let sql_1 = `INSERT INTO bug_step_log(bug_id,tag_id,user_id,remark,createdAt,platform) VALUES(${bug_id},7,${user_id},'${remark}','${moment().format('YYYY-MM-DD HH:mm:ss')}',1)`
    let res_1 = await HttpApi.obs({ sql: sql_1 })
    if (res_1.data.code === 0) {
        let sql_2 = `update bugs set isread = 0,status = 1,last_status_time='${moment().format('YYYY-MM-DD HH:mm:ss')}' where id = ${bug_id} `;
        let res_2 = await HttpApi.obs({ sql: sql_2 })
        if (res_2.data.code === 0) { message.success('专工打回操作成功'); initCallback(); } else { message.error('专工打回操作失败') }
    } else { message.error('专工打回操作失败') }
}
export async function passByEngineer(v, currentRecord, initCallback) {
    localUserInfo = storage.getItem('userinfo');
    let remark = v.remarkText;
    let bug_id = currentRecord.id;
    let user_id = JSON.parse(localUserInfo).id;

    let sql_1 = `INSERT INTO bug_step_log (bug_id,tag_id,user_id,remark,createdAt,platform) VALUES (${bug_id},17,${user_id},'${remark}','${moment().format('YYYY-MM-DD HH:mm:ss')}',1)`
    let res_1 = await HttpApi.obs({ sql: sql_1 })
    if (res_1.data.code === 0) {
        let sql_2 = `update bugs set isread = 0,status = 3,last_status_time='${moment().format('YYYY-MM-DD HH:mm:ss')}' where id = ${bug_id}`;
        let res_2 = await HttpApi.obs({ sql: sql_2 })
        if (res_2.data.code === 0) { message.success('专工确认无需维修'); initCallback(); } else { message.error('专工确认无需维修操作失败') }
    } else { message.error('专工确认无需维修操作失败') }
}

////改变包含了这个bug_id 的record 再数据库中的值。 isDelete 是否为 删除缺陷的操作
export async function changeRecordData(bugId, isDelete = false) {
    localUserInfo = storage.getItem('userinfo');
    // console.log('changeRecordData')
    // let bugId = this.state.currentRecord.id;
    ///1，要根据bug_id 去bugs表中去查询该条数据，获取其中的 device_id 字段信息
    let sql_1 = `select bugs.* from bugs where id = ${bugId} and effective = ${isDelete ? 0 : 1}`;
    let res_sql1 = await HttpApi.obs({ sql: sql_1 })
    if (res_sql1.data.code === 0) {
        let oneBugInfo = res_sql1.data.data[0]
        let device_id = oneBugInfo.device_id;
        if (!device_id) { return }
        ///2，根据 device_id 去record 表中 找到 这个巡检点最新的一次record。 获取到后，在本地修改。再最为一条新数据插入到records表中
        let sql2 = ' select * from records rds where effective = 1 and device_id = ' + device_id + ' order by rds.id desc limit 1';
        let res_sql2 = await HttpApi.obs({ sql: sql2 })
        if (res_sql2.data.code === 0) {
            let oneRecordInfo = res_sql2.data.data[0]
            let bug_content = JSON.parse(oneRecordInfo.content);
            ///content 数组。找到其中bug_id 不为null的。把bug_id 和 bugId 相同的给至null,再手动判断是不是bug_id字段都是null了。如果是device_status就要至1（正常）
            let bug_id_count = 0;
            ///先知道 有多少个 bug_id 不为null
            bug_content.forEach((oneSelect) => {
                if (oneSelect.bug_id) {
                    bug_id_count++;
                }
            })
            // console.log('run 这个巡检点还有几个bug:', bug_id_count);
            if (bug_id_count > 0) {
                ///如果找到对应的bug_id。将它至null,说明这个缺陷已经解决了。就不要再出现在record中了。同时bug_id_count减1
                bug_content.forEach((oneSelect) => {
                    if (oneSelect.bug_id === bugId) {
                        oneSelect.bug_id = null;
                        bug_id_count--;
                    }
                })
                // console.log('处理完一个bug后的content为:', bug_content);
                // console.log('run 这个巡检点还有几个bug:', bug_id_count);
                oneRecordInfo.content = JSON.stringify(bug_content);
                if (bug_id_count === 0) {
                    oneRecordInfo.device_status = 1;
                }
            }
            oneRecordInfo.user_id = JSON.parse(localUserInfo).id;///更新record的上传人。
            delete oneRecordInfo.id;
            delete oneRecordInfo.createdAt;
            delete oneRecordInfo.updatedAt;
            oneRecordInfo.is_clean = 1;///标注为 消缺时的record
            // console.log('待入库的最新record:', oneRecordInfo);
            HttpApi.insertRecordInfo(oneRecordInfo, (res) => {
                if (res.data.code === 0) {
                    // console.log('所有 入库成功。');
                    if (oneRecordInfo.device_status === 1) {
                        ///手动更新数据库中，对应巡检点的状态
                        HttpApi.updateDeviceInfo({ query: { id: device_id }, update: { status: 1 } }, (res) => {
                            if (res.data.code === 0) { message.success('对应巡检点最新巡检记录更新-巡检点状态恢复正常'); }
                        })
                    } else {
                        HttpApi.updateDeviceInfo({ query: { id: device_id }, update: { status: 2 } }, (res) => {
                            if (res.data.code === 0) { message.info('对应巡检点最新巡检记录更新'); } ///这么做的目的是只要有record上传，就要更新对应巡检点的updateAt
                        })
                    }
                }
            })
        }
    }
}