import React, { Component } from 'react';
import { Table, Tag } from 'antd'
import HttpApi from '../../util/HttpApi';
import moment from 'moment'
const storage = window.localStorage;
var userinfo;

export default class TransactionViewNew extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            data: [],
            dataCount: 0,
            currentPage: 1,
            currentPageSize: 10,
        }
        userinfo = storage.getItem('userinfo')
    }
    componentDidMount() {
        this.init();
    }
    init = async (record) => {
        this.setState({ loading: true })
        let result = await this.getSomeOneTransactionInfo(JSON.parse(userinfo).name);
        let dataCount = await this.getTransactionCount(JSON.parse(userinfo).name);/// 数据统计
        this.setState({
            dataCount: dataCount[0].count,
            loading: false,
            data: result.map((item, index) => { item.key = index; return item })
        })
    }
    /// 获取数据条数统计
    getTransactionCount = (name) => {
        let sql = `SELECT count(*) as count FROM [Transaction] t
            LEFT JOIN TransactionDetail td
            ON t.TransactionID = td.TransactionID
            LEFT JOIN Account a
            ON t.AccountID = a.AccountID
            WHERE a.AccountName LIKE '%${name}%'`
        return new Promise((resolve, reject) => {
            let result = [];
            HttpApi.obsForss({ sql }, (res) => {
                if (res.data.code === 0) {
                    result = res.data.data
                }
                resolve(result);
            })
        })
    }
    getSomeOneTransactionInfo = (v, param = {}) => {
        return new Promise((resolve, reject) => {
            let result = [];
            HttpApi.getSomeOneTransactionInfo({ ...param, accountName: v }, (res) => {
                if (res.data.code === 0) {
                    result = res.data.data
                }
                resolve(result);
            })
        })
    }
    getNewInfo = async () => {
        // console.log('page:', this.state.currentPage, 'size:', this.state.currentPageSize);
        this.setState({ loading: true })
        let paramObj = { currentPage: this.state.currentPage, pageSize: this.state.currentPageSize };
        let result = await this.getSomeOneTransactionInfo(JSON.parse(userinfo).name, paramObj)
        this.setState({
            loading: false,
            data: result.map((item, index) => { item.key = index; return item })
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
                title: '剩余',
                dataIndex: 'FinalBalance',
            }
        ]
        return (
            <div>
                <h2 style={{ borderLeft: 4, borderLeftColor: "#3080fe", borderLeftStyle: 'solid', paddingLeft: 5, fontSize: 16 }}>个人消费记录</h2>
                <Table
                    loading={this.state.loading}
                    bordered
                    dataSource={this.state.data}
                    columns={columns}
                    pagination={{
                        total: this.state.dataCount,
                        current: this.state.currentPage,
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '50', '80', '100'],
                        onShowSizeChange: (currentPage, pageSize) => {
                            this.setState({ currentPage, currentPageSize: pageSize }, () => {
                                this.getNewInfo()
                            })
                        },
                        onChange: (page) => {
                            this.setState({ currentPage: page }, () => {
                                this.getNewInfo()
                            });
                        },
                    }}
                />
            </div>
        );
    }
}
