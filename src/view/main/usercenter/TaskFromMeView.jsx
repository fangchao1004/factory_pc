import React, { Component } from 'react'
import { Row, Col, Table, Button, message, Tag, Popconfirm, Divider } from 'antd'
import HttpApi from '../../util/HttpApi'
import AddStaffView from './AddTaskView';
import UpdateStaffView from './PreviewTaskView'

var storage = window.localStorage;
var userinfo;
/**
 * 我发起的任务 界面
 */
class TaskFromMeView extends Component {

    state = { tasks: null, addStaffVisible: false, updateStaffVisible: false, updateStaffData: null }

    componentDidMount() {
        this.getTasksData()
    }
    async getTasksData() {
        userinfo = JSON.parse(storage.getItem("userinfo"))
        let tasksData = await this.getTaskInfo()
        console.log('我发起的任务：',tasksData)
        this.setState({
            tasks: tasksData.map(user => {
                user.key = user.id
                return user
            })
        })
    }
    getTaskInfo() {
        return new Promise((resolve, reject) => {
            HttpApi.getTaskInfo({from:userinfo.user_id}, data => {
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
        newValues.status = 0;
        newValues.from = userinfo.user_id
        newValues.to = ","+newValues.to.join(',')+","
        newValues.overTime = newValues.overTime.endOf('day').valueOf()+""
        HttpApi.addTaskInfo(newValues, data => {
            if (data.data.code === 0) {
                this.setState({ addStaffVisible: false })
                this.getTasksData()
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
        console.log('update', record)
        this.setState({ updateStaffVisible: true, updateStaffData: record })
    }
    updateStaffOnOk = (newValues) => {
        HttpApi.updateUserInfo({ query: { id: this.state.updateStaffData.id }, update: newValues }, data => {
            if (data.data.code === 0) {
                this.setState({ updateStaffVisible: false })
                this.getTasksData()
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
        HttpApi.removeTaskInfo({ id: record.id }, data => {
            if (data.data.code === 0) {
                message.success('删除成功')
                this.getTasksData()
            } else {
                message.error(data.data.data)
            }
        })
    }

    render() {
        const columns = [
            {
                title: '编号',
                width: 60,
                align: 'center',
                dataIndex: 'id',
                render: (text, record) => (
                    <div>{text}</div>
                )
            },
            {
                title: '当前状态',
                dataIndex: 'status',
                align: 'center',
                render: (text) => {
                    let str = '';
                    let strColor = '#555555'
                    if (text === 1) { str = '已完成'; strColor = 'green' }
                    else { str = '未完成'; strColor = 'red' }
                    return <Tag color={strColor}>{str}</Tag>
                }
            },
            {
                title: '任务主题',
                dataIndex: 'title',
            },
            {
                title: '操作',
                dataIndex: 'actions',
                width: 200,
                render: (text, record) => (
                    <div style={{ textAlign: 'center' }}>
                        <Popconfirm title="确定要删除该任务吗?" onConfirm={this.deleteStaffConfirm.bind(null, record)}>
                            <Button type="danger">删除</Button>
                        </Popconfirm>
                        <Divider type="vertical" />
                        <Button type="primary" onClick={this.updateStaff.bind(this, record)}>详情</Button>
                    </div>
                )
            }
        ];

        return (
            <div>
                <Row>
                    <Col span={6}>
                        <Button type="primary" style={{ marginBottom: 16 }} onClick={this.addStaff.bind(this)}>
                            新建任务
                         </Button>
                    </Col>
                </Row>
                <Table
                    size={'small'}
                    bordered
                    dataSource={this.state.tasks}
                    columns={columns}
                />
                <AddStaffView onOk={this.addStaffOnOk} onCancel={this.addStaffOnCancel} visible={this.state.addStaffVisible} />
                <UpdateStaffView staff={this.state.updateStaffData} onOk={this.updateStaffOnOk}
                    onCancel={this.updateStaffOnCancel} visible={this.state.updateStaffVisible} />
            </div>
        )
    }
}

export default TaskFromMeView;