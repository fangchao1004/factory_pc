import React, { Component } from 'react';
import { Table, DatePicker, message } from 'antd'
import moment from 'moment'
import HttpApi from '../../util/HttpApi';

var storage = window.localStorage;
var userinfo = storage.getItem('userinfo')

class CarView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            dateRange: [moment(), moment()],
        }
    }
    componentDidMount() {
        userinfo = storage.getItem('userinfo')
        this.init();
    }
    init = async () => {
        // console.log(JSON.parse(userinfo).name);
        let sql1 = `select carNumber from p_car_card 
        where employeeId =(select recordId from p_employee where name = '${JSON.parse(userinfo).name}' )`
        let mycar = await this.getCarInfo(sql1);
        // console.log('mycarInfo:', mycar);
        if (mycar.length > 0) {
            let carNumber = mycar[0].carNumber;
            let sql2 = `
            select * from
            (select employeeName,terminalId,carNumber,inTime as time, 0 as io from p_record_in_history where carNumber = '${carNumber}' 
            union all (select employeeName,terminalId,carNumber, inTime as time, 0 as io from p_record_in where carNumber = '${carNumber}')
            union all (select employeeName,terminalId,carNumber, outTime as time, 1 as io from p_record_out where carNumber = '${carNumber}')
            ORDER BY time DESC) temp
            where time > '${this.state.dateRange[0].startOf('day').format('YYYY-MM-DD HH:mm:ss')}'
            and time < '${this.state.dateRange[1].endOf('day').format('YYYY-MM-DD HH:mm:ss')}' and terminalId = 6`;
            let resultOfMine = await this.getCarInfo(sql2);
            // console.log(resultOfMine.map((item, index) => { item.key = index; return item }));
            this.setState({ data: resultOfMine.map((item, index) => { item.key = index; return item }) })
        }
    }
    getCarInfo = (sql) => {
        return new Promise((resolve, reject) => {
            let result = []
            HttpApi.obsForcar({ sql }, (res) => {
                if (res.data.code === 0) { result = res.data.data }
                resolve(result);
            })
        })
    }
    disabledDate = (current) => {
        return current > moment().endOf('day');
    }
    render() {
        const columns = [
            { key: 'carNumber', dataIndex: 'carNumber', title: '车牌' },
            { key: 'employeeName', dataIndex: 'employeeName', title: '所属人' },
            {
                key: 'time', dataIndex: 'time', title: '时间日期',
                sorter: (a, b) => {
                    return new Date(a.time).getTime() - new Date(b.time).getTime()
                },
                defaultSortOrder: 'descend',
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
            }
        ]
        return (
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h2 style={{ borderLeft: 4, borderLeftColor: "#3080fe", borderLeftStyle: 'solid', paddingLeft: 5, fontSize: 16 }}>个人车辆出入信息</h2>
                    <DatePicker.RangePicker disabledDate={this.disabledDate} value={this.state.dateRange} ranges={{
                        '今日': [moment(), moment()],
                        '本月': [moment().startOf('month'), moment().endOf('month')],
                    }} onChange={(v) => {
                        if (v && v.length > 0) { this.setState({ dateRange: v }, () => { this.init() }) } else { message.warn('请选择日期'); }
                    }} />
                </div>
                <Table
                    style={{ marginTop: 20 }}
                    bordered
                    dataSource={this.state.data}
                    columns={columns}
                />
            </div>
        );
    }
}

export default CarView;