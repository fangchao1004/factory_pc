import React, { useState, useCallback, useEffect } from 'react';
import { List, Avatar, Tag, Button, Popconfirm, message } from 'antd';
import HttpApi from '../../util/HttpApi';
export default (props) => {
    const [dataSource, setDataSource] = useState([])
    const [selectItem, setSelectedItem] = useState(null)
    const dataHandler = useCallback(() => {
        let result = props.data.unreadWarns.map((item, index) => { item.des = item.key; item.key = index; return item }).reverse()
        // console.log('result:', result)
        setDataSource(result)
    }, [props.data.unreadWarns])
    useEffect(() => {
        dataHandler()
    }, [dataHandler])
    return <div>
        <List
            style={{ height: 300, overflow: 'scroll' }}
            itemLayout="horizontal"
            dataSource={dataSource}
            renderItem={item => (
                <List.Item
                    extra={
                        <Popconfirm
                            title="确认关闭此警告吗？"
                            onConfirm={() => {
                                let sql = `update monitor_warning set is_read = 1 where id = ${selectItem.id}`
                                HttpApi.obs({ sql }, (res) => {
                                    if (res.data.code === 0) {
                                        message.success('已关闭该警告', 4)
                                    }
                                })
                            }}
                            okText="确认"
                            cancelText="取消"
                        >
                            <Button type='link' size="small" style={{ padding: 0, marginRight: 8 }} onClick={() => {
                                setSelectedItem(item)
                            }}>关闭</Button>
                        </Popconfirm>
                    }
                >
                    <List.Item.Meta
                        avatar={<Avatar style={{ backgroundColor: '#1890ff', verticalAlign: 'middle' }} size="large">{item.device_no + '号炉'}</Avatar>}
                        title={<Tag color={'#ff7a45'}>{item.des + ' 异常'}</Tag>}
                        description={item.time}
                    />
                </List.Item>
            )}
        />
    </div>
}