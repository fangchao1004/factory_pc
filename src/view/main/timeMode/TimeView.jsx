import React, { Component } from 'react';
import { Table, Button } from 'antd';

var data = [
    {
        time: ['01:10', '4:30'],
        should: '/',
        actually: '/',
        name: '夜班'
    }, {
        time: ['05:00', '7:30'],
        should: '/',
        actually: '/',
        name: '夜班'
    }, {
        time: ['08:10', '11:30'],
        should: '/',
        actually: '/',
        name: '白班'
    }, {
        time: ['13:10', '15:30'],
        should: '/',
        actually: '/',
        name: '白班'
    }, {
        time: ['16:10', '19:20'],
        should: '/',
        actually: '/',
        name: '中班'
    }, {
        time: ['19:30', '22:00'],
        should: '/',
        actually: '/',
        name: '中班'
    }, {
        time: ['22:10', '00:30'],
        should: '/',
        actually: '/',
        name: '中班'
    }
]

const columns = [
    {
        title: '时间段',
        dataIndex: 'time',
        render: (text, record) => {
            return <div>{record.time[0]} ~ {record.time[1]} （{record.name}）</div>
        }
    },
    {
        title: '应检测数',
        dataIndex: 'should',
    },
    {
        title: '实际检测数',
        dataIndex: 'actually',
    }, {
        title: '操作',
        dataIndex: 'actions',
        width: 150,
        render: (text, record) => (
            <div style={{ textAlign: 'center' }}>
                <Button size="small" type="primary">详情</Button>
            </div>
        )
    }
]
/**
 * 时间区间 模块界面
 */
class TimeView extends Component {
    render() {
        return (
            <div>
                <Table
                    bordered
                    columns={columns}
                    dataSource={data}
                />
            </div>
        );
    }
}

export default TimeView;