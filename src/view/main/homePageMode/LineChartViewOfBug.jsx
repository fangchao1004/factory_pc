import React, { Component } from 'react';
import { Chart, Geom, Axis, Tooltip, Legend } from "bizcharts";
import DataSet from "@antv/data-set";
import HttpApi from '../../util/HttpApi'
import moment from 'moment'

class LineChartViewOfBug extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: []
        }
    }
    componentDidMount() {
        this.getData();
    }
    getData = async () => {
        let todayBugNum = await this.getTodayBugNum();////获取今日的缺陷数量
        let todayCloseBugNum = await this.getTodayCloseBugNum();///获取今日多少个缺陷解决
        // console.log('todayBugNum:', todayBugNum[0]);///今日记录
        // console.log('todayCloseBugNum:',todayCloseBugNum);///今日解决个数
        let bugsCount = await this.getBugsCount();///近一个月的缺陷情况
        // console.log('bugsCount:', bugsCount);
        let dataArr = [];
        bugsCount.forEach((item) => {
            let obj = {};
            obj.总数 = item.total_num;
            obj.解决 = item.close_num;
            obj.date = moment(item.createdAt).format('DD');
            dataArr.push(obj);
        })
        let todayObj = {}
        todayObj.总数 = todayBugNum[0].count;
        todayObj.解决 = todayCloseBugNum[0].count;
        todayObj.date = moment().format('DD');
        dataArr.push(todayObj);
        this.setState({
            data: dataArr
        })
    }
    getTodayBugNum = () => {
        return new Promise((resolve, reject) => {
            let todayStart = moment().startOf('day').format('YYYY-MM-DD HH:mm:ss');
            let todayEnd = moment().endOf('day').format('YYYY-MM-DD HH:mm:ss');
            let sql = `select count(*) count from bugs
            where createdAt>'${todayStart}' and createdAt<'${todayEnd}' and effective = 1`
            HttpApi.obs({ sql }, (res) => {
                let result = [];
                if (res.data.code === 0) {
                    result = res.data.data
                }
                resolve(result);
            });
        })
    }
    getTodayCloseBugNum = () => {
        return new Promise((resolve, reject) => {
            let todayStart = moment().startOf('day').format('YYYY-MM-DD HH:mm:ss');
            let todayEnd = moment().endOf('day').format('YYYY-MM-DD HH:mm:ss');
            let sql = `select count(*) count from bugs
            where closedAt>'${todayStart}' and closedAt<'${todayEnd}' and effective = 1`
            HttpApi.obs({ sql }, (res) => {
                let result = [];
                if (res.data.code === 0) {
                    result = res.data.data
                }
                resolve(result);
            });
        })
    }
    getBugsCount = () => {
        let startOfMonth = moment().startOf('month').format('YYYY-MM-DD HH:mm:ss');
        let endOfMonth = moment().endOf('month').format('YYYY-MM-DD HH:mm:ss');
        return new Promise((resolve, reject) => {
            let sql = `select * from bugs_counts
            where createdAt>'${startOfMonth}' and createdAt<'${endOfMonth}'`
            HttpApi.obs({ sql }, (res) => {
                let result = [];
                if (res.data.code === 0) {
                    result = res.data.data
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
            fields: ["总数", "解决"],
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
                            formatter: val => `${val}个`
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

export default LineChartViewOfBug;