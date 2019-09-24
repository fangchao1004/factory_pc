import React, { Component } from 'react';
import { Table, Button, Popconfirm, Divider, Tag, message } from 'antd';
import HttpApi from '../../util/HttpApi';
import moment from 'moment'
import uuidv1 from 'uuid/v1'
const storage = window.localStorage;
var userinfo;
var foodresult = [];
const status_filter = [{ text: '待审批', value: 0 }, { text: '通过', value: 1 }, { text: '拒绝', value: 2 }]
/**
 * 消费审批界面
 */
class ApproveTrans extends Component {
    constructor(props) {
        super(props);
        this.state = { data: [], loading: false }
        userinfo = storage.getItem('userinfo')
    }
    componentDidMount() {
        this.init();
    }
    init = async () => {
        let result = await this.getApplyRecordsInfo();
        foodresult = await this.getFoodsInfo();
        this.setState({ data: result.map((item, index) => { item.key = index; return item }) })
    }
    getFoodsInfo = () => {
        return new Promise((resolve, reject) => {
            let sql = `select * from foods`
            HttpApi.obs({ sql }, (res) => {
                let result = [];
                if (res.data.code === 0) { result = res.data.data }
                resolve(result);
            })
        })
    }
    getApplyRecordsInfo = () => {
        return new Promise((resolve, reject) => {
            let sql = `select applyRecords.*,u1.name apply_name,u2.name approve_name,levels.name level_name from applyRecords
            left join users u1 on u1.id = applyRecords.apply_id
            left join users u2 on u2.id = applyRecords.approve_id
            left join levels on levels.id = u1.level_id
            order by applyRecords.id desc`
            HttpApi.obs({ sql }, (res) => {
                let result = [];
                if (res.data.code === 0) { result = res.data.data }
                resolve(result);
            })
        })
    }
    okHandler = async (record) => {
        this.setState({ loading: true })
        this.updateCardAndTranHandler(record);
    }
    refuseHandler = async (record) => {
        let result = await this.updateHandler(2, record.id);
        if (result === 0) { message.success('审批成功-申请驳回'); this.init() } else { message.error('操作失败') }
    }
    /**
     * 更新card表数据
     */
    updateCardAndTranHandler = async (record) => {
        let cardName = record.level_name + '餐卡';
        let add_price = record.total_price;
        // console.log('审批通过，修改对应卡的金额', cardName, add_price);
        let accountResult = await this.getAccount(cardName);///朱桂庭 cardName 根据cardName 去找对应的账户信息
        if (accountResult.length > 0) {
            let cardID = accountResult[0].CardID;
            let cardResult = await this.getCard(cardID);
            let AccountID = accountResult[0].AccountID;
            let old_balance = cardResult[0].Balance;
            let finally_balance = cardResult[0].Balance + add_price;
            let chargeResultcard = await this.updateCardHandler(cardResult[0], finally_balance);/// 改变的是card的数据；
            let chargeResultaccount = await this.updateAccountCash(AccountID, finally_balance);///还要改变 Account账户中的 现金余额项。（）。金额要和Card 中和 TransactionDetail交易详情中 三者一致
            if (chargeResultcard === 0 && chargeResultaccount === 0) {/// Card表 和 Account表 中 数据已经改变好了，然后改变 Transaction 表
                let transactionID = await this.insertTranGetTranID(cardResult[0]);
                // console.log('transactionID:', transactionID);
                if (transactionID) {/// 如果插入成功，获取 TransactionID
                    let data = {};
                    data.TransactionID = transactionID;/// 交易id
                    data.Balance = old_balance;///交易前余额
                    data.RequestTransactionAmount = add_price;///预计交易额
                    data.ActualTransactionAmount = add_price;///实际交易额
                    data.FinalBalance = finally_balance;///交易后的余额
                    data.IsConsumption = 0;///是否为消费
                    data.TransactionWalletType = 2;/// 1现金 2补贴
                    data.Increase = 1;/// 增1/减0
                    data.TransactionTime = moment().format("YYYY-MM-DDTHH:mm:ss.SSS") + 'Z';///交易时间
                    data.CreateTime = cardResult[0].CreateTime;
                    // data.TransactionType = 528;
                    // data.TransactionDesc = '单位补贴';
                    data.TransactionType = 272;
                    data.TransactionDesc = '现金充值';
                    // console.log('data:', data);
                    let result = await this.insertTranDetail(data);///插入 消费详情表
                    if (result === 0) {
                        message.success('餐卡补贴已经发放成功!');
                        this.updateHandler(1, record.id);
                        let result = await this.updateHandler(1, record.id);
                        if (result === 0) { this.init(); } else { message.error('申请记录状态操作失败') }
                    } else {
                        message.error('餐卡补贴已经发放失败!');
                    }
                    this.setState({ loading: false })
                }
            } else {
                message.error('餐卡金额或账户金额更新失败');
                this.setState({ loading: false })
            }
        } else {
            message.error('未查询到对应部门的餐卡-请先添加对应餐卡');
            this.setState({ loading: false })
        }
    }
    /**
     * 更新Card表
     */
    updateCardHandler = (card, finally_balance) => {
        let chargeTime = moment().format("YYYY-MM-DDTHH:mm:ss.SSS") + 'Z'
        return new Promise((resolve, reject) => {
            let sql = `UPDATE Card SET Balance = ${finally_balance},
            UpdateTime = '${chargeTime}',
            LastRechargeTime = '${chargeTime}'  WHERE CardID = ${card.CardID}`;
            HttpApi.obsForss({ sql }, (res) => {
                resolve(res.data.code);
            })
        })
    }
    /**
     * 更新Account表
     */
    updateAccountCash = (AccountID, CashBalance) => {
        return new Promise((resolve, reject) => {
            let sql = `UPDATE Account SET CashBalance = ${CashBalance}
            WHERE AccountID = ${AccountID}`;
            HttpApi.obsForss({ sql }, (res) => {
                resolve(res.data.code);
            })
        })
    }
    /**
     * 插入 Transaction 表，并获取新增的 主键 TransactionID,作为 插入 TransactionDetail表的 TransactionID 参数
     */
    insertTranGetTranID = (cardInfo) => {///插入交易表获取交易表的id,再进行交易详情表的插入
        return new Promise((resolve, reject) => {
            let result = null;
            let sql = `INSERT INTO [Transaction] (TransactionNumber,TransactionType,AccountID,CardID,ClientType,CardNo,CardLevelID,CardLevelName) 
            VALUES('${uuidv1()}',2,${cardInfo.AccountID},${cardInfo.CardID},0,${cardInfo.CardNo},${cardInfo.LevelID},'${cardInfo.LevelName}') 
            select @@identity`///插入一条数据后获取该数据的主键select @@identity
            HttpApi.obsForss({ sql }, (res) => {
                if (res.data.code === 0) {
                    result = res.data.data[0][''];
                }
                resolve(result);
            })
        })
    }
    /**
     * 插入 TransactionDetail表
     */
    insertTranDetail = (data) => {///插入交易表获取交易表的id,再进行交易详情表的插入
        return new Promise((resolve, reject) => {
            let sql = `INSERT INTO [TransactionDetail] (TransactionID,Balance,RequestTransactionAmount,ActualTransactionAmount,FinalBalance,IsConsumption,TransactionWalletType,Increase,TransactionTime,CreateTime,TransactionType,TransactionDesc) 
            VALUES( ${data.TransactionID},${data.Balance},${data.RequestTransactionAmount},${data.ActualTransactionAmount},${data.FinalBalance},${data.IsConsumption},${data.TransactionWalletType},${data.Increase},'${data.TransactionTime}','${data.CreateTime}',${data.TransactionType},'${data.TransactionDesc}') `
            HttpApi.obsForss({ sql }, (res) => {
                resolve(res.data.code);
            })
        })
    }
    getCard = (cardID) => {
        return new Promise((resolve, reject) => {
            let result = [];
            let sql = `SELECT * FROM Card where cardID = '${cardID}' `
            HttpApi.obsForss({ sql }, (res) => {
                if (res.data.code === 0) {
                    result = res.data.data
                }
                resolve(result);
            })
        })
    }
    /**
     * 根据 名称 来查询对应的账户
     */
    getAccount = (name) => {
        return new Promise((resolve, reject) => {
            let result = [];
            let sql = `SELECT * FROM Account where AccountName = '${name}' `
            HttpApi.obsForss({ sql }, (res) => {
                if (res.data.code === 0) {
                    result = res.data.data
                }
                resolve(result);
            })
        })
    }
    /**
     * 更新xiaomu数据库中 applyRecords 的值
     */
    updateHandler = (status, id) => {
        return new Promise((resolve, reject) => {
            let sql = `UPDATE applyRecords SET status=${status}, approve_id=${JSON.parse(storage.getItem('userinfo')).id}, approve_time='${moment().format('YYYY-MM-DD HH:mm:ss')}'
            where id = ${id}`
            HttpApi.obs({ sql }, (res) => {
                resolve(res.data.code)
            })
        })
    }

    render() {
        const columns = [
            {
                title: '申请时间',
                dataIndex: 'apply_time',
                sorter: (a, b) => {
                    let remain_time = moment(a.apply_time).toDate().getTime() - moment(b.apply_time).toDate().getTime();
                    return remain_time
                },
                defaultSortOrder: 'descend',
            },
            {
                title: '申请人',
                dataIndex: 'apply_name',
            },
            {
                title: '所属部门',
                dataIndex: 'level_name',
                render: (text) => {
                    return <div>
                        {text ? text : '/'}
                    </div>
                }
            },
            {
                title: '人数',
                dataIndex: 'people_count',
            },
            {
                title: '消费类型',
                dataIndex: 'type',
                render: (text) => {
                    let list = text.split(',');
                    let tempList = [];
                    foodresult.forEach((item) => {
                        list.forEach((ele) => {
                            if (item.id + '' === ele + '') {
                                tempList.push(item.type);
                            }
                        })
                    })
                    return <div>{tempList.join(',')}</div>
                }
            },
            {
                title: '总金额',
                dataIndex: 'total_price',
            },
            {
                title: '具体事由',
                dataIndex: 'remark',
            },
            {
                title: '当前状态',
                dataIndex: 'status',
                filters: status_filter,
                onFilter: (value, record) => record.status === value,
                render: (text) => {
                    let color = '#888888';
                    let str = '待审批'
                    if (text === 1) { color = '#87d068'; str = '通过' } else if (text === 2) { color = '#f50'; str = '拒绝' }
                    return <div>
                        <Tag color={color}>{str}</Tag>
                    </div>
                }
            },
            {
                title: '审批人',
                dataIndex: 'approve_name',
                render: (text) => {
                    return <div>
                        {text ? text : '/'}
                    </div>
                }
            },
            {
                title: '审批时间',
                dataIndex: 'approve_time',
                render: (text) => {
                    return <div>
                        {text ? text : '/'}
                    </div>
                }
            }]
        const operationObj = {
            title: '操作',
            width: 180,
            render: (text, record) => {
                return <div>
                    <Popconfirm disabled={record.status !== 0} title="确认审批通过吗?" onConfirm={() => { this.okHandler(record) }}>
                        <Button disabled={record.status !== 0} type={'primary'}>通过</Button>
                    </Popconfirm>
                    <Divider type="vertical" />
                    <Popconfirm disabled={record.status !== 0} title="确认拒绝吗?" onConfirm={() => { this.refuseHandler(record) }}>
                        <Button disabled={record.status !== 0} type={'danger'}>拒绝</Button>
                    </Popconfirm>
                </div>
            }
        }
        if (JSON.parse(userinfo).permission.indexOf('2') !== -1) {
            columns.push(operationObj);
        }
        return (
            <div>
                <h2 style={{ borderLeft: 4, borderLeftColor: "#3080fe", borderLeftStyle: 'solid', paddingLeft: 5, fontSize: 16 }}>申请记录</h2>
                <Table
                    loading={this.state.loading}
                    style={{ marginTop: 20 }}
                    bordered
                    dataSource={this.state.data}
                    columns={columns}
                />
            </div>
        );
    }
}

export default ApproveTrans;