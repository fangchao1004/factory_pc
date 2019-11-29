import React, { Component } from 'react';
import { Table, Tag, Input } from 'antd'
import HttpApi from '../../util/HttpApi';
import moment from 'moment'
const { Search } = Input;
const storage = window.localStorage;
var userinfo;

export default class TransactionView extends Component {
    constructor(props) {
        super(props);
        userinfo = storage.getItem('userinfo')
        this.state = {
            data: [],
            isAdmin: JSON.parse(userinfo).isadmin === 1,
            loading: true,
            dataCount: 0,
            currentPage: 1,
            currentPageSize: 10,
            searchName: null,
            nowIsAll: false, /// 当前是否显示的是全部数据
        }
    }
    componentDidMount() {
        this.setState({ loading: true }, () => { this.init() })
    }
    init = async (param = {}) => {
        let result = await this.getAllTransactionInfo(param); /// 如果你是管理员 那么就获取所有人的数据
        let dataCount = await this.getTransactionCount();/// 数据统计
        this.setState({
            loading: false,
            data: result.map((item, index) => { item.key = index; return item }),
            dataCount: dataCount[0].count, ///获取总数据统计数
            nowIsAll: true,
        })
    }
    /// 获取数据条数统计
    getTransactionCount = (name = '') => {
        let isAll = this.state.isAdmin && !name
        let sql;
        if (isAll) {
            sql = `SELECT count(*) as count from [Transaction]`
        } else {
            sql = `SELECT count(*) as count FROM [Transaction] t
            LEFT JOIN TransactionDetail td
            ON t.TransactionID = td.TransactionID
            LEFT JOIN Account a
            ON t.AccountID = a.AccountID
            WHERE a.AccountName LIKE '%${name}%'`
        }
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
    ///////////////
    ///获取所有消费数据 分页
    getAllTransactionInfo = (param) => {
        return new Promise((resolve, reject) => {
            let result = [];
            HttpApi.getAllTransactionInfo(param, (res) => {
                if (res.data.code === 0) {
                    result = res.data.data
                }
                resolve(result);
            })
        })
    }
    ///获取某个人的消费数据 分页
    getSomeOneTransactionInfo = (param = {}, name) => {
        return new Promise((resolve, reject) => {
            let result = [];
            HttpApi.getSomeOneTransactionInfo({ ...param, accountName: name }, (res) => {
                if (res.data.code === 0) {
                    result = res.data.data
                }
                resolve(result);
            })
        })
    }
    /////////////////
    /// 第一次点击搜索按钮 开始搜索相关人员数据
    seachPeopleHandler = async () => {
        if (!this.state.searchName) { return }
        let dataCount = await this.getTransactionCount(this.state.searchName); /// 获取搜索对象的条数
        let result = await this.getSomeOneTransactionInfo({}, this.state.searchName);
        this.setState({
            data: result.map((item, index) => { item.key = index; return item }),
            currentPage: 1,
            currentPageSize: 10,
            dataCount: dataCount[0].count,
            nowIsAll: false
        })
    }
    ///翻页器切换
    getNewInfo = async (page, size) => {
        // console.log(page, size);///获取到最新的page 和 size 状态
        let paramObj = { currentPage: page, pageSize: size };
        this.setState({ loading: true })
        if (this.state.searchName === null) { ///如果是管理员 且 现在没有查询的数据 则获取所有的数据
            this.init(paramObj) /// init 即是获取所有数据 并且 传入分页参数
        } else { ///如果当前有搜索的关键字  每次翻页
            let result = await this.getSomeOneTransactionInfo(paramObj, this.state.searchName)
            this.setState({
                loading: false,
                data: result.map((item, index) => { item.key = index; return item })
            })
        }
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
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h2 style={{ borderLeft: 4, borderLeftColor: "#3080fe", borderLeftStyle: 'solid', paddingLeft: 5, fontSize: 16 }}>所有消费记录</h2>
                    <Search
                        style={{ width: '40%' }}
                        placeholder="支持人员姓名模糊查询"
                        enterButton="搜索"
                        allowClear
                        onSearch={value => { this.setState({ searchName: value }, () => { this.seachPeopleHandler() }); }}
                        onChange={e => {
                            if (e.currentTarget.value === '') {
                                this.setState({
                                    searchName: null,
                                    loading: true,
                                    currentPage: 1,
                                    currentPageSize: 10,
                                }, () => { this.init() });
                            }
                        }}
                    />
                </div>
                <Table
                    loading={this.state.loading}
                    style={{ marginTop: 20 }}
                    bordered
                    dataSource={this.state.data}
                    columns={columns}
                    pagination={{
                        total: this.state.dataCount,
                        current: this.state.currentPage,
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '50', '80', '100'],
                        onShowSizeChange: (currentPage, pageSize) => { this.setState({ currentPage, currentPageSize: pageSize }); this.getNewInfo(currentPage, pageSize) },
                        onChange: (page) => { this.setState({ currentPage: page }); this.getNewInfo(page, this.state.currentPageSize); },
                    }}
                />
            </div >
        );
    }
}
