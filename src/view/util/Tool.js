import React from "react";
import { Icon, message } from 'antd'
import HttpApi from './HttpApi'
import moment from 'moment';
import { BROWERTYPE, NOTICEMUSICOPEN, MAXBUGIDMY, MAXTASKIDMY, OLDRUNBUGIDLIST, BUGIDLIST } from "./AppData";
var storage = window.localStorage;
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
    if (!text) { return text }
    let result = ''
    if (text.length > targetlength) {
        result = text.substring(0, targetlength) + '...'
    } else {
        result = text
    }
    return result
}

/**
 * 转换一维数组为树形数组
 * @param  {Array} keys  树形结构的参照key
 * @param  {Array} data  数据
 * @param  {Number} selectLevel  可选层级
 * @return {String} pValue    转换后的数组
 * @api    private
 */
export function translate(keys, data, selectLevel = null, pValue = '') {
    // console.log('pValue:', pValue)
    let [key, ...nextKeys] = keys
    let hasNextKey = nextKeys && nextKeys.length
    let map = {}
    data.forEach(item => {
        let k = item[key] ///k 为 areaX_id的值 key 为 areaX_id字段
        if (k && !map[k]) {
            // 获取源数组中所有命中的`item`认为这些`item`为子项
            let childList = data.filter(item => item[key] === k).map(item => delete item[key] && item)
            let value = pValue ? pValue + '-' + String(k) : String(k);
            let selectable = false;
            // console.log('啊哈哈', value.split('-').length)
            if (selectLevel && selectLevel <= value.split('-').length) { selectable = true }
            else if (!selectLevel) { selectable = true; }
            map[k] = {
                title: item[String(key).substring(0, key.length - 2) + 'name'],
                order_key: item.order_key,
                value,
                key: value,
                selectable,
                children: hasNextKey ? translate(nextKeys, childList, selectLevel, value) : []  // 如果还有用来分组的key，继续执行，否则返回数组
            }
        }
    })
    return Object.values(map)
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
            order_key: item.order_key, ///新增order_key
            title: item.area1_name,
            value: item.area1_id + '',
            key: item.area1_id + '',
            selectable: all3,
            children: [],
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
 * 递归---不需要统计故障状态
 */
export function combinAreaAndDeviceTest(LevelList, deviceList, targetLevel = 2, levelCount = 1) {
    LevelList.forEach((levelItem) => {
        if (levelItem && levelItem.children) {
            let nextLevelList = levelItem.children;
            if (levelCount < targetLevel && nextLevelList) { combinAreaAndDeviceTest(nextLevelList, deviceList, targetLevel, levelCount + 1) }
            else if (levelCount === targetLevel && nextLevelList) {
                nextLevelList.forEach((nextlevelItem) => {
                    nextlevelItem.status2_count = 0;
                    nextlevelItem.children = []
                    deviceList.forEach((deviceItem) => {
                        if (nextlevelItem.value.split('-')[2] === String(deviceItem.area_id)) {
                            nextlevelItem.children.push({
                                key: String(deviceItem.id),
                                value: String(deviceItem.id),
                                title: omitTextLength(deviceItem.name, 25),
                                type_id: deviceItem.type_id,
                                status: deviceItem.status,
                                area_id: deviceItem.area_id,
                            })
                        }
                    })
                })
            }
        }
    })
    return LevelList;
}

/**
 * 将三级区间结构数+巡检点信息之间进行绑定
 * 形成了4级结构
 * 因为要统计每一层的status2_count 所以无法用递归算法
 * @export
 * @param {*} level3List
 * @param {*} devicesList
 * @returns
 */
export function combinAreaAndDevice(level4List, devicesList) {
    level4List.forEach((area0Item) => {
        area0Item.status2_count = 0;
        if (area0Item && area0Item.children.length > 0) {
            let area1ItemList = area0Item.children;
            area1ItemList.forEach((area1Item) => {
                area1Item.status2_count = 0;
                if (area1Item && area1Item.children.length > 0) {
                    let area2ItemList = area1Item.children;
                    area2ItemList.forEach((area2Item) => {
                        area2Item.status2_count = 0;
                        if (area2Item && area2Item.children.length > 0) {
                            let area3ItemList = area2Item.children;
                            area3ItemList.forEach((area3Item) => {
                                area3Item.children = []
                                area3Item.status2_count = 0;
                                devicesList.forEach((deviceItem) => {
                                    if (area3Item.value.split('-')[3] === deviceItem.area_id + '') {
                                        if (deviceItem.status === 2) {
                                            area3Item.status2_count = area3Item.status2_count + 1;
                                            area2Item.status2_count = area2Item.status2_count + 1;
                                            area1Item.status2_count = area1Item.status2_count + 1;
                                            area0Item.status2_count = area0Item.status2_count + 1;
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
        }
    })
    return level4List
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
    let nodeList = dataList.map((area0Item) => {
        return <TargetNode title={<span>{omitTextLength(area0Item.title, 25)}<span style={{ marginLeft: 5, color: 'red' }}>{area0Item.status2_count || null}</span></span>} key={area0Item.key} value={area0Item.value} selectable={false} icon={<span><Icon type="environment" /></span>}>
            {area0Item.children.length > 0 ?
                area0Item.children.map(area1Item => {
                    return <TargetNode title={<span>{omitTextLength(area1Item.title, 25)}<span style={{ marginLeft: 5, color: 'red' }}>{area1Item.status2_count || null}</span></span>} key={area1Item.key} value={area1Item.value} selectable={false} icon={<span><Icon type="environment" /></span>}>
                        {area1Item.children.length > 0 ?
                            area1Item.children.map(area2Item => {
                                return <TargetNode title={<span>{omitTextLength(area2Item.title, 25)}<span style={{ marginLeft: 5, color: 'red' }}>{area2Item.status2_count || null}</span></span>} key={area2Item.key} value={area2Item.value} selectable={false} icon={<Icon type="environment" />}>
                                    {area2Item.children.length > 0 ?
                                        area2Item.children.map(area3Item => {
                                            return <TargetNode title={<span>{omitTextLength(area3Item.title, 25)}<span style={{ marginLeft: 5, color: 'red' }}>{area3Item.status2_count || null}</span></span>} key={area3Item.key} value={area3Item.value} selectable={false} icon={<Icon type="environment" />}>
                                                {renderDevice(area3Item, TargetNode)}
                                            </TargetNode>
                                        }) : null}
                                </TargetNode>
                            }) : null}
                    </TargetNode>
                }) : null}
        </TargetNode>
    })
    return nodeList
}
/**
 * 递归---不渲染 缺陷数量
 */
export function renderTreeNodeListByDataTest(dataList, TargetNode, targetLevel = 3, levelCount = 1) {
    let nodeList = dataList.map((listItem) => {
        return <TargetNode title={omitTextLength(listItem.title, 25)} key={listItem.key} value={listItem.value} selectable={false} icon={<span><Icon type="environment" /></span>}>
            {targetLevel > levelCount ?
                (listItem.children && listItem.children.length > 0 ? renderTreeNodeListByDataTest(listItem.children, TargetNode, targetLevel, levelCount + 1) : null)
                :
                (listItem.children && listItem.children.length > 0 ? renderDevice(listItem, TargetNode) : null)}
        </TargetNode>
    })
    return nodeList
}

function renderDevice(area3Item, TargetNode) {
    // console.log('area3Item:', area3Item)
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
export async function getAllowTime(area0_id = 1) {
    ///首先获取最新的 allow_time 表。因为要根据它来，指定分组的sql语句
    return new Promise((resolve, reject) => {
        let sql = `select id,begin,end,name,isCross,area0_id from allow_time where effective = 1 and area0_id = ${area0_id}`
        HttpApi.obs({ sql }, (res) => {
            if (res.data.code === 0) {
                let tempList = [];
                let finallyResult = [];
                tempList = res.data.data.map((item) => {
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
                tempList.forEach((item) => {
                    // console.log('item:', item)
                    finallyResult.push(item);
                    if (item.isCross) {
                        let item_copy = JSON.parse(JSON.stringify(item));
                        item_copy.date = -1;/// 昨天
                        item_copy.begin = moment(item.begin).add('day', -1).format('YYYY-MM-DD HH:mm:ss')
                        item_copy.end = moment(item.end).add('day', -1).format('YYYY-MM-DD HH:mm:ss')
                        finallyResult.unshift(item_copy)
                    }
                })
                resolve(finallyResult)
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
    let sql = `select a_t.id,a_t.begin,a_t.end,a_t.name,group_concat(distinct a_m_d.device_id) actu_concat,count(distinct a_m_d.device_id) actu_count,temp_table.need_devices, group_concat(distinct user_name) users_name,group_concat(actully_device_List.device_status) status_arr from allow_time a_t
    left join (select * from allowTime_map_device where effective = 1) a_m_d on a_t.id = a_m_d.allow_time_id
    inner join (select distinct device_id,user_name,device_status from records 
                left join (select users.id,users.name as user_name from users where effective = 1) users 
                on users.id = records.user_id  
                where checkedAt>'${oneTime.begin}' and checkedAt<'${oneTime.end}' and effective = 1 and (is_clean = 0 || is_clean is NULL)) actully_device_List 
    on actully_device_List.device_id = a_m_d.device_id
    left join (select a_t.id,group_concat(distinct a_m_d.device_id) need_devices from allow_time a_t
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
/**
 * 查询，今天有那几个人上传过缺陷。获取他们的id
 */
export async function getCheckManIdToday() {
    let beginOfToday = moment().startOf('day').format('YYYY-MM-DD HH:mm:ss');
    let endOfToday = moment().endOf('day').format('YYYY-MM-DD HH:mm:ss');
    let sql = `select distinct bugs.user_id from bugs where effective = 1 and createdAt>'${beginOfToday}' and createdAt<'${endOfToday}'`
    return new Promise((resolve, reject) => {
        let result = [];
        HttpApi.obs({ sql }, (res) => {
            if (res.data.code === 0) {
                result = res.data.data
            }
            resolve(result);
        })
    })
}
/**
 * 获取某个人，今天上传的缺陷信息的 统计信息
 */
export async function getSomeOneBugsCountToday(oneId) {
    let beginOfToday = moment().startOf('day').format('YYYY-MM-DD HH:mm:ss');
    let endOfToday = moment().endOf('day').format('YYYY-MM-DD HH:mm:ss');
    let sql = `select users.id as user_id,users.name as user_name,major_id,majors.name as major_name,count(major_id) as major_count from bugs
    left join (select * from users where effective = 1) users  on users.id = bugs.user_id
    left join (select * from majors where effective = 1) majors on majors.id = bugs.major_id
    where bugs.createdAt>'${beginOfToday}' and bugs.createdAt<'${endOfToday}' and bugs.effective = 1 and bugs.user_id = ${oneId}
    group by bugs.major_id`
    return new Promise((resolve, reject) => {
        let result = [];
        HttpApi.obs({ sql }, (res) => {
            if (res.data.code === 0) {
                result = res.data.data
            }
            resolve(result);
        })
    })
}
/**
 * 判断今日距离某一天的天数是不是奇数
 * 距离2019年1月1日 00:00:00的天数
 * 
 * @param {Date} paramDate 传入参数 date类型
 * @returns {Boolean} isOdd 是不是奇数天
 */
export function getTodayIsOdd(paramDate = moment().startOf('day').toDate()) {
    let originDate = new Date(2019, 0, 1, 0, 0, 0, 0)
    let duringDate = (paramDate.getTime() - originDate.getTime()) / (24 * 1000 * 3600);
    let isOdd = duringDate % 2 === 1; ///奇数天
    // console.log('天数：', duringDate)
    return isOdd;
}
/**
 * 截去括号里面的内容(或（
 */
export function substringBrackets(originStr) {
    let tempStr = originStr;
    let index1 = originStr.length;
    let index2 = originStr.length;
    let index = 0;
    if (originStr.indexOf('（') !== -1) {
        index1 = originStr.indexOf('（')
    }
    if (originStr.indexOf('(') !== -1) {
        index2 = originStr.indexOf('(');
    }
    if (index1 < index2 && index1 > 0) {
        index = index1
    }
    else if (index2 < index1 && index2 > 0) {
        index = index2
    }
    if (index > 0) {
        tempStr = originStr.substring(0, index)
    }
    return tempStr;
}
/**
 * 获取时间区间
 * 毫秒--->天时分
 */
export function getDuration(my_time, resultType = 1, showSecond = true) {
    let days = my_time / (1000 * 60 * 60 * 24);
    let daysRound = Math.floor(days);
    let hours = my_time / 1000 / 60 / 60 - (24 * daysRound);
    let hoursRound = Math.floor(hours);
    let minutes = my_time / 1000 / 60 - (24 * 60 * daysRound) - (60 * hoursRound);
    let minutesRound = Math.floor(minutes);
    let seconds = my_time / 1000 - (24 * 60 * 60 * daysRound) - (60 * 60 * hoursRound) - (60 * minutesRound);
    // console.log('转换时间:', daysRound + '天', hoursRound + '时', minutesRound + '分', seconds + '秒');
    // console.log('seconds:', parseInt(seconds))
    let tempS = showSecond ? parseInt(seconds) + '秒' : ''
    let tempM = minutesRound > 0 ? minutesRound + '分钟' : ''
    let time = '/';
    if (daysRound > 0) {
        // time = daysRound + '天' + hoursRound + '小时' + minutesRound + '分钟'
        time = (24 * daysRound + hoursRound) + '小时' + minutesRound + '分钟' + tempS
    } else if (hoursRound > 0) {
        time = hoursRound + '小时' + tempM + tempS
    } else if (hoursRound === 0 && minutesRound > 0) {
        time = tempM + tempS
    } else if (minutesRound === 0 && seconds > 0) {
        time = tempS
    }
    if (resultType === 1) {
        return time;
    } else {
        return { daysRound, hoursRound, minutesRound, seconds }
    }
}
/**
 *
 *最新bug 通知 提示音
 * @export
 * @param {*} [auto=null] audo对象
 * @param {boolean} [playMusic=false] 是否播放提示音
 * @param {number} maxBug 最新缺陷id
 * @param {string} localStorageIndex 要存储的localstorage的key
 * @param {string} [noticeLab='有最新缺陷,请注意查看!'] message 文本
 */
export function notifyMusicForNewBug(auto = null) {
    if (!auto) { return }
    if (storage.getItem(BROWERTYPE) !== 'Safari') {
        auto.play();
    }
}
/**
 *等待运行处理的缺陷列表中有新的出现
 * @export
 * @param {*} [auto=null] audo对象
 * @param {boolean} [playMusic=false] 是否播放提示音
 * @param {number[]} newlist 缺陷的id数组
 * @param {string} localStorageIndex 要存储的localstorage的key
 * @param {string} [noticeLab='有新缺陷等待运行验收,请注意查看!'] message 文本
 */
export function noticeForRunCheckList(auto = null, playMusic = false, newlist, localStorageIndex, noticeLab = '有新缺陷等待运行验收,请注意查看!') {
    if (!auto || newlist.length === 0) { return }
    newlist = newlist.map((item) => item.id)
    // console.log('缓存中的数组:', storage.getItem(localStorageIndex))
    // console.log('newlist:', JSON.stringify(newlist))
    if (!storage.getItem(localStorageIndex) || !playMusic) { storage[localStorageIndex] = JSON.stringify(newlist) }///记录下此次的 缺陷的id数组
    if (storage.getItem(localStorageIndex)) {
        let oldlist = JSON.parse(storage.getItem(localStorageIndex));
        let newExist = checkNewListIsMoreThanOldList(newlist, oldlist);
        if (newExist) { ///说明有最新的id存在于新的数组中。
            console.log('说明有最新的id不存在于老的数组中');
            if (storage.getItem(BROWERTYPE) !== 'Safari' && playMusic) {
                message.info(noticeLab, 5);
                auto.play();
                storage[localStorageIndex] = JSON.stringify(newlist)
            }
        }
    }
}
export function checkNewListIsMoreThanOldList(newlist, oldlist) {
    let newExist = false; ///说明有最新的id存在于新的数组中。
    if (newlist && oldlist) {
        newlist.forEach((newid) => {
            if (oldlist.indexOf(newid) === -1) {
                newExist = true
            }
        })
    }
    return newExist;
}

export function checkBugTaskDataIsNew(data) {
    const { maxTaskId, myMaxBugId, RunBugIdList } = data;
    // console.log('maxTaskId:', maxTaskId, 'myMaxBugId:', myMaxBugId, 'RunBugIdList:', RunBugIdList)
    let result = [{ title: '有相关的新缺陷注意查看', route: 'bugAboutMe', hasNew: false },
    { title: '有待运行验收的新缺陷注意查看', route: 'bugRunCheck', hasNew: false },
    { title: '有新任务注意查看', route: 'task', hasNew: false }]
    let flag = false;
    let count = 0;
    if (!storage.getItem(MAXBUGIDMY) || parseInt(storage.getItem(MAXBUGIDMY)) < myMaxBugId) {
        result[0].hasNew = true;
        flag = true;
        count = count + 1;
    }
    if (!storage.getItem(MAXTASKIDMY) || parseInt(storage.getItem(MAXTASKIDMY)) < maxTaskId) {
        result[2].hasNew = true;
        flag = true
        count = count + 1;
    }
    if (!storage.getItem(OLDRUNBUGIDLIST) || checkNewListIsMoreThanOldList(RunBugIdList, JSON.parse(storage.getItem(OLDRUNBUGIDLIST)))) {
        result[1].hasNew = true;
        flag = true;
        count = count + 1;
    }
    // console.log('{ detail: result, needFresh: flag }:', { detail: result, needFresh: flag })
    return { detail: result, needFresh: flag, count }
}
/**
 *浏览器类型判断
 * @export
 */
export function BrowserType() {
    let userAgent = navigator.userAgent; //取得浏览器的userAgent字符串
    let isOpera = userAgent.indexOf("Opera") > -1; //判断是否Opera浏览器
    let isIE = userAgent.indexOf("compatible") > -1
        && userAgent.indexOf("MSIE") > -1 && !isOpera; //判断是否IE浏览器
    let isEdge = userAgent.indexOf("Edge") > -1; //判断是否IE的Edge浏览器
    let isFF = userAgent.indexOf("Firefox") > -1; //判断是否Firefox浏览器
    let isSafari = userAgent.indexOf("Safari") > -1
        && userAgent.indexOf("Chrome") === -1; //判断是否Safari浏览器
    let isChrome = userAgent.indexOf("Chrome") > -1
        && userAgent.indexOf("Safari") > -1; //判断Chrome浏览器
    let browertype = '';
    if (isIE) {
        let reIE = new RegExp("MSIE (\\d+\\.\\d+);");
        reIE.test(userAgent);
        let fIEVersion = parseFloat(RegExp["$1"]);
        if (fIEVersion === 7) {
            browertype = "IE7";
        } else if (fIEVersion === 8) {
            browertype = "IE8";
        } else if (fIEVersion === 9) {
            browertype = "IE9";
        } else if (fIEVersion === 10) {
            browertype = "IE10";
        } else if (fIEVersion === 11) {
            browertype = "IE11";
        } else {
            browertype = "IE版本过低";
        }//IE版本过低
    }
    if (isOpera) {
        browertype = "Opera";
    }
    if (isEdge) {
        browertype = "Edge";
    }
    if (isFF) {
        browertype = "FF";
    }
    if (isSafari) {
        browertype = "Safari";
        storage[NOTICEMUSICOPEN] = false;
    }
    if (isChrome) {
        browertype = "Chrome";
    }
    storage[BROWERTYPE] = browertype
}
/**
 *根据开始和结束时间，和设备id
 *对record巡检记录进行查询
 * @export
 */
export function getRecordInfoByStartEndTimeAndDevices(record) {
    let sql = `select records.*,users.name as user_name,devices.name as device_name,
    concat_ws('/',area_1.name,area_2.name,area_3.name) as area_name
    from records
    left join (select * from users where effective = 1) users on users.id = records.user_id
    left join (select * from devices where effective = 1) devices on devices.id = records.device_id
    left join (select * from area_3 where effective = 1) area_3 on area_3.id = devices.area_id
    left join (select * from area_2 where effective = 1) area_2 on area_3.area2_id = area_2.id
    left join (select * from area_1 where effective = 1) area_1 on area_2.area1_id = area_1.id
    where checkedAt>'${record.bt}' and checkedAt<'${record.et}' and records.effective = 1
    and device_id in (${record.select_map_device})
    order by records.checkedAt desc
    `;
    return new Promise((resolve, reject) => {
        HttpApi.obs({ sql }, (res) => {
            let result = [];
            if (res.data.code === 0) {
                result = res.data.data
            }
            resolve(result);
        })
    })
}
/**
 *根据设备id
 *获取设备信息
 * @export
 */
export function getDevicesInfoByIdListStr(record) {
    return new Promise((resolve, reject) => {
        let sql = `select devices.*,group_concat(distinct date_value) as date_value_list,group_concat(distinct title) as scheme_title,group_concat(distinct scheme_of_cycleDate.id) as sche_cyc_id,group_concat(distinct scheme_of_cycleDate.cycleDate_id) as cycleDate_id,concat_ws('/',area_1.name,area_2.name,area_3.name) as area_name from devices
        left join (select * from sche_cyc_map_device where effective = 1) sche_cyc_map_device on sche_cyc_map_device.device_id = devices.id
        left join (select * from scheme_of_cycleDate where effective = 1) scheme_of_cycleDate on scheme_of_cycleDate.id = sche_cyc_map_device.scheme_id
        left join (select * from sche_cyc_map_date where effective = 1) sche_cyc_map_date on sche_cyc_map_date.scheme_id = sche_cyc_map_device.scheme_id
        left join (select * from area_3 where effective = 1) area_3 on devices.area_id = area_3.id
        left join (select * from area_2 where effective = 1) area_2 on area_3.area2_id = area_2.id
        left join (select * from area_1 where effective = 1) area_1 on area_2.area1_id = area_1.id
        where devices.effective = 1 and devices.id in (${record.select_map_device})
        group by devices.id`
        let result = []
        HttpApi.obs({ sql }, (res) => {
            if (res.data.code === 0) {
                result = res.data.data;
            }
            resolve(result);
        })
    })
}
/**
 *根据方案筛选设备点
 * @export
 * @param {*} deviceList
 * @param {*} momentTarget
 * @returns
 */
export function filterDevicesByDateScheme(deviceList, momentTarget) {
    let todayDateNum = momentTarget.toDate().getDate();///多少号
    let todayDayNum = momentTarget.toDate().getDay() === 0 ? 7 : momentTarget.toDate().getDay();///周几
    // console.log('todayDateNum:', todayDateNum, 'todayDayNum:', todayDayNum)
    let resultList = [];
    if (deviceList) {
        deviceList.forEach((item) => {
            if (item.date_value_list && item.sche_cyc_id && item.cycleDate_id) {
                if ((String(item.cycleDate_id) === "1" && item.date_value_list.split(',').indexOf(String(todayDayNum)) !== -1)
                    || (String(item.cycleDate_id) === "2" && item.date_value_list.split(',').indexOf(String(todayDateNum)) !== -1)) { ///当
                    resultList.push(item);
                }
            } else {
                resultList.push(item);
            }
        })
    }
    return resultList;
}
export function checkOverTime(record, currentTime) {
    let durationTime;
    let isOver = false
    if (record.status === 0) {
        isOver = false
        let temp1 = currentTime - moment(record.createdAt).toDate().getTime();
        durationTime = temp1 > 0 ? temp1 : 0
    } else if (record.status !== 0 && record.last_status_time) {
        let temp2 = currentTime - moment(record.last_status_time).toDate().getTime();
        durationTime = temp2 > 0 ? temp2 : 0
    }
    if (record.status < 2) { ///如果缺陷的状态处在2之前，即专工处理之前，那么就根据缺陷的等级来判断时间区间大小
        if (record.bld_duration_time && durationTime > record.bld_duration_time) { isOver = true }
    } else {
        if (record.bsd_duration_time && durationTime > record.bsd_duration_time) { isOver = true }
    }
    return { isOver, durationTime };
}

export function checkLocalStorageBugIdList(lastBugList, auto = null) {
    let isSafari = storage.getItem(BROWERTYPE) === 'Safari';
    // console.log('isSafari:', isSafari)
    if (lastBugList.length === 0) { return }
    let lastBugIdList = lastBugList.map((item) => item.id)
    // console.log('最新缺陷id数组：', lastBugIdList)
    // console.log('缓存缺陷id数组：', JSON.parse(storage.getItem(BUGIDLIST)))
    if (storage.getItem(BUGIDLIST)) {///如果缓存中有缺陷id数组存在 判断最新的缺陷id数组中，是否有id不存在于缓存中
        if (hasNewBugIdExist(lastBugIdList, JSON.parse(storage.getItem(BUGIDLIST)))) {
            ///播放一次提示音，并且将最新的缺陷id数组，替换到缓存中 （当用户点击查看某个缺陷后，要将数组中的对应的缺陷id剔除）
            // console.log('111播放提示音')
            if (!isSafari) {
                if (auto) { auto.play() }
            } else {
                message.warning('因苹果安全政策，Safari浏览器不支持自动播报功能，请使用其他浏览器', 4)
            }
            storage[BUGIDLIST] = JSON.stringify(lastBugIdList);
        } else {
            // console.log('没有新增的缺陷id,不需要播放提示音')
        }
    } else {///如果缓存中为空，那么就确定要播放一次提示音，并且将最新的缺陷id数组，替换到缓存中（当用户点击查看某个缺陷后，要将数组中的对应的缺陷id剔除）
        // console.log('222播放提示音')
        if (!isSafari) {
            if (auto) { auto.play() }
        } else {
            message.warning('因苹果安全政策，Safari浏览器不支持自动播报功能，请使用其他浏览器', 4)
        }
        storage[BUGIDLIST] = JSON.stringify(lastBugIdList);
    }
}
function hasNewBugIdExist(bugidList, targetList) {
    let flag = false;
    bugidList.forEach((bugid) => {
        if (targetList.indexOf(bugid) === -1) { flag = true }
    })
    return flag
}

export function removeOneBugIdFromList(bugid) {
    let originList = JSON.parse(storage.getItem(BUGIDLIST)) || []
    let newList = originList.filter((originId) => {
        return originId !== bugid
    })
    storage[BUGIDLIST] = JSON.stringify(newList);
}
/**
 *计算steplist中的每一步耗时
 *
 * @export
 * @param {*} bugResult
 * @param {*} bugStepResult
 * @returns
 */
export function calcStepSpendTime(bugResult, bugStepResult) {
    bugResult.forEach((bugItem) => {
        bugItem.step_list = [];
        bugStepResult.forEach((stepItem) => {
            if (stepItem.bug_id === bugItem.id) {
                bugItem.step_list.push(stepItem)
            }
        })
    })
    bugResult.forEach((bugItem) => {
        if (bugItem.step_list && bugItem.step_list.length > 0) {
            for (let index = 0; index < bugItem.step_list.length; index++) {
                const stepItem = bugItem.step_list[index];
                if (index === 0) {
                    stepItem.spendTime = moment(stepItem.createdAt).toDate().getTime() - moment(bugItem.checkedAt).toDate().getTime()
                } else {
                    stepItem.spendTime = moment(stepItem.createdAt).toDate().getTime() - moment(bugItem.step_list[index - 1].createdAt).toDate().getTime()
                }
            }
        }
    })
    return bugResult
}
/**
 *根据bug对象中的 step_list 操作日志结合对应的时间区间判断是否超时
 *
 * @export
 * @param {*} bugList
 */
export function calcOverTimeByStepList(bugList) {
    if (bugList.length === 0) { return }
    ///所有缺陷用同一套 专工运行时间区间。选取第一位的时间区间数据。避免不必要的重复循环
    const bsd_duration_list = bugList[0].bsd_duration_list///专工和运行处理时间区间列表 JSON
    var eng_duration_time;///专工的工作时间区间
    var run_duration_time;///运行的工作时间区间
    bsd_duration_list.forEach((item) => {
        if (item.status === 2) { eng_duration_time = item.duration_time }
        else if (item.status === 3) { run_duration_time = item.duration_time }
    })
    for (let i = 0; i < bugList.length; i++) {
        const bugItem = bugList[i];
        bugItem.isOver = false;///整个bug中是否存在过超时的情况
        const rep_duration_time = bugList[0].bld_duration_time;///当前bug的等级下给维修工的维修时间区间 毫秒单位 每个缺陷的等级可能不同，所以对应的维修时间区间也不同。要在循环内部选取
        var stepList = bugItem.step_list
        ///从后往前循环处理
        for (let j = stepList.length - 1; j >= 0; j--) {
            const stepItem = stepList[j];///当前索引所在的对象
            stepItem.isOver = false;
            if (j > 0) {
                const stepItemPre = stepList[j - 1];///前一位对象
                if ((stepItem.tag_id === 6 || stepItem.tag_id === 8) && (stepItemPre.tag_id === 5 || stepItemPre.tag_id === 17)) {
                    ///情况1 运行的处理选择 6验收通过 8验收不通过  此时前一位必然是 专工处理结果为 5通过 或 17确认无需维修  此时的用时 就是 运行的操作用时。要比对 对应的时间区间 判断用没有超时 (如果是其他情况不考虑计算是否超时)
                    stepItem.isOver = stepItem.spendTime > run_duration_time;
                    if (stepItem.isOver) { bugItem.isOver = true }
                } else if ((stepItem.tag_id === 5 || stepItem.tag_id === 7 || stepItem.tag_id === 17) && (stepItemPre.tag_id === 4 || stepItemPre.tag_id === 16)) {
                    /// 情况2 专工处理选择 5验收通过 7验收不通过 17 确认无需处理 此时前一位如果是正常流程的话 应该是 维修的选择 4完成维修 16 认为无需维修 (如果是其他情况不考虑计算是否超时)
                    stepItem.isOver = stepItem.spendTime > eng_duration_time;
                    if (stepItem.isOver) { bugItem.isOver = true }
                } else if (stepItem.tag_id === 15 && stepItemPre.tag_id === 2) {
                    ///情况3 专工 选择 15挂起 此时前一位如果是正常流程的话 应该是 维修的选择 2申请挂起 (如果是其他情况不考虑计算是否超时)
                    stepItem.isOver = stepItem.spendTime > eng_duration_time;
                    if (stepItem.isOver) { bugItem.isOver = true }
                } else if (stepItem.tag_id === 3 && stepItemPre.tag_id === 1) {
                    ///情况4 专工 选择 3转专业 此时前一位如果是正常流程的话 应该是 维修的选择 1申请转专业 (如果是其他情况不考虑计算是否超时)
                    stepItem.isOver = stepItem.spendTime > eng_duration_time;
                    if (stepItem.isOver) { bugItem.isOver = true }
                } else if ((stepItem.tag_id === 1 || stepItem.tag_id === 2 || stepItem.tag_id === 4 || stepItem.tag_id === 16) && stepItemPre.tag_id === 10) {
                    ///情况5 维修 选择 1申请转专业 2申请挂起 4完成维修 16认为无需维修 此时前一位如果是正常流程的话 应该是 维修的选择 10开始维修 (如果是其他情况不考虑计算是否超时)
                    stepItem.isOver = stepItem.spendTime > rep_duration_time;
                    if (stepItem.isOver) { bugItem.isOver = true }
                }
            }
        }
        ///////////////////////////
        let extraItem = { isExtra: true, des: null, isOver: false, user_name: null, spendTime: 0 };///补充一位对象,用于表示当前的状态
        if (stepList.length > 0) {
            /// 获取当前缺陷的操作日志列表中的最后一位   与 当前时刻 做对比
            let lastStepItem = stepList[stepList.length - 1];
            let lastItemSpendTimeFormNow = moment().toDate().getTime() - moment(lastStepItem.createdAt).toDate().getTime()
            // console.log('lastItemSpendTimeFormNow:', lastItemSpendTimeFormNow)
            ///根据 lastItem 的tag_id 判断这个操作是哪个职位的操作。再判断它是否超时
            if (lastStepItem.tag_id === 10 || lastStepItem.tag_id === 7) {///最后一位是开始维修或专工验收不通过  则缺陷属于维修中的状态。属于维修工
                extraItem.isOver = lastItemSpendTimeFormNow > rep_duration_time;
                if (extraItem.isOver) { bugItem.isOver = true; extraItem.des = "维修工作"; extraItem.user_name = lastStepItem.user_name; extraItem.spendTime = lastItemSpendTimeFormNow }
            } else if (lastStepItem.tag_id === 1 || lastStepItem.tag_id === 2 || lastStepItem.tag_id === 4 || lastStepItem.tag_id === 16 || lastStepItem.tag_id === 8) {///维修已经作出操作，或者 运行验收不通过 接下来就是专工的工作了
                extraItem.isOver = lastItemSpendTimeFormNow > eng_duration_time;
                if (extraItem.isOver) { bugItem.isOver = true; extraItem.des = "等待专工处理"; extraItem.spendTime = lastItemSpendTimeFormNow }
            } else if (lastStepItem.tag_id === 5 || lastStepItem.tag_id === 17) {///专工已经作出操作，接下来就是运行的工作了
                extraItem.isOver = lastItemSpendTimeFormNow > run_duration_time;
                if (extraItem.isOver) { bugItem.isOver = true; extraItem.des = "等待运行处理"; extraItem.spendTime = lastItemSpendTimeFormNow }
            }
            stepList.push(extraItem);///在处理日志列表上最后再push一个对象表示当前的超时情况
        }
    }
    return bugList
}

export function pickUpActuConcatDeviceList(actu_concat = [], afterFilter = []) {
    let result = [];
    for (let index = 0; index < actu_concat.length; index++) {
        const actu_device_id = actu_concat[index];
        for (let index = 0; index < afterFilter.length; index++) {
            const afterFilter_device = afterFilter[index];
            if (parseInt(afterFilter_device.id) === parseInt(actu_device_id)) {
                result.push(afterFilter_device);
            }
        }
    }
    return result
}

export function getNoCheckDevices(actu_device, devices) {
    let result = [];
    let actu_device_id = actu_device.map((item) => parseInt(item.id))
    for (let index = 0; index < devices.length; index++) {
        const device = devices[index];
        if (device.id && actu_device_id.indexOf(device.id) === -1) { result.push(device) }
    }
    return result;
}
/**
 * 适用与包含厂区的情况
 * @param {*} result 
 */
export function sortByOrderKey(result) {
    let copyResult = JSON.parse(JSON.stringify(result))
    copyResult.forEach((item) => {
        item.children.sort((x, y) => {
            return x.order_key - y.order_key
        })
    })
    return copyResult
}

/**
 * 适用与1级及以下
 * @param {*} result 
 */
export function sortByOrderKey2(result) {
    let copyResult = JSON.parse(JSON.stringify(result))
    copyResult.sort((x, y) => {
        return x.order_key - y.order_key
    })
    return copyResult
}
/**
 *合并两个数组，去重复
 * @export
 * @param {*} list1
 * @param {*} list2
 * @returns
 */
export function combin2BugList(list1_p, list2_p) {
    let list1 = JSON.parse(JSON.stringify(list1_p))
    let list2 = JSON.parse(JSON.stringify(list2_p))
    list1.forEach((item1) => {
        let isExist = false;
        list2.forEach((item2) => {
            if (item1.id === item2.id) { isExist = true }
        })
        if (!isExist) {
            list2.push(item1)
        }
    })
    return list2
}
export function sortById_desc(list_params) {
    let list = JSON.parse(JSON.stringify(list_params))
    if (list.length === 0) { return [] }
    list.sort((x, y) => {
        return y.id - x.id
    })
    return list
}