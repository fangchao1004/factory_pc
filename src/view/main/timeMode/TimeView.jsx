import React, { Component } from 'react';
import { Table, Button } from 'antd';
import moment from 'moment';
import HttpApi from '../../util/HttpApi';
import RecordDetailByTime from './RecordDetailByTime';

const today = moment().format('YYYY-MM-DD ');
const tomorrow = moment().add(1, 'day').format('YYYY-MM-DD ');
var list = [
    {
        time: ['01:10', '4:30'], /// 开始时间，结束时间
        isCross: false, ///是否跨天
        should: '/', /// 应该检设备数量
        actually: '/',/// 实际检查设备数量
        name: '夜班'
    }, {
        time: ['05:00', '7:30'],
        isCross: false,
        should: '/',
        actually: '/',
        name: '夜班'
    }, {
        time: ['08:10', '11:30'],
        isCross: false,
        should: '/',
        actually: '/',
        name: '白班'
    }, {
        time: ['13:10', '15:30'],
        isCross: false,
        should: '/',
        actually: '/',
        name: '白班'
    }, {
        time: ['16:10', '19:20'],
        isCross: false,
        should: '/',
        actually: '/',
        name: '中班'
    }, {
        time: ['19:30', '22:00'],
        isCross: false,
        should: '/',
        actually: '/',
        name: '中班'
    }, {
        time: ['22:10', '00:30'],
        isCross: true,
        should: '/',
        actually: '/',
        name: '中班'
    }
]
/**
 * 时间区间 模块界面
 */
class TimeView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            list: [],
            showDrawer: false,
            oneRecord: {}
        }
    }
    componentDidMount() {
        this.getInfoAndChangeData();
    }
    closeHandler = () => {
        this.setState({
            showDrawer: false
        })
    }
    getInfoAndChangeData = async () => {
        for (let index = 0; index < list.length; index++) {
            const element = list[index];
            let beginTime = today + element.time[0] + ':00'
            let endTime = element.isCross ? tomorrow + element.time[1] + ':00' : today + element.time[1] + ':00'
            element.bt = beginTime;
            element.et = endTime;
            let result = await this.getCountInfoFromDB(element);
            element.actually = result[0].count;
        }
        this.setState({
            list
        })
    }

    /**
     * 从数据库查询统计数据
     */
    getCountInfoFromDB = (element) => {
        let sql = `select count(distinct(device_id)) as count from records
        where checkedAt>'${element.bt}' and checkedAt<'${element.et}'`;
        return new Promise((resolve, reject) => {
            HttpApi.obs({ sql }, (res) => {
                let result = [];
                if (res.data.code === 0) {
                    result = res.data.data
                }
                resolve(result);
            })
        })
    }

    render() {
        const columns = [
            {
                title: '今日时间段划分',
                dataIndex: 'time',
                render: (text, record) => {
                    return <div>{record.time[0]} ~ {record.time[1]} （{record.name}）</div>
                }
            },
            {
                title: '今日应检测设备数量',
                dataIndex: 'should',
            },
            {
                title: '今日实际检测设备数量',
                dataIndex: 'actually',
            }, {
                title: '操作',
                dataIndex: 'actions',
                width: 150,
                render: (text, record) => (
                    <div style={{ textAlign: 'center' }}>
                        <Button size="small" type="primary" onClick={() => {
                            this.setState({
                                oneRecord: record,
                                showDrawer: true
                            })
                        }}>详情</Button>
                    </div>
                )
            }
        ]
        return (
            <div>
                <Table
                    bordered
                    columns={columns}
                    dataSource={list.map((item, index) => { item.key = index + ''; return item })}
                />
                <RecordDetailByTime visible={this.state.showDrawer} record={this.state.oneRecord} close={this.closeHandler} />
            </div>
        );
    }
}

export default TimeView;