import React, { Component } from 'react';
import { Table, Tag, DatePicker, message } from 'antd'
import HttpApi from '../../util/HttpApi';
import moment from 'moment'
const storage = window.localStorage;
var userinfo;

export default class TransactionView extends Component {
    constructor(props) {
        super(props);
        userinfo = storage.getItem('userinfo')
        this.state = {
            data: [],
            loading: true,
            dataCount: 0,
            currentPage: 1,
            currentPageSize: 10,
            searchName: JSON.parse(userinfo).name,
            nowIsAll: false, /// 当前是否显示的是全部数据
            dateRange: [moment(), moment()],
        }
    }
    componentDidMount() {
        this.setState({ loading: true }, () => { this.init() })
    }
    init = async (param = {}) => {
        param.beginTime = this.state.dateRange[0].startOf('day').format('YYYY-MM-DD HH:mm:ss');
        param.endTime = this.state.dateRange[1].endOf('day').format('YYYY-MM-DD HH:mm:ss')
        param.pageSize = this.state.currentPageSize;
        param.currentPage = this.state.currentPage;
        this.seachPeopleHandler()
    }
    /// 获取数据条数统计
    getTransactionCount = (name = '') => {
        let sql = `SELECT count(*) as count FROM [Transaction] t
            LEFT JOIN TransactionDetail td
            ON t.TransactionID = td.TransactionID
            LEFT JOIN Account a
            ON t.AccountID = a.AccountID
            WHERE a.AccountName LIKE '%${name}%'
            AND td.TransactionTime >'${this.state.dateRange[0].startOf('day').format('YYYY-MM-DD HH:mm:ss')}'
            AND td.TransactionTime <'${this.state.dateRange[1].endOf('day').format('YYYY-MM-DD HH:mm:ss')}'`
        // console.log('name:', sql)
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
        param.beginTime = this.state.dateRange[0].startOf('day').format('YYYY-MM-DD HH:mm:ss');
        param.endTime = this.state.dateRange[1].endOf('day').format('YYYY-MM-DD HH:mm:ss')
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
            nowIsAll: false,
            loading: false
        })
    }
    ///翻页器切换
    getNewInfo = async (page, size) => {
        // console.log(page, size);///获取到最新的page 和 size 状态
        let paramObj = {
            currentPage: this.state.currentPage,
            pageSize: this.state.currentPageSize,
        };
        this.setState({ loading: true })
        if (this.state.searchName === null) { ///如果是管理员 且 现在没有查询的数据 则获取所有的数据
            // console.log('object:', paramObj)
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
                key: 'TransactionTime', dataIndex: 'TransactionTime', title: <div><span style={{ marginRight: 30 }}>时间日期</span></div>,
                render: (text) => { return <div>{moment(text).utcOffset(0).format('YYYY-MM-DD HH:mm:ss')}</div> }
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
            <div style={{ padding: 10, backgroundColor: '#FFFFFF' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h2 style={{ borderLeft: 4, borderLeftColor: "#3080fe", borderLeftStyle: 'solid', paddingLeft: 5, fontSize: 16 }}>消费记录</h2>
                    <DatePicker.RangePicker size='small' disabledDate={this.disabledDate} value={this.state.dateRange} ranges={{
                        '今日': [moment(), moment()],
                        '本月': [moment().startOf('month'), moment().endOf('month')],
                    }} onChange={(v) => {
                        if (v && v.length > 0) { this.setState({ dateRange: v, dataCount: 10, currentPage: 1 }, () => { this.init({}) }) } else { message.warn('请选择日期'); }
                    }} />
                </div>
                <Table
                    size="small"
                    loading={this.state.loading}
                    style={{ marginTop: 10 }}
                    bordered
                    dataSource={this.state.data}
                    columns={columns}
                    pagination={{
                        total: this.state.dataCount,
                        current: this.state.currentPage,
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '50', '100'],
                        onShowSizeChange: (currentPage, pageSize) => { this.setState({ currentPage, currentPageSize: pageSize }, () => { this.getNewInfo(); }); },
                        onChange: (page) => { this.setState({ currentPage: page }, () => { this.getNewInfo(); }) },
                    }}
                />
            </div >
        );
    }
}
