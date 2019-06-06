import React, { Component } from 'react';
import { Table, Tag } from 'antd'
import HttpApi from '../../util/HttpApi'
import moment from 'moment'
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
            if (text !== '') { result = text }
            return <div>{result}</div>
        }
    },
    { key: 'user_name', dataIndex: 'user_name', title: '上报人', width: 80 },
    // { key: 'status', dataIndex: 'status', title: '状态', width: 80 },
    {
        key: 'area_remark', dataIndex: 'area_remark', title: '区域', width: 100, render: (text) => {
            let result = '/'
            if (text) { result = text }
            return <div>{result}</div>
        }
    },
    {
        key: 'buglevel', dataIndex: 'buglevel', title: '等级', width: 80, render: (text) => {
            let result = null;
            let color = '#505659';
            if (text === 1) { result = '一级'; color = '#f50' }
            else if (text === 2) { result = '二级'; color = '#FF9900' }
            else if (text === 3) { result = '三级'; color = '#87d068' }
            return <Tag color={color}>{result}</Tag>
        }
    },
    {
        key: 'content', dataIndex: 'content', title: '内容', render: (text) => {
            let obj = JSON.parse(text);
            return <div><div>{obj.select}</div><div>{obj.text}</div></div>
        }
    },
    {
        key: 'content', dataIndex: 'content', title: '图片', render: (text) => {
            let obj = JSON.parse(text);
            return <div><div>{obj.imgs}</div></div>
        }
    },
]

let needSeachDeviceIdArr = [];
let needSeachUserIdArr = [];
let devicesInfoArr = [];
let usersInfoArr = [];
export default class BugView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: []
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
        let finallyData = this.linkTwoData(bugsInfo);
        console.log(finallyData);
        this.setState({
            data: finallyData
        })
    }
    linkTwoData = (bugsInfoArr) => {
        bugsInfoArr.forEach((item) => {
            item.device_name = this.findDeviceName(item);
            item.user_name = this.findUserName(item);
        })
        return bugsInfoArr
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
            if (device.id === item.device_id) { result = device.name }
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

    render() {
        return (
            <div>
                <Table
                    bordered
                    size={'small'}
                    dataSource={this.state.data}
                    columns={columns}
                />
            </div>
        );
    }
}
