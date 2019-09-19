import React, { Component } from 'react';
import { Table, Input, Button, message } from 'antd'
import HttpApi from '../../util/HttpApi';
const { Search } = Input;
const storage = window.localStorage;
var level_filter = [];///用于筛选任务专业的数据 选项
var userinfo;

export default class RechargeView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            users: [],
            filterData: [],
            showDrawer: false,
            data: []
        }
        userinfo = storage.getItem('userinfo')
    }
    componentDidMount() {
        this.getUsersData();
    }
    getUsersData = async () => {
        level_filter.length = 0;
        let levelData = await this.getLevelInfo();
        levelData.forEach((item) => { level_filter.push({ text: item.name, value: item.id }) })
        var usersData = await this.getUserList();
        this.setState({
            users: usersData.map(user => {
                user.key = user.id
                return user
            }),
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
            where users.effective = 1 ${userinfo && !JSON.parse(userinfo).isadmin ? `and users.name = '${JSON.parse(userinfo).name}' ` : ''}
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
    chargeHandler = (record) => {
        let name = record.name;

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
                    return <div>{record.level_name}</div>;
                }
            },
            {
                title: '操作',
                dataIndex: 'actions',
                width: 150,
                render: (text, record) => (
                    <div style={{ textAlign: 'center' }}>
                        <Button size="small" type='primary' onClick={() => { this.chargeHandler(record) }}>充值</Button>
                    </div>
                )
            }
        ]
        return (
            <div>
                <h2 style={{ borderLeft: 4, borderLeftColor: "#3080fe", borderLeftStyle: 'solid', paddingLeft: 5, fontSize: 16 }}>员工充值</h2>
                <Search style={{ width: 400 }} allowClear placeholder="支持姓名模糊查询" onSearch={value => this.onSearch(value)} onChange={e => this.onChange(e.currentTarget.value)} enterButton />
                <Table
                    style={{ marginTop: 20 }}
                    bordered
                    dataSource={this.state.users}
                    columns={columns}
                />
            </div>
        );
    }
}
