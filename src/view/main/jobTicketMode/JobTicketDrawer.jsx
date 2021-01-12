import { Alert, Button, Drawer, Tag, Select, message, Modal } from 'antd'
import React, { useCallback, useEffect, useState } from 'react'
import HttpApi from '../../util/HttpApi'
import { RenderEngine } from '../../util/RenderEngine'
import { changeShowLabByStauts } from '../../util/Tool';
const { confirm } = Modal;
const storage = window.localStorage;
export default function JobTicketDrawer({ visible, onClose, record, resetData }) {
    const [currentJobTicket, setCurrentJobTicket] = useState({})///当前票的数据
    const [currentJobTicketValue, setCurrentJobTicketValue] = useState({})///填写改动后的数值-二者区分开 提交时使用
    const [currentPageIndex, setCurentPageIndex] = useState(0)///当前页面索引 0 为第一页
    const [currentUserId, setCurrentUserId] = useState(null)
    const [userList, setUserList] = useState([])
    const [selectValue, setSelectValue] = useState(null)
    const [selectDisable, setSelectDisable] = useState(true)///默认不可操作
    const [showDeleteBtn, setShowDeleteBtn] = useState(false)///是否显示删除按钮
    const [showStopBtn, setShowStopBtn] = useState(false)///是否显示终止作废按钮
    const perpage = useCallback(() => {
        if (currentPageIndex > 0) { setCurentPageIndex(currentPageIndex - 1) }
    }, [currentPageIndex])
    const nextpage = useCallback(() => {
        if (currentPageIndex < currentJobTicket.pages.length - 1) { setCurentPageIndex(currentPageIndex + 1) }
    }, [currentPageIndex, currentJobTicket])

    const init = useCallback(async () => {
        if (record && record.job_t_r_id) {
            let res = await HttpApi.getJTRecords({ id: record.job_t_r_id })
            if (res.data.code === 0) {
                let tempObj = JSON.parse(JSON.stringify(res.data.data[0]))
                tempObj.pages = JSON.parse(tempObj.pages)
                // console.log('tempObj:', tempObj);
                setCurrentJobTicket(tempObj)///票数据初始化
                setCurrentJobTicketValue(tempObj)///票数据初始化
            }
            let res_user = await HttpApi.getUserInfo({ effective: 1 })
            if (res_user.data.code === 0) {
                let user_list = res_user.data.data.map((item) => { return { id: item.id, name: item.name } })
                setUserList(user_list)
            }
            const localUserInfo = storage.getItem('userinfo');
            const userObj = JSON.parse(localUserInfo)
            setCurrentUserId(userObj.id)
            if ((record.status === 0 || record.status === 1 || record.status === 2) && userObj.id === record.user_id) {
                ///0待审核 1待接票 2待回填 状态时，申请人可以操作
                setSelectDisable(false)
                if (record.status === 0) {
                    setShowDeleteBtn(true)
                    if (userObj.permission.split(',').indexOf("0") === -1) {
                        setSelectDisable(true)
                        setShowStopBtn(false)
                    }
                } else {
                    setShowDeleteBtn(false)
                    setShowStopBtn(true)
                }
            }
            console.log('userObj:', userObj);
            console.log('专工权限:', userObj.permission.split(',').indexOf("0") !== -1);
            console.log('运行权限:', userObj.permission.split(',').indexOf("1") !== -1);
            if (record.status === 0 && userObj.major_id_all && userObj.major_id_all.split(',').indexOf(String(record.major_id)) !== -1 && userObj.permission && userObj.permission.split(',').indexOf("0") !== -1) {
                ///0待审核 状态时，对应专业的专工可以操作
                setSelectDisable(false)
                setShowStopBtn(true)

            }
            if (record.status === 3 && userObj.major_id_all && userObj.permission && userObj.permission.split(',').indexOf("1") !== -1) {
                ///0待确认 状态时，运行可以操作
                setSelectDisable(false)
                setShowDeleteBtn(false)
                setShowStopBtn(true)
            }
            if (record.status === 4) {
                setSelectDisable(true)
                setShowDeleteBtn(false)
                setShowStopBtn(false)
            }
        }
    }, [record])
    useEffect(() => {
        init();
    }, [init])
    return (
        <Drawer
            destroyOnClose={true}
            width={900}
            title="工作票处理"
            placement='left'
            onClose={onClose}
            visible={visible}
        >
            <div style={{ backgroundColor: '#F1F2F5', padding: '10px 10px 0 10px', }}>
                <div style={styles.panel}>
                    <Alert message='处理栏选择后点击提交上传数据；工作票进入下一状态' type='info' showIcon />
                    <div style={{ marginTop: 10, ...styles.bar }}><Tag color='blue'>操作</Tag>
                        <div style={{ width: 200, ...styles.bar }}>
                            <Button type='primary' size='small' disabled={currentPageIndex === 0} onClick={perpage}>上一页</Button>
                            <Button type='primary' size='small' disabled={!currentJobTicket.pages || currentPageIndex === currentJobTicket.pages.length - 1}
                                onClick={nextpage}
                            >下一页</Button>
                        </div>
                    </div>
                    <div style={{ marginTop: 10, ...styles.bar }}><Tag color='blue'>处理</Tag>
                        <Select placeholder='请选择处理项' allowClear size='small' style={{ width: 200 }} disabled={selectDisable}
                            onChange={(v) => { setSelectValue(v) }}
                        >
                            <Select.Option value='1'>{record && record.status >= 0 ? changeShowLabByStauts(record.status) : '通过'}</Select.Option>
                            {record && record.status !== 2 && record.status !== 0 ? <Select.Option value='-1'>打回</Select.Option> : null}
                        </Select>
                    </div>
                    <div style={{ marginTop: 10, ...styles.bar }}>
                        <span>
                            {showStopBtn ? <Button type='danger' size='small' icon='stop' style={{ marginRight: 10 }} onClick={() => {
                                confirm({
                                    title: '确认作废当前工作票吗?',
                                    content: '请自行保证准确性',
                                    okText: '确认',
                                    okType: 'danger',
                                    cancelText: '取消',
                                    onOk: async () => {
                                        let res = await HttpApi.updateJTApplyRecord({ id: record.id, is_stop: 1 })
                                        if (res.data.code === 0) {
                                            message.success('已经作废')
                                            setCurentPageIndex(0)
                                            onClose()
                                            resetData()
                                        }
                                    }
                                })
                            }}>作废</Button> : null}
                            {showDeleteBtn ? <Button type='danger' size='small' icon='delete' onClick={() => {
                                confirm({
                                    title: '确认删除当前工作票吗?',
                                    content: '请自行保证准确性',
                                    okText: '确认',
                                    okType: 'danger',
                                    cancelText: '取消',
                                    onOk: async () => {
                                        let res = await HttpApi.updateJTApplyRecord({ id: record.id, is_delete: 1 })
                                        if (res.data.code === 0) {
                                            message.success('已经删除')
                                            setCurentPageIndex(0)
                                            onClose()
                                            resetData()
                                        }
                                    }
                                })
                            }}>删除</Button> : null}
                        </span>
                        <Button disabled={selectDisable} type='danger' size='small' icon='upload' onClick={async () => {
                            if (!selectValue) { message.error('请先选择处理项'); return }
                            confirm({
                                title: '确认提交吗?',
                                content: '请自行保证准确性',
                                okText: '确认',
                                okType: 'danger',
                                cancelText: '取消',
                                onOk: async () => {
                                    // console.log('selectValue:', selectValue);
                                    // console.log('值:', currentJobTicketValue);
                                    // console.log('record:', record);
                                    ///修改 job_tickets_records 中的pages 和 job_tickets_apply_records 中的status
                                    let res1 = await HttpApi.updateJTRecord({ id: currentJobTicketValue.id, pages: JSON.stringify(currentJobTicketValue.pages) })
                                    if (res1.data.code === 0) {
                                        let new_status = record.status;
                                        if (selectValue === "1") {
                                            new_status = record.status + 1
                                        }
                                        else {
                                            new_status = record.status - 1
                                        }
                                        let res2 = await HttpApi.updateJTApplyRecord({ id: record.id, status: new_status })
                                        if (res2.data.code === 0) {
                                            message.success('提交成功')
                                            setCurentPageIndex(0)
                                            onClose()
                                            resetData()
                                        }
                                    }
                                },
                            });
                        }}>提交</Button>
                    </div>
                </div>
                <RenderEngine jsonlist={currentJobTicket} userList={userList} currentUserId={currentUserId} currentPageIndex={currentPageIndex} callbackValue={(v) => {
                    setCurrentJobTicketValue(v)///数据改动后的回调
                }} />
            </div>
        </Drawer >
    )
}
const styles = {
    panel: {
        backgroundColor: '#FFFFFF',
        padding: 10
    },
    bar: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
    }
}