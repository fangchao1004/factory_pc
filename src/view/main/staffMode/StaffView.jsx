import React, { Component } from 'react'
import { Row, Col, Table, Button, Divider, message, Popconfirm, Input } from 'antd'
import HttpApi from '../../util/HttpApi'
import AddStaffView from './AddStaffView';
import UpdateStaffView from './UpdateStaffView';
var level_filter = [];///用于筛选任务专业的数据 选项
const { Search } = Input;

class StaffView extends Component {

    state = { levels: null, nfcs: null, users: null, addStaffVisible: false, updateStaffVisible: false, updateStaffData: null }

    componentDidMount() {
        this.getUsersData()
    }
    async getUsersData() {
        level_filter.length = 0;
        let levelData = await this.getLevelInfo();
        levelData.forEach((item) => { level_filter.push({ text: item.name, value: item.id }) })
        let levelsData = await this.getUserLevelList()
        let nfcsData = await this.getUserNfcList()
        this.setState({ levels: levelsData, nfcs: nfcsData })
        var usersData = await this.getUserList()
        this.setState({
            users: usersData.map(user => {
                user.key = user.id
                return user
            })
        })
    }
    getLevelInfo = () => {
        let sqlText = 'select m.id,m.name from levels m'
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
    getUserLevelList() {
        return new Promise((resolve, reject) => {
            HttpApi.getUserLevel({ effective: 1 }, data => {
                if (data.data.code === 0) {
                    resolve(data.data.data)
                }
            })
        })
    }
    getUserNfcList() {
        return new Promise((resolve, reject) => {
            HttpApi.getNFCInfo({ type: 1, effective: 1 }, data => {
                if (data.data.code === 0) {
                    resolve(data.data.data)
                }
            })
        })
    }
    getUserList() {
        return new Promise((resolve, reject) => {
            let sql = `select * from users where effective = 1
            order by level_id`;
            let result = [];
            HttpApi.obs({ sql }, (res) => {
                if (res.data.code === 0) { result = res.data.data }
                resolve(result);
            })
        })
    }

    addStaff() {
        this.setState({ addStaffVisible: true })
    }
    addStaffOnOk = (newValues) => {
        if (newValues.permission) {
            newValues.permission = newValues.permission.join(',')
        }
        HttpApi.addUserInfo(newValues, data => {
            if (data.data.code === 0) {
                this.setState({ addStaffVisible: false })
                this.getUsersData()
                message.success('添加成功')
            } else {
                message.error(data.data.data)
            }
        })
    }
    addStaffOnCancel = () => {
        this.setState({ addStaffVisible: false })
    }
    updateStaff(record) {
        this.setState({ updateStaffVisible: true, updateStaffData: record })
    }
    updateStaffOnOk = (newValues) => {
        newValues.isadmin = newValues.isadmin ? 1 : 0
        if (newValues.permission) newValues.permission = newValues.permission.join(',')
        HttpApi.updateUserInfo({ query: { id: this.state.updateStaffData.id }, update: newValues }, data => {
            if (data.data.code === 0) {
                this.setState({ updateStaffVisible: false })
                this.getUsersData()
                message.success('更新成功')
            } else {
                message.error(data.data.data)
            }
        })
    }
    updateStaffOnCancel = () => {
        this.setState({ updateStaffVisible: false })
    }
    deleteStaffConfirm = (record) => {
        HttpApi.obs({ sql: `update users set effective = 0 where id = ${record.id} ` }, (data) => {
            // HttpApi.removeUserInfo({ id: record.id }, data => {
            if (data.data.code === 0) {
                message.success('删除成功')
                this.getUsersData()
            } else {
                message.error(data.data.data)
            }
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
        // console.log('init')
        var usersData = await this.getUserList()
        if (usersData.length !== this.state.users.length) {
            // console.log('需要重新渲染所有');
            this.setState({
                users: usersData.map(user => {
                    user.key = user.id
                    return user
                })
            })
        }
        // else { console.log('不需要重新渲染所有'); }
    }
    searchUserData(value) {
        return new Promise((resolve, reject) => {
            let sql = `select * from users where effective = 1 and name like '%${value}%'
            order by level_id`;
            let result = [];
            HttpApi.obs({ sql }, (res) => {
                if (res.data.code === 0) { result = res.data.data }
                resolve(result);
            })
        })
    }

    render() {
        const columns = [
            {
                title: '登陆账户',
                dataIndex: 'username',
                render: (text, record) => (
                    <div>{text}</div>
                )
            },
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
                render: (text) => {
                    var levelName
                    this.state.levels.some(level => {
                        if (level.id === text) {
                            levelName = level.name
                            return true
                        } else {
                            return false
                        }
                    })
                    return <div>{levelName}</div>
                }
            },
            // {
            //     title: '员工工卡',
            //     dataIndex: 'nfc_id',
            //     render: (text) => {
            //         var nfcName
            //         this.state.nfcs.some(nfc => {
            //             if (nfc.id === text) {
            //                 nfcName = nfc.name
            //                 return true
            //             } else {
            //                 return false
            //             }
            //         })
            //         return <div>{nfcName}</div>
            //     }
            // },
            {
                title: '密码',
                dataIndex: 'password',
                render: (text, record) => (
                    <div>{text}</div>
                )
            },
            {
                title: '联系方式',
                dataIndex: 'phonenumber',
                render: (text, record) => (
                    <div>{text}</div>
                )
            },
            {
                title: '备注',
                dataIndex: 'remark',
                render: (text, record) => (
                    <div>{text}</div>
                )
            },
            {
                title: '操作',
                dataIndex: 'actions',
                width: 150,
                render: (text, record) => (
                    <div style={{ textAlign: 'center' }}>
                        <Popconfirm title="确定要删除该员工吗?" onConfirm={this.deleteStaffConfirm.bind(null, record)}>
                            <Button size="small" type="danger">删除</Button>
                        </Popconfirm>
                        <Divider type="vertical" />
                        <Button size="small" type="primary" onClick={this.updateStaff.bind(this, record)}>修改</Button></div>
                )
            }
        ];

        return (
            <div>
                <Row>
                    <Col span={6}>
                        <Button type="primary" style={{ marginBottom: 16 }} onClick={this.addStaff.bind(this)}>
                            添加员工
                         </Button>
                    </Col>
                    <Col span={18} style={{ display: 'flex', flexDirection: 'row-reverse' }}>
                        <Search style={{ width: 400 }} allowClear placeholder="支持姓名模糊查询" onSearch={value => this.onSearch(value)} onChange={e => this.onChange(e.currentTarget.value)} enterButton />
                    </Col>
                </Row>
                <Table
                    bordered
                    dataSource={this.state.users}
                    columns={columns}
                />
                <AddStaffView onOk={this.addStaffOnOk} onCancel={this.addStaffOnCancel} visible={this.state.addStaffVisible} />
                <UpdateStaffView staff={this.state.updateStaffData} onOk={this.updateStaffOnOk}
                    onCancel={this.updateStaffOnCancel} visible={this.state.updateStaffVisible} />
            </div>
        )
    }
}

export default StaffView;