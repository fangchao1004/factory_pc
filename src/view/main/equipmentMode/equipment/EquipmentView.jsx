import React, { Component } from 'react';
import { Table, Button, Row, Col, Drawer, Icon, message, Popconfirm, Divider, Tag } from 'antd'
import HttpApi from '../../../util/HttpApi';
import moment from 'moment';
import AddEquipmentView from './AddEquipmentView';
import UpdateEquipmentView from './UpdateEquipmentView';
import PieViewOfOneDeStus from './PieViewOfOneDeStus';
import OneRecordDetialView from './OneRecordDetialView'
import LineViewOfCollection from './LineViewOfCollection';

var device_status_filter = [{ text: '正常', value: 1 }, { text: '故障', value: 2 }, { text: '待检', value: 3 }];///用于筛选设备状态的数据 选项
var device_type_data_filter = []; ///用于筛选巡检点类型的数据 选项
// var area_data_filter = []; ///用于筛选区域的数据 选项

class EquipmentView extends Component {
    constructor(props) {
        super(props)
        this.state = {
            dataSource: [],
            drawerVisible1: false,
            drawerVisible2: false,
            drawerVisible3: false,
            deviceRecords: [],
            oneRecordData: {},
            recordView: null,
            addEquipmentVisible: false,
            updateEquipmentVisible: false,
            isAdmin: JSON.parse(window.localStorage.getItem('userinfo')).isadmin,
            pieDeviceId: null,
            oneDeviceInfo: null,
        }
    }
    componentDidMount() {
        this.init();
    }
    init = async () => {
        let devicesInfo = await this.getDevicesInfo();
        let devicesTypeInfo = await this.getDevicesTypeInfo();
        // let areasInfo = await this.getAreasInfo();
        // console.log('areasInfo:', areasInfo);
        // area_data_filter = areasInfo.map((item) => { return { text: item.name, value: item.id } })
        device_type_data_filter = devicesTypeInfo.map((item) => { return { text: item.name, value: item.id } })
        devicesInfo.map((item) => item.key = item.id + '')
        this.setState({
            dataSource: devicesInfo
        })
    }
    // getAreasInfo = () => {
    //     return new Promise((resolve, reject) => {
    //         let sql = `select area_3.id as area3_id, area_3.name as area3_name, area_2.id as area2_id, area_2.name as area2_name
    //         ,area_1.id as area1_id, area_1.name as area1_name, concat(area_1.id,'-',area_2.id,'-',area_3.id) as all_area_id, concat(area_1.name,'-',area_2.name,'-',area_3.name) as all_area_name from area_3
    //         left join (select * from area_2) area_2 on area_2.id = area_3.area2_id
    //         left join (select * from area_1) area_1 on area_1.id = area_2.area1_id
    //         where area_3.effective = 1
    //         `;
    //         HttpApi.obs({ sql }, (res) => {
    //             let result = [];
    //             if (res.data.code === 0) {
    //                 result = res.data.data
    //             }
    //             resolve(result);
    //         })
    //     })
    // }
    getDevicesTypeInfo = () => {
        return new Promise((resolve, reject) => {
            let sql = `select * from device_types where effective = 1`;
            HttpApi.obs({ sql }, (res) => {
                let result = [];
                if (res.data.code === 0) {
                    result = res.data.data
                }
                resolve(result);
            })
        })
    }
    getDevicesInfo = () => {
        return new Promise((resolve, reject) => {
            let sql = `select des.*,dts.name as device_type_name,area_3.name as area_name,nfcs.name as nfc_name from devices des
            left join (select * from device_types where effective = 1) dts on dts.id = des.type_id 
            left join (select * from area_3 where effective = 1) area_3 on area_3.id = des.area_id 
            left join nfcs on nfcs.id = des.nfc_id
            where des.effective = 1`;
            HttpApi.obs({ sql }, (res) => {
                let result = [];
                if (res.data.code === 0) {
                    result = res.data.data
                }
                resolve(result);
            })
        })
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

    addEquipment = (newValues) => {
        this.setState({ addEquipmentVisible: true })
    }
    addEquipmentOk = (newValues) => {
        let area3_id = newValues.area_id.split('-')[2];
        newValues.status = 3 // 默认设置设备为 1正常 3待检 状态
        newValues.area_id = area3_id;
        // console.log(newValues)
        // return;
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
    updateEquipmentOk = (newValues) => {
        HttpApi.updateDeviceInfo({ query: { id: this.state.oneDeviceInfo.id }, update: newValues }, (res) => {
            if (res.data.code === 0) {
                this.setState({ updateEquipmentVisible: false })
                this.init();
                message.success('更新设备信息成功');
            } else {
                message.error(res.data.data)
            }
        })
    }
    updateEquipmentCancel = () => {
        this.setState({ updateEquipmentVisible: false })
    }
    deleteEquipmentConfirm = (record) => {
        // console.log('确定删除 某个设备:', record.id);
        HttpApi.obs({ sql: `update devices set effective = 0 where id = ${record.id} ` }, (data) => {
            if (data.data.code === 0) {
                message.success('删除巡检点成功')
                this.init();
            } else {
                message.error(data.data.data)
            }
        })
    }
    changeDeviceInfo = (record) => {
        this.setState({
            oneDeviceInfo: record,
            updateEquipmentVisible: true
        })
    }
    render() {
        const columns = [
            {
                title: '巡检点名称',
                dataIndex: 'name',
                render: (text, record) => (
                    <div>{text}</div>
                )
            },
            {
                title: '具体设备范围',
                dataIndex: 'area_name',
                // filters: area_data_filter,
                onFilter: (value, record) => record.area_id === value,
                render: (text, record) => (
                    <div>{text}</div>
                )
            },
            {
                title: '巡检点类型',
                dataIndex: 'device_type_name',
                filters: device_type_data_filter,
                onFilter: (value, record) => record.type_id === value,
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
                    let str = '';
                    let strColor = '#555555'
                    if (text === 1) { str = '正常'; strColor = '#00CC00' }
                    else if (text === 2) { str = '故障'; strColor = '#FF0000' }
                    else { str = '待检'; strColor = 'gray' }
                    return <Tag style={{ cursor: 'pointer' }} color={strColor} onClick={() => {
                        if (text === 2 || text === 1) { this.openLastRecord(record) }
                        // else if (text === 1) { message.success('正常') }
                        else if (text === 3) { message.info('待检') }
                    }}>{str}</Tag>
                }
            },
            {
                title: '巡检时间 (或 状态更新时间)',
                dataIndex: 'updatedAt',
                sorter: (a, b) => {
                    return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
                },
                defaultSortOrder: 'descend',
                render: (text, record) => {
                    return <div>{moment(text).format('YYYY-MM-DD HH:mm:ss')}</div>
                }
            },
            {
                title: '记录查询',
                dataIndex: 'actions',
                width: 250,
                render: (text, record) => (
                    <div style={{ textAlign: 'center' }}>
                        {
                            this.state.isAdmin ?
                                <span>
                                    <Popconfirm title="确定要删除该巡检点吗?" onConfirm={() => { this.deleteEquipmentConfirm(record) }}>
                                        <Button size="small" type="danger">删除</Button>
                                    </Popconfirm>
                                    <Divider type="vertical" />
                                    <Button size="small" type='ghost' onClick={() => { this.changeDeviceInfo(record) }} >修改</Button>
                                </span>
                                : null
                        }
                        {
                            this.state.isAdmin ?
                                <Divider type="vertical" />
                                : null
                        }
                        <Button size="small" type='primary' onClick={() => this.openModalHandler(record)} >巡检记录</Button>
                    </div>
                )
            }
        ];

        return (
            <div>
                {
                    this.state.isAdmin ? (<Row>
                        <Col span={6}>
                            <Button onClick={this.addEquipment} type="primary" style={{ marginBottom: 16 }}>
                                添加巡检点
                             </Button>
                        </Col>
                    </Row>) : null
                }
                <Table
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
                    <Divider orientation="left"></Divider>
                    {this.renderDevicePieView()}
                    <Divider orientation="left"></Divider>
                    {this.renderCollectionLineView()}
                    <Drawer
                        title={<div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', }}>
                            <span>当次记录</span>
                            <span>{moment(this.state.oneRecordData.updatedAt).format('YYYY-MM-DD HH:mm:ss')}</span>
                        </div>}
                        placement="left"
                        width={500}
                        closable={false}
                        onClose={this.closeDrawer2}
                        visible={this.state.drawerVisible2}
                    >
                        <OneRecordDetialView renderData={this.state.oneRecordData} />
                    </Drawer>
                </Drawer>
                <Drawer
                    title={<div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', }}>
                        <span>最新记录</span>
                        <span>{moment(this.state.oneRecordData.updatedAt).format('YYYY-MM-DD HH:mm:ss')}</span>
                    </div>}
                    placement="right"
                    width={500}
                    closable={false}
                    onClose={this.closeDrawer3}
                    visible={this.state.drawerVisible3}
                >
                    <OneRecordDetialView renderData={this.state.oneRecordData} />
                </Drawer>
                <AddEquipmentView visible={this.state.addEquipmentVisible} onOk={this.addEquipmentOk} onCancel={this.addEquipmentCancel} />
                <UpdateEquipmentView visible={this.state.updateEquipmentVisible} device={this.state.oneDeviceInfo} onOk={this.updateEquipmentOk} onCancel={this.updateEquipmentCancel} />
            </div>
        );
    }

    openLastRecord = async (record) => {
        ///获取该设备，数据库中最近的一条records 记录
        let lastRecordData = await this.getLastRecordData(record.id);
        // console.log('lastRecordData:', lastRecordData);
        this.openDrawer(lastRecordData, 3)
    }

    getLastRecordData = (device_id) => {
        return new Promise((resolve, reject) => {
            // let sql1 = ' select rds.*,users.name as user_name,devices.name as device_name,device_types.name as device_type_name from records rds'
            // let sql2 = ' left join users on users.id = rds.user_id left join devices on devices.id = rds.device_id'
            // let sql3 = ' left join device_types on device_types.id = rds.device_type_id where device_id = ' + device_id + ' and rds.effective = 1 order by id desc limit 1'
            // let sqlText = sql1 + sql2 + sql3;
            let sql = `select rds.*,users.name as user_name,devices.name as device_name,device_types.name as device_type_name from records rds
            left join (select * from users where effective =1) users on users.id = rds.user_id left join devices on devices.id = rds.device_id
            left join (select * from device_types where effective =1) device_types on device_types.id = rds.device_type_id 
            where device_id = "${device_id}" and rds.effective = 1 order by id desc limit 1
            `
            let result = {};
            HttpApi.obs({ sql }, (res) => {
                if (res.data.code === 0) {
                    result = res.data.data[0]
                }
                resolve(result);
            })

        })
    }
    ///查询某个设备的所有record记录数据
    openModalHandler = async (record) => {
        ///查询数据库中某个设备的所有record记录
        let OneDeviceAllRecords = await HttpApi.getOneDeviceAllRecords(record.id);
        OneDeviceAllRecords.map((item) => item.key = item.id + '')
        ///获取了当前的设备id
        this.setState({
            pieDeviceId: record.id,
            drawerVisible1: true,
            deviceRecords: OneDeviceAllRecords,
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
    closeDrawer3 = () => {
        this.setState({
            drawerVisible3: false
        })
    }
    ///2 左边的二级抽屉，显示该设备任意一次的record记录 
    ///3 右边的独立的一级抽屉，显示该设备最新一次的record记录 
    openDrawer = async (record, v) => {
        // console.log('record:',record);
        if (!record) { message.warn('无记录数据'); return }
        // if (record.device_status === 1) {
        //     message.success('正常');
        //     return;
        // }
        // console.log('JSON.parse(record.content):', JSON.parse(record.content));
        ///对record.content内容进行处理。
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
            updatedAt: record.updatedAt
        }
        if (v === 2) {
            this.setState({
                drawerVisible2: true,
                oneRecordData
            })
        } else if (v === 3) {
            this.setState({
                drawerVisible3: true,
                oneRecordData
            })
        }
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
                dataIndex: 'user_name',
                render: (text, record) => {
                    return <div>{text}</div>
                }
            },
            {
                title: '操作',
                width: 75,
                dataIndex: 'operation',
                render: (text, record) => {
                    return (
                        <Button style={{ marginLeft: 10 }} size="small" type='primary' onClick={() => this.openDrawer(record, 2)} >详情</Button>
                    )
                },
            }
        ]
        return <Table
            bordered
            dataSource={this.state.deviceRecords}
            columns={columns}
            pagination={{ pageSize: 5 }}
        />
    }

    /**
     * 当前设备的状态统计饼图
     */
    renderDevicePieView = () => {
        return <PieViewOfOneDeStus pieDeviceId={this.state.pieDeviceId} isShow={this.state.drawerVisible1} />
    }

    /**
     * 当前设备的 采集数据的折线图
     */
    renderCollectionLineView = () => {
        return <LineViewOfCollection deviceId={this.state.pieDeviceId} isShow={this.state.drawerVisible1} />
    }
}

export default EquipmentView;