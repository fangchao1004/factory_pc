import React, { Component } from 'react';
import { Table, Button, Popconfirm, Divider, Tag, message } from 'antd';
import HttpApi from '../../util/HttpApi';
import moment from 'moment'
const storage = window.localStorage;
var foodresult = [];
const status_filter = [{ text: '待审批', value: 0 }, { text: '通过', value: 1 }, { text: '拒绝', value: 2 }]
/**
 * 批准界面
 */
class ApproveTrans extends Component {
    constructor(props) {
        super(props);
        this.state = { data: [] }
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
            let sql = `select applyRecords.*,u1.name apply_name,u2.name approve_name from applyRecords
            left join users u1 on u1.id = applyRecords.apply_id
            left join users u2 on u2.id = applyRecords.approve_id
            order by applyRecords.id desc`
            HttpApi.obs({ sql }, (res) => {
                let result = [];
                if (res.data.code === 0) { result = res.data.data }
                resolve(result);
            })
        })
    }
    okHandler = async (record) => {
        let result = await this.updateHandler(1, record.id);
        if (result === 0) { message.success('审批成功'); this.init(); this.updateCardHandler(); } else { message.error('操作失败') }
    }
    refuseHandler = async (record) => {
        let result = await this.updateHandler(2, record.id);
        if (result === 0) { message.success('审批成功'); this.init() } else { message.error('操作失败') }
    }
    updateCardHandler = () => {
        console.log('审批通过，修改对应卡的金额');
    }
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
            },
            {
                title: '操作',
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
            }]
        return (
            <div>
                <div>
                    <h2 style={{ borderLeft: 4, borderLeftColor: "#3080fe", borderLeftStyle: 'solid', paddingLeft: 5, fontSize: 16 }}>申请记录</h2>
                </div>
                <Table
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