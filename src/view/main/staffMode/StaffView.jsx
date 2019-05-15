import React, { Component } from 'react'
import { Row, Col, Table, Button } from 'antd'
import HttpApi from '../../util/HttpApi'
import AddStaffView from './AddStaffView';

class StaffView extends Component {

    state = { levels: null, users: null, addStaffVisible: false}

    componentDidMount() {
        this.getUsersData()
    }

    async getUsersData() {
        let levelsData = await this.getUserLevelList()
        this.setState({levels: levelsData})
        var usersData = await this.getUserList()
        this.setState({users: usersData.map(user => {
            user.key = user.id
            return user
        })})
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
        this.setState({addStaffVisible: true})
    }

    addStaffOnOk = () => {
        this.setState({addStaffVisible: false})
    }
    
    addStaffOnCancel = () => {
        this.setState({addStaffVisible: false})
    }

    render() {
        const columns = [
            {
                title: '编号',
                dataIndex: 'id',
                width: '8%',
                render: (text, record) => (
                    <div>{text}</div>
                )
            },
            {
                title: '等级',
                dataIndex: 'level_id',
                width: '8%',
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
                title: '用户名',
                dataIndex: 'username',
                width: '8%',
                render: (text, record) => (
                    <div>{text}</div>
                )
            },
            {
                title: '昵称',
                dataIndex: 'name',
                width: '8%',
                render: (text, record) => (
                    <div>{text}</div>
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
                <AddStaffView onOk={this.addStaffOnOk}  onCancel={this.addStaffOnCancel} visible={this.state.addStaffVisible}/>
            </div>
        )
    }
}

export default StaffView;