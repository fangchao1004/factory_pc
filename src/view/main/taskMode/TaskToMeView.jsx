import React, { Component } from 'react'
import { Table, Button, message, Tag } from 'antd'
import HttpApi from '../../util/HttpApi'
import UpdateTaskView from './UpdateTaskView'
import moment from 'moment'
import Store from '../../../redux/store/Store';
import { showTaskNum } from '../../../redux/actions/TaskAction';

var storage = window.localStorage;
var userinfo;
var currentTime = moment().toDate().getTime();
var task_status_filter = [{ text: '已完成', value: 1 }, { text: '未完成', value: 0 }];///用于筛选任务状态的数据 选项
/**
 * 给我的任务界面
 */
class TaskToMeView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tasks: null,
            users: null,
            addTaskVisible: false,
            updateTaskVisible: false,
            updateTaskData: null,
            lastTimeSelectIndex: null///上次选中的是哪一个record
        }
    }
    componentDidMount() {
        this.init()
    }
    init = async () => {
        userinfo = JSON.parse(storage.getItem("userinfo"))
        let tasksData = await this.getTaskInfo()
        let usersData = await this.getAllUserInfo()
        let finallyTasksData = tasksData.map(user => {
            user.key = user.id
            return user
        }).reverse();
        if (this.state.updateTaskVisible) {///如果当前更新界面已经显示
            let newRecordAfterUpdateStepRemak = tasksData[this.state.lastTimeSelectIndex];
            this.setState({ updateTaskData: newRecordAfterUpdateStepRemak });
        }
        this.setState({
            tasks: finallyTasksData,
            users: usersData
        })
    }
    getTaskInfo() {
        return new Promise((resolve, reject) => {
            let sql = `select * from tasks where tasks.to like '%,${userinfo.id},%' and effective = 1 order by id desc`;
            HttpApi.obs({ sql }, (data) => {
                let result = [];
                if (data.data.code === 0) {
                    result = data.data.data
                }
                resolve(result)
            })
        })
    }
    getAllUserInfo = () => {
        return new Promise((resolve, reject) => {
            HttpApi.getUserInfo({ effective: 1 }, data => {
                if (data.data.code === 0) {
                    resolve(data.data.data)
                }
            })
        })
    }
    addStaff() {
        this.setState({ addTaskVisible: true })
    }
    addTaskOnOk = (newValues) => {
        // console.log(newValues)
        newValues.from = 0
        newValues.to = newValues.to.join(',')
        HttpApi.addTaskInfo(newValues, data => {
            if (data.data.code === 0) {
                this.setState({ addTaskVisible: false })
                this.init()
                message.success('添加成功')
            } else {
                message.error(data.data.data)
            }
        })
    }
    addTaskOnCancel = () => {
        this.setState({ addTaskVisible: false })
    }
    updateStaff(record, index) {
        // console.log('update', record)
        this.setState({ updateTaskVisible: true, updateTaskData: record, lastTimeSelectIndex: index })
    }
    /**
     *  确定修改任务。(包含了 完成任务，给任务加流程备注)
     */
    updateTaskOnOk = (newtaskInfo, updateTaskVisible = false) => {
        HttpApi.updateTaskInfo({ query: { id: this.state.updateTaskData.id }, update: { ...newtaskInfo } }, data => {
            if (data.data.code === 0) {
                this.setState({ updateTaskVisible })
                this.init()
                this.updateDataByRedux()
                message.success('更新成功')
                if (newtaskInfo.isMessage === 1) {
                    this.sendMessageToLeader(newtaskInfo)
                }
            } else {
                message.error(data.data.data)
            }
        })
    }
    updateTaskOnCancel = () => {
        this.setState({ updateTaskVisible: false })
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
    updateDataByRedux = () => {
        Store.dispatch(showTaskNum(null)); ///随便派发一个值，目的是让 mainView处监听到 执行init();
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
                render: (text, record) => {
                    return <div>{text || '/'}</div>
                }
            },
            {
                title: '分配人',
                dataIndex: 'from',
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
                render: (text, record, index) => (
                    <div style={{ textAlign: 'center' }}>
                        <Button size="small" type="primary" onClick={this.updateStaff.bind(this, record, index)}>详情</Button>
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
                    pagination={{
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '50', '80', '100'],
                    }}
                />
                <UpdateTaskView task={this.state.updateTaskData} onOk={this.updateTaskOnOk}
                    onCancel={this.updateTaskOnCancel} visible={this.state.updateTaskVisible} />
            </div>
        )
    }
}

export default TaskToMeView;