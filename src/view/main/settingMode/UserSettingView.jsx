import React, { useEffect, useState } from 'react'
import { List } from 'antd'
import { VersionlistData } from '../../util/AppData'
import { environmentIsTest } from '../../util/HttpApi'

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
                        description={<div>{item.description}</div>}
                    />
                </List.Item>
            )}
        >
            <List.Item.Meta title={<a style={{ color: "#47A2FF" }} rel="noopener noreferrer" href={`http://60.174.196.158:12345/update_log/update${environmentIsTest ? '_test' : ''}.html`} title="更新日志" target="_blank">更新日志</a>} />
        </List>
    </div>
}