import React, { Component } from 'react';
import { Table, DatePicker, message } from 'antd'
import HttpApi from '../../util/HttpApi';
import moment from 'moment'


export default class AllCarView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentPage: 1,
            CarsData: [],
            CarsCounts: 0,
            dateRange: [moment(), moment()],
        }
    }
    componentDidMount() {
        this.init();
    }
    init = async () => {
        let CarsCounts = await this.getCarsCount();
        let CarsData = await this.getCarsInfo(1);
        // console.log('old CarsData:', CarsData, CarsCounts);
        CarsData = CarsData.map((item, index) => { item.key = index; return item })
        this.setState({ CarsData, CarsCounts })
    }
    getCarsCount = () => {
        return new Promise((resolve, reject) => {
            let sql = `select count(*) count from
            (
            select terminalId,carNumber,inTime as time, 0 as io from p_record_in_history
            union all (select terminalId,carNumber, inTime as time, 0 as io from p_record_in)
            union all (select terminalId,carNumber, outTime as time, 1 as io from p_record_out)
            ) t1
            where time > '${this.state.dateRange[0].startOf('day').format('YYYY-MM-DD HH:mm:ss')}'
            and time < '${this.state.dateRange[1].endOf('day').format('YYYY-MM-DD HH:mm:ss')}' and terminalId = 6`;
            let result = 0;
            HttpApi.obsForcar({ sql }, (res) => {
                if (res.data.code === 0) { result = res.data.data[0].count }
                resolve(result);
            })
        })
    }
    getCarsInfo = (currentPage) => {
        return new Promise((resolve, reject) => {
            let sql = `
            select * from
            (select employeeName,terminalId, carNumber,inTime as time, 0 as io from p_record_in_history
            union all (select employeeName,terminalId,carNumber, inTime as time, 0 as io from p_record_in)
            union all (select employeeName,terminalId,carNumber, outTime as time, 1 as io from p_record_out)) as temp
            where time > '${this.state.dateRange[0].startOf('day').format('YYYY-MM-DD HH:mm:ss')}'
            and time < '${this.state.dateRange[1].endOf('day').format('YYYY-MM-DD HH:mm:ss')}' and terminalId = 6
            order by time desc
            limit ${(currentPage - 1) * 10},10`;
            let result = [];
            HttpApi.obsForcar({ sql }, (res) => {
                if (res.data.code === 0) { result = res.data.data }
                resolve(result);
            })
        })
    }
    handleTableChange = async (currentPage) => {
        // console.log('currentPage:', currentPage);
        let CarsData = await this.getCarsInfo(currentPage);
        CarsData = CarsData.map((item, index) => { item.key = index; return item })
        // console.log('CarsData:', CarsData);
        this.setState({ currentPage, CarsData })
    }
    disabledDate = (current) => {
        return current > moment().endOf('day');
    }
    render() {
        const { currentPage, CarsCounts } = this.state;
        const paginationProps = {
            showQuickJumper: true,
            current: currentPage,
            onChange: (page) => this.handleTableChange(page),
            total: CarsCounts,
        }
        const columns = [
            { key: 'carNumber', dataIndex: 'carNumber', title: '车牌' },
            { key: 'employeeName', dataIndex: 'employeeName', title: '所属单位(人)' },
            {
                key: 'time', dataIndex: 'time', title: '时间日期',
                render: (text) => { return <div>{moment(text).utcOffset(0).format('YYYY-MM-DD HH:mm:ss')}</div> }
            },
            {
                key: 'io', dataIndex: 'io', title: '出入', render: (text) => {
                    let str = '驶出';
                    let color = 'red'
                    if (text === 0) {
                        str = '驶入'
                        color = 'green'
                    }
                    return <div style={{ color }}>{str}</div>
                }
            }]
        return (
            <div style={{ backgroundColor: '#FFFFFF', padding: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h2 style={{ borderLeft: 4, borderLeftColor: "#3080fe", borderLeftStyle: 'solid', paddingLeft: 5, fontSize: 16 }}>所有车辆出入记录</h2>
                    <DatePicker.RangePicker size="small" disabledDate={this.disabledDate} value={this.state.dateRange} ranges={{
                        '今日': [moment(), moment()],
                        '本月': [moment().startOf('month'), moment().endOf('day')],
                    }} onChange={(v) => {
                        if (v && v.length > 0) { this.setState({ dateRange: v }, () => { this.init() }) } else { message.warn('请选择日期'); }
                    }} />
                </div>
                <Table
                    size="small"
                    bordered
                    dataSource={this.state.CarsData}
                    columns={columns}
                    pagination={paginationProps}
                />
            </div>
        );
    }
}

// `select carNumber,inTime as time, 0 as io from p_record_in_history
// union all (select carNumber, inTime as time, 0 as io from p_record_in)
// union all (select carNumber, outTime as time, 1 as io from p_record_out)`