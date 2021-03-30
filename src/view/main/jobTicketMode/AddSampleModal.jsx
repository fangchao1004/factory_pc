import { Alert, Input, message, Modal } from 'antd'
import React, { useState } from 'react'

export default function AddSampleModal({ visible, onCancel, onOk }) {
    const [selfTicketName, setSelfTicketName] = useState(null)
    return (
        <Modal
            destroyOnClose
            title='另存为模版'
            visible={visible}
            onCancel={onCancel}
            onOk={() => {
                if (!selfTicketName) { message.error('请输入自定义模版的名称'); return }
                onOk({ self_ticket_name: selfTicketName })
                setSelfTicketName(null)
            }}
        >
            <Alert style={{ marginBottom: 10 }} message='注意！工作票模版会忽略所有日期时间与措施票勾选值；可前往设置-个人中心进行模版的删除；保存主票时会自动刷新数据；请在此之前确保没有未保存的的措施票；' showIcon type='warning' />
            <Input value={selfTicketName} placeholder='请输入名称' onChange={(e) => {
                setSelfTicketName(e.target.value)
            }} />
        </Modal>
    )
}
