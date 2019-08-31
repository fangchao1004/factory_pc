import React, { Component } from 'react'
import { Table, Button, message, Input } from 'antd'
import HttpApi from '../../util/HttpApi'
var level_filter = [];///用于筛选任务专业的数据 选项
const { Search } = Input;

class AttendanceView extends Component {

    state = { users: null }

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
            where users.effective = 1
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
    checkOneHistory = (record) => {
        console.log('record:', record);
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
                <Search style={{ width: 400 }} allowClear placeholder="支持姓名模糊查询" onSearch={value => this.onSearch(value)} onChange={e => this.onChange(e.currentTarget.value)} enterButton />
                <Table
                    style={{ marginTop: 20 }}
                    bordered
                    dataSource={this.state.users}
                    columns={columns}
                />
            </div>
        )
    }
}

export default AttendanceView;