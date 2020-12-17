import { Badge, Button, Col, Form, Row, Table, Select } from 'antd'
import React, { useCallback, useEffect, useState } from 'react'
import HttpApi from '../../util/HttpApi'
import moment from 'moment'
const { Option } = Select;

const totalCount = 0
var condition = {
    page: 1
}
var searchCondition = {}
export default () => {
    const [dataSource, setDataSource] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [pagination, setPagination] = useState({
        current: condition.page,
        total: totalCount
    })

    const loadData = useCallback(async c => {
        setIsLoading(true)
        const data = await HttpApi.listPCLoginLog(c)
        if (data.data && data.data.code === 0) {
            const logs = data.data.data.logs.map(log => {
                log.key = log.id
                return log
            })
            setDataSource(logs)
            setPagination({
                current: c.page,
                total: data.data.data.count,
                showTotal: () => `共${data.data.data.count}条记录`
            })
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        condition.page = 1
        loadData(condition)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div style={styles.root}>
            <div style={styles.header}>
                <Searchfrom startSearch={async (conditionValues) => {
                    searchCondition = conditionValues;
                    let tempC = { ...conditionValues, ...condition }
                    loadData(tempC)
                }} />
            </div>
            <div style={styles.body}>
                <Table
                    size="small"
                    bordered
                    loading={isLoading}
                    columns={[
                        {
                            title: '登录时间',
                            dataIndex: 'createdAt',
                            key: 'createdAt',
                            width: 180,
                            align: 'center',
                            render: text => <span style={{ fontSize: 12 }}>{moment(text).format('YYYY-MM-DD HH:mm:ss')}</span>
                        },
                        {
                            title: '姓名',
                            dataIndex: 'name',
                            key: 'name'
                        },
                        {
                            title: '用户名',
                            dataIndex: 'username',
                            key: 'username'
                        },
                        {
                            title: '登录地址',
                            dataIndex: 'ip',
                            key: 'ip'
                        },
                        {
                            title: '登录状态',
                            dataIndex: 'status',
                            key: 'status',
                            width: 100,
                            align: 'center',
                            render: (val, record) => {
                                return <Badge status={val === 0 ? 'success' : 'error'} />
                            }
                        },
                        {
                            title: '登录备注',
                            dataIndex: 'remark',
                            key: 'remark',
                            render: (val, record) => {
                                if (record.uuid) { val = val + '【手机端】' }
                                return val
                            }
                        }
                    ]}
                    dataSource={dataSource}
                    pagination={pagination}
                    onChange={p => {
                        condition.page = p.current
                        loadData({ ...condition, ...searchCondition })
                    }}
                />
            </div>
        </div>
    )
}
const Searchfrom = Form.create({ name: 'form' })(props => {
    const itemProps = { labelCol: { span: 6 }, wrapperCol: { span: 18 } }
    return <Form onSubmit={(e) => {
        e.preventDefault();
        props.form.validateFields((err, values) => {
            ///values搜寻条件数据过滤
            let newObj = {};
            for (const key in values) {
                if (values.hasOwnProperty(key)) {
                    const element = values[key];
                    if (element !== undefined && element !== null) {
                        newObj[key] = values[key]
                    }
                }
            }
            props.startSearch(newObj);
        });
    }}>
        <Row>
            <Col span={6}>
                <Form.Item label='登录状态'  {...itemProps}>
                    {props.form.getFieldDecorator('status', {
                        rules: [{ required: false }]
                    })(
                        <Select style={{ width: '100%' }} allowClear>
                            <Option value={0}><Badge status={'success'} />正常</Option>
                            <Option value={1}><Badge status={'error'} />拒绝</Option>
                        </Select>
                    )}
                </Form.Item>
            </Col>
            <Col span={18}>
                <div style={{ textAlign: 'right', paddingTop: 3 }}>
                    <Button icon='search' type="primary" htmlType="submit">查询</Button>
                    <Button icon='delete' style={{ marginLeft: 8 }} onClick={() => { props.form.resetFields() }}>清除</Button>
                </div>
            </Col>
        </Row>
    </Form>
})
const styles = {
    root: {
        backgroundColor: '#F1F2F5',
        width: '100%',
        height: '100vh',
        padding: 10,
    },
    header: {
        backgroundColor: '#FFFFFF',
        padding: '16px 16px 0 16px',
        marginBottom: 10,
    },
    body: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        marginBottom: 10,
    },
}
