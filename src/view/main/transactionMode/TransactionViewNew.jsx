import React, { Component } from 'react';
import { Table, Tag, Input, Button, message, Drawer } from 'antd'
import HttpApi from '../../util/HttpApi';
import moment from 'moment'
const { Search } = Input;
const storage = window.localStorage;
var level_filter = [];///用于筛选任务专业的数据 选项
var userinfo;

export default class TransactionView1 extends Component {
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
        this.initOtherConfigData();
    }
    initOtherConfigData = async () => {
        let filterData = await this.getTransactionType();
        // console.log('filterData:', filterData);
        let tempList = [];
        filterData.forEach((item) => {
            if (item.text && item.value) { tempList.push(item) }
        })
        this.setState({ filterData: tempList })
    }
    getTransactionType = () => {
        return new Promise((resolve, reject) => {
            let result = [];
            let sql = `SELECT DISTINCT td.TransactionDesc text,td.TransactionType value FROM [Transaction] t
            LEFT JOIN TransactionDetail td
            ON t.TransactionID = td.TransactionID`
            HttpApi.obsForss({ sql }, (res) => {
                if (res.data.code === 0) {
                    result = res.data.data
                }
                resolve(result);
            })
        })
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
    openDrawn = async (record) => {
        let result = await this.getSomeOneTransactionInfo(record.name);
        // console.log('result:', result);
        this.setState({
            showDrawer: true,
            data: result.map((item, index) => { item.key = index; return item })
        })
    }
    getSomeOneTransactionInfo = (v) => {
        return new Promise((resolve, reject) => {
            let result = [];
            HttpApi.getSomeOneTransactionInfo({ accountName: v }, (res) => {
                if (res.data.code === 0) {
                    result = res.data.data
                }
                resolve(result);
            })
        })
    }
    renderDrawer = () => {
        const columns = [
            {
                title: '消费时间',
                dataIndex: 'TransactionTime',
                sorter: (a, b) => {
                    let remain_time = moment(a.TransactionTime).toDate().getTime() - moment(b.TransactionTime).toDate().getTime();
                    return remain_time
                },
                defaultSortOrder: 'descend',
                render: (text) => {
                    return moment(text).utcOffset(0).format('YYYY-MM-DD HH:mm:ss');
                }
            },
            {
                title: '姓名',
                dataIndex: 'AccountName',
            },
            {
                title: '消费类型',
                dataIndex: 'TransactionDesc',
                filters: this.state.filterData,
                onFilter: (value, record) => record.TransactionType[1] === value,
                render: (text, record) => {
                    let color = '#2db7f5'
                    if (record.Increase) {
                        color = '#87d068'
                    }
                    return <Tag color={color}>{text}</Tag>
                }
            },
            {
                title: '消费金额',
                dataIndex: 'ActualTransactionAmount',
                render: (text, record) => {
                    let str = '-'
                    if (record.Increase) {
                        str = '+'
                    }
                    return <div>{str + text}</div>
                }
            },
            {
                title: '剩余',
                dataIndex: 'FinalBalance',
            }
        ]
        return <Table
            bordered
            dataSource={this.state.data}
            columns={columns}
        />
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
                        <Button size="small" type='primary' onClick={() => { this.openDrawn(record) }}>查看消费记录</Button>
                    </div>
                )
            }
        ]
        return (
            <div>
                {userinfo && JSON.parse(userinfo).isadmin ?
                    <div>
                        <h2 style={{ borderLeft: 4, borderLeftColor: "#3080fe", borderLeftStyle: 'solid', paddingLeft: 5, fontSize: 16 }}>员工消费记录</h2>
                        <Search style={{ width: 400 }} allowClear placeholder="支持姓名模糊查询" onSearch={value => this.onSearch(value)} onChange={e => this.onChange(e.currentTarget.value)} enterButton />
                    </div> :
                    <h2 style={{ borderLeft: 4, borderLeftColor: "#3080fe", borderLeftStyle: 'solid', paddingLeft: 5, fontSize: 16 }}>个人消费记录</h2>
                }
                <Table
                    style={{ marginTop: 20 }}
                    bordered
                    dataSource={this.state.users}
                    columns={columns}
                />
                <Drawer
                    title="个人消费记录"
                    placement='left'
                    visible={this.state.showDrawer}
                    onClose={() => { this.setState({ showDrawer: false }) }}
                    width={650}
                >
                    {this.renderDrawer()}
                </Drawer>
            </div>
        );
    }
}
