import React, { Component } from 'react';
import { Table, Button, Row, Col } from 'antd'
import HttpApi from '../../util/HttpApi';

var nfc_data = [];
var area_data = [];
var device_type_data = [];
var device_data = [];

var device_status_filter = [{ text: '正常', value: 1 }, { text: '故障', value: 2 }, { text: '待检', value: 3 }];///用于筛选设备状态的数据 选项
var device_type_data_filter = []; ///用于筛选设备类型的数据 选项
var area_data_filter = []; ///用于筛选区域的数据 选项

class EquipmentView extends Component {
    constructor(props) {
        super(props)
        this.state = {
            dataSource: []
        }
    }
    async componentDidMount() {
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
        let newData = await this.transformConstruct();
        this.setState({
            dataSource: newData
        })
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
            device_type_data.forEach((item) => {
                if (item.id === deviceItem.type_id) {
                    resolve(item.name)
                }
            })
        })
        return p;
    }
    findAreaName = (deviceItem) => {
        let p = new Promise((resolve, reject) => {
            area_data.forEach((item) => {
                if (item.id === deviceItem.area_id) {
                    resolve(item.name)
                }
            })
        })
        return p;
    }
    findNfcName = (deviceItem) => {
        let p = new Promise((resolve, reject) => {
            nfc_data.forEach((item) => {
                if (item.id === deviceItem.nfc_id) {
                    resolve(item.nfcid)
                }
            })
        })
        return p;
    }

    render() {
        const columns = [
            {
                title: '编号',
                dataIndex: 'id',
                width: '8%',
                render: (text, record) => (
                    <div>{text}</div>
                )
            },
            {
                title: '状态',
                dataIndex: 'status',
                width: '12%',
                filters: device_status_filter,
                onFilter: (value, record) => record.status === value,
                render: (text, record) => {
                    // console.log(record);
                    let str = '';
                    let strColor = '#555555'
                    if (text === 1) { str = '正常'; strColor = '#66CC00' }
                    else if (text === 2) { str = '故障'; strColor = '#FF3333' }
                    else { str = '待检' }
                    return <div style={{ color: strColor }}>{str}</div>
                }
            },
            {
                title: '设备类型',
                dataIndex: 'device_type_name',
                width: '12%',
                filters: device_type_data_filter,
                onFilter: (value, record) => record.type_id === value,
                render: (text, record) => (
                    <div>{text}</div>
                )
            },
            {
                title: 'NFC',
                dataIndex: 'nfc_name',
                width: '20%',
                render: (text, record) => (
                    <div>{text}</div>
                )
            },
            {
                title: '设备名',
                dataIndex: 'name',
                width: '12%',
                render: (text, record) => (
                    <div>{text}</div>
                )
            },
            {
                title: '区域',
                dataIndex: 'area_name',
                width: '8%',
                filters: area_data_filter,
                onFilter: (value, record) => record.area_id === value,
                render: (text, record) => (
                    <div>{text}</div>
                )
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
                dataIndex: 'operation',
                width: '10%',
                render: (text, record) => {
                    return (
                        <Button type='primary'>操作</Button>
                    )
                },
            }

        ];

        return (
            <div>
                <Row>
                    <Col span={6}>
                        <Button onClick={this.handleAdd} type="primary" style={{ marginBottom: 16 }}>
                            添加设备
                         </Button>
                    </Col>
                </Row>
                <Table
                    size={'small'}
                    rowClassName={() => 'editable-row'}
                    bordered
                    dataSource={this.state.dataSource}
                    columns={columns}
                />
            </div>
        );
    }
}

export default EquipmentView;