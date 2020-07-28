import React, { Component } from 'react';
import { Table } from 'antd'
import HttpApi from '../../util/HttpApi';
import moment from 'moment'
import './Schedule.css'
const todayLab = moment().format('YYYY-MM-DD')

const columns = [
    {
        title: <div style={{ fontSize: 20 }}>生产运行部倒班表</div>,
        children: [
            {
                key: 'time',
                dataIndex: 'time',
                title: '日期',
            },
            {
                key: 'group_1_val',
                dataIndex: 'group_1_lab',
                title: '甲组',
            }, {
                key: 'group_2_val',
                dataIndex: 'group_2_lab',
                title: '乙组',
            }, {
                key: 'group_3_val',
                dataIndex: 'group_3_lab',
                title: '丙组',
            },
            {
                key: 'group_4_val',
                dataIndex: 'group_4_lab',
                title: '丁组',
                render: (text) => {
                    let str = '/'
                    if (text) { str = text }
                    return <div>{str}</div>
                }
            }]
    }]

class ScheduleView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            schedulesData: [],
            pageNum: 1
        }
    }
    componentDidMount() {
        this.init();
    }
    init = async () => {
        let result = await this.getScheduleData();
        let todayNum = result.map((item) => item.time).indexOf(todayLab) + 1
        let pageNum = parseInt(todayNum / 10) + (parseInt(todayNum % 10) > 0 ? 1 : 0)
        this.setState({
            schedulesData: result.map((item, index) => { item.key = index; return item }),
            pageNum
        })
    }

    getScheduleData = () => {
        return new Promise((resolve, reject) => {
            let sql = `select * from schedules`
            HttpApi.obs({ sql }, (res) => {
                let result = []
                if (res.data.code === 0) {
                    result = res.data.data
                }
                resolve(result);
            })
        })
    }

    render() {
        return (
            <div>
                <Table
                    rowClassName={(record, index) => { if (record.time === todayLab) { return 'row' } else { return '' } }}
                    bordered
                    dataSource={this.state.schedulesData}
                    columns={columns}
                    pagination={{
                        onChange: (pageNum) => { this.setState({ pageNum }) },
                        current: this.state.pageNum,
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '50', '100'],
                    }}
                />
            </div>
        );
    }
}

export default ScheduleView;