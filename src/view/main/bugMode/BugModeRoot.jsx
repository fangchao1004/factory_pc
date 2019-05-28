import React, { useEffect, useState } from 'react'
import { Table } from 'antd';
import HttpApi from '../../util/HttpApi';

export default function BugModeRoot(props) {

    const [dataSource, setDataSource] = useState(null)

    const columns = [
        { key: 'id', dataIndex: 'id', title: '编号' },
        { key: 'record_id', dataIndex: 'record_id', title: '编号' },
        { key: 'device_id', dataIndex: 'device_id', title: '设备编号' },
        { key: 'user_id', dataIndex: 'user_id', title: '上报人' },
        { key: 'fixed_user_id', dataIndex: 'fixed_user_id', title: '解决人' },
        { key: 'status', dataIndex: 'status', title: '状态' },
        { key: 'content', dataIndex: 'content', title: '内容' },
    ]

    // componentDidMount hook
    useEffect(() => {
        HttpApi.getBugInfo(null, (data) => {
            console.log(data)
            if (data.data.code === 0 && data.data.data) {
                setDataSource(data.data.data.map(item => { item.key = item.id; return item }))
            }
        })
    }, [])

    return <Table bordered dataSource={dataSource} columns={columns}></Table>
}