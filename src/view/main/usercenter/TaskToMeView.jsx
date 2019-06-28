import React, { Component } from 'react'
import { Table, Button, message, Tag } from 'antd'
import HttpApi from '../../util/HttpApi'
import AddStaffView from './AddTaskView';
import UpdateStaffView from './UpdateTaskView'
import moment from 'moment'

var storage = window.localStorage;
var userinfo;
var currentTime = moment().toDate().getTime();
var task_status_filter = [{ text: '已完成', value: 1 }, { text: '未完成', value: 0 }];///用于筛选任务状态的数据 选项
/**
 * 给我的任务界面
 */
class TaskToMeView extends Component {

    state = { tasks: null, users: null, addStaffVisible: false, updateStaffVisible: false, updateStaffData: null }

    componentDidMount() {
        this.getTasksData()
    }
    async getTasksData() {
        userinfo = JSON.parse(storage.getItem("userinfo"))
        let tasksData = await this.getTaskInfo()
        let usersData = await this.getAllUserInfo()
        this.setState({
            tasks: tasksData.map(task => {
                task.key = task.id
                return task
            }),
            users: usersData
        })
    }
    getTaskInfo() {
        return new Promise((resolve, reject) => {
            HttpApi.getTaskInfo({ to: { $like: `%,${userinfo.id},%` } }, data => {
                if (data.data.code === 0) {
                    resolve(data.data.data)
                }
            })
        })
    }

    getAllUserInfo = () => {
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
        // console.log(newValues)
        newValues.from = 0
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
                if (taskInfo.isMessage === 1) {
                    this.sendMessageToLeader(taskInfo);
                }
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
        let param = { phonenumber: leaderInfo.phonenumber, name: leaderInfo.name, name_to: userinfo.name }
        HttpApi.sendMessageToLeader(param, (res) => {
            // console.log(res);
        })
    }
    getUserInfo = (userid) => {
        return new Promise((resolve, reject) => {
            HttpApi.getUserInfo({ id: userid }, (res) => {
                resolve(res.data.data[0]);
            })
        })
    }
    getDuration = (my_time) => {
        var days = my_time / 1000 / 60 / 60 / 24;
        var daysRound = Math.floor(days);
        var hours = my_time / 1000 / 60 / 60 - (24 * daysRound);
        var hoursRound = Math.floor(hours);
        var minutes = my_time / 1000 / 60 - (24 * 60 * daysRound) - (60 * hoursRound);
        var minutesRound = Math.floor(minutes);
        // var seconds = my_time / 1000 - (24 * 60 * 60 * daysRound) - (60 * 60 * hoursRound) - (60 * minutesRound);
        // console.log('转换时间:', daysRound + '天', hoursRound + '时', minutesRound + '分', seconds + '秒');
        var time;
        if (daysRound > 0) {
            time = daysRound + '天 ' + hoursRound + '小时 ' + minutesRound + '分钟'
        } else {
            time = hoursRound + '小时 ' + minutesRound + '分钟'
        }
        return time;
    }

    render() {
        const columns = [
            {
                title: '任务发起时间',
                dataIndex: 'createdAt',
                align: 'center',
                sorter: (a, b) => {
                    let remain_time = moment(a.createdAt).toDate().getTime() - moment(b.createdAt).toDate().getTime();
                    return remain_time
                },
                defaultSortOrder: 'descend',
                render: (text, record) => {
                    let createdAtTxt = moment(record.createdAt).format('YYYY-MM-DD');
                    // let upadtedAtTxt = '更新于:' + moment(record.updatedAt).format('YYYY-MM-DD HH:mm:ss');
                    return <div>{createdAtTxt}</div>
                }
            },
            {
                title: '任务主题',
                dataIndex: 'title',
                // width: '20%',
            },
            {
                title: '分配人',
                dataIndex: 'from',
                // width: '15%',
                render: (text, record) => {
                    var u
                    this.state.users.some(user => {
                        if (user.id === text) {
                            u = user
                            return true
                        }
                        return false
                    })
                    return <span>{u.name}</span>
                }
            },
            {
                title: '倒计时',
                dataIndex: 'overTime',
                align: 'center',
                sorter: (a, b) => {
                    let remain_time = a.overTime - b.overTime; ///剩余时间 ms
                    return remain_time
                },
                defaultSortOrder: 'ascend',
                render: (text, record) => {
                    let remain_time = record.overTime - currentTime; ///剩余时间 ms
                    // console.log('剩余时间ms:', remain_time);
                    let result = '/'
                    if (record.status === 0) { ///未完成 计算超时
                        result = this.getDuration(Math.abs(remain_time));
                    }
                    return <div>{record.status === 0 ? (remain_time > 0 ? result : "超时 " + result) : result}</div>
                }
            },
            {
                title: '当前状态',
                dataIndex: 'status',
                align: 'center',
                // width: '10%',
                filters: task_status_filter,
                onFilter: (value, record) => record.status === value,
                render: (text, record) => {
                    let strColor = '#555555'
                    let str = '';
                    let remain_time = record.overTime - currentTime; ///剩余时间 ms
                    let one_day_time = 24 * 60 * 60 * 1000; ///一天的时间 ms
                    if (text === 1) { str = '已完成'; strColor = 'blue' }
                    else {
                        str = '未完成';
                        if (remain_time > 0) {
                            let last_time_day = parseFloat((remain_time / one_day_time).toFixed(5));////剩余天数
                            // console.log("剩余天数",last_time_day);
                            if (last_time_day >= 3) {
                                strColor = 'green'
                            } else if (last_time_day < 3 && last_time_day >= 1) {
                                strColor = 'orange'
                            } else {
                                strColor = 'magenta'
                            }
                        } else {
                            ///已经超期了
                            strColor = 'red'
                            str = '已经超期'
                        }
                    }
                    return <Tag color={strColor}>{str}</Tag>
                }
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