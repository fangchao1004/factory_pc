import React, { Component } from 'react'
import { Row, Col, Table, Button, message, Tag, Popconfirm, Divider } from 'antd'
import HttpApi from '../../util/HttpApi'
import AddStaffView from './AddTaskView';
import UpdateStaffView from './PreviewTaskView'
import moment from 'moment'

var storage = window.localStorage;
var userinfo;
var currentTime = moment().toDate().getTime();
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
        // console.log('我发起的任务：', tasksData)
        this.setState({
            tasks: tasksData.map(user => {
                user.key = user.id
                return user
            })
        })
    }
    getTaskInfo() {
        return new Promise((resolve, reject) => {
            HttpApi.getTaskInfo({ from: userinfo.user_id }, data => {
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
        let toUsersArr = newValues.to
        newValues.status = 0;
        newValues.from = userinfo.user_id
        newValues.to = "," + newValues.to.join(',') + ","
        newValues.overTime = newValues.overTime.endOf('day').valueOf()
        HttpApi.addTaskInfo(newValues, data => {
            if (data.data.code === 0) {
                this.setState({ addStaffVisible: false })
                message.success('添加成功')
                this.getTasksData()
                this.sendMessageToStaff(toUsersArr, newValues);
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
    sendMessageToStaff = async (toUsersArr, data) => {
        let title = data.title;
        let overTimeDate = moment(parseInt(data.overTime)).format('YYYY年MM月DD日');
        HttpApi.getUserInfo({ id: toUsersArr }, (res) => {
            let userInfo = res.data.data;
            let tempArr = [];
            userInfo.forEach((item) => {
                let messageObj = {
                    phonenumber: item.phonenumber,
                    name: item.name,
                    title: title,
                    time: overTimeDate
                }
                tempArr.push(messageObj);
            })
            HttpApi.sendMessageToStaffs(tempArr)
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
        if(daysRound>0){
            time = daysRound + '天 ' + hoursRound + '小时 ' + minutesRound + '分钟'
        }else{
            time = hoursRound + '小时 ' + minutesRound + '分钟'
        }
        return time;
    }


    render() {
        const columns = [
            {
                title: '当前状态',
                dataIndex: 'status',
                align: 'center',
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
                title: '倒计时',
                dataIndex: 'overTime',
                align: 'center',
                render: (text, record) => {
                    let remain_time = record.overTime - currentTime; ///剩余时间 ms
                    // console.log('剩余时间ms:', remain_time);
                    let result = this.getDuration(Math.abs(remain_time));
                    return <div>{remain_time > 0 ? result : "超时 " + result}</div>
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