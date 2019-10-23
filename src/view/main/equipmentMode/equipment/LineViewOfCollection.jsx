import React, { Component } from 'react';
import { Radio, Empty } from 'antd'
import HttpApi from '../../../util/HttpApi';
import { transfromDataToCollectionList } from '../../../util/Tool'
import { Chart, Geom, Axis, Tooltip, Legend } from "bizcharts";
var device_id;

const cols = {
    index: {
        range: [0, 1]
    }
};
/// 测试数据结构为
// var data = [
//     { index: 0, collectionValue: "0", itemName: "电机侧联轴器处振动（振动值的正常范围）轴向" },
//     { index: 1, collectionValue: "0.308", itemName: "电机侧联轴器处振动（振动值的正常范围）轴向" },
//     { index: 0, collectionValue: "0.001", itemName: "电机侧联轴器处振动（振动值的正常范围）垂直" },
//     { index: 1, collectionValue: "0.003", itemName: "电机侧联轴器处振动（振动值的正常范围）垂直" },
//     { index: 0, collectionValue: "0", itemName: "电机侧联轴器处振动（振动值的正常范围）水平" },
//     { index: 1, collectionValue: "0.002", itemName: "电机侧联轴器处振动（振动值的正常范围）水平" },
//     { index: 0, collectionValue: "0.001", itemName: "风机侧联轴器处振动（振动值的正常范围）轴向" },
//     { index: 1, collectionValue: "0.003", itemName: "风机侧联轴器处振动（振动值的正常范围）轴向" },
//     { index: 0, collectionValue: "0.001", itemName: "风机侧联轴器处振动（振动值的正常范围）垂直" },
//     { index: 1, collectionValue: "0.002", itemName: "风机侧联轴器处振动（振动值的正常范围）垂直" },
//     { index: 0, collectionValue: "0", itemName: "风机侧联轴器处振动（振动值的正常范围）水平" },
//     { index: 1, collectionValue: "0.002", itemName: "风机侧联轴器处振动（振动值的正常范围）水平" },
//     { index: 0, collectionValue: "24.0", itemName: "电机侧联轴器处温度（温度值的正常范围）" },
//     { index: 1, collectionValue: "27.1", itemName: "电机侧联轴器处温度（温度值的正常范围）" },
//     { index: 0, collectionValue: "24.0", itemName: "风机侧联轴器处温度（温度值的正常范围）" },
//     { index: 1, collectionValue: "24.0", itemName: "风机侧联轴器处温度（温度值的正常范围）" }
// ]

/**
 * 采集数据的折线图
 * 
 * 10-20-50-100
 */
class LineViewOfCollection extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentCount: 10,
            renderLineData: []
        }
    }
    componentDidMount() {
        if (this.props.isShow) {
            device_id = this.props.deviceId;
            this.getDataFromDB(this.state.currentCount);
        }
    }
    componentWillReceiveProps(nextProps, nextStates) {
        if (nextProps.isShow) {
            device_id = nextProps.deviceId;
            this.getDataFromDB(this.state.currentCount);
        }
    }
    getDateSelect = () => {
        return (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 16, fontWeight: 500, color: '#000000' }}>采集数据统计图</span>
                <div>
                    <Radio.Group defaultValue={10} buttonStyle="solid" onChange={this.dateChange}>
                        <Radio.Button value={10}>近10次</Radio.Button>
                        <Radio.Button value={20}>近20次</Radio.Button>
                        <Radio.Button value={50}>近50次</Radio.Button>
                        <Radio.Button value={100}>近100次</Radio.Button>
                    </Radio.Group>
                </div>
            </div>
        )
    }

    dateChange = (e) => {
        // console.log(e.target.value);
        this.setState({ currentCount: e.target.value })
        this.getDataFromDB(e.target.value);
    }

    getDataFromDB = async (count) => {
        // console.log('设备id:', device_id, '此多少条上传的record数据:', count);
        let result = await this.getRecordInfo(count);///多条records
        let renderLineData = transfromDataToCollectionList(result);
        // console.log('renderLineData:', renderLineData);
        this.setState({ renderLineData })
    }

    /**
     * 获取最近的 count 次 record 数据。
     */
    getRecordInfo = (count) => {
        return new Promise((resolve, reject) => {
            let result = [];
            let sql = `select id,content from records where effective = 1
            and device_id = '${device_id}'
            order by id desc
            limit ${count}
            `
            HttpApi.obs({ sql }, (res) => {
                if (res.data.code === 0) {
                    result = res.data.data;
                }
                resolve(result);
            })
        })
    }

    render() {
        return (
            <div style={{ backgroundColor: '#FAFAFA', height: 700, width: '100%', borderStyle: 'solid', borderColor: '#E6E6E7', borderWidth: 1 }}>
                {this.getDateSelect()}
                {this.state.renderLineData.length > 0 ?
                    <div>
                        <Chart height={500} data={this.state.renderLineData} scale={cols} style={{ backgroundColor: '#ffffff' }} >
                            <Legend layout={'vertical'} useHtml={true} />
                            <Axis name="index" />
                            <Axis
                                name="collectionValue"
                                label={{
                                    formatter: val => `${val}`
                                }}
                            />
                            <Tooltip
                                crosshairs={{
                                    type: "y"
                                }}
                            />
                            <Geom
                                type="line"
                                position="index*collectionValue"
                                size={2}
                                color={"itemName"}
                                shape={"smooth"}
                            />
                            <Geom
                                type="point"
                                position="index*collectionValue"
                                size={4}
                                shape={"circle"}
                                color={"itemName"}
                                style={{
                                    stroke: "#fff",
                                    lineWidth: 1
                                }}
                            />

                        </Chart>
                    </div>
                    : <Empty style={{ marginTop: 50 }} />}
            </div>
        );
    }
}

export default LineViewOfCollection;