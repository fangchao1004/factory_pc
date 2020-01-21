import React, { Component } from 'react';
import { Drawer, Table, Button, Tag, message } from 'antd'
import HttpApi from '../../util/HttpApi';
import OneDeviceRecordListView from './OneDeviceRecordListView';
import ChangeDeviceBindDateScheme from './ChangeDeviceBindDateScheme';

/**
 * 某个时间段内所有的巡检记录界面
 */
class RecordDetailByTime extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isAdmin: JSON.parse(window.localStorage.getItem('userinfo')).isadmin,
            visible: false,
            showRecordListDrawer: false,
            record: {},
            deviceRecords: [],
            oneRecordData: {},
            showBugDrawer: false,
            devicesList: [],
            selectDeviceRecord: {},
            updateVisible: false,
        }
        this.columns = [
            {
                title: '巡检点名称',
                dataIndex: 'name',
                render: (text, record) => {
                    return <div>{text || '/'}</div>
                }
            },
            {
                title: '是否巡检',
                dataIndex: 'recordList',
                filters: [{ value: false, text: '否' }, { value: true, text: '是' }],
                onFilter: (value, record) => { return ((record.recordList.length > 0) === value) },
                render: (text, record) => {
                    let flag = text.length > 0;
                    return <div style={{ color: flag ? '#66CC00' : '#FF3333' }}>{flag ? '是' : '否'}</div>
                }
            },
            {
                title: '日期方案',
                dataIndex: 'scheme_title',
                render: (text, record) => {
                    if (text) return <Tag color='#2db7f5'>{text}</Tag>
                    else return <div>/</div>
                }
            },
            {
                title: '操作',
                width: 75,
                dataIndex: 'operation',
                render: (text, record) => {
                    return (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <Button size="small" type='primary' onClick={() => { this.openDrawer(record) }} >详情</Button>
                            {this.state.isAdmin ? <>
                                <div style={{ borderBottomStyle: 'solid', borderBottomColor: '#D0D0D0', borderBottomWidth: 1, margin: 10 }} />
                                <Button size="small" type='dashed' onClick={() => { this.openModal(record) }} >变更方案</Button></> : null}
                        </div>
                    )
                },
            }
        ]
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
        let devicesResult = await this.getDevicesInfo(data.select_map_device);
        // console.log('data.select_map_device:', data.select_map_device)
        let recordsResult = await this.getRecordInfo(data);
        devicesResult.forEach((deviceItem) => {
            deviceItem.recordList = [];
            recordsResult.forEach((recordItem) => {
                if (deviceItem.id === recordItem.device_id) {
                    deviceItem.recordList.push(recordItem);
                }
            })
        })
        // console.log('devicesResult:', devicesResult)
        this.setState({
            devicesList: devicesResult.map((item, index) => { item.key = index + ''; return item })
        })
    }
    openDrawer = (record) => {
        this.setState({ selectDeviceRecord: record, showRecordListDrawer: true })
    }
    openModal = (record) => {
        this.setState({ selectDeviceRecord: record, updateVisible: true })
    }
    updateSchemeBindOk = (value) => {
        // console.log('updateSchemeBindOk:', value)
        let sql = `update sche_cyc_map_device set effective = 0 where device_id = ${value.id}`
        HttpApi.obs({ sql }, (res) => {
            if (res.data.code === 0) {
                let sql = `insert into sche_cyc_map_device (scheme_id,device_id) values (${value.atm_options},${value.id})`
                HttpApi.obs({ sql }, (res) => {
                    if (res.data.code === 0) {
                        message.success('变更方案成功'); this.setState({ updateVisible: false }); this.getInfoHandler(this.state.record);
                    } else { message.error('变更方案失败'); }
                })
            } else { message.error('变更方案失败'); }
        })
    }
    updateSchemeBindCancel = () => {
        this.setState({ updateVisible: false })
    }
    removeBindScheme = (id) => {
        let sql = `update sche_cyc_map_device set effective = 0 where device_id = ${id}`
        HttpApi.obs({ sql }, (res) => {
            if (res.data.code === 0) { message.success('解除方案成功'); this.setState({ updateVisible: false }); this.getInfoHandler(this.state.record); }
            else { message.error('解除方案失败'); }
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
    getDevicesInfo = (devicesIdListStr) => {
        return new Promise((resolve, reject) => {
            // let sql = `select devices.* from devices
            // where devices.effective = 1 and devices.id in (${devicesIdListStr})
            // `
            let sql = `select devices.*,group_concat(distinct date_value) as date_value_list,group_concat(distinct title) as scheme_title,group_concat(distinct scheme_of_cycleDate.id) as sche_cyc_id,group_concat(distinct scheme_of_cycleDate.cycleDate_id) as cycleDate_id from devices
            left join (select * from sche_cyc_map_device where effective = 1) sche_cyc_map_device on sche_cyc_map_device.device_id = devices.id
            left join (select * from scheme_of_cycleDate where effective = 1) scheme_of_cycleDate on scheme_of_cycleDate.id = sche_cyc_map_device.scheme_id
            left join (select * from sche_cyc_map_date where effective = 1) sche_cyc_map_date on sche_cyc_map_date.scheme_id = sche_cyc_map_device.scheme_id
            where devices.effective = 1 and devices.id in (${devicesIdListStr})
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

    render() {
        return (
            <Drawer
                title="当前时间区间内所有巡检记录"
                placement='left'
                width={800}
                visible={this.state.visible}
                destroyOnClose
                onClose={() => { this.props.close(); }}>
                <Table
                    bordered
                    dataSource={this.state.devicesList}
                    columns={this.columns}
                    pagination={{
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '50', '80', '100'],
                    }}
                />
                <OneDeviceRecordListView
                    onClose={() => { this.setState({ showRecordListDrawer: false }) }}
                    showDrawer={this.state.showRecordListDrawer}
                    record={this.state.selectDeviceRecord} />
                <ChangeDeviceBindDateScheme visible={this.state.updateVisible} onOk={this.updateSchemeBindOk} onCancel={this.updateSchemeBindCancel} record={this.state.selectDeviceRecord} removeBindScheme={this.removeBindScheme} />
            </Drawer>
        );
    }
}

export default RecordDetailByTime;