import { Empty, Icon, Modal, Tag, Timeline } from 'antd'
import React, { useCallback, useEffect, useState } from 'react'
import HttpApi from '../../util/HttpApi';

export default function JobTicketStepLogView({ record, visible, onCancel }) {
    const [steplist, setSteplist] = useState([])
    const init = useCallback(async () => {
        if (record) {
            const jbtar_id = record.id;
            let res = await HttpApi.getJTStepLogs({ jbtar_id })
            if (res.data.code === 0) {
                let tempList = res.data.data.map((item) => { return { time: item.time, user_name: item.user_name, step_des: item.step_des, remark: item.remark, is_agent: item.is_agent } })
                // console.log(tempList);
                setSteplist(tempList)
            }
        }
    }, [record])
    const RenderStepTree = useCallback(() => {
        if (steplist.length === 0) { return <Empty /> }
        return <Timeline style={{ marginTop: 10 }} >
            {steplist.map((item, index) => {
                // console.log('item:', item);
                return <Timeline.Item key={index}>
                    <div>
                        <Tag color={'#1690FF'}><Icon style={{ marginRight: 5 }} type="clock-circle" />{item.time}</Tag>
                        <Tag color={item.is_agent ? '#f5222d' : '#ff7a45'} ><Icon style={{ marginRight: 5 }} type={item.is_agent ? 'audit' : 'user'} />{item.user_name}</Tag>
                        <span>{item.step_des}</span>
                        {item.remark ? <div style={{ color: '#FF9900', marginTop: 2 }}>{'备注: ' + item.remark}</div> : ''}
                    </div>
                </Timeline.Item>
            })}
        </Timeline>
    }, [steplist])
    useEffect(() => {
        init()
    }, [init])
    return (
        <Modal destroyOnClose visible={visible} width={600}
            title='工作票处理记录'
            onCancel={onCancel}
            footer={null}>
            <div style={{ height: steplist.length > 0 ? 400 : 200, overflow: "scroll" }}>
                {RenderStepTree()}
            </div>
        </Modal>
    )
}
