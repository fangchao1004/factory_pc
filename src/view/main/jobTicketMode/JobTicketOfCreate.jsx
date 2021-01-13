import { Button, Col, Empty, Row, Select, Tag, Affix, Modal, message } from 'antd'
import React, { useCallback, useEffect, useState } from 'react'
import HttpApi from '../../util/HttpApi'
import { RenderEngine } from '../../util/RenderEngine'
import { createNewJobTicketApply } from '../../util/Tool'
const { confirm } = Modal
const storage = window.localStorage
export default function JobTicketOfCreate() {
  const [currentPageIndex, setCurentPageIndex] = useState(0) ///当前页面索引 0 为第一页
  const [jobTicketsOption, setJobTicketsOption] = useState([])
  const [currentJobTicket, setCurrentJobTicket] = useState({})
  const [currentJobTicketValue, setCurrentJobTicketValue] = useState({})
  const [userList, setUserList] = useState([])
  const [currentUserId, setCurrentUserId] = useState(null)
  const [scaleNum, setScaleNum] = useState(1)
  const [ticketSampleId, setTicketSampleId] = useState(null)
  const getJobTicketByid = useCallback(async id => {
    if (id !== null) {
      let res = await HttpApi.getJobTicketsList({ id })
      if (res.data.code === 0) {
        let tempObj = JSON.parse(JSON.stringify(res.data.data[0]))
        tempObj.pages = JSON.parse(tempObj.pages)
        setCurrentJobTicket(tempObj)
      }
    } else {
      setCurrentJobTicket({})
      setCurrentJobTicketValue({})
      setScaleNum(1)
    }
    setTicketSampleId(id)
  }, [])
  const init = useCallback(async () => {
    const localUserInfo = storage.getItem('userinfo')
    setCurrentUserId(JSON.parse(localUserInfo).id)
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
  const perpage = useCallback(() => {
    if (currentPageIndex > 0) {
      setCurentPageIndex(currentPageIndex - 1)
    }
  }, [currentPageIndex])
  const nextpage = useCallback(() => {
    if (currentPageIndex < currentJobTicket.pages.length - 1) {
      setCurentPageIndex(currentPageIndex + 1)
    }
  }, [currentPageIndex, currentJobTicket])
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
            <div style={styles.rightpart}>
              {!currentJobTicket.pages ? (
                <Empty style={{ padding: 36 }} description={'请先选择需要的工作票'} />
              ) : (
                <RenderEngine
                  jsonlist={currentJobTicket}
                  userList={userList}
                  currentUserId={currentUserId}
                  currentPageIndex={currentPageIndex}
                  scaleNum={scaleNum}
                  callbackValue={v => {
                    setCurrentJobTicketValue(v)
                  }}
                />
              )}
            </div>
          </Col>
          <Col span={6}>
            <Affix>
              <div style={styles.leftpart}>
                <div style={{ display: 'flex', flexDirection: 'row', width: '100%', alignItems: 'center' }}>
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
                        getJobTicketByid(value)
                      } else {
                        getJobTicketByid(null)
                      }
                    }}
                    filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
                    {jobTicketsOption.map((item, index) => {
                      return (
                        <Select.Option key={index} value={item.id}>
                          {item.ticket_name}
                        </Select.Option>
                      )
                    })}
                  </Select>
                </div>
                {/* <div style={{ display: 'flex', flexDirection: 'row', width: "100%", alignItems: 'center', marginTop: 15 }}>
                                <Tag color='blue'>缩放</Tag>
                                <Slider style={{ width: "100%" }} disabled={!currentJobTicket.pages} defaultValue={50} tipFormatter={(v) => { return v / 50 }} onChange={(v) => { setScaleNum(v / 50) }} />
                            </div> */}
                <div style={{ display: 'flex', flexDirection: 'row', width: '100%', alignItems: 'center', marginTop: 10 }}>
                  <Tag color='blue'>翻页</Tag>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      width: '100%',
                      justifyContent: 'space-between',
                      padding: 5
                    }}>
                    <Button type='primary' size='small' disabled={currentPageIndex === 0} onClick={perpage}>
                      上一页
                    </Button>
                    <Button type='primary' size='small' disabled={!currentJobTicket.pages || currentPageIndex === currentJobTicket.pages.length - 1} onClick={nextpage}>
                      下一页
                    </Button>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', width: '100%', alignItems: 'center', marginTop: 10 }}>
                  <Tag color='blue'>操作</Tag>
                  <div style={{ display: 'flex', flexDirection: 'row-reverse', width: '100%', padding: 5 }}>
                    <Button
                      type='danger'
                      size='small'
                      disabled={!currentJobTicket.pages}
                      onClick={() => {
                        confirm({
                          title: '确认提交当前的工作票吗?',
                          content: '请确保所填信息的准确和完整',
                          okText: '确认',
                          okType: 'danger',
                          cancelText: '取消',
                          onOk: async function () {
                            if (!currentJobTicketValue.pages) {
                              message.error('请填写好工作票后，再进行提交')
                              return
                            }
                            let res = await createNewJobTicketApply(currentJobTicketValue)
                            console.log('提交:', res)
                            if (res) {
                              message.success('提交成功')
                              getJobTicketByid(null)
                              setCurentPageIndex(0)
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
  leftpart: {
    backgroundColor: '#FFFFFF',
    padding: 15
  },
  rightpart: {
    backgroundColor: '#FFFFFF'
  }
}
