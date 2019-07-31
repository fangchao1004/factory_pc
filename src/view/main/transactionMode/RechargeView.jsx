import React, { Component } from 'react';
import { Table, Input, Tag, Button, Modal } from 'antd'
import HttpApi from '../../util/HttpApi';
const { Search } = Input;
class RechargeView extends Component {
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
        let data = await this.getAllAcountInfo();
        console.log(data);
        data.map((item, index) => { return item.key = index })
        this.setState({ data })
    }
    getAllAcountInfo = () => {
        return new Promise((resolve, reject) => {
            let result = [];
            let sql = `SELECT * FROM Account`
            HttpApi.obsForss({ sql }, (res) => {
                if (res.data.code === 0) {
                    result = res.data.data
                }
                resolve(result);
            })
        })
    }
    getSomeoneAccountInfo = (v) => {
        return new Promise((resolve, reject) => {
            let result = [];
            let sql = `SELECT * FROM Account WHERE AccountName LIKE '%${v}%' `
            HttpApi.obsForss({ sql }, (res) => {
                if (res.data.code === 0) {
                    result = res.data.data
                }
                resolve(result);
            })
        })
    }
    seachPeopleHandler = async (v) => {
        if (!v) { return }
        let data = await this.getSomeoneAccountInfo(v);
        data.map((item, index) => { return item.key = index })
        this.setState({ data })
    }
    rechargeHandler = (record) => {
        console.log(record);
    }
    render() {
        const columns = [
            {
                title: '姓名',
                dataIndex: 'AccountName',
            },
            {
                title: '账户状态',
                dataIndex: 'AccountStatus',
                render: (text) => {
                    let color = '#2db7f5'
                    if (!text) {
                        color = '#f50'
                    }
                    return <Tag color={color}>{text ? '正常' : '异常'}</Tag>
                }
            },
            // {
            //     title: '账户ID',
            //     dataIndex: 'AccountID',
            // },
            // {
            //     title: '账户编号',
            //     dataIndex: 'AccountNo',
            // },
            // {
            //     title: '卡ID',
            //     dataIndex: 'CardID'
            // },
            // {
            //     title: '补贴余额',
            //     dataIndex: 'SubsidyBalance',
            // },
            {
                title: '账户余额',
                dataIndex: 'CashBalance',
            },
            {
                title: '操作',
                dataIndex: 'actions',
                width: 150,
                render: (text, record) => (
                    <div style={{ textAlign: 'center' }}>
                        <Button size="small" type="primary" onClick={() => { this.rechargeHandler(record) }}>充值</Button></div>
                )
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
                <Modal></Modal>
            </div>
        );
    }
}

export default RechargeView;