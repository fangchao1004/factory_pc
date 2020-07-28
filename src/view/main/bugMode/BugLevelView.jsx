import React, { useState, useEffect } from 'react'
import HttpApi from '../../util/HttpApi';
import { Table, Popconfirm, Divider, Button, message } from 'antd';
import AddBugLTM from './AddBugLTM';
import UpdateBugLTM from './UpdateBugLTM';
/// 缺陷类型（等级）管理界面 （一级,二级,三级,.... bug_level表）
export default props => {
    const [bugLevels, setBugLevels] = useState([]);
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [updateModalVisible, setUpdateModalVisible] = useState(false);
    const [record, setRecord] = useState({});
    const [title, setTitle] = useState('');
    useEffect(() => {
        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    const init = async () => {
        let result = await getBugLevelInfo();
        setBugLevels(result.map((item, index) => { item.key = index; return item }));
    }
    const getBugLevelInfo = () => {
        return new Promise((resolve, reject) => {
            HttpApi.getBugLevel({ effective: 1 }, data => {
                if (data.data.code === 0) {
                    resolve(data.data.data)
                }
            })
        })
    }
    const addBugLevel = (data) => {
        setAddModalVisible(false)
        HttpApi.addBugLevel(data, (res) => {
            if (res.data.code === 0) { message.success('添加成功'); init() }
        })
    }
    const updateBugLevel = (data) => {
        setUpdateModalVisible(false)
        HttpApi.updateBugLevel({ query: { id: record.id }, update: data }, (res) => {
            if (res.data.code === 0) { message.success('更新成功'); init() }
        })
    }
    const deleteHandler = (recordValue) => {
        HttpApi.updateBugLevel({ query: { id: recordValue.id }, update: { effective: 0 } }, (res) => {
            if (res.data.code === 0) { message.success('删除成功'); init() }
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
                    <Popconfirm title="确定要删除该缺陷类型吗?" onConfirm={() => { deleteHandler(record) }}>
                        <Button size="small" type="danger">删除</Button>
                    </Popconfirm>
                    <Divider type="vertical" />
                    <Button size="small" type="primary" onClick={() => {
                        setTitle('修改缺陷类型');
                        setUpdateModalVisible(true);
                        setRecord(record);
                    }}>修改</Button></div>
            )
        }
    ]
    return <div>
        <Button type={'primary'} style={{ marginBottom: 20 }} onClick={() => { setTitle('添加缺陷类型'); setAddModalVisible(true) }}>添加缺陷类型</Button>
        <Table
            bordered
            columns={columns}
            dataSource={bugLevels}
            pagination={{
                showSizeChanger: true,
                pageSizeOptions: ['10', '50', '100'],
            }}
        />
        <AddBugLTM visible={addModalVisible} onCancel={() => { setAddModalVisible(false) }} onOk={addBugLevel} title={title} />
        <UpdateBugLTM visible={updateModalVisible} onCancel={() => { setUpdateModalVisible(false) }} onOk={updateBugLevel} title={title} record={record} />
    </div>
}