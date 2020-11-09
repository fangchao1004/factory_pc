import React, { useState, useEffect } from 'react'
import HttpApi from '../../util/HttpApi';
import { Table, Popconfirm, Divider, Button, message } from 'antd';
import AddBugLTM from './AddBugLTM';
import UpdateBugLTM from './UpdateBugLTM';
/// 缺陷专业管理界面 （电气，渗滤液,.... major表）
export default props => {
    const [majors, setMajors] = useState([]);
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [updateModalVisible, setUpdateModalVisible] = useState(false);
    const [record, setRecord] = useState({});
    const [title, setTitle] = useState('');
    useEffect(() => {
        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    const init = async () => {
        let result = await getMajorInfo();
        setMajors(result.map((item, index) => { item.key = index; return item }));
    }
    const getMajorInfo = () => {
        return new Promise((resolve, reject) => {
            HttpApi.getUserMajor({ effective: 1 }, data => {
                if (data.data.code === 0) {
                    resolve(data.data.data)
                }
            })
        })
    }
    const addMajor = (data) => {
        setAddModalVisible(false)
        HttpApi.addUserMajor(data, (res) => {
            if (res.data.code === 0) { message.success('添加成功'); init() }
        })
    }
    const updateMajor = (data) => {
        setUpdateModalVisible(false)
        HttpApi.updateUserMajor({ query: { id: record.id }, update: data }, (res) => {
            if (res.data.code === 0) { message.success('更新成功'); init() }
        })
    }
    const deleteHandler = (recordValue) => {
        HttpApi.updateUserMajor({ query: { id: recordValue.id }, update: { effective: 0 } }, (res) => {
            if (res.data.code === 0) {
                let sql = `update user_map_major set effective = 0 where mj_id = ${recordValue.id}`
                HttpApi.obs({ sql }, (res) => {
                    if (res.data.code === 0) {
                        message.success('删除成功');
                        init();
                    }
                })
            }
        })
    }
    const columns = [
        {
            title: '名称',
            dataIndex: 'name'
        }, {
            title: '操作',
            dataIndex: 'actions',
            width: 150,
            render: (text, record) => (
                <div style={{ textAlign: 'center' }}>
                    <Popconfirm title="确定要删除该缺陷专业吗?" onConfirm={() => { deleteHandler(record) }}>
                        <Button size="small" type="danger">删除</Button>
                    </Popconfirm>
                    <Divider type="vertical" />
                    <Button size="small" type="primary" onClick={() => {
                        setTitle('修改缺陷专业');
                        setUpdateModalVisible(true);
                        setRecord(record);
                    }}>修改</Button></div>
            )
        }
    ]
    return <div style={{ padding: 10, backgroundColor: '#FFFFFF' }}>
        <Button size="small" type={'primary'} style={{ marginBottom: 10 }} onClick={() => { setTitle('添加缺陷专业'); setAddModalVisible(true) }}>添加缺陷专业</Button>
        <Table
            size="small"
            bordered
            columns={columns}
            dataSource={majors}
            pagination={{
                showSizeChanger: true,
                pageSizeOptions: ['10', '50', '100'],
            }}
        />
        <AddBugLTM visible={addModalVisible} onCancel={() => { setAddModalVisible(false) }} onOk={addMajor} title={title} />
        <UpdateBugLTM visible={updateModalVisible} onCancel={() => { setUpdateModalVisible(false) }} onOk={updateMajor} title={title} record={record} />
    </div>
}