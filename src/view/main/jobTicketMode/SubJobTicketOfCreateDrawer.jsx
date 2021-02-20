import { Drawer, Select, Tag, Button, Affix } from 'antd'
import React, { useCallback, useState } from 'react'
import { RenderEngine } from '../../util/RenderEngine';
const { OptGroup, Option } = Select
var copy_currentSubJBT = {}
var ticketNextUserNameList = []
export default function SubJobTicketOfCreateDrawer({ visible, onClose, currentSubJBT, userList, currentUser, sbjtvalueChangeCallback }) {
    const [ticketNextUserList, setTicketNextUserList] = useState([])/// allSubTicketList 内容每个副票所对应的 某些处理人id[{1,2},{1,2},...]
    // console.log('新 currentSubJBT:', currentSubJBT);
    const renderAllPage = useCallback(() => {
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
            return null
        }
    }, [currentSubJBT, currentUser, userList, sbjtvalueChangeCallback])

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
            if (currentSubJBT.is_sub === 1) {///措施票-就根据是否为运行人员来分组
                if (item.is_runner) {
                    manager_list.push(item)
                } else { other_list.push(item) }
            } else {///主票-就根据是否为当前专业的专工来分组
                if (item.is_current_major_manager) {
                    manager_list.push(item)
                } else { other_list.push(item) }
            }
        })
        return [<OptGroup key='a' label={<div style={{ width: '100%', justifyContent: 'space-between', display: 'flex', justifyItems: 'center' }}><span>{currentSubJBT.is_sub === 1 ? '运行人员' : '当前专业专工'}</span><Button type='link' size='small' onClick={() => {
            setTicketNextUserList(manager_list.map((item) => item.id))
            ticketNextUserNameList = manager_list.map((item) => item.name)
            let id_list = manager_list.map((item) => item.id)
            let name_list = manager_list.map((item) => item.name)
            callbackHandler(id_list, name_list)
        }}>全选</Button></div>}>
            {manager_list.map((item, index) => { return <Option key={'a' + index} value={item.id}>{item.name}</Option> })}
        </OptGroup>,
        <OptGroup key='b' label="其他">
            {other_list.map((item, index) => { return <Option key={'b' + index} value={item.id}>{item.name}</Option> })}
        </OptGroup>]
    }, [userList, callbackHandler, currentSubJBT.is_sub])

    const resetUserSelectValue = useCallback(() => {
        setTicketNextUserList([])
        ticketNextUserNameList = []
    }, [])
    return (
        <Drawer
            destroyOnClose={true}
            width={1100}
            title="措施票编辑"
            placement='left'
            onClose={() => { onClose(); resetUserSelectValue() }}
            visible={visible}
        >
            <div style={{ display: 'flex', flexDirection: 'row' }}>
                <div style={{ backgroundColor: '#F1F2F5' }}>
                    {renderAllPage()}
                </div>
                <Affix>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        width: 200,
                        alignItems: 'center',
                        marginTop: 10
                    }}>
                        <Tag style={{ marginLeft: 10 }} color='blue'>人员</Tag>
                        <Select
                            maxTagCount={5}
                            mode="multiple"
                            style={{ width: '100%' }}
                            bordered={false}
                            allowClear={true}
                            placeholder='请选择下一步处理人'
                            showSearch
                            optionFilterProp='children'
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
                </Affix>
            </div>
        </Drawer>
    )
}
