import React, { Component } from 'react';
import { Chart, Geom, Tooltip, Coord, Label } from "bizcharts";
import DataSet from "@antv/data-set";
import { Radio, Popover, Icon, Empty } from 'antd'
import moment from 'moment'
import HttpApi from '../../../util/HttpApi';

const content = (
    <div>
        <p>一周定义为:今天结束时刻+回溯6天前的启始时间(共7天)</p>
        <p>同理:一月30天,三月90天,半年180天</p>
    </div>
);
var device_id;
/**
 * 设备的状态
 * 统计饼图
 */
class PieViewOfOneDeStus extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentDate: 7,
            renderPieData: []
        }
    }
    componentDidMount() {
        if (this.props.isShow) {
            device_id = this.props.pieDeviceId;
            this.getDataFromDB(this.state.currentDate);
        }
    }
    componentWillReceiveProps(nextProps, nextStates) {
        if (nextProps.isShow) {
            device_id = nextProps.pieDeviceId;
            this.getDataFromDB(this.state.currentDate);

        }
    }
    getDataFromDB = async (date) => {
        let dayOfBegin = moment().subtract(date - 1, 'day').startOf('day').format('YYYY-MM-DD HH:mm:ss');
        let dayOfEnd = moment().endOf('day').format('YYYY-MM-DD HH:mm:ss');
        // console.log(date + '天前的开始时间\n', dayOfBegin);
        // console.log('获取今天结束的时间\n', dayOfEnd);
        // console.log('deviceId:', device_id);
        ///开始查询时间库。
        let result = await this.getRecordInfo(dayOfBegin, dayOfEnd);
        // console.log("开始查询时间库。", result);
        let tempArr = [];
        result.forEach((oneStatusItem) => {
            tempArr.push({ item: oneStatusItem.device_status === 1 ? '正常' : '故障', count: oneStatusItem.count_device_status });
        })
        // console.log(tempArr);
        this.setState({ renderPieData: tempArr })
    }

    getRecordInfo = (dayOfBegin, dayOfEnd) => {
        return new Promise((resolve, reject) => {
            let result = [];
            let sql = `select device_status, count(device_status) as count_device_status from records
            where effective = 1 and createdAt > "${dayOfBegin}" and createdAt < "${dayOfEnd}" and device_id = "${device_id}"
            group by device_status
            `
            HttpApi.obs({ sql }, (res) => {
                if (res.data.code === 0) {
                    result = res.data.data;
                }
                resolve(result);
            })
        })
    }

    getDateSelect = () => {
        return (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 16, fontWeight: 500, color: '#000000' }}>设备状态统计图</span>
                <div>
                    <Popover content={content} title="日期说明">
                        <Icon type="info-circle" theme="twoTone" style={{ fontSize: 20, marginRight: 20 }} />
                    </Popover>
                    <Radio.Group defaultValue={7} buttonStyle="solid" onChange={this.dateChange}>
                        <Radio.Button value={7}>近一周</Radio.Button>
                        <Radio.Button value={30}>近一月</Radio.Button>
                        <Radio.Button value={90}>近三月</Radio.Button>
                        <Radio.Button value={180}>近半年</Radio.Button>
                    </Radio.Group>
                </div>
            </div>
        )
    }

    dateChange = (e) => {
        // console.log(e.target.value);
        this.setState({ currentDate: e.target.value })
        this.getDataFromDB(e.target.value);
    }

    render() {
        const { DataView } = DataSet;
        const data = this.state.renderPieData
        const dv = new DataView();
        dv.source(data).transform({
            type: "percent",
            field: "count",
            dimension: "item",
            as: "percent"
        });
        const cols = {
            percent: {
                formatter: val => {
                    val = val * 100 + "%";
                    return val;
                }
            }
        };
        return (
            <div style={{ backgroundColor: '#FAFAFA', height: 350, width: '100%', borderStyle: 'solid', borderColor: '#E6E6E7', borderWidth: 1 }}>
                {this.getDateSelect()}
                {this.state.renderPieData.length > 0 ?
                    <Chart
                        height={320}
                        data={dv}
                        scale={cols}
                        padding={[30, 0, 30, 50]}
                    >
                        <Coord type="theta" radius={1} />
                        <Tooltip
                            showTitle={false}
                            itemTpl="<li><span style=&quot;background-color:{color};&quot; class=&quot;g2-tooltip-marker&quot;></span>{name}: {value}</li>"
                        />
                        <Geom
                            type="intervalStack"
                            position="percent"
                            color="item"
                            tooltip={[
                                "item*percent",
                                (item, percent) => {
                                    let newPercent = (percent * 100).toFixed(2) + "%";
                                    return {
                                        name: item + '率',
                                        value: newPercent
                                    };
                                }
                            ]}
                            style={{
                                lineWidth: 1,
                                stroke: "#fff"
                            }}
                        >
                            <Label
                                content="percent"
                                formatter={(val, item) => {
                                    return item.point.item + ": " + item.point.count + '次';
                                }}
                            />
                        </Geom>
                    </Chart> : <Empty style={{ marginTop: 50 }} />}
            </div>
        );
    }
}

export default PieViewOfOneDeStus;