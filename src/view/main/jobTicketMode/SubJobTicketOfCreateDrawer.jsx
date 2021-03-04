import { Drawer, Select, Tag, Button, Affix, Modal, Alert, message } from 'antd'
import React, { useCallback, useState } from 'react'
import HttpApi from '../../util/HttpApi';
import { RenderEngine } from '../../util/RenderEngine';
import { checkCellWhichIsEmpty, checkDataIsLostValue, createNewJobTicketApply, getPinYin } from '../../util/Tool';
import moment from 'moment'
const { OptGroup, Option } = Select
const { confirm } = Modal
var copy_currentSubJBT = {}
var ticketNextUserNameList = []
export default function SubJobTicketOfCreateDrawer({ resetList, pId, pNo, isExtraAdd, visible, onClose, currentSubJBT, userList, currentUser, sbjtvalueChangeCallback }) {
    const [ticketNextUserList, setTicketNextUserList] = useState([])/// allSubTicketList 内容每个措施票所对应的 某些处理人id[{1,2},{1,2},...]
    // const [currentSubJBTSelf, setCurrentSubJBTSelf] = useState(currentSubJBT)
    // console.log('新 currentSubJBT:', currentSubJBT);
    const renderAllPage = useCallback((currentSubJBT) => {
        if (!currentSubJBT.pages) { return null }
        let scalObj = {}
        if (currentSubJBT.scal) {
            scalObj = JSON.parse(currentSubJBT.scal)
        }
        copy_currentSubJBT = JSON.parse(JSON.stringify(currentSubJBT))
        try {
            return copy_currentSubJBT.pages.map((_, index) => {
                return <RenderEngine
                    key={index}
                    jsonlist={copy_currentSubJBT}
                    userList={userList}
                    currentUser={currentUser}
                    currentStatus={0}
                    currentPageIndex={index}
                    scaleNum={scalObj.scaleNum || 1}
                    bgscaleNum={scalObj.bgscalNum || 1}
                    callbackValue={v => {
                        sbjtvalueChangeCallback(v)
                    }}
                />
            })
        } catch (error) {
            console.log('currentSubJBT.pages JSON解析失败');
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

    const getUserGroupList = useCallback(() => {
        if (!userList) { return null }
        let manager_list = [];
        let other_list = [];
        userList.forEach((item) => {
            if (currentSubJBT.is_sub !== 0) {///措施票-就根据是否为运行值长人员来分组
                if (item.is_runner) {
                    manager_list.push(item)
                } else { other_list.push(item) }
            }
            // else {///主票-就根据是否为当前专业的专工来分组
            //     if (item.is_current_major_manager) {
            //         manager_list.push(item)
            //     } else { other_list.push(item) }
            // }
        })
        return [<OptGroup key='a' label={<div style={{ width: '100%', justifyContent: 'space-between', display: 'flex', justifyItems: 'center' }}><span>{currentSubJBT.is_sub === 1 ? '运行值长' : '当前专业专工'}</span><Button type='link' size='small' onClick={() => {
            setTicketNextUserList(manager_list.map((item) => item.id))
            ticketNextUserNameList = manager_list.map((item) => item.name)
            let id_list = manager_list.map((item) => item.id)
            let name_list = manager_list.map((item) => item.name)
            callbackHandler(id_list, name_list)
        }}>全选</Button></div>}>
            {manager_list.map((item, index) => { return <Option key={'a' + index} value={item.id} short_lab={getPinYin(item.name)[0] || ''}>{item.name}</Option> })}
        </OptGroup>
            // ,
            // <OptGroup key='b' label="其他">
            //     {other_list.map((item, index) => { return <Option key={'b' + index} value={item.id} short_lab={getPinYin(item.name)[0] || ''}>{item.name}</Option> })}
            // </OptGroup>
        ]
    }, [userList, callbackHandler, currentSubJBT.is_sub])

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
                        {isExtraAdd ? <div style={{ textAlign: 'right', marginTop: 10 }}><Button type='danger' size='small' icon='upload' onClick={() => {
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
                                    await createNewJobTicketApply(element, user_str, pNo)
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
                        }}>提交</Button> </div> : null}
                    </div>
                </Affix>
            </div>
        </Drawer>
    )
}
