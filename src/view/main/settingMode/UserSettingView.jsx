import React, { useEffect, useState } from 'react'
import { List } from 'antd'

export default function UserSettingView(props) {
    const [data, setData] = useState([])

    useEffect(() => {
        const userinfo = JSON.parse(window.localStorage.getItem('userinfo'))
        const listData = [
            { title: '姓名', description: userinfo.name },
            { title: '职位', description: userinfo.remark },
            { title: '手机号', description: userinfo.phonenumber },
            { title: '版本号', description: 'V 1.1.8' },
            // { title: '更新', description: '1.0.7支持缺陷数据导出为Excel' }
            // { title: '更新', description: '1.0.8 添加考勤信息-测试版本' }
            // { title: '更新', description: '1.0.9 添加设备信息修改功能' }
            // { title: '更新', description: '1.1.0 消费审批' }
            // { title: '更新', description: '1.1.1 任务进程添加' }
            //  { title: '更新', description: '1.1.2 点检record-改造+巡检记录展示改造' }
            // { title: '更新', description: '1.1.3 增加巡检点处-区域和巡检点类型筛选' }
            // { title: '更新', description: '1.1.4 多级区域' }
            // { title: '更新', description: '1.1.5 多级区域-自由选择' }
            // { title: '更新', description: '1.1.6 打点时间修改-添加巡检时间段模块' }
            // { title: '更新', description: '1.1.7 编辑表单模块增设通用组件' }
            { title: '更新', description: '1.1.8' }
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