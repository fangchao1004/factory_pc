import React from "react";
import { Icon } from 'antd'

/**
 * 权限数据
 */
export const permisstion = [{ name: '专工权限', value: 0 }, { name: '运行权限', value: 1 }, { name: '消费审批权限', value: 2 }, { name: '维修专工权限', value: 3 }]
export const permisstionWithDes = [
    { name: '专工权限', value: 0, des: '可以在缺陷处理过程中，进行缺陷的分配和验收工作，添加缺陷备注' },
    { name: '运行权限', value: 1, des: '可以在缺陷处理过程中，进行最后的运行验收工作' },
    { name: '消费审批权限', value: 2, des: '可以处理消费申请，进行审批操作' },
    { name: '维修专工权限', value: 3, des: '可以自行处理未分配的权限，无需专工分配，添加缺陷备注' }]

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
function omitTextLength(text, targetlength) {
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
 * 只有在添加 设备时 只能选择第三级
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
 * 将三级区间结构数+设备信息之间进行绑定
 * 形成了4级结构
 * @export
 * @param {*} level3List
 * @param {*} devicesList
 * @returns
 */
export function combinAreaAndDevice(level3List, devicesList) {
    level3List.forEach((area1Item) => {
        if (area1Item.children.length > 0) {
            let area2ItemList = area1Item.children;
            area2ItemList.forEach((area2Item) => {
                if (area2Item.children.length > 0) {
                    let area3ItemList = area2Item.children;
                    area3ItemList.forEach((area3Item) => {
                        area3Item.children = []
                        devicesList.forEach((deviceItem) => {
                            if (area3Item.value.split('-')[2] === deviceItem.area_id + '') {
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
 *将多级数据+设备信息 形成的新的4级结构数据
 *渲染成对应的 4级树节点
 * @export
 * @param {*} dataList
 * @param {*} TargetNode
 * @returns
 */
export function renderTreeNodeListByData(dataList, TargetNode) {
    let nodeList = dataList.map((area1Item) => {
        return <TargetNode title={omitTextLength(area1Item.title, 25)} key={area1Item.key} value={area1Item.value} selectable={false} icon={<Icon type="environment" />}>
            {area1Item.children.length > 0 ?
                area1Item.children.map(area2Item => {
                    return <TargetNode title={omitTextLength(area2Item.title, 25)} key={area2Item.key} value={area2Item.value} selectable={false} icon={<Icon type="environment" />}>
                        {area2Item.children.length > 0 ?
                            area2Item.children.map(area3Item => {
                                return <TargetNode title={omitTextLength(area3Item.title, 25)} key={area3Item.key} value={area3Item.value} selectable={false} icon={<Icon type="environment" />}>
                                    {area3Item.children.length > 0 ?
                                        area3Item.children.map(deviceItem => {
                                            let color = '#33CC66' /// 绿色 正常
                                            if (deviceItem.status === 2) {
                                                color = '#FF0000' /// 红色 故障
                                            } else if (deviceItem.status === 3) {
                                                color = '#AAAAAA' /// 灰色 待检
                                            }
                                            return <TargetNode {...deviceItem} icon={<Icon type="laptop" style={{ color }} />} ></TargetNode>
                                        })
                                        : null}
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

