import React, { Component } from 'react';
import { Table } from 'antd'
import HttpApi from '../../util/HttpApi';
import moment from 'moment'


export default class AllCarView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentPage: 1,
            CarsData: [],
            CarsCounts: 0,
        }
    }
    componentDidMount() {
        this.init();
    }
    init = async () => {
        let CarsCounts = await this.getCarsCount();
        let CarsData = await this.getCarsInfo(1);
        console.log('CarsData:', CarsData, CarsCounts);
        CarsData = CarsData.map((item, index) => { item.key = index; return item })
        this.setState({ CarsData, CarsCounts })
    }
    getCarsCount = () => {
        return new Promise((resolve, reject) => {
            let sql = `select count(*) count from
            (
            select carNumber,inTime as time, 0 as io from p_record_in_history
            union all (select carNumber, inTime as time, 0 as io from p_record_in)
            union all (select carNumber, outTime as time, 1 as io from p_record_out)
            ) t1`;
            let result = 0;
            HttpApi.obsForcar({ sql }, (res) => {
                if (res.data.code === 0) { result = res.data.data[0].count }
                resolve(result);
            })
        })
    }
    getCarsInfo = (currentPage) => {
        return new Promise((resolve, reject) => {
            let sql = `select carNumber,inTime as time, 0 as io from p_record_in_history
            union all (select carNumber, inTime as time, 0 as io from p_record_in)
            union all (select carNumber, outTime as time, 1 as io from p_record_out)
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
    render() {
        const { currentPage, CarsCounts } = this.state;
        const paginationProps = {
            current: currentPage,
            onChange: (page) => this.handleTableChange(page),
            total: CarsCounts,
        }
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
            }]
        return (
            <Table
                bordered
                dataSource={this.state.CarsData}
                columns={columns}
                pagination={paginationProps}
            />
        );
    }
}

// `select carNumber,inTime as time, 0 as io from p_record_in_history
// union all (select carNumber, inTime as time, 0 as io from p_record_in)
// union all (select carNumber, outTime as time, 1 as io from p_record_out)`