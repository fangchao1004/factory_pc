import React, { useState, useEffect, useCallback, useContext } from 'react'
import { Table, Button, message, Tag } from 'antd'
import HttpApi from '../../util/HttpApi'
import UpdateTaskView from './UpdateTaskView'
import moment from 'moment'
import { getDuration } from '../../util/Tool';
import { AppDataContext } from '../../../redux/AppRedux'

var storage = window.localStorage;
var userinfo = JSON.parse(storage.getItem("userinfo"))
var currentTime = moment().toDate().getTime();
var task_status_filter = [{ text: '未完成', value: 0 }, { text: '待检', value: 1 }, { text: '完结', value: 2 }];///用于筛选任务状态的数据 选项
/**
 * 给我的任务界面
 */
export default props => {
    const { appDispatch } = useContext(AppDataContext)
    const [tasklist, setTasklist] = useState([])
    const [userlist, setUserlist] = useState([])
    const [updateTaskVisible, setUpdateTaskVisible] = useState(false)
    const [updateTaskData, setUpdateTaskData] = useState(null)
    const init = useCallback(async () => {
        let sql_task = `select * from tasks where tasks.to like '%,${userinfo.id},%' and effective = 1 order by id DESC`;
        let res_task = await HttpApi.obs({ sql: sql_task })
        if (res_task.data.code === 0) {
            let result = res_task.data.data.map(user => {
                user.key = user.id
                return user
            });
            setTasklist(result)
            let undidtasklist = result.filter((item) => { return item.status === 0 });
            appDispatch({ type: 'aboutMeTaskCount', data: undidtasklist.length })
        }
        let res_user = await HttpApi.getUserInfo({ effective: 1 })
        if (res_user.data.code === 0) {
            setUserlist(res_user.data.data)
        }
    }, [appDispatch])
    const sendMessageToLeader = useCallback(async (taskInfo) => {
        const userid = taskInfo.form;
        let res_one_user = await HttpApi.getUserInfo({ id: userid })
        if (res_one_user.data.code === 0 && res_one_user.data.data.length > 0) {
            let leaderInfo = res_one_user.data.data[0]
            let param = { phonenumber: leaderInfo.phonenumber, name: leaderInfo.name, name_to: userinfo.name }
            HttpApi.sendMessageToLeader(param)
        }
    }, [])
    const updateTaskOnOk = useCallback(async (newtaskInfo, taskVisible_param = false) => {
        let res = await HttpApi.updateTaskInfo({ query: { id: updateTaskData.id }, update: { ...newtaskInfo } })
        if (res.data.code === 0) {
            setUpdateTaskVisible(false)
            init()
            message.success('操作成功')
            if (newtaskInfo.isMessage === 1) {
                sendMessageToLeader(newtaskInfo)
            }
        } else { message.error(res.data.data) }
    }, [init, sendMessageToLeader, updateTaskData])
    useEffect(() => {
        init();
    }, [init, updateTaskData])
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
                userlist.some(user => {
                    if (user.id === text) {
                        u = user
                        return true
                    }
                    return false
                })
                return <span>{u ? u.name : '/'}</span>
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
                if (text === 2) { str = '完结'; strColor = 'blue' }
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
            width: 75,
            render: (text, record, index) => (
                <div style={{ textAlign: 'center' }}>
                    <Button size="small" type="primary" onClick={() => {
                        setUpdateTaskVisible(true)
                        setUpdateTaskData(record)
                    }}>详情</Button>
                </div>
            )
        }
    ];
    return <div style={styles.root}>
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
        <UpdateTaskView task={updateTaskData} onOk={updateTaskOnOk}
            onCancel={() => { setUpdateTaskVisible(false) }} visible={updateTaskVisible} />
    </div>
}

const styles = {
    root: {
        padding: 10,
        backgroundColor: '#FFFFFF',
    }
}