import { Button, Table } from 'antd';
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
        { title: '编号', dataIndex: 'id', key: 'id', width: 100 },
        { title: '时间', dataIndex: 'time', key: 'time', width: 180 },
        { title: '票名', dataIndex: 'ticket_name', key: 'ticket_name' },
        { title: '申请人', dataIndex: 'user_name', key: 'user_name' },
        {
            title: '状态', dataIndex: 'status', key: 'status', render: (text) => {
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