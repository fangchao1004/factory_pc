import React, { useState, useEffect } from 'react'
import HttpApi from '../../util/HttpApi';
import { Table, Popconfirm, Divider, Button, message } from 'antd';
import AddBugLTM from './AddBugLTM';
import UpdateBugLTM from './UpdateBugLTM';
/// 备注类型管理界面 （正常,缺少备件,停机处理,.... bug_types表）
export default props => {
    const [bugLevels, setBugTypes] = useState([]);
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [updateModalVisible, setUpdateModalVisible] = useState(false);
    const [record, setRecord] = useState({});
    const [title, setTitle] = useState('');
    useEffect(() => {
        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    const init = async () => {
        let result = await getBugTypeInfo();
        setBugTypes(result.map((item, index) => { item.key = index; return item }));
    }
    const getBugTypeInfo = () => {
        return new Promise((resolve, reject) => {
            HttpApi.getBugType({ effective: 1 }, data => {
                if (data.data.code === 0) {
                    resolve(data.data.data)
                }
            })
        })
    }
    const addBugType = async (data) => {
        setAddModalVisible(false)
        HttpApi.addBugType(data, (res) => {
            if (res.data.code === 0) { message.success('添加成功'); init() }
        })
    }
    const updateBugType = async (data) => {
        setUpdateModalVisible(false)
        HttpApi.updateBugType({ query: { id: record.id }, update: data }, (res) => {
            if (res.data.code === 0) { message.success('更新成功'); init() }
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
                    <Popconfirm title="确定要删除该备注类型吗?" onConfirm={() => { }}>
                        <Button size="small" type="danger">删除</Button>
                    </Popconfirm>
                    <Divider type="vertical" />
                    <Button size="small" type="primary" onClick={() => {
                        setTitle('修改备注类型');
                        setUpdateModalVisible(true);
                        setRecord(record);
                    }}>修改</Button></div>
            )
        }
    ]
    return <div>
        <Button type={'primary'} style={{ marginBottom: 20 }} onClick={() => { setTitle('添加备注类型'); setAddModalVisible(true) }}>添加备注类型</Button>
        <Table
            bordered
            columns={columns}
            dataSource={bugLevels}
            pagination={{
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50', '80', '100'],
            }}
        />
        <AddBugLTM visible={addModalVisible} onCancel={() => { setAddModalVisible(false) }} onOk={addBugType} title={title} />
        <UpdateBugLTM visible={updateModalVisible} onCancel={() => { setUpdateModalVisible(false) }} onOk={updateBugType} title={title} record={record} />
    </div>
}