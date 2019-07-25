import React, { Component } from 'react';
import { Table, Tag, Input } from 'antd'
import HttpApi from '../../util/HttpApi';
import moment from 'moment'
const { Search } = Input;

export default class TransactionView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            filterData: []
        }
    }
    componentDidMount() {
        this.init();
        this.initOtherConfigData();
    }
    initOtherConfigData = async () => {
        let filterData = await this.getTransactionType();
        this.setState({ filterData })
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
        let data = await this.getAllTransactionInfo();
        data.map((item, index) => { return item.key = index })
        this.setState({ data })
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
                    return moment(text).format('YYYY-MM-DD HH:mm:ss');
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
                title: '卡内余额',
                dataIndex: 'FinalBalance',
            }
        ]
        return (
            <div>
                <Search
                    style={{ width: '40%', marginBottom: 20 }}
                    placeholder="支持人员姓名模糊查询"
                    enterButton="搜索"
                    size="large"
                    allowClear
                    onSearch={value => this.seachPeopleHandler(value)}
                    onChange={e => { if (e.currentTarget.value === '') { this.init() } }}
                />
                <Table
                    bordered
                    dataSource={this.state.data}
                    columns={columns}
                />
            </div>
        );
    }
}
