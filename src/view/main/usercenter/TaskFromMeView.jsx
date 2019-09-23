import React, { Component } from 'react'
import { Row, Col, Table, Button, message, Tag, Popconfirm, Divider } from 'antd'
import HttpApi from '../../util/HttpApi'
import AddTaskView from './AddTaskView';
import PreviewTaskView from './PreviewTaskView'
import moment from 'moment'
import Store from '../../../redux/store/Store';
import { showTaskNum } from '../../../redux/actions/TaskAction';

var storage = window.localStorage;
var userinfo;
var currentTime = moment().toDate().getTime();
var allDoThingManIdArr = []; /////所有的执行人id 数组  去重复的
var needStaffInfo = [];
var task_status_filter = [{ text: '已完成', value: 1 }, { text: '未完成', value: 0 }];///用于筛选任务状态的数据 选项
/**
 * 我发起的任务 界面
 */
class TaskFromMeView extends Component {

    state = { tasks: null, addStaffVisible: false, updateStaffVisible: false, updateStaffData: null }

    componentDidMount() {
        this.getTasksData()
        allDoThingManIdArr.length = 0;
    }
    async getTasksData() {
        userinfo = JSON.parse(storage.getItem("userinfo"))
        let tasksData = await this.getTaskInfo()
        tasksData.forEach(element => {
            element.toArr = element.to.substring(1, element.to.length - 1).split(','); ///字符串元素数字
            element.toArr.forEach((oneId) => {
                if (allDoThingManIdArr.indexOf(oneId) === -1) { allDoThingManIdArr.push(oneId) }
            })
        });
        let newArr = allDoThingManIdArr.map((item) => (parseInt(item)))
        needStaffInfo = await this.getUserInfo(newArr)

        for (const item of tasksData) {
            let toArrname = [];
            for (const id of item.toArr) {
                toArrname.push(this.findUserName(id));
            }
            item.toArrname = toArrname;
        }
        this.setState({
            tasks: tasksData.map(user => {
                user.key = user.id
                return user
            }).reverse()
        })
    }

    findUserName = (userid) => {
        let username = '';
        needStaffInfo.forEach((item) => {
            if (item.id === parseInt(userid)) {
                username = item.name
            }
        })
        return username;
    }

    getUserInfo = (userArr) => {
        return new Promise((resolve, reject) => {
            let result = [];
            HttpApi.getUserInfo({ id: userArr, effective: 1 }, data => {
                if (data.data.code === 0) {
                    result = data.data.data
                }
                resolve(result);
            })
        })
    }

    getTaskInfo = () => {
        return new Promise((resolve, reject) => {
            HttpApi.getTaskInfo({ from: userinfo.id, effective: 1 }, data => {
                if (data.data.code === 0) {
                    resolve(data.data.data)
                }
            })
        })
    }

    addStaff = () => {
        this.setState({ addStaffVisible: true })
    }
    addStaffOnOk = (newValues) => {
        var toIds = []
        newValues.to.forEach(toItem => {
            let items = toItem.split('-')
            if (items.length === 2) {
                toIds.push(items[1])
            }
        })
        newValues.status = 0;
        newValues.from = userinfo.id
        newValues.to = "," + toIds.join(',') + ","
        newValues.overTime = newValues.overTime.endOf('day').valueOf()
        newValues.isMessage = newValues.isMessage ? 1 : 0;
        HttpApi.addTaskInfo(newValues, data => {
            if (data.data.code === 0) {
                this.setState({ addStaffVisible: false })
                message.success('添加成功')
                this.getTasksData()
                ///新建任务的时候 如果分配人员中有自己 立刻刷新
                if (toIds.indexOf(userinfo.id + '') !== -1) {
                    this.updateDataByRedux()
                }
                let usersIdArrInt = toIds.map((item) => parseInt(item))
                if (newValues.isMessage === 1) {
                    console.log('添加任务，短信通知')
                    this.sendMessageToStaff(usersIdArrInt, newValues);
                } else {
                    console.log('添加任务，不必短信通知')
                }
                this.pushNoticeToApp(usersIdArrInt);
            } else {
                message.error(data.data.data)
            }
        })
    }
    addStaffOnCancel = () => {
        this.setState({ addStaffVisible: false })
    }
    updateStaff(record) {
        // console.log('record ：：：', record)
        this.setState({ updateStaffVisible: true, updateStaffData: record })
    }
    /**
     * 确定修改任务。
     */
    updateStaffOnOk = (newValues) => {
        HttpApi.updateTaskInfo({ query: { id: this.state.updateStaffData.id }, update: newValues }, data => {
            if (data.data.code === 0) {
                this.setState({ updateStaffVisible: false })
                this.getTasksData()
                message.success('任务修改成功')
                let usersIdArr = newValues.to.split(',');
                usersIdArr.shift();
                usersIdArr.pop();
                let usersIdArrInt = usersIdArr.map((item) => parseInt(item))
                if (newValues.isMessage === 1) {
                    console.log('修改任务，短信通知')
                    this.sendMessageToStaff(usersIdArrInt, newValues);
                } else {
                    console.log('修改任务，不必短信通知')
                }
                this.pushNoticeToApp(usersIdArrInt);
            } else {
                message.error('任务修改失败')
            }
        })
    }
    updateStaffOnCancel = () => {
        this.setState({ updateStaffVisible: false })
    }
    deleteStaffConfirm = (record) => {
        // console.log(record);
        // console.log(record.to.substring(1, record.to.length - 1).split(','));
        // return;
        HttpApi.updateTaskInfo({ query: { id: record.id }, update: { effective: 0 } }, (res) => {
            if (res.data.code === 0) {
                message.success('删除成功')
                this.getTasksData()
                ////当删除的任务中 执行人包含自己的时候，立即刷新
                if (record.to.substring(1, record.to.length - 1).split(',').indexOf(userinfo.id + '') !== -1) {
                    this.updateDataByRedux()
                }
            } else {
                message.error(res.data.data)
            }
        })
    }
    updateDataByRedux = () => {
        Store.dispatch(showTaskNum(null)); ///随便派发一个值，目的是让 mainView处监听到 执行init();
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
                // console.log(item)
                // HttpApi.pushnotice({user_id: item.id, title: '任务通知', text: '您有最新的任务,请注意查看'})
            })
            HttpApi.sendMessageToStaffs(tempArr)
        })
    }

    pushNoticeToApp = (toUsersArr) => {
        console.log('开始向app推送信息。需要推送通知的人员有:', toUsersArr);
        toUsersArr.forEach((oneUserId) => {
            HttpApi.pushnotice({ user_id: oneUserId, title: '任务通知', text: '您有最新的任务,请注意查看' })
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
                // width: '15%'
            },
            {
                title: '执行人',
                dataIndex: 'toArrname',
                width: '20%',
                render: (text, record) => {
                    return <div>{text.join(',')}</div>
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
                width: 150,
                render: (text, record) => (
                    <div style={{ textAlign: 'center' }}>
                        <Popconfirm title="确定要删除该任务吗?" onConfirm={this.deleteStaffConfirm.bind(null, record)}>
                            <Button size="small" type="danger">删除</Button>
                        </Popconfirm>
                        <Divider type="vertical" />
                        <Button size="small" type="primary" onClick={this.updateStaff.bind(this, record)}>详情</Button>
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
                    bordered
                    dataSource={this.state.tasks}
                    columns={columns}
                />
                <AddTaskView onOk={this.addStaffOnOk} onCancel={this.addStaffOnCancel} visible={this.state.addStaffVisible} />
                <PreviewTaskView staff={this.state.updateStaffData} onOk={this.updateStaffOnOk}
                    onCancel={this.updateStaffOnCancel} visible={this.state.updateStaffVisible} />
            </div>
        )
    }
}

export default TaskFromMeView;