import React, { Component } from 'react';
import { Table, Button, Row, Col, Drawer, Icon, message, Popconfirm, Divider, Tag } from 'antd'
import HttpApi from '../../util/HttpApi';
import RecordViewTool from '../../util/RecordViewTool';
import moment from 'moment';
import AddEquipmentView from './AddEquipmentView';

var nfc_data = [];
var area_data = [];
var device_type_data = [];
var device_data = [];
var user_data = [];

var device_status_filter = [{ text: '正常', value: 1 }, { text: '故障', value: 2 }, { text: '待检', value: 3 }];///用于筛选设备状态的数据 选项
var device_type_data_filter = []; ///用于筛选设备类型的数据 选项
var area_data_filter = []; ///用于筛选区域的数据 选项

class EquipmentView extends Component {
    constructor(props) {
        super(props)
        this.state = {
            dataSource: [],
            drawerVisible1: false,
            drawerVisible2: false,
            deviceRecords: [],
            recordView: null,
            addEquipmentVisible: false
        }
    }
    async componentDidMount() {
        this.init();
    }

    init = async () => {
        device_type_data_filter.length = device_type_data_filter.length = area_data_filter.length = 0;
        nfc_data = await this.getNFCData();
        area_data = await this.getAreaData();
        area_data.forEach((item) => {
            area_data_filter.push({ text: item.name, value: item.id })
        })
        device_type_data = await this.getDeviceTypeData();
        device_type_data.forEach((item) => {
            device_type_data_filter.push({ text: item.name, value: item.id })
        })
        device_data = await this.getDeviceData();
        console.log('device_data', device_data)
        let newData = await this.transformConstruct();
        console.log('newData', newData)
        this.setState({
            dataSource: newData
        })
        user_data = await this.getUserData();
    }
    getNFCData = () => {
        // console.log("getNFCDatagetNFCDatagetNFCDatagetNFCDatagetNFCData");
        let p = new Promise((resolve, reject) => {
            HttpApi.getNFCInfo({}, (res) => {
                if (res.data.code === 0) {
                    resolve(res.data.data)
                }
            })
        })
        return p;
    }
    getAreaData = () => {
        let p = new Promise((resolve, reject) => {
            HttpApi.getAreainfo({}, (res) => {
                if (res.data.code === 0) {
                    resolve(res.data.data)
                }
            })
        })
        return p;
    }
    getDeviceTypeData = () => {
        let p = new Promise((resolve, reject) => {
            HttpApi.getDeviceTypeInfo({}, (res) => {
                if (res.data.code === 0) {
                    resolve(res.data.data)
                }
            })
        })
        return p;
    }
    getDeviceData = () => {
        let p = new Promise((resolve, reject) => {
            HttpApi.getDeviceInfo({}, (res) => {
                if (res.data.code === 0) {
                    resolve(res.data.data)
                }
            })
        })
        return p;
    }
    getUserData = () => {
        let p = new Promise((resolve, reject) => {
            HttpApi.getUserInfo({}, (res) => {
                if (res.data.code === 0) {
                    resolve(res.data.data)
                }
            })
        })
        return p;
    }
    transformConstruct = async () => {
        for (const item of device_data) {
            item.key = item.id + ""
            item.device_type_name = await this.findTypeName(item)
            item.area_name = await this.findAreaName(item)
            item.nfc_name = await this.findNfcName(item)
        }
        console.log('处理后的：', device_data);
        return device_data
    }
    findTypeName = (deviceItem) => {
        let p = new Promise((resolve, reject) => {
            let result = '';
            device_type_data.forEach((item) => {
                if (item.id === deviceItem.type_id) {
                    result = item.name
                }
            })
            resolve(result)
        })
        return p;
    }
    findAreaName = (deviceItem) => {
        let p = new Promise((resolve, reject) => {
            let result = '';
            area_data.forEach((item) => {
                if (item.id === deviceItem.area_id) {
                    result = item.name
                }
            })
            resolve(result)
        })
        return p;
    }
    findNfcName = (deviceItem) => {
        let p = new Promise((resolve, reject) => {
            let result = '';
            nfc_data.forEach((item) => {
                if (item.id === deviceItem.nfc_id) {
                    result = item.name
                }
            })
            resolve(result)
        })
        return p;
    }
    findUserName = (recordItem) => {
        let p = new Promise((resolve, reject) => {
            let result = '';
            user_data.forEach((item) => {
                if (item.id === recordItem.user_id) {
                    resolve(item.username)
                    result = item.username
                }
            })
            resolve(result)
        })
        return p;
    }
    findDeviceName = (recordItem) => {
        let p = new Promise((resolve, reject) => {
            device_data.forEach((item) => {
                if (item.id === recordItem.device_id) {
                    resolve(item.name)
                }
            })
        })
        return p;
    }
    addEquipment = (newValues) => {
        this.setState({ addEquipmentVisible: true })
    }
    addEquipmentOk = (newValues) => {
        newValues.status = 3 // 默认设置设备为 待检 状态
        console.log(newValues)
        HttpApi.addDeviceInfo(newValues, data => {
            if (data.data.code === 0) {
                this.setState({ addEquipmentVisible: false })
                this.init();
                message.success('添加成功')
            } else {
                message.error(data.data.data)
            }
        })
    }
    addEquipmentCancel = () => {
        this.setState({ addEquipmentVisible: false })
    }
    deleteEquipmentConfirm(record) {
        HttpApi.removeDeviceInfo({ id: record.id }, data => {
            if (data.data.code === 0) {
                message.success('删除成功')
                this.init()
            } else {
                message.error(data.data.data)
            }
        })
    }
    render() {
        const columns = [
            {
                title: '编号',
                dataIndex: 'id',
                render: (text, record) => (
                    <div>{text}</div>
                )
            },
            {
                title: '设备名称',
                dataIndex: 'name',
                render: (text, record) => (
                    <div>{text}</div>
                )
            },
            {
                title: '区域',
                dataIndex: 'area_name',
                filters: area_data_filter,
                onFilter: (value, record) => record.area_id === value,
                render: (text, record) => (
                    <div>{text}</div>
                )
            },
            {
                title: '设备类型',
                dataIndex: 'device_type_name',
                filters: device_type_data_filter,
                onFilter: (value, record) => record.type_id === value,
                render: (text, record) => (
                    <div>{text}</div>
                )
            },
            {
                title: '设备ID',
                dataIndex: 'nfc_name',
                width: '20%',
                render: (text, record) => (
                    <div>{text}</div>
                )
            },
            {
                title: '当前状态',
                dataIndex: 'status',
                filters: device_status_filter,
                align: 'center',
                onFilter: (value, record) => record.status === value,
                render: (text, record) => {
                    console.log(record);
                    let str = '';
                    let strColor = '#555555'
                    if (text === 1) { str = '正常'; strColor = '#00CC00' }
                    else if (text === 2) { str = '故障'; strColor = '#FF0000' }
                    else { str = '待检'; strColor = 'gray' }
                    return <Tag color={strColor}>{str}</Tag>
                }
            },
          
            {
                title: '备注',
                dataIndex: 'remark',
                render: (text, record) => (
                    <div>{text}</div>
                )
            },
            {
                title: '操作',
                dataIndex: 'actions',
                width: 150,
                render: (text, record) => (
                    <div style={{ textAlign: 'center' }}>
                        <Popconfirm title="确定要删除该设备吗?" onConfirm={this.deleteEquipmentConfirm.bind(null, record)}>
                            <Button size="small" type="danger">删除</Button>
                        </Popconfirm>
                        <Divider type="vertical" />
                        <Button size="small" type='primary' onClick={() => this.openModalHandler(record)} >详情</Button></div>
                )
            }
        ];

        return (
            <div>
                <Row>
                    <Col span={6}>
                        <Button onClick={this.addEquipment} type="primary" style={{ marginBottom: 16 }}>
                            添加设备
                         </Button>
                    </Col>
                </Row>
                <Table
                    size={'small'}
                    bordered
                    dataSource={this.state.dataSource}
                    columns={columns}
                />
                <Drawer
                    title={(
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>设备状态历史记录</span>
                            <Icon type="close-circle" theme="twoTone" style={{ fontSize: 20 }}
                                onClick={() => { this.setState({ drawerVisible1: false }) }}
                            />
                        </div>
                    )}
                    placement="left"
                    closable={false}
                    onClose={this.onCloseDrawer}
                    visible={this.state.drawerVisible1}
                    width={600}
                >
                    {this.renderDeviceRecordsView()}
                    <Drawer
                        title="当次报表"
                        placement="left"
                        width={520}
                        closable={false}
                        onClose={this.closeDrawer2}
                        visible={this.state.drawerVisible2}
                    >
                        {this.state.recordView}
                    </Drawer>
                </Drawer>
                <AddEquipmentView visible={this.state.addEquipmentVisible} onOk={this.addEquipmentOk} onCancel={this.addEquipmentCancel} />
            </div>
        );
    }

    openModalHandler = (record) => {
        // console.log(record);
        HttpApi.getRecordInfo({ device_id: record.id }, async (res) => {
            let resultArr = res.data.data;
            resultArr.sort(function (a, b) {
                return b.id - a.id
            })
            for (let item of resultArr) {
                item.key = item.id + '';
                item.username = await this.findUserName(item);
                item.devicename = await this.findDeviceName(item)
            }
            this.setState({
                drawerVisible1: true,
                deviceRecords: resultArr
            })
        })
    }

    onCloseDrawer = () => {
        this.setState({
            drawerVisible1: false
        })
    }
    closeDrawer2 = () => {
        this.setState({
            drawerVisible2: false
        })
    }
    openDrawer2 = (record) => {
        console.log(record);
        let titleObj = {};
        titleObj.key = '0';
        titleObj.title_name = '表头';
        titleObj.type_id = '7';
        titleObj.default_values = record.device_type_id + ''; ///表头的value值
        titleObj.extra_value = record.table_name;
        let dataArr = JSON.parse(record.content);
        let newArr = [titleObj, ...dataArr];///将数据结构进行转化
        this.setState({
            modalvisible: true
        })
        let recordViewFinallyData = {
            devicename: record.devicename,
            username: record.username,
            tableData: newArr
        }
        let sample = RecordViewTool.renderTable(recordViewFinallyData);
        this.setState({
            recordView: sample,
            drawerVisible2: true
        })
    }

    renderDeviceRecordsView = () => {
        const columns = [
            {
                title: '时间',
                dataIndex: 'createdAt',
                render: (text, record) => (
                    <div>{moment(text).format('YYYY-MM-DD HH:mm:ss')}</div>
                )
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
                dataIndex: 'username',
                render: (text, record) => (
                    <div>{text}</div>
                )
            },
            {
                title: '操作',
                width: 75,
                dataIndex: 'operation',
                render: (text, record) => {
                    return (
                        <Button style={{marginLeft: 10}} size="small" type='primary' onClick={() => this.openDrawer2(record)} >详情</Button>
                    )
                },
            }
        ]
        return <Table
            size={'small'}
            bordered
            dataSource={this.state.deviceRecords}
            columns={columns}
        />
    }
}

export default EquipmentView;