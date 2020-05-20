import React, { Component } from 'react';
import { Drawer, Table, Button, Tag, message } from 'antd'
import HttpApi from '../../util/HttpApi';
import OneDeviceRecordListView from './OneDeviceRecordListView';
import ChangeDeviceBindDateScheme from './ChangeDeviceBindDateScheme';
import { getDevicesInfoByIdListStr, getRecordInfoByStartEndTimeAndDevices } from '../../util/Tool';

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
        let devicesResult = await getDevicesInfoByIdListStr(data);
        let recordsResult = await getRecordInfoByStartEndTimeAndDevices(data);
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