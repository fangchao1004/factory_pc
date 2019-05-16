import React, { Component } from 'react';
import { Chart, Geom, Axis, Tooltip, Legend } from "bizcharts";
import DataSet from "@antv/data-set";

class LineChartView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: []
        }
    }
    componentDidMount() {
        this.getRandomData();
    }
    getRandomData = () => {
        let dataArr = [];
        for (let index = 1; index <= 31; index++) {
            let obj = {};
            obj.检查 = 50;
            obj.故障 = parseInt((Math.random() * 10).toFixed(0));
            obj.date = index + "";
            dataArr.push(obj);
        }
        this.setState({
            data: dataArr
        })
    }
    render() {
        const ds = new DataSet();
        const dv = ds.createView().source(this.state.data);
        dv.transform({
            type: "fold",
            fields: ["检查", "故障"],
            // 展开字段集
            key: "status",
            // key字段
            value: "num" // value字段
        });
        console.log(dv);
        const cols = {
            date: {
                range: [0, 1]
            }
        };
        return (
            <div style={{ backgroundColor: '#F0F2F5' }}>
                <div style={{ marginLeft: 20, padding: 20, fontSize: 20 }}>{new Date().getMonth() + 1}月统计</div>
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