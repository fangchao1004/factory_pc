import React, { Component } from 'react';
import { Table } from 'antd'
import moment from 'moment'
import HttpApi from '../../util/HttpApi';

var storage = window.localStorage;
var userinfo = storage.getItem('userinfo')

class CarView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: []
        }
    }
    componentDidMount() {
        userinfo = storage.getItem('userinfo')
        this.init();
    }
    init = async () => {
        // console.log(JSON.parse(userinfo).name);
        let sql1 = `select carNumber from p_car_card where employeeId =(select recordId from p_employee where name = '${JSON.parse(userinfo).name}' )`
        let mycar = await this.getCarInfo(sql1);
        // console.log('mycarInfo:', mycar);
        if (mycar.length > 0) {
            let carNumber = mycar[0].carNumber;
            let sql2 = `select carNumber,inTime as time, 0 as io from p_record_in_history where carNumber = '${carNumber}' 
            union all (select carNumber, inTime as time, 0 as io from p_record_in where carNumber = '${carNumber}')
            union all (select carNumber, outTime as time, 1 as io from p_record_out where carNumber = '${carNumber}')
            ORDER BY time DESC`
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

    render() {
        const columns = [
            { key: 'carNumber', dataIndex: 'carNumber', title: '车牌' },
            {
                key: 'time', dataIndex: 'time', title: '时间', render: (text) => { return <div>{moment(text).utcOffset(0).format('YYYY-MM-DD HH:mm:ss')}</div> }
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
            <Table
                bordered
                dataSource={this.state.data}
                columns={columns}
            />
        );
    }
}

export default CarView;