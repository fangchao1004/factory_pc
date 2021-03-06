import React, { Component } from 'react'
import { Row, Col, Table, Button, Divider, message, Popconfirm } from 'antd'
import HttpApi from '../../util/HttpApi'
import AddStaffTypeView from './AddStaffTypeView';
import UpdateStaffTypeView from './UpdateStaffTypeView';

class StaffTypeView extends Component {

    state = { levels: null, addLevelVisible: false, updateLevelVisible: false, updateLevelData: null }

    componentDidMount() {
        this.getUsersData()
    }

    async getUsersData() {
        let levelsData = await this.getUserLevelList()
        this.setState({ levels: levelsData.map(level => { level.key = level.id; return level }) })
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
    addLevel() {
        this.setState({ addLevelVisible: true })
    }
    addLevelOnOk = (newValues) => {
        HttpApi.addUserLevel(newValues, data => {
            if (data.data.code === 0) {
                this.setState({ addLevelVisible: false })
                message.success('添加成功')
                this.getUsersData()
            } else {
                message.error(data.data.data)
            }
        })
    }
    addLevelOnCancel = () => {
        this.setState({ addLevelVisible: false })
    }
    updateLevel(record) {
        // console.log('update', record)
        this.setState({ updateLevelVisible: true, updateLevelData: record })
    }
    updateLevelOnOk = (newValues) => {
        HttpApi.updateUserLevel({ query: { id: this.state.updateLevelData.id }, update: newValues }, data => {
            if (data.data.code === 0) {
                this.setState({ updateLevelVisible: false })
                message.success('更新成功')
                this.getUsersData()
            } else {
                message.error(data.data.data)
            }
        })
    }
    updateLevelOnCancel = () => {
        this.setState({ updateLevelVisible: false })
    }
    deleteLevelConfirm = (record) => {
        HttpApi.obs({ sql: `update levels set effective = 0 where id = ${record.id} ` }, (data) => {
            // HttpApi.removeUserLevel({ id: record.id }, data => {
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
            // {
            //     title: '编号',
            //     dataIndex: 'id',
            //     render: (text) => (
            //         <div>{text}</div>
            //     )
            // },
            {
                title: '职位名称',
                dataIndex: 'name',
                render: (text) => (
                    <div>{text}</div>
                )
            },
            {
                title: '操作',
                dataIndex: 'actions',
                width: 170,
                align: 'center',
                render: (text, record) => (
                    <div style={{ textAlign: 'center' }}>
                        <Button icon='edit' size="small" type="primary" onClick={this.updateLevel.bind(this, record)}>编辑</Button>
                        <Divider type="vertical" />
                        <Popconfirm title="确定要删除该部门吗?" onConfirm={this.deleteLevelConfirm.bind(null, record)}>
                            <Button icon='delete' size="small" type="danger">删除</Button>
                        </Popconfirm>
                    </div>
                )
            }
        ];

        return (
            <div style={{ backgroundColor: '#FFFFFF', padding: 10 }}>
                <Row>
                    <Col span={6}>
                        <Button icon='plus' type="primary" size="small" style={{ marginBottom: 10 }} onClick={this.addLevel.bind(this)}>
                            添加部门
                         </Button>
                    </Col>
                </Row>
                <Table
                    size="small"
                    bordered
                    dataSource={this.state.levels}
                    columns={columns}
                    pagination={false}
                />
                <AddStaffTypeView visible={this.state.addLevelVisible} onOk={this.addLevelOnOk}
                    onCancel={this.addLevelOnCancel} />
                <UpdateStaffTypeView level={this.state.updateLevelData} onOk={this.updateLevelOnOk}
                    onCancel={this.updateLevelOnCancel} visible={this.state.updateLevelVisible} />
            </div>
        )
    }
}

export default StaffTypeView;