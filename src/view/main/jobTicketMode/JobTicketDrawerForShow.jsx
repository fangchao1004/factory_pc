import { Alert, Button, Drawer, Spin } from 'antd'
import React, { useCallback, useEffect, useState } from 'react'
import HttpApi from '../../util/HttpApi'
import { RenderEngine } from '../../util/RenderEngine'
import JobTicketStepLogView from './JobTicketStepLogView';
const storage = window.localStorage;

export default function JobTicketDrawerForShow({ visible, onClose, record }) {
    // console.log('record:', record);
    const [currentJobTicketValue, setCurrentJobTicketValue] = useState({})///填写改动后的数值- 提交时使用
    const [currentUser] = useState(JSON.parse(storage.getItem('userinfo')))
    const [userList, setUserList] = useState([])
    const [loading, setLoading] = useState(true)
    const [stepLogVisible, setStepLogVisible] = useState(false);///展示步骤界面

    const init = useCallback(async () => {
        if (record && record.job_t_r_id) {
            let res = await HttpApi.getJTRecords({ id: record.job_t_r_id })
            if (res.data.code === 0) {
                let tempObj = JSON.parse(JSON.stringify(res.data.data[0]))
                tempObj.pages = JSON.parse(tempObj.pages)
                setCurrentJobTicketValue(tempObj)///票数据初始化
            }
            let res_user = await HttpApi.getUserInfo({ effective: 1 })
            if (res_user.data.code === 0) {
                var user_list = res_user.data.data.map((item) => { return { id: item.id, name: item.name } })
                setUserList(user_list)
            }
        }
        setLoading(false)
    }, [record])

    const renderAllPage = useCallback(() => {
        if (record && currentJobTicketValue && currentJobTicketValue.pages) {
            let scalObj = {}
            if (currentJobTicketValue.scal) {
                scalObj = JSON.parse(currentJobTicketValue.scal)
            }
            return currentJobTicketValue.pages.map((_, index) => {
                return <RenderEngine
                    key={index}
                    jsonlist={currentJobTicketValue}
                    currentStatus={record ? record.status : 1}
                    userList={userList}
                    currentUser={currentUser}
                    currentPageIndex={index}
                    scaleNum={scalObj.scaleNum || 1}
                    bgscaleNum={scalObj.bgscaleNum || 1}
                    callbackValue={v => {
                        setCurrentJobTicketValue(v)
                    }}
                />
            })
        }
    }, [userList, record, currentJobTicketValue, currentUser])
    useEffect(() => {
        setLoading(true)
        setTimeout(() => {
            init();
        }, 500);
    }, [init])

    return (
        <Drawer
            destroyOnClose={true}
            width={930}
            title={<div><span>工作票查看</span><Button type='link' size='small' onClick={() => { setStepLogVisible(true) }}>记录</Button></div>}
            placement='left'
            onClose={onClose}
            visible={visible}
        >
            {loading ?
                <Spin tip="加载数据中...">
                    <Alert
                        message="正在打开【工作票查看】页面"
                        description="在此页面查看工作票，或进行数据修改"
                        type="info"
                    />
                </Spin> :
                <div style={{ display: 'flex', flexDirection: 'row', backgroundColor: '#F1F2F5', padding: '10px 10px 0px 10px', }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {renderAllPage()}
                    </div>
                </div>
            }
            <JobTicketStepLogView record={record} visible={stepLogVisible} onCancel={() => { setStepLogVisible(false) }} />
        </Drawer >
    )
}
