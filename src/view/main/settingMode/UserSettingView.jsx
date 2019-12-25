import React, { useEffect, useState } from 'react'
import { List } from 'antd'
import { VersionlistData } from '../../util/AppData'

export default function UserSettingView(props) {
    const [data, setData] = useState([])

    useEffect(() => {
        const userinfo = JSON.parse(window.localStorage.getItem('userinfo'))
        const listData = [
            { title: '姓名', description: userinfo.name },
            { title: '职位', description: userinfo.remark },
            { title: '手机号', description: userinfo.phonenumber },
            ...VersionlistData
        ]
        setData(listData)
    }, [])
    return <div>
        <List
            itemLayout="horizontal"
            dataSource={data}
            renderItem={item => (
                <List.Item actions={item.actions}>
                    <List.Item.Meta
                        title={item.title}
                        description={item.description}
                    />
                </List.Item>
            )}
        />
    </div>
}