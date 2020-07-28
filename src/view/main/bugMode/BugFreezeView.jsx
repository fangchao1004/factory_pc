import React, { useState, useEffect } from 'react'
import HttpApi from '../../util/HttpApi';
import { Table, Popconfirm, Divider, Button, message, Alert } from 'antd';
import AddBugLTM from './AddBugLTM';
import UpdateBugLTM from './UpdateBugLTM';
/// 缺陷管理界面 （待采购,停运处理,.... bug_freeze_status表）
export default props => {
    const [freezes, setFreezes] = useState([]);
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [updateModalVisible, setUpdateModalVisible] = useState(false);
    const [record, setRecord] = useState({});
    const [title, setTitle] = useState('');
    useEffect(() => {
        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    const init = async () => {
        let result = await getFreezeInfo();
        setFreezes(result.map((item, index) => { item.key = index; return item }));
    }
    const getFreezeInfo = () => {
        return new Promise((resolve, reject) => {
            let sql = `select * from bug_freeze_status where effective = 1`
            HttpApi.obs({ sql }, data => {
                if (data.data.code === 0) {
                    resolve(data.data.data)
                }
            })
        })
    }
    const addFreeze = (data) => {
        setAddModalVisible(false)
        let sql = `insert into bug_freeze_status (des) values ('${data.name}')`
        HttpApi.obs({ sql }, (res) => {
            if (res.data.code === 0) { message.success('添加成功'); init() } else { message.error('添加失败'); }
        })
    }
    const updateFreeze = (data) => {
        setUpdateModalVisible(false)
        let sql = `update bug_freeze_status set des = '${data.name}' where id = ${record.id}`
        HttpApi.obs({ sql }, (res) => {
            if (res.data.code === 0) { message.success('更新成功'); init() } else { message.error('更新失败'); }
        })
    }
    const deleteHandler = (record) => {
        let sql = `update bug_freeze_status set effective = 0 where id = ${record.id}`
        HttpApi.obs({ sql }, (res) => {
            if (res.data.code === 0) { message.success('删除成功'); init() } else { message.error('删除失败'); }
        })
    }
    const columns = [
        {
            title: '名称',
            dataIndex: 'des'
        }, {
            title: '操作',
            dataIndex: 'actions',
            width: 150,
            render: (text, record) => (
                <div style={{ textAlign: 'center' }}>
                    <Popconfirm title="确定要删除该状态吗?" onConfirm={() => { deleteHandler(record) }}>
                        <Button size="small" type="danger">删除</Button>
                    </Popconfirm>
                    <Divider type="vertical" />
                    <Button size="small" type="primary" onClick={() => {
                        setTitle('修改状态');
                        setUpdateModalVisible(true);
                        record.name = record.des;
                        setRecord(record);
                    }}>修改</Button></div>
            )
        }
    ]
    return <div>
        <Alert message="请勿随意删除, 至少保持一个缺陷状态用于挂起操作时的具体选项" type="info" showIcon />
        <Button style={{ marginTop: 10 }} type={'primary'} onClick={() => { setTitle('添加状态'); setAddModalVisible(true) }}>添加状态</Button>
        <Table
            style={{ marginTop: 10 }}
            bordered
            columns={columns}
            dataSource={freezes}
            pagination={{
                showSizeChanger: true,
                pageSizeOptions: ['10', '50', '100'],
            }}
        />
        <AddBugLTM visible={addModalVisible} onCancel={() => { setAddModalVisible(false) }} onOk={addFreeze} title={title} />
        <UpdateBugLTM visible={updateModalVisible} onCancel={() => { setUpdateModalVisible(false) }} onOk={updateFreeze} title={title} record={record} />
    </div>
}