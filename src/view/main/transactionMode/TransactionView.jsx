import React, { Component } from 'react';
import { Table, Tag, Input } from 'antd'
import HttpApi from '../../util/HttpApi';
import moment from 'moment'
const { Search } = Input;
const storage = window.localStorage;
var userinfo = storage.getItem('userinfo')

export default class TransactionView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            filterData: [],
            isAdmin: false
        }
    }
    componentDidMount() {
        this.init();
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
    init = async () => {
        userinfo = storage.getItem('userinfo')
        let isAdmin = JSON.parse(userinfo).isadmin === 1;
        let data = [];
        if (isAdmin) {
            data = await this.getAllTransactionInfo();
        } else {
            data = await this.getSomeOneTransactionInfo(JSON.parse(userinfo).name);
        }
        data.map((item, index) => { return item.key = index })
        this.setState({ data, isAdmin })
    }
    getAllTransactionInfo = () => {
        return new Promise((resolve, reject) => {
            let result = [];
            HttpApi.getAllTransactionInfo({}, (res) => {
                if (res.data.code === 0) {
                    result = res.data.data
                }
                resolve(result);
            })
        })
    }
    seachPeopleHandler = async (v) => {
        if (!v) { return }
        let data = await this.getSomeOneTransactionInfo(v);
        data.map((item, index) => { return item.key = index });
        this.setState({ data })
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


    render() {
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
                title: '账户余额 / 补贴余额',
                dataIndex: 'FinalBalance',
            }
        ]
        return (
            <div>
                {userinfo && JSON.parse(userinfo).isadmin ?
                    <div>
                        <h2 style={{ borderLeft: 4, borderLeftColor: "#3080fe", borderLeftStyle: 'solid', paddingLeft: 5, fontSize: 16 }}>员工消费记录</h2>
                        <Search
                            style={{ width: '40%', marginBottom: 20 }}
                            placeholder="支持人员姓名模糊查询"
                            enterButton="搜索"
                            allowClear
                            onSearch={value => this.seachPeopleHandler(value)}
                            onChange={e => { if (e.currentTarget.value === '') { this.init() } }}
                        />
                    </div> :
                    <h2 style={{ borderLeft: 4, borderLeftColor: "#3080fe", borderLeftStyle: 'solid', paddingLeft: 5, fontSize: 16 }}>个人消费记录</h2>
                }
                <Table
                    bordered
                    dataSource={this.state.data}
                    columns={columns}
                />
            </div>
        );
    }
}
