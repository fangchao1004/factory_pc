import React, { Component } from 'react'
import { Table, Button, message, Input, Drawer } from 'antd'
import HttpApi from '../../util/HttpApi'
import OneAttendanceView from './OneAttendanceView'
import moment from 'moment'
var level_filter = [];///用于筛选任务专业的数据 选项
const { Search } = Input;
const storage = window.localStorage;
var userinfo;

var OneAttendanceData;
class AttendanceView extends Component {
    constructor(props) {
        super(props);
        this.state = { users: null, drawerVisible: false }
        userinfo = storage.getItem('userinfo')
    }
    componentDidMount() {
        this.getUsersData()
    }
    async getUsersData() {
        level_filter.length = 0;

        let levelData = await this.getLevelInfo();
        levelData.forEach((item) => { level_filter.push({ text: item.name, value: item.id }) })

        var usersData = await this.getUserList()
        this.setState({
            users: usersData.map(user => {
                user.key = user.id
                return user
            })
        })
    }
    getLevelInfo = () => {
        let sqlText = 'select m.id,m.name from levels m where effective = 1'
        return new Promise((resolve, reject) => {
            HttpApi.obs({ sql: sqlText }, (res) => {
                let result = [];
                if (res.data.code === 0) {
                    result = res.data.data
                }
                resolve(result);
            })
        })
    }
    getUserList() {
        return new Promise((resolve, reject) => {
            let sql = `select users.*,levels.name as level_name from users 
            left join levels on levels.id = users.level_id
            where users.effective = 1 ${JSON.parse(userinfo).isadmin === 1 ? '' : "and users.name = '" + JSON.parse(userinfo).name + "'"}
            order by level_id`;
            let result = [];
            HttpApi.obs({ sql }, (res) => {
                if (res.data.code === 0) { result = res.data.data }
                resolve(result);
            })
        })
    }

    onSearch = async (value) => {
        if (value === '') { message.info('请输入有效字符'); return; }
        // console.log('onSearch:', value);
        let usersData = await this.searchUserData(value);
        this.setState({
            users: usersData.map(user => {
                user.key = user.id
                return user
            })
        })
    }
    onChange = async (value) => {
        if (value !== '') { return; }
        var usersData = await this.getUserList()
        if (usersData.length !== this.state.users.length) {
            this.setState({
                users: usersData.map(user => {
                    user.key = user.id
                    return user
                })
            })
        }
    }
    searchUserData(value) {
        return new Promise((resolve, reject) => {
            let sql = `select users.*,levels.name as level_name from users 
            left join levels on levels.id = users.level_id
            where users.effective = 1 and users.name like '%${value}%'
            order by users.level_id`;
            let result = [];
            HttpApi.obs({ sql }, (res) => {
                if (res.data.code === 0) { result = res.data.data }
                resolve(result);
            })
        })
    }
    checkOneHistory = async (record) => {
        // console.log('record:', record);
        let allCount = await this.getAllCount(record.name);
        if (allCount > 0) {
            let lastRecord = await this.getLastRecord(record.name);
            let firstRecord = await this.getFirstRecord(record.name);
            ///相差天数
            let dayCount = (moment(lastRecord.time).utcOffset(0).startOf('day').valueOf() - moment(firstRecord.time).utcOffset(0).startOf('day').valueOf()) / (1000 * 60 * 60 * 24);
            OneAttendanceData = { 'name': record.name, 'show': true, 'lastTime': lastRecord.time, dayCount, 'groupid': record.group_id }
            this.setState({ drawerVisible: true })
        } else {
            message.warn('暂无该用户考勤信息');
        }
    }
    getLastRecord = (name) => {
        return new Promise((resolve, reject) => {
            let sql = `select * from records where name = '${name}' order by id desc limit 1`
            HttpApi.obsForks({ sql }, (res) => {
                let result = [];
                if (res.data.code === 0) {
                    ///获取当前人员的最新一次的打卡时刻
                    result = res.data.data[0];
                }
                resolve(result);
            })
        })
    }
    getFirstRecord = (name) => {
        return new Promise((resolve, reject) => {
            let sql = `select * from records where name = '${name}' limit 1`
            HttpApi.obsForks({ sql }, (res) => {
                let result = [];
                if (res.data.code === 0) {
                    ///获取当前人员的最新一次的打卡时刻
                    result = res.data.data[0];
                }
                resolve(result);
            })
        })
    }
    getAllCount = (name) => {
        return new Promise((resolve, reject) => {
            let sql = `select count(*) count from records where name = '${name}' `
            HttpApi.obsForks({ sql }, (res) => {
                let result = 0;
                if (res.data.code === 0) {
                    result = res.data.data[0].count;
                }
                resolve(result);
            })
        })
    }
    onClose = () => {
        OneAttendanceData = { 'show': false }
        this.setState({ drawerVisible: false })
    }
    render() {
        const columns = [
            {
                title: '姓名',
                dataIndex: 'name',
                render: (text, record) => (
                    <div>{text}</div>
                )
            },
            {
                title: '部门',
                dataIndex: 'level_id',
                filters: level_filter,
                onFilter: (value, record) => record.level_id === value,
                render: (text, record, index) => {
                    if (record.group_id === null) {
                        return {
                            children: <div>{record.level_name}</div>,
                            props: {
                                colSpan: 2,
                            },
                        }
                    }
                    return <div>{record.level_name}</div>;
                }
            },
            {
                title: '组别',
                dataIndex: 'group_id',
                render: (text) => {
                    if (text === null) {
                        return {
                            children: null,
                            props: {
                                colSpan: 0,
                            },
                        }
                    }
                    return <div>{text === 1 ? '甲组' : (text === 2 ? '乙组' : (text === 3 ? '丙组' : '丁组'))}</div>;
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
                        <Button size="small" type="primary" onClick={() => { this.checkOneHistory(record) }} >查看</Button>
                    </div>
                )
            }
        ];


        return (
            <div>
                {userinfo && JSON.parse(userinfo).isadmin ?
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <h2 style={{ borderLeft: 4, borderLeftColor: "#3080fe", borderLeftStyle: 'solid', paddingLeft: 5, fontSize: 16 }}>员工考勤记录</h2>
                        <Search style={{ width: 400 }} allowClear placeholder="支持姓名模糊查询" onSearch={value => this.onSearch(value)} onChange={e => this.onChange(e.currentTarget.value)} enterButton />
                    </div> :
                    <h2 style={{ borderLeft: 4, borderLeftColor: "#3080fe", borderLeftStyle: 'solid', paddingLeft: 5, fontSize: 16 }}>个人考勤记录</h2>
                }
                <Table
                    style={{ marginTop: 10 }}
                    bordered
                    dataSource={this.state.users}
                    columns={columns}
                    pagination={{
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '50', '100'],
                    }}
                />
                <Drawer
                    width={700}
                    title="考勤记录"
                    placement="left"
                    closable={true}
                    onClose={this.onClose}
                    visible={this.state.drawerVisible}
                >
                    <OneAttendanceView {...OneAttendanceData} />
                </Drawer>
            </div >
        )
    }
}

export default AttendanceView;