import { Alert, Input, message, Modal } from 'antd'
import React, { useCallback, useEffect, useState } from 'react'

export default function UpdateSampleModal({ data, visible, onCancel, onOk }) {
    const [selfTicketName, setSelfTicketName] = useState(null)
    const init = useCallback(() => {
        if (data && data.self_ticket_name)
            setSelfTicketName(data.self_ticket_name)
    }, [data])
    useEffect(() => {
        init()
    }, [init])
    return (
        <Modal
            destroyOnClose
            title='修改覆盖模版'
            visible={visible}
            onCancel={onCancel}
            onOk={() => {
                if (!selfTicketName) { message.error('请输入自定义模版的名称'); return }
                onOk({ self_ticket_name: selfTicketName })
                setSelfTicketName(null)
            }}
        >
            <Alert style={{ marginBottom: 10 }} message='注意！工作票模版会忽略所有日期时间与措施票勾选值' showIcon type='warning' />
            <Input value={selfTicketName} placeholder='请输入名称' onChange={(e) => {
                setSelfTicketName(e.target.value)
            }} />
        </Modal>
    )
}
