import { Button, Col, Empty, Row, Select, Tag, Affix, Modal, message } from 'antd'
import React, { useCallback, useEffect, useState } from 'react'
// import { testData } from '../../../assets/testJson'
import HttpApi from '../../util/HttpApi'
import { RenderEngine } from '../../util/RenderEngine'
import { checkDataIsLostValue, createNewJobTicketApply, checkCellWhichIsEmpty } from '../../util/Tool'
const { OptGroup, Option } = Select
const { confirm } = Modal
const storage = window.localStorage
export default function JobTicketOfCreate() {
    const [jobTicketsOption, setJobTicketsOption] = useState([])
    const [currentJobTicketValue, setCurrentJobTicketValue] = useState({})
    const [userList, setUserList] = useState([])
    const [currentUser] = useState(JSON.parse(storage.getItem('userinfo')))
    const [scaleNum, setScaleNum] = useState(1)
    const [ticketSampleId, setTicketSampleId] = useState(null)
    const [ticketNextUserList, setTicketNextUserList] = useState([])
    const getJobTicketById = useCallback(async id => {
        if (id !== null) {
            let res = await HttpApi.getJobTicketsList({ id })
            if (res.data.code === 0) {
                let tempObj = JSON.parse(JSON.stringify(res.data.data[0]))
                tempObj.pages = JSON.parse(tempObj.pages)
                // tempObj.pages = testData
                setCurrentJobTicketValue(tempObj)
                const major_id = tempObj.major_id
                console.log('major_id', major_id);
                let managerList_res = await HttpApi.getManagerIdListByMajorId({ major_id })
                if (managerList_res.data.code === 0) {
                    const managerlist = managerList_res.data.data;
                    // console.log('managerlist:', managerlist);
                    userList.forEach((item) => {
                        item.is_current_major_manager = false
                        managerlist.forEach((manager) => {
                            if (item.id === manager.user_id) {
                                item.is_current_major_manager = true
                            }
                        })
                    })
                    setUserList(userList)
                }
            }
        } else {
            setCurrentJobTicketValue({})
            setScaleNum(1)
        }
        setTicketSampleId(id)
    }, [userList])
    const init = useCallback(async () => {
        let res = await HttpApi.getJobTicketsOptionList()
        if (res.data.code === 0) {
            setJobTicketsOption(res.data.data)
        }
        let res_user = await HttpApi.getUserInfo({ effective: 1 })
        if (res_user.data.code === 0) {
            let user_list = res_user.data.data.map(item => {
                return { id: item.id, name: item.name }
            })
            setUserList(user_list)
        }
    }, [])
    const getUserGroupList = useCallback(() => {
        if (!userList) { return null }
        let manager_list = [];
        let other_list = [];
        userList.forEach((item) => {
            if (item.is_current_major_manager) {
                manager_list.push(item)
            } else { other_list.push(item) }
        })
        return [<OptGroup label={<div style={{ width: '100%', justifyContent: 'space-between', display: 'flex', justifyItems: 'center' }}><span>当前专业专工</span><Button type='link' size='small' onClick={() => {
            setTicketNextUserList(manager_list.map((item) => item.id))
        }}>全选</Button></div>}>
            {manager_list.map((item, index) => { return <Option value={item.id}>{item.name}</Option> })}
        </OptGroup>,
        <OptGroup label="其他">
            {other_list.map((item, index) => { return <Option value={item.id}>{item.name}</Option> })}
        </OptGroup>]
    }, [userList])
    const renderAllPage = useCallback(() => {
        if (currentJobTicketValue && currentJobTicketValue.pages) {
            return currentJobTicketValue.pages.map((_, index) => {
                // return <RenderEngine jsonlist={pagelist} page={index} />
                return <RenderEngine
                    key={index}
                    jsonlist={currentJobTicketValue}
                    userList={userList}
                    currentUser={currentUser}
                    currentStatus={0}
                    currentPageIndex={index}
                    scaleNum={scaleNum}
                    callbackValue={v => {
                        setCurrentJobTicketValue(v)
                    }}
                />
            })
        }
    }, [currentJobTicketValue, currentUser, scaleNum, userList])
    useEffect(() => {
        init()
    }, [init])
    return (
        <div style={styles.root}>
            <div style={styles.head}>
                <h2 style={styles.title}>创建工作票</h2>
            </div>
            <div style={styles.body}>
                <Row gutter={10}>
                    <Col span={18}>
                        <div style={styles.rightPart}>
                            {!currentJobTicketValue.pages ? <Empty style={{ padding: 36 }} description={'请先选择需要的工作票'} /> : renderAllPage()}
                        </div>
                    </Col>
                    <Col span={6}>
                        <Affix>
                            <div style={styles.leftPart}>
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    width: '100%',
                                    alignItems: 'center'
                                }}>
                                    <Tag color='blue'>选择</Tag>
                                    <Select
                                        style={{ width: '100%' }}
                                        bordered={false}
                                        allowClear={true}
                                        placeholder='请选择工作票'
                                        showSearch
                                        optionFilterProp='children'
                                        value={ticketSampleId}
                                        onChange={value => {
                                            if (value >= 0) {
                                                getJobTicketById(value)
                                            } else {
                                                getJobTicketById(null)
                                            }
                                        }}
                                        filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
                                        {jobTicketsOption.map((item, index) => {
                                            return (
                                                <Option key={index} value={item.id}>
                                                    {item.ticket_name}
                                                </Option>
                                            )
                                        })}
                                    </Select>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    width: '100%',
                                    alignItems: 'center',
                                    marginTop: 10
                                }}>
                                    <Tag color='blue'>人员</Tag>
                                    <Select
                                        maxTagCount={5}
                                        disabled={!currentJobTicketValue.pages}
                                        mode="multiple"
                                        style={{ width: '100%' }}
                                        bordered={false}
                                        allowClear={true}
                                        placeholder='请选择下一步处理人'
                                        showSearch
                                        optionFilterProp='children'
                                        value={ticketNextUserList}
                                        onChange={value => {
                                            setTicketNextUserList(value)
                                        }}
                                    >
                                        {getUserGroupList()}
                                    </Select>
                                </div>
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
                                        <Button
                                            type='danger'
                                            size='small'
                                            disabled={!currentJobTicketValue.pages}
                                            onClick={() => {
                                                if (ticketNextUserList.toString().length === 0) { message.error('请选择好处理人员，再进行提交'); return }
                                                let user_str = ',' + ticketNextUserList.toString() + ','
                                                console.log('user_str:', user_str);
                                                // return;
                                                let afterCheckObj = checkCellWhichIsEmpty(currentJobTicketValue, 0)
                                                // console.log('afterCheckObj:', afterCheckObj);
                                                setCurrentJobTicketValue(JSON.parse(JSON.stringify(afterCheckObj)))
                                                let needValueButIsEmpty = checkDataIsLostValue(afterCheckObj)
                                                if (needValueButIsEmpty) {
                                                    message.error('请填写好工作票后，再进行提交')
                                                    return
                                                }
                                                // return;
                                                confirm({
                                                    title: '确认提交当前的工作票吗?',
                                                    content: '请确保所填信息的准确和完整',
                                                    okText: '确认',
                                                    okType: 'danger',
                                                    cancelText: '取消',
                                                    onOk: async function () {
                                                        let res = await createNewJobTicketApply(afterCheckObj, user_str)
                                                        console.log('提交:', res)
                                                        if (res) {
                                                            message.success('提交成功')
                                                            getJobTicketById(null)
                                                        }
                                                    }
                                                })
                                            }}>
                                            提交
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Affix>
                    </Col>
                </Row>
            </div>
        </div>
    )
}

const styles = {
    root: {
        padding: 10
    },
    head: {
        backgroundColor: '#FFFFFF',
        padding: '10px 10px 5px 10px'
    },
    title: {
        borderLeft: 4,
        borderLeftColor: '#3080fe',
        borderLeftStyle: 'solid',
        paddingLeft: 5,
        fontSize: 16,
        backgroundColor: '#FFFFFF'
    },
    body: {
        marginTop: 10
    },
    leftPart: {
        backgroundColor: '#FFFFFF',
        padding: 15
    },
    rightPart: {
        backgroundColor: '#FFFFFF'
    }
}
