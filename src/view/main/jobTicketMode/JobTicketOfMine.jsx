import { Button, Table, Tooltip } from 'antd';
import React, { useCallback, useEffect, useState } from 'react'
import HttpApi from '../../util/HttpApi';
import { changeJobTicketStatusToText } from '../../util/Tool';
import JobTicketDrawer from './JobTicketDrawer';
const storage = window.localStorage;
export default function JobTicketOfMine() {
    const [list, setList] = useState([])
    const [drawerVisible, setDrawerVisible] = useState(false)
    const [currentSelectRecord, setCurrentSelectRecord] = useState(null)
    const init = useCallback(async () => {
        const localUserInfo = storage.getItem('userinfo');
        let userinfo = JSON.parse(localUserInfo);
        let run_permission = userinfo.permission && userinfo.permission.split(',').indexOf("1") !== -1;
        let res = await HttpApi.getJTApplyRecords({ major_id: userinfo.major_id_all, user_id: userinfo.id, is_all: run_permission });
        if (res.data.code === 0) {
            let templist = res.data.data.map((item, index) => { item.key = index; return item })
            setList(templist)
        }
    }, [])
    useEffect(() => {
        init();
    }, [init])
    const columns = [
        { title: '序号', dataIndex: 'id', key: 'id', width: 60 },
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
        {
            title: '状态', dataIndex: 'status', key: 'status', width: 100, render: (text) => {
                return changeJobTicketStatusToText(text)
            }
        },
        {
            title: '操作', dataIndex: 'action', key: 'action', width: 100, render: (_, record) => {
                return <div><Button size='small' type='primary' icon='edit' onClick={() => { setCurrentSelectRecord(record); setDrawerVisible(true) }}>处理</Button></div>
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