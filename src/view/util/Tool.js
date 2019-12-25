import React from "react";
import { Icon } from 'antd'
import HttpApi from './HttpApi'
import moment from 'moment';

/**
 * Tool 工具类 
 * 将可以重复利用的函数，或是代码量很大的函数进行封装
 * 方便调用 - 整洁项目
 */

/**
 *省略文本长度
 * @param {*} text
 * @param {*} targetlength
 * @returns
 */
export function omitTextLength(text, targetlength) {
    let result = ''
    if (text.length > targetlength) {
        result = text.substring(0, targetlength) + '...'
    } else {
        result = text
    }
    return result
}

/**
 *将数据库查询的 数据进行 三层结构转换
 *123级
 * 三级的节点都可以被选择 (默认三级都可选)
 * 只有在添加 巡检点时 只能选择第三级
 * 在添加缺陷时，三级区域范围都可以被选择
 * @export
 * @param {*} area123result
 * @param {boolean} [all3=true]
 * @returns
 */
export function transfromDataTo3level(area123result, all3 = true) {
    let tempObj = {};
    area123result.forEach((item) => {
        if (tempObj[item.area2_id]) { /// 如果它已经有了某个二级属性
            if (item.area3_id)
                tempObj[item.area2_id].children.push({ value: item.area1_id + '-' + item.area2_id + '-' + item.area3_id, title: item.area3_name, key: item.area1_id + '-' + item.area2_id + '-' + item.area3_id })
        } else {
            if (item.area3_id) { /// 有三级
                tempObj[item.area2_id] = {
                    title: item.area2_name,
                    value: item.area1_id + '-' + item.area2_id,
                    key: item.area1_id + '-' + item.area2_id,
                    selectable: all3,
                    children: [{ value: item.area1_id + '-' + item.area2_id + '-' + item.area3_id, title: item.area3_name, key: item.area1_id + '-' + item.area2_id + '-' + item.area3_id }]
                }
            }
            else if (!item.area3_id && item.area2_id) { /// 没有三级
                tempObj[item.area2_id] = {
                    title: item.area2_name,
                    value: item.area1_id + '-' + item.area2_id,
                    key: item.area1_id + '-' + item.area2_id,
                    selectable: all3,
                    children: []
                };
            }
        }
    })
    let jsonList = [];
    for (let key in tempObj) {
        jsonList.push(tempObj[key]);
    }
    /// jsonList 到此步 二三级已经形成了 所需的数据结构 继续解析 一级区域数据
    let rootObj = {}
    area123result.forEach((item) => {
        rootObj[item.area1_id] = {
            title: item.area1_name,
            value: item.area1_id + '',
            key: item.area1_id + '',
            selectable: all3,
            children: []
        }
    })
    let rootList = [];
    for (let key in rootObj) {
        rootList.push(rootObj[key]);
    }
    rootList.forEach((area1item) => {
        jsonList.forEach((area2item) => {
            if (area1item.value === area2item.value.split('-')[0] + '') {
                area1item.children.push(area2item)
            }
        })
    })
    return rootList;
}

/**
 *将数据库查询的 数据进行 二层结构转换
 *12级
 * @export
 * @param {*} area12result
 * @returns
 */
export function transfromDataTo2level(area12result) {
    let tempObj = {};
    area12result.forEach((item) => {
        if (tempObj[item.area1_id]) { /// 如果它已经有了某个一级属性
            if (item.area2_id)
                tempObj[item.area1_id].children.push({ value: item.area1_id + '-' + item.area2_id, title: item.area2_name, key: item.area1_id + '-' + item.area2_id })
        } else {
            if (item.area2_id) { /// 有二级
                tempObj[item.area1_id] = {
                    title: item.area1_name,
                    value: item.area1_id + '',
                    key: item.area1_id + '',
                    selectable: false,
                    children: [{ value: item.area1_id + '-' + item.area2_id, title: item.area2_name, key: item.area1_id + '-' + item.area2_id }]
                }
            } else { /// 没有二级
                tempObj[item.area1_id] = {
                    title: item.area1_name,
                    value: item.area1_id + '',
                    key: item.area1_id + '',
                    selectable: false,
                    children: []
                };
            }
        }
    })
    let jsonList = [];
    for (let key in tempObj) {
        jsonList.push(tempObj[key]);
    }
    return jsonList;
}

/**
 * 将三级区间结构数+巡检点信息之间进行绑定
 * 形成了4级结构
 * @export
 * @param {*} level3List
 * @param {*} devicesList
 * @returns
 */
export function combinAreaAndDevice(level3List, devicesList) {
    level3List.forEach((area1Item) => {
        area1Item.status2_count = 0;
        if (area1Item.children.length > 0) {
            let area2ItemList = area1Item.children;
            area2ItemList.forEach((area2Item) => {
                area2Item.status2_count = 0;
                if (area2Item.children.length > 0) {
                    let area3ItemList = area2Item.children;
                    area3ItemList.forEach((area3Item) => {
                        area3Item.children = []
                        area3Item.status2_count = 0;
                        devicesList.forEach((deviceItem) => {
                            if (area3Item.value.split('-')[2] === deviceItem.area_id + '') {
                                if (deviceItem.status === 2) {
                                    area3Item.status2_count = area3Item.status2_count + 1;
                                    area2Item.status2_count = area2Item.status2_count + 1;
                                    area1Item.status2_count = area1Item.status2_count + 1;
                                }
                                area3Item.children.push({
                                    key: deviceItem.id + '',
                                    value: deviceItem.id + '',
                                    title: omitTextLength(deviceItem.name, 25),
                                    type_id: deviceItem.type_id,
                                    status: deviceItem.status,
                                    area_id: deviceItem.area_id,
                                })
                            }
                        })
                    })
                }
            })
        }
    })
    return level3List
}

/**
 *将多级数据+巡检点信息 形成的新的4级结构数据
 *渲染成对应的 4级树节点
 <span style={{marginLeft:5,color:'red'}}>{area1Item.status2_count||null}</span>
 <Badge style={{ marginLeft: 5 }} count={area2Item.status2_count} />
 * @export
 * @param {*} dataList
 * @param {*} TargetNode
 * @returns
 */
export function renderTreeNodeListByData(dataList, TargetNode) {
    let nodeList = dataList.map((area1Item, index) => {
        return <TargetNode title={<span>{omitTextLength(area1Item.title, 25)}<span style={{ marginLeft: 5, color: 'red' }}>{area1Item.status2_count || null}</span></span>} key={area1Item.key} value={area1Item.value} selectable={false} icon={<span><Icon type="environment" />
        </span>}>
            {area1Item.children.length > 0 ?
                area1Item.children.map(area2Item => {
                    return <TargetNode title={<span>{omitTextLength(area2Item.title, 25)}<span style={{ marginLeft: 5, color: 'red' }}>{area2Item.status2_count || null}</span></span>} key={area2Item.key} value={area2Item.value} selectable={false} icon={<Icon type="environment" />}>
                        {area2Item.children.length > 0 ?
                            area2Item.children.map(area3Item => {
                                return <TargetNode title={<span>{omitTextLength(area3Item.title, 25)}<span style={{ marginLeft: 5, color: 'red' }}>{area3Item.status2_count || null}</span></span>} key={area3Item.key} value={area3Item.value} selectable={false} icon={<Icon type="environment" />}>
                                    {renderDevice(area3Item, TargetNode)}
                                </TargetNode>
                            })
                            : null}
                    </TargetNode>
                })
                : null}
        </TargetNode>
    })
    return nodeList
}

function renderDevice(area3Item, TargetNode) {
    return area3Item.children.length > 0 ?
        area3Item.children.map(deviceItem => {
            let color = '#33CC66' /// 绿色 正常
            if (deviceItem.status === 2) {
                color = '#FF0000' /// 红色 故障
            } else if (deviceItem.status === 3) {
                color = '#AAAAAA' /// 灰色 待检
            }
            // console.log('status2_count:', status2_count, 'status3_count:', status3_count)
            // console.log('deviceItem:', deviceItem)
            return <TargetNode {...deviceItem} icon={<Icon type="laptop" style={{ color }} />} ></TargetNode>
        })
        : null
}

/**
 *将recordlist的数据结构--转换成-采集数据的数组
 *
 * @export
 * @param {*} recordList
 * @returns
 */
export function transfromDataToCollectionList(recordList) {
    let tempObj = {};
    recordList.forEach((recordItem) => {
        let oneRecordContentJson = JSON.parse(recordItem.content);
        oneRecordContentJson.forEach((item) => { /// item 每一项 每一题
            if (item.type_id === '10' || item.type_id === '11' || item.type_id === '2') {
                // console.log('tempObj[item.key]:', tempObj[item.key]);
                let value = item.type_id === '11' ? (item.value / 1000) + '' : item.value
                if (tempObj[item.key]) {
                    tempObj[item.key].list.unshift(value);
                } else {
                    tempObj[item.key] = {
                        list: [value],
                        name: item.title_name
                    };
                }
            }
        })
    })
    let tempList = [];
    for (let key in tempObj) {
        let oneItem = tempObj[key];
        // console.log(oneItem);
        oneItem.list.forEach((value, index) => {
            tempList.push({
                index: '第' + (index + 1) + '次',
                collectionValue: parseFloat(value),
                itemName: oneItem.name
            });
        })
    }
    return tempList;
}


export function transfromDataToRunerAndGroupLeader(runnerList) {
    // console.log('runnerList:', runnerList);
    let groupLeaderList = [];///队长组
    let normalList = [];///普通运行人员组
    runnerList.forEach((item) => {
        if (item.isGroupLeader === 1) groupLeaderList.push(item);
        else normalList.push(item);
    })
    // console.log('groupLeaderList:', groupLeaderList);
    // console.log('normalList:', normalList);
    let treeData = [];
    treeData = [{
        title: '值长',
        value: '1',
        key: '1',
        children: groupLeaderList.map((item, key) => {
            return {
                title: item.name,
                value: item.id,
                key: '1-' + key,
            }
        })
    }, {
        title: '运行人员',
        value: '2',
        key: '2',
        children: normalList.map((item, key) => {
            return {
                title: item.name,
                value: item.id,
                key: '2-' + key,
            }
        })
    }]
    return treeData;
}

///
export async function getAllowTime() {
    ///首先获取最新的 allow_time 表。因为要根据它来，指定分组的sql语句
    return new Promise((resolve, reject) => {
        let sql = `select id,begin,end,name,isCross from allow_time where effective = 1`
        HttpApi.obs({ sql }, (res) => {
            if (res.data.code === 0) {
                // console.log('res:', res.data.data)
                res.data.data.map((item) => {
                    // if (item.isCross) { allowTimeList.unshift(item) }
                    item.begin = moment().format('YYYY-MM-DD ') + item.begin
                    if (item.isCross) {
                        item.date = 1;
                        item.end = moment().add('day', 1).format('YYYY-MM-DD ') + item.end
                    } else {
                        item.date = 0;
                        item.end = moment().format('YYYY-MM-DD ') + item.end
                    }
                    return item;
                })
                res.data.data.forEach((item) => {
                    if (item.isCross) {
                        let item_copy = JSON.parse(JSON.stringify(item));
                        // item_copy.id = -1; ///赋值一个不存在的id值 -1
                        item_copy.date = -1;/// 昨天
                        item_copy.begin = moment(item.begin).add('day', -1).format('YYYY-MM-DD HH:mm:ss')
                        item_copy.end = moment(item.end).add('day', -1).format('YYYY-MM-DD HH:mm:ss')
                        res.data.data.unshift(item_copy)
                    }
                })
                resolve(res.data.data)
            } else {
                resolve([])
            }
        })
    })
}

/**
 * 根据某个时间段去数据库查询-当前时间区间的巡检统计情况
 */
export async function findCountInfoByTime(oneTime) {
    // console.log('oneTime:', oneTime)
    let sql = `select a_t.id,a_t.begin,a_t.end,a_t.name,count(distinct a_m_d.device_id) actu_count,temp_table.need_count, group_concat(distinct user_name) users_name,group_concat(actully_device_List.device_status) status_arr from allow_time a_t
    left join (select * from allowTime_map_device where effective = 1) a_m_d on a_t.id = a_m_d.allow_time_id
    inner join (select distinct device_id,user_name,device_status from records 
                left join (select users.id,users.name as user_name from users where effective = 1) users 
                on users.id = records.user_id  
                where checkedAt>'${oneTime.begin}' and checkedAt<'${oneTime.end}' and effective = 1) actully_device_List 
    on actully_device_List.device_id = a_m_d.device_id
    left join (select a_t.id,count(distinct a_m_d.device_id) need_count from allow_time a_t
    left join (select * from allowTime_map_device where effective = 1) a_m_d on a_t.id = a_m_d.allow_time_id
    where a_t.id = ${oneTime.id} and a_t.effective = 1
    group by a_t.id) temp_table on temp_table.id = a_t.id
    where a_t.id = ${oneTime.id} and a_t.effective = 1
    group by a_t.id`
    // console.log('sql:', sql)
    return new Promise((resolve, reject) => {
        let result = [];
        HttpApi.obs({ sql }, (res) => {
            if (res.data.code === 0) {
                let copy = JSON.parse(JSON.stringify(res.data.data))
                if (copy[0])
                    copy[0].date = oneTime.date;
                result = copy
            }
            resolve(result);
        })
    })
}