import React, { Component } from 'react';
import { Drawer, Table, Button } from 'antd'
import HttpApi from '../../util/HttpApi';
import OneDeviceRecordListView from './OneDeviceRecordListView';

/**
 * 某个时间段内所有的巡检记录界面
 */
class RecordDetailByTime extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            showRecordListDrawer: false,
            record: {},
            deviceRecords: [],
            oneRecordData: {},
            showBugDrawer: false,
            devicesList: [],
            selectDeviceRecord: {},
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
        let devicesResult = await this.getDevicesInfo(data.select_map_device);
        let recordsResult = await this.getRecordInfo(data);
        devicesResult.forEach((deviceItem) => {
            deviceItem.recordList = [];
            recordsResult.forEach((recordItem) => {
                if (deviceItem.id === recordItem.device_id) {
                    deviceItem.recordList.push(recordItem);
                }
            })
        })
        this.setState({
            devicesList: devicesResult.map((item, index) => { item.key = index + ''; return item })
        })
    }
    openDrawer = async (record) => {
        this.setState({ selectDeviceRecord: record, showRecordListDrawer: true })
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
        // sql = `select records.*,users.name as user_name,devices.name as device_name,
        // concat_ws('/',area_1.name,area_2.name,area_3.name) as area_name
        // from records
        // left join (select * from users where effective = 1) users on users.id = records.user_id
        // left join (select * from devices where effective = 1) devices on devices.id = records.device_id
        // left join (select * from area_3 where effective = 1) area_3 on area_3.id = devices.area_id
        // left join (select * from area_2 where effective = 1) area_2 on area_3.area2_id = area_2.id
        // left join (select * from area_1 where effective = 1) area_1 on area_2.area1_id = area_1.id
        // where checkedAt>'2019-01-01 00:00:00' and checkedAt<'2029-01-01 00:00:00' and records.effective = 1
        // and device_id in (${JSON.parse(record.selected_devices)})
        // order by records.checkedAt desc`
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
            let sql = `select devices.* from devices
            where devices.effective = 1 and devices.id in (${devicesIdListStr})
            `
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
        const columns = [
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
                width={600}
                visible={this.state.visible}
                onClose={() => { this.props.close(); }}
            >
                <Table
                    bordered
                    dataSource={this.state.devicesList}
                    columns={columns}
                    pagination={{
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '50', '80', '100'],
                    }}
                />
                <OneDeviceRecordListView
                    onClose={() => { this.setState({ showRecordListDrawer: false }) }}
                    showDrawer={this.state.showRecordListDrawer}
                    record={this.state.selectDeviceRecord} />
            </Drawer>
        );
    }
}

export default RecordDetailByTime;