import React, { useState, useEffect, useCallback, useRef } from 'react';
import HttpApi from '../../util/HttpApi';
import { Table, Row, Col, Radio, Tag, Button, Modal, Form, InputNumber, Alert, message } from 'antd';
let test_list = []
let loop;
let config_list = []
var storage = window.localStorage;
export default () => {
    var localUserInfo = storage.getItem('userinfo')
    const [dataSource, setDataSource] = useState([])
    const [loading, setLoading] = useState(false)
    const [timeType, setTimeType] = useState(4)
    const [showPanel, setShowPanel] = useState(false)
    const [selectItem, setSelectedItem] = useState(null)
    const [isAdmin] = useState(JSON.parse(localUserInfo).isadmin || 0)
    const setDataHandler = useCallback((data_obj) => {
        // console.log('data_obj:', data_obj)
        let temp_list = [];
        for (const key in data_obj) {
            if (data_obj.hasOwnProperty(key)) {
                const element = data_obj[key];
                temp_list.push({ 'pjt': key, value: element })
            }
        }
        // console.log('temp_list:', temp_list)
        // console.log('config_list:', config_list)
        temp_list.forEach((list_item) => {
            config_list.forEach((config_item) => {
                if (list_item.pjt === config_item.des) {
                    list_item['value']['level'] = config_item
                }
            })
        })
        setDataSource(temp_list.map((item, index) => { item.key = index; return item }))
        setLoading(false)
    }, [])
    const getDataHandler = useCallback(async () => {
        setLoading(true)
        // console.log('getDataHandler')
        let monitorlevelRes = await HttpApi.getMonitorLevel();
        if (monitorlevelRes.data.code === 0) {
            config_list = monitorlevelRes.data.data
        }
        test_list.length = 0;
        let result = await HttpApi.getMonitorData()
        // console.log('result:', result.data)
        // return;
        ///数据结构做横向切割转换
        let data_obj = {};
        if (result.data) {
            if (timeType === 4) {///实时
                data_obj = result.data.now
            } else {///小时
                data_obj = result.data.hour
            }
        }
        setDataHandler(data_obj)
    }, [timeType, setDataHandler])

    useEffect(() => {
        getDataHandler();
        if (loop) { clearInterval(loop) }
        loop = setInterval(() => {
            getDataHandler();
        }, 1 * 60 * 1000)
    }, [getDataHandler])
    const columns = [
        {
            dataIndex: 'pjt', title: '项目', width: 200
        }, {
            dataIndex: 'value', title: '设备', children: [
                {
                    dataIndex: 'device1', title: '1号炉', align: 'center', render: (text, record) => {
                        const temp = record['value']['device_list'].filter((item) => item.device_no === 1)[0];
                        if (!temp) { return '-' }
                        let value = temp['value_list'][0]['value'] || '/'
                        let status = temp['value_list'][0]['status']
                        if (status === 1) {
                            return <Tag color={'#f5222d'}>{value}</Tag>
                        }
                        return value
                    }
                },
                {
                    dataIndex: 'device2', title: '2号炉', align: 'center', render: (text, record) => {
                        const temp = record['value']['device_list'].filter((item) => item.device_no === 2)[0];
                        if (!temp) { return '-' }
                        let value = temp['value_list'][0]['value'] || '/'
                        let status = temp['value_list'][0]['status']
                        if (status === 1) {
                            return <Tag color={'#f5222d'}>{value}</Tag>
                        }
                        return value
                    }
                },
                {
                    dataIndex: 'device3', title: '3号炉', align: 'center', render: (text, record) => {
                        const temp = record['value']['device_list'].filter((item) => item.device_no === 3)[0];
                        if (!temp) { return '-' }
                        let value = temp['value_list'][0]['value'] || '/'
                        let status = temp['value_list'][0]['status']
                        if (status === 1) {
                            return <Tag color={'#f5222d'}>{value}</Tag>
                        }
                        return value
                    }
                },
                {
                    dataIndex: 'device4', title: '4号炉', align: 'center', render: (text, record) => {
                        const temp = record['value']['device_list'].filter((item) => item.device_no === 4)[0];
                        if (!temp) { return '-' }
                        let value = temp['value_list'][0]['value'] || '/'
                        let status = temp['value_list'][0]['status']
                        if (status === 1) {
                            return <Tag color={'#f5222d'}>{value}</Tag>
                        }
                        return value
                    }
                }
            ]
        }, {
            dataIndex: 'duration', title: '区间', width: 240, render: (text, record) => {
                if (timeType === 1) {
                    return '-'
                }
                // console.log('record:', record['value']['level'])
                const level = record['value']['level'];
                const { min, max } = level;
                let result = '-'
                if (min !== null && max !== null) {
                    result = `${min} ~ ${max}`
                } else if (min !== null && max === null) {
                    result = `> ${min}`
                } else if (min === null && max !== null) {
                    result = `< ${max}`
                }
                return <div style={{ justifyContent: 'space-between', display: 'flex', alignItems: 'center' }}>
                    <div style={{ width: 90 }}>{result}</div>
                    {level.count ? <Tag>{level.count}</Tag> : null}
                    {isAdmin ?
                        <Button icon='setting' type='link' style={{ padding: 0 }} onClick={() => {
                            setShowPanel(true)
                            setSelectedItem(level)
                        }}>设置</Button> : null}
                </div>
            }
        }]
    return <div>
        <Row style={{ height: 56, marginTop: -66, gap: 10 }} type='flex' align='middle' justify='end'>
            <Col>
                <Radio.Group value={timeType} buttonStyle="solid" onChange={(e) => {
                    setTimeType(e.target.value)
                }}>
                    {[{ id: 1, name: '小时' }, { id: 4, name: '实时' }].map((item, index) => { return <Radio.Button key={index} value={item.id}>{item.name}</Radio.Button> })}
                </Radio.Group>
            </Col>
        </Row>
        <div style={{ backgroundColor: '#FFFFFF', marginTop: 10 }}>
            <Table loading={loading} columns={columns} bordered size="small" dataSource={dataSource} pagination={false} />
        </div>
        <SetPanel data={selectItem} visible={showPanel} onCancel={() => { setShowPanel(false) }} onOk={() => { getDataHandler() }} />
    </div>
}

function SetPanel(props) {
    const form = useRef(null)
    return <Modal
        destroyOnClose
        title='区间设置'
        visible={props.visible}
        onCancel={() => { props.onCancel() }}
        onOk={() => {
            form.current.validateFields(async (error, values) => {
                if (!error) {
                    console.log('values:', values)
                    let result = await HttpApi.updateMonitorLevel({ ...values, key: props.data.key })
                    if (result.data.code === 0) {
                        message.success('设置成功')
                        props.onOk()
                    } else {
                        message.error('设置失败')
                    }
                }
            })
            props.onCancel()
        }}
    >{props.data ? <Alert style={{ marginBottom: 16 }} message={`${props.data.des} 区间阀值 若不需要可以不设置或删除`} /> : null}
        <ConfigForm ref={form} data={props.data} />
    </Modal>
}

function configForm(props) {
    const { getFieldDecorator } = props.form
    return <Form >
        <Row gutter={16}>
            <Col span={12} >
                <Form.Item label="最小值:" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
                    {getFieldDecorator('min', {
                        initialValue: props.data.min,
                        rules: [{ required: false, message: '请输入最小值' }]
                    })(<InputNumber style={{ width: '100%' }} placeholder='请输入最小值' min={0}></InputNumber>)}
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item label="最大值:" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
                    {getFieldDecorator('max', {
                        initialValue: props.data.max,
                        rules: [{ required: false, message: '请输入最大值' }]
                    })(<InputNumber style={{ width: '100%' }} placeholder='请输入最大值' max={99999}></InputNumber>)}
                </Form.Item>
            </Col>
        </Row>
        <Row gutter={16}>
            <Col span={12} >
                <Form.Item label="触发时间:" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
                    {getFieldDecorator('count', {
                        initialValue: props.data.count,
                        rules: [{ required: false, message: '触发时间（分钟）' }]
                    })(<InputNumber style={{ width: '100%' }} placeholder='触发时间（分钟）' min={0}></InputNumber>)}
                </Form.Item>
            </Col>
        </Row>
    </Form>
}

const ConfigForm = Form.create({ name: 'areaForm' })(configForm)