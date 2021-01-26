import { Badge, Button, Table, Tooltip } from 'antd';
import React, { useCallback, useEffect, useState } from 'react'
import HttpApi from '../../util/HttpApi';
import { changeJobTicketStatusToText } from '../../util/Tool';
import JobTicketDrawer from './JobTicketDrawer';
import JobTicketStepLogView from './JobTicketStepLogView';
const storage = window.localStorage;
export default function JobTicketOfMine() {
    const [list, setList] = useState([])
    const [drawerVisible, setDrawerVisible] = useState(false)
    const [currentSelectRecord, setCurrentSelectRecord] = useState(null)
    const [stepLogVisible, setStepLogVisible] = useState(false);///展示步骤界面
    const [currentUser, setCurrentUser] = useState({})
    const init = useCallback(async () => {
        const localUserInfo = storage.getItem('userinfo');
        let userinfo = JSON.parse(localUserInfo);
        setCurrentUser(userinfo)
        let run_permission = userinfo.permission && userinfo.permission.split(',').indexOf("1") !== -1;
        let res = await HttpApi.getJTApplyRecords({ major_id: userinfo.major_id_all, user_id: userinfo.id, is_all: run_permission });
        if (res.data.code === 0) {
            let templist = res.data.data.map((item, index) => { item.key = index; return item })
            setList(templist)
        }
    }, [])
    const readLocalRecord = useCallback(async (record) => {
        if (record.is_read) { return }
        let copy_list = JSON.parse(JSON.stringify(list))
        copy_list.forEach((item) => {
            if (item.id === record.id) { item.is_read = 1 }
        })
        setList(copy_list)
        await HttpApi.updateJTApplyRecord({ id: record.id, is_read: 1 })
    }, [list])
    useEffect(() => {
        init();
    }, [init])
    useEffect(() => {
        let loop = setInterval(() => {
            init();
        }, 5 * 60 * 1000)
        return () => {
            clearInterval(loop)
        }
    }, [init])
    const columns = [
        {
            title: '序号', dataIndex: 'id', key: 'id', width: 80, render: (text, record) => {
                return <div>{record.is_read ? null : <Badge status="processing" />}{text}</div>
            }
        },
        { title: '编号', dataIndex: 'no', key: 'no', width: 120 },
        { title: '发起时间', dataIndex: 'time', key: 'time', width: 180 },
        { title: '计划开始', dataIndex: 'time_begin', key: 'time_begin', width: 150 },
        { title: '计划结束', dataIndex: 'time_end', key: 'time_end', width: 150 },
        {
            title: '内容', dataIndex: 'job_content', key: 'job_content', render: (text) => {
                return <Tooltip title={text} placement="topLeft">
                    <div className='hideText lineClamp2'>{text}</div>
                </Tooltip>
            }
        },
        { title: '申请人', dataIndex: 'user_name', key: 'user_name', width: 100 },
        { title: '上步处理人', dataIndex: 'user_name', key: 'per_step_user_name', width: 100 },
        {
            title: '状态', dataIndex: 'status', key: 'status', width: 80, render: (text) => {
                return changeJobTicketStatusToText(text)
            }
        },
        {
            title: '操作', dataIndex: 'action', key: 'action', align: 'center', width: 100, render: (_, record) => {
                return <div>
                    <Button disabled={record.current_step_user_id_list.indexOf(`,${currentUser.id},`) === -1} size='small' type='primary' icon='edit' onClick={() => { setCurrentSelectRecord(record); setDrawerVisible(true); readLocalRecord(record); }}>处理</Button>
                    <div style={{ borderBottomStyle: 'solid', borderBottomColor: '#D0D0D0', borderBottomWidth: 1, margin: 10 }} />
                    <Button icon='unordered-list' size="small" type="default" onClick={() => { setStepLogVisible(true); setCurrentSelectRecord(record); }}>记录</Button>
                </div>
            }
        },
    ]
    return (
        <div style={styles.root}>
            <div style={styles.head}>
                <h2 style={styles.title}>我的工作票</h2>
            </div>
            <div style={styles.body}>
                <Table
                    bordered
                    size='small'
                    columns={columns}
                    dataSource={list}
                />
            </div>
            <JobTicketDrawer visible={drawerVisible} onClose={() => { setDrawerVisible(false); setCurrentSelectRecord(null) }} record={currentSelectRecord} resetData={init} />
            <JobTicketStepLogView record={currentSelectRecord} visible={stepLogVisible} onCancel={() => { setStepLogVisible(false) }} />
        </div>
    )
}
const styles = {
    root: {
        padding: 10,
    },
    head: {
        backgroundColor: '#FFFFFF',
        padding: "10px 10px 5px 10px",
    },
    title: {
        borderLeft: 4, borderLeftColor: "#3080fe", borderLeftStyle: 'solid', paddingLeft: 5, fontSize: 16, backgroundColor: '#FFFFFF',
    },
    body: {
        backgroundColor: '#FFFFFF',
        padding: 10,
        marginTop: 10
    }
}