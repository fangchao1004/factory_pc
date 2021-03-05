import React, { useState, useEffect, useCallback } from 'react'
import { Table, Button, message, Tag, Popconfirm, Divider } from 'antd'
import HttpApi from '../../util/HttpApi'
import PreviewTaskView from './PreviewTaskView'
import moment from 'moment'
import { getDuration } from '../../util/Tool';
import AddTaskView from './AddTaskView'

var storage = window.localStorage;
var userinfo = JSON.parse(storage.getItem("userinfo"))
var currentTime = moment().toDate().getTime();
var allDoThingManIdArr = []; /////所有的执行人id 数组  去重复的
var needStaffInfo = [];
var task_status_filter = [{ text: '未完成', value: 0 }, { text: '待检', value: 1 }, { text: '终结', value: 2 }];///用于筛选任务状态的数据 选项
/**
 * 我发起的任务 界面
 */
export default props => {
    const [tasklist, setTasklist] = useState([])
    const [addTaskVisible, setAddTaskVisible] = useState(false)
    const [updateTaskVisible, setUpdateTaskVisible] = useState(false)
    const [updateTaskData, setUpdateTaskData] = useState(null)
    const init = useCallback(async () => {
        allDoThingManIdArr.length = 0;
        let sql_task = `select * from tasks where tasks.from = ${userinfo.id} and effective = 1 order by id desc`;
        let res_task = await HttpApi.obs({ sql: sql_task })
        if (res_task.data.code === 0) {
            let tasksData = res_task.data.data
            tasksData.forEach(element => {
                element.toArr = element.to.substring(1, element.to.length - 1).split(','); ///字符串元素数字
                element.toArr.forEach((oneId) => {
                    if (allDoThingManIdArr.indexOf(oneId) === -1) { allDoThingManIdArr.push(parseInt(oneId)) }
                })
            });
            let res_need_uselist = await HttpApi.getUserInfo({ id: allDoThingManIdArr, effective: 1 })
            if (res_need_uselist.data.code === 0) {
                needStaffInfo = res_need_uselist.data.data
                // console.log('needStaffInfo:', needStaffInfo)
                for (const item of tasksData) {
                    let toArrname = [];
                    for (const id of item.toArr) {
                        toArrname.push(findUserName(id));
                    }
                    item.toArrname = toArrname;
                }
                let finallyTasksData = tasksData.map(user => {
                    user.key = user.id
                    return user
                })
                // console.log('finallyTasksData:', finallyTasksData)
                setTasklist(finallyTasksData)
            }
        }
    }, [])
    const sendMessageToStaffHandler = useCallback(async (toUsersArr, data, isOnlySendMessAgain = false) => {
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
            if (isOnlySendMessAgain) {
                HttpApi.sendMessageToNoticeNew(tempArr, (res) => {
                    if (res.data.code === 0) { message.success('已发送提醒短信给对方'); }
                });
            } else {
                HttpApi.sendMessageToStaffs(tempArr, (res) => {
                    if (res.data.code === 0) { message.success('已发送短信通知对方'); }
                });
            }
        })
    }, [])
    const pushNoticeToApp = useCallback((toUsersArr) => {
        console.log('开始向app推送信息。需要推送通知的人员有:', toUsersArr);
        ///后台接口已经做了调整，前端可以直接发送人员的id数组，后台自动群发。
        HttpApi.pushnotice({ user_id: toUsersArr, title: '任务通知', text: '您有最新的任务,请注意查看' })
        // toUsersArr.forEach((oneUserId) => {
        //     HttpApi.pushnotice({ user_id: oneUserId, title: '任务通知', text: '您有最新的任务,请注意查看' })
        // })
    }, [])
    const addTaskOnOk = useCallback(async (newValues) => {
        var toIds = []
        newValues.to.forEach(toItem => {
            let items = toItem.split('-')
            if (items.length === 2) {
                toIds.push(items[1])
            }
        })
        let stepRemark = {
            '0': [{ from: userinfo.id + '', to: toIds.join(','), remark: null, time: moment().format('YYYY-MM-DD HH:mm:ss') }],
            '1': [],
            '2': [],
        }
        newValues.status = 0;
        newValues.from = userinfo.id
        newValues.to = "," + toIds.join(',') + ","
        newValues.overTime = newValues.overTime.endOf('day').valueOf()
        newValues.isMessage = newValues.isMessage ? 1 : 0;
        newValues.step_remark = JSON.stringify(stepRemark);
        // console.log('新任务数据:', newValues);
        // return;
        HttpApi.addTaskInfo(newValues, data => {
            if (data.data.code === 0) {
                setAddTaskVisible(false)
                message.success('添加成功')
                init()
                let usersIdArrInt = toIds.map((item) => parseInt(item))
                if (newValues.isMessage === 1) {
                    console.log('添加任务，短信通知')
                    sendMessageToStaffHandler(usersIdArrInt, newValues, false);
                } else {
                    console.log('添加任务，不必短信通知')
                }
                pushNoticeToApp(usersIdArrInt);
            } else {
                message.error(data.data.data)
            }
        })
        // eslint-disable-next-line
    }, [])
    const updateTaskOnOk = useCallback(async (newValues, isOnlySendMessAgain = false, updateTaskVisible = false) => {
        HttpApi.updateTaskInfo({ query: { id: updateTaskData.id }, update: newValues }, data => {
            if (data.data.code === 0) {
                setUpdateTaskVisible(false)
                init()
                let usersIdArr = newValues.to.split(',');
                usersIdArr.shift();
                usersIdArr.pop();
                if (!isOnlySendMessAgain) { message.success('任务修改成功') }
                let usersIdArrInt = usersIdArr.map((item) => parseInt(item))
                if (isOnlySendMessAgain) { sendMessageToStaffHandler(usersIdArrInt, newValues, true); } else {
                    if (newValues.isMessage === 1) {
                        console.log('修改任务，短信通知')
                        sendMessageToStaffHandler(usersIdArrInt, newValues, false);
                    } else {
                        console.log('修改任务，不必短信通知')
                    }
                }
                pushNoticeToApp(usersIdArrInt);
            } else {
                message.error('任务修改失败')
            }
        })
        // eslint-disable-next-line
    }, [updateTaskData])
    const deleteHandler = useCallback((record) => {
        HttpApi.updateTaskInfo({ query: { id: record.id }, update: { effective: 0 } }, (res) => {
            if (res.data.code === 0) {
                message.success('删除成功')
                init()
            } else {
                message.error(res.data.data)
            }
        })
    }, [init])
    useEffect(() => { init() }, [init])
    const columns = [
        {
            title: '编号',
            dataIndex: 'id',
            align: 'center',
            width: 120,
        },
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
            title: '执行人',
            dataIndex: 'toArrname',
            width: '20%',
            render: (text, record) => {
                return <div>{text.join(',') || '/'}</div>
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
                    result = getDuration(Math.abs(remain_time));
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
                if (text === 2) { str = '终结'; strColor = 'blue' }
                else if (text === 1) { str = '待检'; strColor = 'purple' }
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
            render: (text, record, index) => (
                <div style={{ textAlign: 'center' }}>
                    <Popconfirm title="确定要删除该任务吗?" onConfirm={() => { deleteHandler(record) }}>
                        <Button size="small" type="danger">删除</Button>
                    </Popconfirm>
                    <Divider type="vertical" />
                    <Button size="small" type="primary" onClick={() => { setUpdateTaskData(record); setUpdateTaskVisible(true) }}>详情</Button>
                </div>
            )
        }
    ];
    return <div style={styles.root}>
        <Button size="small" type="primary" style={{ marginBottom: 10 }} onClick={() => { setAddTaskVisible(true) }}>新建任务</Button>
        <Table
            size="small"
            bordered
            dataSource={tasklist}
            columns={columns}
            pagination={{
                showSizeChanger: true,
                pageSizeOptions: ['10', '50', '100'],
            }}
        />
        <AddTaskView onOk={addTaskOnOk} onCancel={() => { setAddTaskVisible(false) }} visible={addTaskVisible} />
        <PreviewTaskView task={updateTaskData} onOk={updateTaskOnOk}
            onCancel={() => { setUpdateTaskVisible(false) }} visible={updateTaskVisible} />
    </div>
}
const styles = {
    root: {
        padding: 10,
        backgroundColor: '#FFFFFF',
    }
}

function findUserName(userid) {
    let username = '-';
    needStaffInfo.forEach((item) => {
        if (item.id === parseInt(userid)) {
            username = item.name
        }
    })
    return username;
}