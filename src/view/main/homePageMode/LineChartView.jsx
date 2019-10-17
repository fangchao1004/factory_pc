import React, { Component } from 'react';
import { Chart, Geom, Axis, Tooltip, Legend } from "bizcharts";
import DataSet from "@antv/data-set";
import HttpApi from '../../util/HttpApi'
import moment from 'moment'

class LineChartView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: []
        }
    }
    componentDidMount() {
        // this.getRandomData();
        this.getData();
    }
    // getRandomData = () => {
    //     let dataArr = [];
    //     for (let index = 1; index <= 30; index++) {
    //         let obj = {};
    //         obj.总共 = 50;
    //         obj.故障 = parseInt((Math.random() * 10).toFixed(0));
    //         obj.date = index + "";
    //         dataArr.push(obj);
    //     }
    //     this.setState({
    //         data: dataArr
    //     })
    // }
    getData = async () => {
        let currentDeviceStatusData = await this.getDeviceStatusCount();////当前设备的状态。分布（正常多少）（故障多少）
        // console.log('当前的设备状态：', currentDeviceStatusData);///今日记录
        let historyOfDevicesStatusData = await this.getStatusCount();///近一个月的设备情况
        // console.log('设备历史记录：', historyOfDevicesStatusData);
        let todayHasDetectCount = await this.getTodayHasDetectCount();///今日检测了多少台设备
        // console.log('今日检测了多少台设备:', todayHasDetectCount.todayDetectCount);

        let dataArr = [];
        historyOfDevicesStatusData.forEach((item) => {
            let obj = {};
            obj.总共 = item.total_num;
            obj.故障 = item.error_num;
            obj.巡检 = item.detect_num;
            obj.date = moment(item.createdAt).format('DD');
            dataArr.push(obj);
        })
        // console.log(dataArr);///历史记录
        let allcountForToday = 0;
        currentDeviceStatusData.forEach((item) => {
            allcountForToday += item.status_count
        })
        let todayObj = {}
        todayObj.总共 = allcountForToday;
        todayObj.故障 = currentDeviceStatusData[1].status_count;
        todayObj.巡检 = todayHasDetectCount.todayDetectCount;
        todayObj.date = moment().format('DD');
        dataArr.push(todayObj);
        this.setState({
            data: dataArr
        })
    }
    getDeviceStatusCount = () => {
        return new Promise((resolve, reject) => {
            let sqlText = 'select des.status,count(des.status) as status_count from devices des group by des.status'
            HttpApi.obs({ sql: sqlText }, (res) => {
                let result = [];
                if (res.data.code === 0) {
                    result = res.data.data
                }
                resolve(result);
            });
        })
    }
    getStatusCount = () => {
        let startOfMonth = moment().startOf('month').format('YYYY-MM-DD HH:mm:ss');
        let endOfMonth = moment().endOf('month').format('YYYY-MM-DD HH:mm:ss');
        // console.log([startOfMonth, endOfMonth]);
        return new Promise((resolve, reject) => {
            let sqlText = 'select * from status_counts where createdAt > "' + startOfMonth + '" and createdAt < "' + endOfMonth + '"'
            HttpApi.obs({ sql: sqlText }, (res) => {
                let result = [];
                if (res.data.code === 0) {
                    result = res.data.data
                }
                resolve(result);
            });
        })
    }
    getTodayHasDetectCount = () => {
        let startOfToday = moment().startOf('day').format('YYYY-MM-DD HH:mm:ss');
        let endOfToday = moment().endOf('day').format('YYYY-MM-DD HH:mm:ss');
        // console.log(startOfToday,endOfToday);
        return new Promise((resolve, reject) => {
            // let sql1 = ' select count(*) as todayDetectCount  from (select distinct rds.device_id from records rds'
            // let sql2 = ' where rds.createdAt > "' + startOfToday + '" and rds.createdAt < "' + endOfToday + '") t1 ';
            // let sqlText = sql1 + sql2;
            let sql = `select count(*) as todayDetectCount  from (select distinct rds.device_id from records rds
                where rds.createdAt > "${startOfToday}" and rds.createdAt < "${endOfToday}") t1 
            `
            HttpApi.obs({ sql }, (res) => {
                let result = null;
                if (res.data.code === 0) {
                    result = res.data.data[0]
                }
                resolve(result);
            });
        })
    }
    render() {
        const ds = new DataSet();
        const dv = ds.createView().source(this.state.data);
        dv.transform({
            type: "fold",
            fields: ["总共", "巡检", "故障"],
            // 展开字段集
            key: "status",
            // key字段
            value: "num" // value字段
        });
        // console.log(dv);
        const cols = {
            date: {
                range: [0, 1]
            }
        };
        return (
            <div style={{ backgroundColor: '#F0F2F5' }}>
                <div style={{ marginLeft: 20, padding: 20, fontSize: 20 }}>近一个月统计</div>
                <Chart height={400} data={dv} scale={cols} forceFit>
                    <Legend />
                    <Axis name="date" />
                    <Axis
                        name="num"
                        label={{
                            formatter: val => `${val}台`
                        }}
                    />
                    <Tooltip
                        crosshairs={{
                            type: "y"
                        }}
                    />
                    <Geom
                        type="line"
                        position="date*num"
                        size={2}
                        color={"status"}
                        shape={"smooth"}
                    />
                    <Geom
                        type="point"
                        position="date*num"
                        size={4}
                        shape={"circle"}
                        color={"status"}
                        style={{
                            stroke: "#fff",
                            lineWidth: 1
                        }}
                    />
                </Chart>
            </div>
        );
    }
}

export default LineChartView;