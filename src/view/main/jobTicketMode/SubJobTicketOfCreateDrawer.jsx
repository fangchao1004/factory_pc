import { Drawer, Select, Tag, Button, Affix, Modal, Alert, message } from 'antd'
import React, { useCallback, useEffect, useState } from 'react'
import HttpApi from '../../util/HttpApi';
import { RenderEngine } from '../../util/RenderEngine';
import { checkCellWhichIsEmpty, checkDataIsLostValue, createNewJobTicketApply, getPinYin, getTargetRoleIdUser, removeDateCheckBox } from '../../util/Tool';
import moment from 'moment'
import AddSampleModal from './AddSampleModal';
import UpdateSampleModal from './UpdateSampleModal';
const { OptGroup, Option } = Select
const { confirm } = Modal
var copy_currentSubJBT = {}
var ticketNextUserNameList = []
export default function SubJobTicketOfCreateDrawer({ resetList, pId, pNo, isExtraAdd, visible, onClose, currentSubJBT, userList, currentUser, sbjtvalueChangeCallback }) {
    const [ticketNextUserList, setTicketNextUserList] = useState([])/// allSubTicketList 内容每个措施票所对应的 某些处理人id[{1,2},{1,2},...]
    // const [currentSubJBTSelf, setCurrentSubJBTSelf] = useState(currentSubJBT)
    // console.log('新 currentSubJBT:', currentSubJBT);
    // console.log('userList:', userList);
    const [targetUserList, setTargetUserList] = useState([])
    const [addJBTSampleVisible, setAddJBTSampleVisible] = useState(false)
    const [updateJBTSampleVisible, setUpdateJBTSampleVisible] = useState(false)

    const renderAllPage = useCallback((currentSubJBT) => {
        if (!currentSubJBT.pages) { return null }
        let scalObj = {}
        if (currentSubJBT.scal) {
            scalObj = JSON.parse(currentSubJBT.scal)
        }
        copy_currentSubJBT = JSON.parse(JSON.stringify(currentSubJBT))
        try {
            if (typeof copy_currentSubJBT.pages === 'string') {
                copy_currentSubJBT.pages = JSON.parse(copy_currentSubJBT.pages)
            }
            return copy_currentSubJBT.pages.map((_, index) => {
                return <RenderEngine
                    key={index}
                    jsonlist={copy_currentSubJBT}
                    userList={userList}
                    currentUser={currentUser}
                    currentStatus={0}
                    currentPageIndex={index}
                    scaleNum={scalObj.scaleNum || 1}
                    bgscaleNum={scalObj.bgscaleNum || 1}
                    callbackValue={v => {
                        sbjtvalueChangeCallback(v)
                    }}
                />
            })
        } catch (error) {
            console.log('currentSubJBT.pages JSON解析失败', error);
            return null
        }
    }, [currentUser, userList, sbjtvalueChangeCallback])

    const callbackHandler = useCallback((id_list, name_list) => {
        let userInfo = {}
        userInfo.user_name_list = name_list
        userInfo.user_id_list = id_list
        currentSubJBT.userInfo = userInfo
        let new_copy_currentSubJBT = JSON.parse(JSON.stringify(currentSubJBT))
        // console.log('new_copy_currentSubJBT:', new_copy_currentSubJBT)
        sbjtvalueChangeCallback(new_copy_currentSubJBT)
    }, [currentSubJBT, sbjtvalueChangeCallback])

    const getUserGroupList = useCallback((currentSubJBT) => {
        return <OptGroup key='a' label={<div style={{ width: '100%', justifyContent: 'space-between', display: 'flex', justifyItems: 'center' }}><span>对应处理人</span><Button type='link' size='small'
            onClick={() => {
                setTicketNextUserList(targetUserList.map((item) => item.id))
                ticketNextUserNameList = targetUserList.map((item) => item.name)
                let id_list = targetUserList.map((item) => item.id)
                let name_list = targetUserList.map((item) => item.name)
                callbackHandler(id_list, name_list)
            }}>全选</Button></div>}>
            {targetUserList.map((item, index) => { return <Option key={'a' + index} value={item.id} short_lab={getPinYin(item.name)[0] || ''}>{item.name}</Option> })}
        </OptGroup>
    }, [targetUserList, callbackHandler])

    const initTargetUserList = useCallback(async () => {
        if (!userList) { return null }
        if (!currentSubJBT.status_table) { return null }
        let status_table = JSON.parse(currentSubJBT.status_table)
        let result = status_table.status_list.filter((item) => { return item.current_status === 0 })
        let target_role_id = result[0].next_role_id///候选人role_id数组
        let { target_list } = await getTargetRoleIdUser(userList, target_role_id)
        setTargetUserList(target_list)
    }, [userList, currentSubJBT])

    useEffect(() => {
        initTargetUserList()
    }, [initTargetUserList])

    const resetUserSelectValue = useCallback(() => {
        setTicketNextUserList([])
        ticketNextUserNameList = []
    }, [])
    return (
        <Drawer
            destroyOnClose={true}
            width={1200}
            title="措施票编辑"
            placement='left'
            onClose={() => { resetUserSelectValue(); onClose() }}
            visible={visible}
        >
            <div style={{ display: 'flex', flexDirection: 'row', backgroundColor: '#F1F2F5', padding: 10 }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {renderAllPage(currentSubJBT)}
                </div>
                <Affix offsetTop={100}>
                    <div style={{ backgroundColor: '#FFFFFF', padding: 10, width: 260 }}>
                        {isExtraAdd ? <Alert showIcon={true} message='关闭窗口数据清空' type='info' /> : null}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginTop: 10
                        }}>
                            <Tag color='blue'>人员</Tag>
                            <Select
                                maxTagCount={5}
                                mode="multiple"
                                style={{ width: '100%' }}
                                bordered={false}
                                allowClear={true}
                                placeholder='请选择下一步处理人'
                                showSearch
                                filterOption={(input, option) => {
                                    if (option.props.short_lab) {
                                        let res = option.props.short_lab.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                        return res
                                    } else {
                                        return false
                                    }
                                }}
                                value={ticketNextUserList.length > 0 ? ticketNextUserList : currentSubJBT.userInfo ? currentSubJBT.userInfo.user_id_list : []}
                                onChange={(value, option) => {
                                    setTicketNextUserList(value)///当前页面先变动
                                    ticketNextUserNameList = option.map((item) => { return item.props.children })
                                    callbackHandler(value, ticketNextUserNameList)
                                }}
                            >
                                {getUserGroupList()}
                            </Select>
                        </div>
                        {isExtraAdd ?
                            <div style={{ textAlign: 'right', marginTop: 10 }}>
                                <Button type='danger' size='small' icon='upload'
                                    onClick={() => {
                                        if (ticketNextUserList.toString().length === 0) { message.error('请选择好措施票处理人员，再进行提交'); return }
                                        var afterCheckObj = checkCellWhichIsEmpty(currentSubJBT, 0)
                                        sbjtvalueChangeCallback(afterCheckObj)
                                        let needValueButIsEmpty = checkDataIsLostValue(afterCheckObj)
                                        if (needValueButIsEmpty) {
                                            message.error('请填写好措施票后，再进行提交')
                                            return
                                        }
                                        confirm({
                                            title: '确认提交当前的措施票吗?',
                                            content: '请确保所填信息的准确和完整',
                                            okText: '确认',
                                            okType: 'danger',
                                            cancelText: '取消',
                                            onOk: async function () {
                                                console.log('pId', pId);
                                                console.log('提交:', currentSubJBT);
                                                let element = afterCheckObj;///每个措施票
                                                element.p_id = pId;
                                                let user_str = ',' + element.userInfo.user_id_list.toString() + ','
                                                let res = await createNewJobTicketApply(element, user_str, pNo)
                                                if (!res) {
                                                    message.error('提交失败')
                                                    return
                                                }
                                                // console.log('添加措施票记录:', res);
                                                let res1 = await HttpApi.getLastJTApplyRecordId()
                                                if (res1.data.code === 0 && res1.data.data.length > 0) {
                                                    const jbtar_id_sub = res1.data.data[0]['id']
                                                    let obj = {};
                                                    obj['jbtar_id'] = jbtar_id_sub /// 添加措施票记录 的id
                                                    obj['user_id'] = currentUser.id
                                                    obj['user_name'] = currentUser.name
                                                    obj['time'] = moment().format('YYYY-MM-DD HH:mm:ss')
                                                    obj['step_des'] = '创建措施票 提交至 ' + element.userInfo.user_name_list.join(',')
                                                    obj['remark'] = ''
                                                    await HttpApi.addJbTStepLog(obj)///添加log
                                                    message.success('添加措施票成功')
                                                    resetUserSelectValue()
                                                    onClose()
                                                    if (resetList) resetList()
                                                }

                                            }
                                        })
                                    }}>提交</Button>
                            </div> :
                            <div>

                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    width: '100%',
                                    alignItems: 'center',
                                    marginTop: 10
                                }}>
                                    <Tag color='blue'>操作</Tag>
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'row-reverse',
                                        width: '100%',
                                        padding: 5
                                    }}>
                                        <Button type='primary' size='small' disabled={!currentSubJBT.pages}
                                            onClick={() => {
                                                setAddJBTSampleVisible(true)
                                            }}>生成典型票</Button>
                                        {currentSubJBT.user_id !== null ?
                                            <Button style={{ marginRight: 10 }} type='dashed' size='small' disabled={!currentSubJBT.pages}
                                                onClick={() => {
                                                    setUpdateJBTSampleVisible(true)
                                                }}>修改</Button> : null}
                                    </div>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    width: '100%',
                                    alignItems: 'center',
                                    marginTop: 10
                                }}>

                                    <Button style={{ marginRight: 10 }} type='dashed' size='small' disabled={!currentSubJBT.pages}
                                        onClick={() => {
                                            onClose()
                                        }}>弹窗收起-返回提交</Button>
                                </div>
                            </div>
                        }
                    </div>
                </Affix>
            </div>
            <AddSampleModal visible={addJBTSampleVisible} onCancel={() => { setAddJBTSampleVisible(false) }}
                onOk={async ({ self_ticket_name }) => {
                    let newObj = { ...currentSubJBT, self_ticket_name }
                    let afterRemoveData = removeDateCheckBox(newObj)
                    let res = await HttpApi.creatOrUpdateNewJBTSample({ is_create: 1, JBTSampleData: afterRemoveData, user_id: currentUser.id })
                    if (res.data.code === 0) {
                        message.success('保存成功，重新勾选措施票会看到个人保存的措施票模版', 4)
                        onClose()
                    }
                    setAddJBTSampleVisible(false)
                }}
            />
            <UpdateSampleModal data={currentSubJBT} visible={updateJBTSampleVisible} onCancel={() => { setUpdateJBTSampleVisible(false) }}
                onOk={async ({ self_ticket_name }) => {
                    currentSubJBT['self_ticket_name'] = self_ticket_name
                    let afterRemoveData = removeDateCheckBox(currentSubJBT)
                    let res = await HttpApi.creatOrUpdateNewJBTSample({ is_create: 0, JBTSampleData: afterRemoveData })
                    if (res.data.code === 0) {
                        message.success('修改成功，重新勾选措施票会看到个人保存的措施票模版', 4)
                        onClose()
                    }
                    setUpdateJBTSampleVisible(false)
                }}
            />
        </Drawer >
    )
}
