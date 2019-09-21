import React, { Component } from 'react';
import { Table, Input, Button, message, Modal, InputNumber, Row, Col } from 'antd'
import HttpApi from '../../util/HttpApi';
const { Search } = Input;
const storage = window.localStorage;
var level_filter = [];///用于筛选任务专业的数据 选项
var userinfo;
var allIds = [];
export default class RechargeView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            users: [],
            filterData: [],
            selectedRowKeys: [], ///选择的人员 id数组
            selectNames: [],///选择的人员 姓名数组
            chargeNumber: 1,///初始化充值的数值
            loading: false,
        }
        userinfo = storage.getItem('userinfo')
    }
    componentDidMount() {
        this.getUsersData();

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
        allIds = usersData.map((item) => item.id)
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
    getUserIdList() {
        return new Promise((resolve, reject) => {
            let sql = `select users.id from users 
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

    /**
     * 批量充值
     */
    chargeSomeHandler = () => {
        let selectIds = this.state.selectedRowKeys;
        let selectNames = [];
        selectIds.forEach((id) => {
            this.state.users.forEach((item) => {
                if (item.id === id) { selectNames.push(item.name) }
            })
        })
        this.setState({ selectNames, visible: true });
    }
    onSelectChange = selectedRowKeys => {
        this.setState({ selectedRowKeys });
    };
    /**
     * 确认 充值
     */
    handleOk = async () => {
        // console.log(this.state.selectNames, this.state.chargeNumber);
        this.setState({ loading: true, visible: false })
        let accountResult = await this.getSomeAccount(this.state.selectNames);///朱桂庭 cardName 根据cardName 去找对应的账户信息
        let noExistList = this.findNoExistList(this.state.selectNames, accountResult)
        console.log('选中的人中，不存在对应账户的人是:', noExistList);
        console.log('找到这些存在的人:', accountResult);
        
    }
    /**
     * 找出不存在的名称 提醒用户，这些人员无法充值。
     */
    findNoExistList = (oldnameList, resultList) => {
        let noExistList = [];
        for (let index = 0; index < oldnameList.length; index++) {
            const oldname = oldnameList[index];
            resultList.forEach(result => {
                if (oldname === result.AccountName) {
                    oldnameList[index] = null
                }
            });
        }
        oldnameList.forEach((item) => {
            if (item !== null) { noExistList.push(item) }
        })
        return noExistList;
    }
    /**
    * 根据 名称 来查询对应的账户
    */
    getSomeAccount = (nameList) => {
        let str = '';
        nameList.forEach((name, index) => {
            if (index > 0) { str = str + `or AccountName = '${name}' ` }
        })
        return new Promise((resolve, reject) => {
            let result = [];
            let sql = `SELECT Account.AccountName,Account.CardID,Card.Balance FROM Account 
            left join Card on Card.CardID  = Account.CardID
            where AccountName = '${nameList[0]}' ${str}`
            HttpApi.obsForss({ sql }, (res) => {
                if (res.data.code === 0) {
                    result = res.data.data
                }
                resolve(result);
            })
        })
    }

    chargeSuccess = () => {
        message.success('充值成功');
        this.setState({ loading: false, selectNames: [], selectedRowKeys: [] })
    }
    chargeFailure = () => {
        message.error('充值失败');
        this.setState({ loading: false })
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
            }
        ]
        const { selectedRowKeys } = this.state;

        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange,
            hideDefaultSelections: true,
            selections: [
                {
                    key: 'all-data',
                    text: '所有人员',
                    onSelect: () => {
                        this.setState({
                            selectedRowKeys: allIds,
                        });
                    },
                },
                {
                    key: 'all-no',
                    text: '全部移除',
                    onSelect: () => {
                        this.setState({
                            selectedRowKeys: [],
                        });
                    },
                }]
        }
        return (
            <div>
                <h2 style={{ borderLeft: 4, borderLeftColor: "#3080fe", borderLeftStyle: 'solid', paddingLeft: 5, fontSize: 16 }}>员工充值</h2>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Search style={{ width: 400 }} allowClear placeholder="支持姓名模糊查询" onSearch={value => this.onSearch(value)} onChange={e => this.onChange(e.currentTarget.value)} enterButton />
                    <Button loading={this.state.loading} type="primary" disabled={this.state.selectedRowKeys.length === 0} onClick={this.chargeSomeHandler} >批量充值</Button>
                </div>
                <Table
                    loading={this.state.loading}
                    rowSelection={rowSelection}
                    style={{ marginTop: 20 }}
                    bordered
                    dataSource={this.state.users}
                    columns={columns}
                />
                <Modal
                    width={500}
                    title="用户充值"
                    visible={this.state.visible}
                    onOk={this.handleOk}
                    onCancel={() => { this.setState({ visible: false }) }}
                >
                    <Row style={{ marginTop: 20 }}>
                        <Col span={4}>
                            <h2 style={{ borderLeft: 4, borderLeftColor: "#3080fe", borderLeftStyle: 'solid', paddingLeft: 5, fontSize: 16 }}>注意:</h2>
                        </Col>
                        <Col span={20}>
                            <div>正在为 {this.state.selectNames.length > 5 ? this.state.selectNames.slice(0, 5).join('、') + ' ...' : this.state.selectNames.join('、')} 等 <span style={{ fontWeight: 800 }}>{this.state.selectNames.length}</span> 位用户充值</div>
                        </Col>
                    </Row>
                    <Row style={{ marginTop: 20 }}>
                        <Col span={6}>
                            <h2 style={{ borderLeft: 4, borderLeftColor: "#3080fe", borderLeftStyle: 'solid', paddingLeft: 5, fontSize: 16 }}>充值金额:</h2>
                        </Col>
                        <Col span={18}>
                            <InputNumber min={1} max={10000} value={this.state.chargeNumber} onChange={(v) => { this.setState({ chargeNumber: v }) }} />
                        </Col>
                    </Row>
                </Modal>
            </div>
        );
    }
}
