import React, { Component } from 'react';
import PieView from './PieView'
import LineChartView from './LineChartView'
import { Row, Col } from 'antd'
import HttpApi from '../../util/HttpApi'

class HomePageView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            groupData: [], ////根据巡检点类型分组后的数据
        }
    }
    componentDidMount() {
        this.init();
    }
    init = async () => {
        ///获取所有巡检点的当前的状态统计信息。
        let allDeviceStatusCount = await this.getAllDeviceStatusCount();///获取所有巡检点的 状态统计 信息
        // console.log(allDeviceStatusCount);////[{device_status: 1, status_count: 3},{device_status: 2, status_count: 4}]
        let allTodayRecordInfo = await this.getEveryUserRecordToday(); ///获取当日 所有巡检点的巡检情况（针对参加巡检的人员的分组）
        // console.log('allTodayRecordInfo:', allTodayRecordInfo); ////这里的数据很有指导性---如果后期修改要看这个数据结构
        let b = {};
        for (let item of allTodayRecordInfo) {
            if (b.hasOwnProperty(item.user_name)) { b[item.user_name].push(item) }
            else { b[item.user_name] = [item] }
        }
        let result = this.changeDataConstruct(b);////进行数据结构的改变统计
        let linkAll = [{ user_name: '所有巡检点', count_data: allDeviceStatusCount }, ...result]
        // console.log('linkAll:', linkAll);////如果后期看不懂，要看这里的数据结构
        this.setState({
            groupData: linkAll
        })
    }
    changeDataConstruct = (v) => {
        let finallyResult = [];
        for (const key in v) {
            // console.log(key, v[key]);//// 员工A  [{…}, {…}, {…}, {…}, {…}, {…}, {…}]
            ///对 v[key] 这个数组进行遍历
            let tempArr = JSON.parse(JSON.stringify(v[key]));
            let result_arr = [{ device_status: 1, status_count: 0 }, { device_status: 2, status_count: 0 }, { device_status: null, status_count: 0 }]
            tempArr.forEach((item) => {
                if (item.device_status === 1) {
                    result_arr[0].status_count = result_arr[0].status_count + 1
                } else if (item.device_status === 2) {
                    result_arr[1].status_count = result_arr[1].status_count + 1
                } else {
                    result_arr[2].status_count = result_arr[2].status_count + 1
                }
            })
            // console.log(key, result_arr);
            finallyResult.push({ 'user_name': key, 'count_data': result_arr });
        }
        return finallyResult
    }
    getAllDeviceStatusCount = () => {
        let sqlText = 'select devices.status as device_status,count(devices.status) as status_count from devices group by devices.status'
        return new Promise((resolve, reject) => {
            HttpApi.obs({ sql: sqlText }, (res) => {
                let result = [];
                if (res.data.code === 0) {
                    result = res.data.data;
                }
                resolve(result);
            })
        })
    }
    getEveryUserRecordToday = () => {
        return new Promise((resolve, reject) => {
            HttpApi.getEveryUserRecordToday({}, (res) => {
                let result = [];
                if (res.data.code === 0) {
                    result = res.data.data;
                }
                resolve(result);
            })
        })
    }
    renderPieView = () => {
        let cellsArr = [];
        let copy_data = JSON.parse(JSON.stringify(this.state.groupData))
        if (copy_data.length === 0) { return null }
        copy_data.forEach((item, index) => {
            // console.log(item);
            let dataObj = { datasouce: item.count_data, title: item.user_name }
            // console.log('dataObj:',dataObj);
            cellsArr.push(
                <Col span={8} key={index}>
                    <PieView data={dataObj} />
                </Col>
            )
        })
        return cellsArr
    }

    render() {
        return (
            <div style={{ marginTop: -16, paddingLeft: 10, paddingRight: 10 }}>
                <Row gutter={5}>
                    {this.renderPieView()}
                </Row>
                <Row gutter={10}>
                    <Col span={24}>
                        <div style={{ marginTop: 16, marginBottom: 20 }}>
                            <LineChartView />
                        </div>
                    </Col>
                </Row>
            </div>
        );
    }
}

export default HomePageView;