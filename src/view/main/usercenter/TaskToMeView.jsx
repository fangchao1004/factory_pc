import React, { Component } from 'react'
import { Table, Button, message, Tag } from 'antd'
import HttpApi from '../../util/HttpApi'
import AddStaffView from './AddTaskView';
import UpdateStaffView from './UpdateTaskView'
import AppData from '../../util/AppData'

var storage = window.localStorage;
var userinfo;
/**
 * 给我的任务界面
 */
class TaskToMeView extends Component {

    state = { tasks: null, addStaffVisible: false, updateStaffVisible: false, updateStaffData: null }

    componentDidMount() {
        this.getTasksData()
    }
    async getTasksData() {
        userinfo = JSON.parse(storage.getItem("userinfo"))
        let tasksData = await this.getTaskInfo()
        // console.log("分配给我的任务", tasksData)
        this.setState({
            tasks: tasksData.map(user => {
                user.key = user.id
                return user
            })
        })
    }
    getTaskInfo() {
        return new Promise((resolve, reject) => {
            HttpApi.getTaskInfo({ to: { $like: `%,${userinfo.user_id},%` } }, data => {
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
        // console.log(newValues)
        newValues.from = AppData.username
        newValues.to = newValues.to.join(',')
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
        // console.log('update', record)
        this.setState({ updateStaffVisible: true, updateStaffData: record })
    }
    updateStaffOnOk = (taskInfo) => {
        HttpApi.updateTaskInfo({ query: { id: this.state.updateStaffData.id }, update: { status: 1 } }, data => {
            if (data.data.code === 0) {
                this.setState({ updateStaffVisible: false })
                this.getTasksData()
                message.success('更新成功')
                this.sendMessageToLeader(taskInfo);
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
                this.getTasksData()
            } else {
                message.error(data.data.data)
            }
        })
    }
    sendMessageToLeader = async (taskInfo) => {
        // console.log("数据:", "from:", taskInfo.from, "me:", userinfo.user_id, userinfo.name);
        let leaderInfo = await this.getUserInfo(taskInfo.from);
        let param = {phonenumber:leaderInfo.phonenumber,name:leaderInfo.name,name_to:userinfo.name}
        HttpApi.sendMessageToLeader(param,(res)=>{
            console.log(res);
        })
    }
    getUserInfo=(userid)=>{
        return new Promise((resolve,reject)=>{
            HttpApi.getUserInfo({id:userid},(res)=>{
                resolve(res.data.data[0]);
            })
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
                width: 75,
                render: (text, record) => (
                    <div style={{ textAlign: 'center' }}>
                        <Button size="small" type="primary" onClick={this.updateStaff.bind(this, record)}>详情</Button>
                    </div>
                )
            }
        ];

        return (
            <div>
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

export default TaskToMeView;