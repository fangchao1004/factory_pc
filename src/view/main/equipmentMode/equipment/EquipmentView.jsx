import React, { Component, Fragment } from 'react';
import { Table, Button, Row, Col, Drawer, Icon, message, Popconfirm, Divider, Tag } from 'antd'
import HttpApi from '../../../util/HttpApi';
import AddEquipmentView from './AddEquipmentView';
import UpdateEquipmentView from './UpdateEquipmentView';
import PieViewOfOneDeStus from './PieViewOfOneDeStus';
import OneRecordDetialView from './OneRecordDetialView'
import LineViewOfCollection from './LineViewOfCollection';

var device_status_filter = [{ text: '正常', value: 1 }, { text: '故障', value: 2 }, { text: '待检', value: 3 }];///用于筛选巡检点状态的数据 选项
var device_type_data_filter = []; ///用于筛选巡检点类型的数据 选项
var device_switch_filter = [{ text: '运行', value: 1 }, { text: '停运', value: 0 }];///用于筛选巡检点开停运状态的数据 选项

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
            let sql = `select des.*,dts.name as device_type_name,nfcs.name as nfc_name,
            concat_ws('/',area_1.name,area_2.name,area_3.name) as area_name,
            concat_ws('-',area_1.id,area_2.id,area_3.id) as area_id,
            tmp.newCheckTime
            from devices des
            left join (select * from device_types where effective = 1) dts on dts.id = des.type_id 
            left join (select * from area_3 where effective = 1) area_3 on area_3.id = des.area_id 
            left join (select * from area_2 where effective = 1) area_2 on area_3.area2_id = area_2.id
            left join (select * from area_1 where effective = 1) area_1 on area_2.area1_id = area_1.id 
            left join nfcs on nfcs.id = des.nfc_id
            left join (select rds.device_id,max(rds.checkedAt) newCheckTime from records rds group by rds.device_id) tmp on tmp.device_id = des.id
            where des.effective = 1`
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
            left join (select * from majors where effective = 1) mjs on mjs.id = bugs.major_id 
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
        newValues.status = 3 // 默认设置巡检点为 1正常 3待检 状态
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
        let area3_id = newValues.area_id.split('-')[2];
        newValues.area_id = area3_id;
        HttpApi.updateDeviceInfo({ query: { id: this.state.oneDeviceInfo.id }, update: newValues }, (res) => {
            if (res.data.code === 0) {
                this.setState({ updateEquipmentVisible: false })
                this.init();
                message.success('更新巡检点信息成功');
            } else {
                message.error(res.data.data)
            }
        })
    }
    updateEquipmentCancel = () => {
        this.setState({ updateEquipmentVisible: false })
    }
    deleteEquipmentConfirm = (record) => {
        // console.log('确定删除 某个巡检点:', record.id);
        HttpApi.obs({ sql: `update devices set effective = 0 where id = ${record.id} ` }, (data) => {
            if (data.data.code === 0) {
                /// 删除某个巡检点后，还要把对应的设备和时间端映射关系表给删了
                HttpApi.obs({ sql: `UPDATE allowTime_map_device SET effective = 0 where device_id = ${record.id}` }, (res) => {
                    if (res.data.code === 0) {
                        let sql = `update sche_cyc_map_device set effective = 0 where device_id = ${record.id}`
                        HttpApi.obs({ sql }, (res) => {
                            if (res.data.code === 0) {
                                message.success('删除巡检点成功')
                                this.init();
                            }
                        })
                    }
                })
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
                sorter: (a, b) => {
                    return a.name.charCodeAt(0) - b.name.charCodeAt(0)
                },
                render: (text, record) => (
                    <div>{text}</div>
                )
            },
            {
                title: '具体巡检点范围',
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
                title: '运/停',
                dataIndex: 'switch',
                width: 80,
                filters: device_switch_filter,
                align: 'center',
                onFilter: (value, record) => record.switch === value,
                render: (text, record) => {
                    return <div>{text === 0 ? '停运' : '运行'}</div>
                }
            },
            {
                title: '巡检时间 (或 状态更新时间)',
                dataIndex: 'newCheckTime',
                sorter: (a, b) => {
                    return new Date(a.newCheckTime).getTime() - new Date(b.newCheckTime).getTime()
                },
                defaultSortOrder: 'descend',
                render: (text, record) => {
                    return <div>{text || '/'}</div>
                }
            },
            {
                title: '记录查询',
                dataIndex: 'actions',
                render: (text, record) => (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Button size="small" type='primary' onClick={() => this.openModalHandler(record)} >查看</Button>
                        {this.state.isAdmin ?
                            <Fragment>
                                <div style={{ borderBottomStyle: 'solid', borderBottomColor: '#D0D0D0', borderBottomWidth: 1, margin: 10 }} />
                                <Button size="small" type='ghost' onClick={() => { this.changeDeviceInfo(record) }} >修改</Button>
                                <div style={{ borderBottomStyle: 'solid', borderBottomColor: '#D0D0D0', borderBottomWidth: 1, margin: 10 }} />
                                <Popconfirm title="确定要删除该巡检点吗?" onConfirm={() => { this.deleteEquipmentConfirm(record) }}>
                                    <Button size="small" type="danger">删除</Button>
                                </Popconfirm>
                            </Fragment>
                            : null}
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
                    pagination={{
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '50', '80', '100'],
                    }}
                />
                <Drawer
                    title={(
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>巡检点状态历史记录</span>
                            <Icon type="close-circle" theme="twoTone" style={{ fontSize: 20 }}
                                onClick={() => { this.setState({ drawerVisible1: false }) }}
                            />
                        </div>
                    )}
                    placement="left"
                    closable={false}
                    onClose={this.onCloseDrawer}
                    visible={this.state.drawerVisible1}
                    width={document.documentElement.clientWidth / 2}
                >
                    {this.renderDeviceRecordsView()}
                    <Divider orientation="left"></Divider>
                    {this.renderDevicePieView()}
                    <Divider orientation="left"></Divider>
                    {this.renderCollectionLineView()}
                    <Drawer
                        title={<div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', }}>
                            <span>当次巡检记录</span>
                            <span>{this.state.oneRecordData.checkedAt}</span>
                        </div>}
                        placement="left"
                        width={document.documentElement.clientWidth / 2}
                        closable={false}
                        destroyOnClose
                        onClose={this.closeDrawer2}
                        visible={this.state.drawerVisible2}
                    >
                        <OneRecordDetialView renderData={this.state.oneRecordData} />
                    </Drawer>
                </Drawer>
                <Drawer
                    title={<div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', }}>
                        <span>最新记录</span>
                        <span>{this.state.oneRecordData.checkedAt}</span>
                    </div>}
                    placement="right"
                    width={document.documentElement.clientWidth / 2}
                    closable={false}
                    destroyOnClose
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
        ///获取该巡检点，数据库中最近的一条records 记录
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
    ///查询某个巡检点的所有record记录数据
    openModalHandler = async (record) => {
        ///查询数据库中某个巡检点的所有record记录
        let OneDeviceAllRecords = await HttpApi.getOneDeviceAllRecords(record.id);
        OneDeviceAllRecords.map((item) => item.key = item.id + '')
        ///获取了当前的巡检点id
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
    ///2 左边的二级抽屉，显示该巡检点任意一次的record记录 
    ///3 右边的独立的一级抽屉，显示该巡检点最新一次的record记录 
    openDrawer = async (record, v) => {
        if (v === 2) {
            this.setState({
                drawerVisible2: true,
                oneRecordData: record
            })
        } else if (v === 3) {
            this.setState({
                drawerVisible3: true,
                oneRecordData: record
            })
        }
    }
    renderDeviceRecordsView = () => {
        const columns = [
            {
                title: '巡检时间',
                dataIndex: 'checkedAt',
                render: (text, record) => (
                    <div>{text || '/'}</div>
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
                title: '运/停',
                dataIndex: 'switch',
                width: 80,
                filters: device_switch_filter,
                align: 'center',
                onFilter: (value, record) => record.switch === value,
                render: (text, record) => {
                    return <div>{text === 0 ? '停运' : '运行'}</div>
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
            pagination={{
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50', '80', '100'],
            }}
        />
    }

    /**
     * 当前巡检点的状态统计饼图
     */
    renderDevicePieView = () => {
        return <PieViewOfOneDeStus pieDeviceId={this.state.pieDeviceId} isShow={this.state.drawerVisible1} />
    }

    /**
     * 当前巡检点的 采集数据的折线图
     */
    renderCollectionLineView = () => {
        return <LineViewOfCollection deviceId={this.state.pieDeviceId} isShow={this.state.drawerVisible1} />
    }
}

export default EquipmentView;