import React from "react";
import { Tree, Icon } from 'antd'
const { TreeNode } = Tree;

/**
 * Tool 工具类 
 * 将可以重复利用的函数，或是代码量很大的函数进行封装
 * 方便调用 - 整洁项目
 */

/**
 * 省略文本长度
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
 * 将数据库查询的 数据进行 三层结构转换
 * 
 * 123级
 */
export function transfromDataTo3level(area123result) {
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
                    selectable: false,
                    children: [{ value: item.area1_id + '-' + item.area2_id + '-' + item.area3_id, title: item.area3_name, key: item.area1_id + '-' + item.area2_id + '-' + item.area3_id }]
                }
            }
            else if (!item.area3_id && item.area2_id) { /// 没有三级
                tempObj[item.area2_id] = {
                    title: item.area2_name,
                    value: item.area1_id + '-' + item.area2_id,
                    key: item.area1_id + '-' + item.area2_id,
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
    /// jsonList 到此步 二三级已经形成了 所需的数据结构 继续解析 一级区域数据
    let rootObj = {}
    area123result.forEach((item) => {
        rootObj[item.area1_id] = {
            title: item.area1_name,
            value: item.area1_id + '',
            key: item.area1_id + '',
            selectable: false,
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
 * 将数据库查询的 数据进行 二层结构转换
 * 
 * 12级
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
 * 将多级数据+设备信息 形成的新的4级结构数据
 * 渲染成对应的 4级树节点
 */
export function renderTreeNodeListByData(dataList) {
    let nodeList = dataList.map((area1Item) => {
        return <TreeNode title={omitTextLength(area1Item.title, 25)} key={area1Item.key} selectable={false} icon={<Icon type="environment" />}>
            {area1Item.children.length > 0 ?
                area1Item.children.map(area2Item => {
                    return <TreeNode title={omitTextLength(area2Item.title, 25)} key={area2Item.key} selectable={false} icon={<Icon type="environment" />}>
                        {area2Item.children.length > 0 ?
                            area2Item.children.map(area3Item => {
                                return <TreeNode title={omitTextLength(area3Item.title, 25)} key={area3Item.key} selectable={false} icon={<Icon type="environment" />}>
                                    {area3Item.children.length > 0 ?
                                        area3Item.children.map(deviceItem => {
                                            return <TreeNode {...deviceItem} icon={<Icon type="laptop" style={{ color: '#198FFF' }} />} ></TreeNode>
                                        })
                                        : null}
                                </TreeNode>
                            })
                            : null}
                    </TreeNode>
                })
                : null}
        </TreeNode>
    })
    return nodeList
}

/**
 * 将recordlist的数据结构--转换成-采集数据的数组
 */
export function transfromDataToCollectionList(recordList) {
    let tempObj = {};
    recordList.forEach((recordItem) => {
        let oneRecordContentJson = JSON.parse(recordItem.content);
        oneRecordContentJson.forEach((item) => { /// item 每一项 每一题
            if (item.type_id === '10' || item.type_id === '11') {
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

