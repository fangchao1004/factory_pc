import React, { Component } from 'react'
import { Row, Col, Table, Button, Divider, message, Popconfirm } from 'antd'
import HttpApi from '../../util/HttpApi'
import AddStaffView from './AddStaffView';
import UpdateStaffView from './UpdateStaffView';

class StaffView extends Component {

    state = { levels: null, nfcs: null, users: null, addStaffVisible: false, updateStaffVisible: false, updateStaffData: null}

    componentDidMount() {
        this.getUsersData()
    }
    async getUsersData() {
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
    getUserLevelList() {
        return new Promise((resolve, reject) => {
            HttpApi.getUserLevel({}, data => {
                if (data.data.code === 0) {
                    resolve(data.data.data)
                }
            })
        })
    }
    getUserNfcList() {
        return new Promise((resolve, reject) => {
            HttpApi.getNFCInfo({ type: 1 }, data => {
                if (data.data.code === 0) {
                    resolve(data.data.data)
                }
            })
        })
    }
    getUserList() {
        return new Promise((resolve, reject) => {
            HttpApi.getUserInfo({}, data => {
                if (data.data.code === 0) {
                    resolve(data.data.data)
                }
            })
        })
    }

    addStaff() {
        this.setState({ addStaffVisible: true })
    }
    addStaffOnOk = (newValues) => {
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
        this.setState({ updateStaffVisible: true, updateStaffData: record})
    }
    updateStaffOnOk = (newValues) => {
        newValues.isadmin = newValues.isadmin ? 1 : 0
        HttpApi.updateUserInfo({query: {id: this.state.updateStaffData.id}, update: newValues}, data => {
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
        HttpApi.removeUserInfo({ id: record.id }, data => {
            if (data.data.code === 0) {
                message.success('删除成功')
                this.getUsersData()
            } else {
                message.error(data.data.data)
            }
        })
    }

    render() {
        const columns = [
            {
                title: '编号',
                dataIndex: 'id',
                render: (text, record) => (
                    <div>{text}</div>
                )
            },
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
            {
                title: '员工工卡',
                dataIndex: 'nfc_id',
                render: (text) => {
                    var nfcName
                    this.state.nfcs.some(nfc => {
                        if (nfc.id === text) {
                            nfcName = nfc.name
                            return true
                        } else {
                            return false
                        }
                    })
                    return <div>{nfcName}</div>
                }
            },
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
                </Row>
                <Table
                    size={'small'}
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