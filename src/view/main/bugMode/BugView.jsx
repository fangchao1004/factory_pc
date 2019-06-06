import React, { Component } from 'react';
import { Table, Tag, Modal } from 'antd'
import HttpApi, { Testuri } from '../../util/HttpApi'
import moment from 'moment'

let needSeachDeviceIdArr = [];
let needSeachUserIdArr = [];
let devicesInfoArr = [];
let usersInfoArr = [];
let areaInfoArr = [];
export default class BugView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            showModal: false,
            imguuid: null
        }
    }
    componentDidMount() {
        this.init();
    }
    init = async () => {
        needSeachDeviceIdArr.length = 0;
        needSeachUserIdArr.length = 0;
        let bugsInfo = await this.getBugInfo();
        devicesInfoArr = await this.getDeviceInfo();
        usersInfoArr = await this.getUserInfo();
        areaInfoArr = await this.getAreaInfo();
        let finallyData = this.linkTwoData(bugsInfo);
        console.log(finallyData);
        this.setState({
            data: finallyData
        })
    }
    linkTwoData = (bugsInfoArr) => {
        bugsInfoArr.forEach((item) => {
            let deviceInfo = this.findDeviceName(item);
            item.device_name = deviceInfo.device_name;
            item.user_name = this.findUserName(item);
            item.area_name = this.findAreaName(deviceInfo.area_id);
        })
        return bugsInfoArr
    }
    findAreaName = (areaId) => {
        let result = '';
        areaInfoArr.forEach((area) => {
            if (area.id === areaId) { result = area.name }
        })
        return result;
    }
    findUserName = (item) => {
        let result = '';
        usersInfoArr.forEach((user) => {
            if (user.id === item.user_id) { result = user.name }
        })
        return result;
    }
    findDeviceName = (item) => {
        let result = '';
        devicesInfoArr.forEach((device) => {
            if (device.id === item.device_id) { result = { 'device_name': device.name, 'area_id': device.area_id } }
        })
        return result;
    }

    getBugInfo = () => {
        return new Promise((resolve, reject) => {
            let result = [];
            HttpApi.getBugInfo({}, (res) => {
                if (res.data.code === 0 && res.data.data) {
                    let tempArr = JSON.parse(JSON.stringify(res.data.data))
                    tempArr.forEach((item) => {
                        item.key = item.id + ''
                        if (item.device_id !== null && needSeachDeviceIdArr.indexOf(item.device_id) === -1) {
                            needSeachDeviceIdArr.push(item.device_id);
                        }
                        if (item.user_id !== null && needSeachUserIdArr.indexOf(item.user_id) === -1) {
                            needSeachUserIdArr.push(item.user_id);
                        }
                        if (item.fixed_user_id !== null && needSeachUserIdArr.indexOf(item.fixed_user_id) === -1) {
                            needSeachUserIdArr.push(item.user_id);
                        }
                    })
                    result = tempArr;
                }
                resolve(result);
            })
        })
    }
    getDeviceInfo = () => {
        return new Promise((resolve, reject) => {
            let result = [];
            HttpApi.getDeviceInfo({ id: needSeachDeviceIdArr }, (res) => {
                if (res.data.code === 0 && res.data.data) {
                    result = res.data.data;
                }
                resolve(result)
            })
        })

    }
    getUserInfo = () => {
        return new Promise((resolve, reject) => {
            let result = [];
            HttpApi.getUserInfo({ id: needSeachUserIdArr }, (res) => {
                if (res.data.code === 0 && res.data.data) {
                    result = res.data.data;
                }
                resolve(result)
            })
        })
    }
    getAreaInfo = () => {
        return new Promise((resolve, reject) => {
            let result = [];
            HttpApi.getAreainfo({}, (res) => {
                if (res.data.code === 0 && res.data.data) {
                    result = res.data.data;
                }
                resolve(result)
            })
        })
    }

    render() {
        const columns = [
            {
                key: 'createdAt', dataIndex: 'createdAt', title: '时间', width: 190,
                sorter: (a, b) => {
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                },
                defaultSortOrder: 'descend',
                render: (text, record) => { return <div>{moment(text).format('YYYY-MM-DD HH:mm:ss')}</div> }
            },
            {
                key: 'device_name', dataIndex: 'device_name', title: '设备', width: 120, render: (text) => {
                    let result = '/'
                    if (text && text !== '') { result = text }
                    return <div>{result}</div>
                }
            },
            { key: 'user_name', dataIndex: 'user_name', title: '上报人', width: 80 },
            // { key: 'status', dataIndex: 'status', title: '状态', width: 80 },
            {
                key: 'area_remark', dataIndex: 'area_remark', title: '区域', width: 100, render: (text, record) => {
                    let result = '/'
                    if (text) { result = text }
                    else { result = record.area_name }
                    return <div>{result}</div>
                }
            },
            {
                key: 'buglevel', dataIndex: 'buglevel', title: '等级', width: 80, render: (text) => {
                    let result = null;
                    let resultCom = '/'
                    let color = '#505659';
                    if (text) {
                        if (text === 1) { result = '一级'; color = '#f50' }
                        else if (text === 2) { result = '二级'; color = '#FF9900' }
                        else if (text === 3) { result = '三级'; color = '#87d068' }
                        resultCom = <Tag color={color}>{result}</Tag>
                    }
                    return <div>{resultCom}</div>
                }
            },
            {
                key: 'content', dataIndex: 'content', title: '内容', render: (text) => {
                    let obj = JSON.parse(text);
                    return <div><div>{obj.select}</div><div>{obj.text}</div></div>
                }
            },
            {
                key: 'img', dataIndex: 'content', title: '图片', render: (text) => {
                    let obj = JSON.parse(text);
                    let imgs_arr = JSON.parse(JSON.stringify(obj.imgs));
                    let result_arr = [];
                    imgs_arr.forEach((item, index) => {
                        result_arr.push({ key: index + item, name: ('图片' + (index + 1)), uuid: item });
                    })
                    let comArr = [];
                    result_arr.forEach((item, index) => {
                        comArr.push(<span key={item.uuid} style={{ color: '#438ef7', marginRight: 10, cursor: "pointer" }}
                            onClick={e => {
                                this.setState({
                                    imguuid: item.uuid,
                                    showModal: true
                                })
                            }}>{item.name}</span>)
                    });
                    let result = '/'
                    if (comArr.length > 0) { result = comArr }
                    return <div>{result}</div>
                }
            }
        ]
        return (
            <div>
                <Table
                    bordered
                    dataSource={this.state.data}
                    columns={columns}
                />
                <Modal
                    title="图片查看"
                    visible={this.state.showModal}
                    onCancel={() => { this.setState({ showModal: false }) }}
                    footer={null}
                    width={500}
                >
                    <img alt='' src={Testuri + 'get_jpg?uuid=' + this.state.imguuid} style={{ width: 450, height: 600 }} />
                </Modal>
            </div>
        );
    }
}
