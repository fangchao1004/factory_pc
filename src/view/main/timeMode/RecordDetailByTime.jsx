import React, { Component } from 'react';
import { Drawer, Table, Button, message } from 'antd'
import HttpApi from '../../util/HttpApi';
import OneRecordDetialView from '../equipmentMode/equipment/OneRecordDetialView';

/**
 * 某个时间段内所有的巡检记录界面
 */
class RecordDetailByTime extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            record: {},
            deviceRecords: [],
            oneRecordData: {},
            showBugDrawer: false
        }
    }
    componentWillReceiveProps(nextProps) {
        this.setState({
            visible: nextProps.visible,
            record: nextProps.record
        })
        if (nextProps.visible) {
            this.getInfoHandler(nextProps.record);
        }
    }
    getInfoHandler = async (data) => {
        let result = await this.getRecordInfo(data);
        this.setState({ deviceRecords: result.map((item, index) => { item.key = index + ''; return item }) })
    }
    openDrawer = async (record) => {
        // console.log('record:', record);
        if (!record) { message.warn('无记录数据'); return }
        let bug_id_arr = [];
        let bug_key_id_arr = [];///key标题和bugId的对应关系
        let collectAndInputDataList = [];/// 采集组件 和 输入组件 对应的
        JSON.parse(record.content).forEach((item) => {
            if (item.bug_id !== null) {
                bug_id_arr.push(item.bug_id);
                bug_key_id_arr.push({ key: item.key, bug_id: item.bug_id });
            }
            if (item.type_id === '2' || item.type_id === '10' || item.type_id === '11') {
                collectAndInputDataList.push(item);
            }
        })
        let bugs_info_arr = await this.getBugsInfo(bug_id_arr);
        ///将key 合并到 bugs_info_arr中
        bugs_info_arr.forEach((oneBugInfo) => {
            bug_key_id_arr.forEach((one_key_bug_id) => {
                if (oneBugInfo.id === one_key_bug_id.bug_id) {
                    oneBugInfo.key = one_key_bug_id.key
                }
            })
        })
        // console.log('待渲染的缺陷数据:', bugs_info_arr);
        // console.log('待渲染的测量数据和输入数据:', collectAndInputDataList);
        let oneRecordData = {
            table_name: record.table_name,
            device_name: record.device_name,
            user_name: record.user_name,
            content: bugs_info_arr,///bugs数据
            collect: collectAndInputDataList,///采集的数据
            updatedAt: record.updatedAt,
            checkedAt: record.checkedAt
        }
        this.setState({ oneRecordData, showBugDrawer: true })
    }
    getBugsInfo = (bug_id_arr) => {
        return new Promise((resolve, reject) => {
            let sql = `select bugs.*,mjs.name as major_name from bugs 
            left join (select * from majors) mjs on mjs.id = bugs.major_id 
            where bugs.id in (${bug_id_arr.join(',')}) and bugs.effective = 1`;
            HttpApi.obs({ sql }, (res) => {
                let result = [];
                if (res.data.code === 0) {
                    result = res.data.data
                }
                resolve(result);
            })
        })
    }

    getRecordInfo = (record) => {
        let sql = `select records.*,users.name as user_name,devices.name as device_name,
        concat_ws('/',area_1.name,area_2.name,area_3.name) as area_name
        from records
        left join (select * from users where effective = 1) users on users.id = records.user_id
        left join (select * from devices where effective = 1) devices on devices.id = records.device_id
        left join (select * from area_3 where effective = 1) area_3 on area_3.id = devices.area_id
        left join (select * from area_2 where effective = 1) area_2 on area_3.area2_id = area_2.id
        left join (select * from area_1 where effective = 1) area_1 on area_2.area1_id = area_1.id
        where checkedAt>'${record.bt}' and checkedAt<'${record.et}' and records.effective = 1
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

    render() {
        const columns = [
            {
                title: '时间',
                dataIndex: 'checkedAt',
                render: (text, record) => (
                    <div>{text || '/'}</div>
                )
            },
            {
                title: '设备名称',
                dataIndex: 'device_name',
                render: (text, record) => {
                    return <div>{text || '/'}</div>
                }
            },
            {
                title: '所在区域',
                dataIndex: 'area_name',
                render: (text, record) => {
                    return <div>{text || '/'}</div>
                }
            },
            {
                title: '基本状态',
                dataIndex: 'device_status',
                render: (text, record) => {
                    let str = '';
                    let strColor = '#555555'
                    if (text === 1) { str = '正常'; strColor = '#66CC00' }
                    else if (text === 2) { str = '故障'; strColor = '#FF3333' }
                    else { str = '待检' }
                    return <div style={{ color: strColor }}>{str}</div>
                }
            },
            {
                title: '报告人',
                dataIndex: 'user_name',
                width: 100,
                render: (text, record) => {
                    return <div>{text || '/'}</div>
                }
            },
            {
                title: '操作',
                width: 75,
                dataIndex: 'operation',
                render: (text, record) => {
                    return (
                        <Button style={{ marginLeft: 10 }} size="small" type='primary' onClick={() => {
                            this.openDrawer(record)
                        }} >详情</Button>
                    )
                },
            }
        ]
        return (
            <Drawer
                title="当前时间区间内所有巡检记录"
                placement='left'
                width={800}
                visible={this.state.visible}
                onClose={() => { this.props.close(); }}
            >
                <Table
                    bordered
                    dataSource={this.state.deviceRecords}
                    columns={columns}
                />
                <Drawer
                    title={<div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', }}>
                        <span>当次记录</span>
                        <span>{this.state.oneRecordData.checkedAt || '/'}</span>
                    </div>}
                    placement="left"
                    width={500}
                    closable={false}
                    onClose={() => { this.setState({ showBugDrawer: false }) }}
                    visible={this.state.showBugDrawer}
                >
                    <OneRecordDetialView renderData={this.state.oneRecordData} />
                </Drawer>
            </Drawer>
        );
    }
}

export default RecordDetailByTime;