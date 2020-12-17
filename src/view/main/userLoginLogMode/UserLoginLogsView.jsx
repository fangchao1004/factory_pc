import { Badge, Table } from 'antd'
import React, { useCallback, useEffect, useState } from 'react'
import HttpApi from '../../util/HttpApi'
import moment from 'moment'

const totalCount = 0
const condition = {
    page: 1
}

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
            <div style={styles.body}>
                <Table
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
                                let is_warning = false;
                                if (record.remark && record.remark.indexOf('注意') !== -1) {
                                    is_warning = true;
                                }
                                return <Badge status={val === 0 ? is_warning ? 'warning' : 'success' : 'error'} />
                            }
                        },
                        {
                            title: '登录备注',
                            dataIndex: 'remark',
                            key: 'remark'
                        }
                    ]}
                    dataSource={dataSource}
                    pagination={pagination}
                    onChange={p => {
                        condition.page = p.current
                        loadData(condition)
                    }}
                />
            </div>
        </div>
    )
}
const styles = {
    root: {
        backgroundColor: '#F1F2F5',
        width: '100%',
        height: '100vh',
        padding: 10,
    },
    body: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        marginBottom: 10,
    },
}
