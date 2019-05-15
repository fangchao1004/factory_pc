import React from "react";
import {
    Chart,
    Geom,
    Axis,
    Tooltip,
} from "bizcharts";
import DataSet from "@antv/data-set";

class LineChartView extends React.Component {
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
            obj.检查 = 100;
            obj.故障 = (Math.random() * 50).toFixed(0);
            obj.date = index;
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
            key: "aaa",
            // key字段
            value: "num" // value字段
        });
        // console.log(dv);
        const cols = {
            date: {
                range: [0, 0.9]
            }
        };
        return (
            <div style={{width:'100%',backgroundColor:'#FFFFFF',borderRadius:5}}>
                <Chart height={400} data={dv} scale={cols} forceFit={true}>
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
                        ///线
                        type="line"
                        position="date*num"
                        size={2}
                        color={"aaa"}
                        shape={"smooth"}
                    />
                    <Geom
                        ///点
                        type="point"
                        position="date*num"
                        size={4}
                        shape={"circle"}
                        color={"aaa"}
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