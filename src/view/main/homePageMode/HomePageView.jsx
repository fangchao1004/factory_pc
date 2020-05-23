import React, { Component } from 'react';
import PieView from './PieView'
import LineChartView from './LineChartView'
import { Row, Col } from 'antd'
import HttpApi from '../../util/HttpApi'
import { getAllowTime, findCountInfoByTime } from '../../util/Tool'
import DeivceRecordAndStatusView from './drawer/DeivceRecordAndStatusVIew';

class HomePageView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            groupData: [], ////根据巡检点类型分组后的数据
            drawerVisible: false,
            onePieData: null,
        }
    }
    componentDidMount() {
        this.init();
    }
    init = async () => {
        ///获取所有巡检点的当前的状态统计信息。
        let allDeviceStatusCount = await this.getAllDeviceStatusCount();///获取所有巡检点的 状态统计 信息
        if (allDeviceStatusCount.length < 3) { /// 如果有某个状态没有设备数，那么就补0。为的是饼图颜色统一
            let temp = [{ lab: 1, value: false }, { lab: 2, value: false }, { lab: 3, value: false }] /// 1 正常 2故障 3待检
            allDeviceStatusCount.forEach((element, index) => {
                temp.forEach((item) => {
                    if (element.device_status === item.lab) { item.value = true }
                })
            });
            temp.forEach((item) => {
                if (item.value === false) { allDeviceStatusCount.push({ device_status: item.lab, status_count: 0 }) }
            })
        }
        allDeviceStatusCount.sort((a, b) => { return a.device_status - b.device_status })///按照device_status的大小排序
        // console.log('获取所有巡检点的 状态统计 信息:', allDeviceStatusCount);////[{device_status: 1, status_count: 3},{device_status: 2, status_count: 4}]
        // let allTodayRecordInfo = await this.getEveryUserRecordToday(); ///获取当日 所有巡检点的巡检情况（针对参加巡检的人员的分组）
        // console.log('allTodayRecordInfo:', allTodayRecordInfo); ////这里的数据很有指导性---如果后期修改要看这个数据结构
        // let b = {};
        // for (let item of allTodayRecordInfo) {
        //     if (b.hasOwnProperty(item.user_name)) { b[item.user_name].push(item) }
        //     else { b[item.user_name] = [item] }
        // }
        // let result = this.changeDataConstruct(b);////进行数据结构的改变统计
        let result = await this.testHandler();
        let linkAll = [{ label: '所有巡检点', count_data: allDeviceStatusCount }, ...result]
        // console.log('linkAll:', linkAll);////如果后期看不懂，要看这里的数据结构
        this.setState({
            groupData: linkAll
        })
    }
    testHandler = async () => {
        let allowTimeList = await getAllowTime();
        let countResultList = [];
        for (let index = 0; index < allowTimeList.length; index++) {
            const element = allowTimeList[index];
            let result = await findCountInfoByTime(element);
            const data = result[0];
            // console.log('data:', data)
            if (data) {
                let status_1_count = 0;
                let status_2_count = 0;
                data.status_arr.split(',').forEach(element => {
                    if (String(element) === "1") { status_1_count++ } else { status_2_count++ }
                });
                // data['status_1_count'] = status_1_count;
                // data['status_2_count'] = status_2_count;
                // data['正常'] = status_1_count;
                // data['故障'] = status_2_count;
                // data['待检'] = data.need_count - data.actu_count
                // delete data['status_arr']
                data['label'] = data.date === -1 ? '昨天 ' + data.begin + '~' + data.end : '今天 ' + data.begin + '~' + data.end
                data['count_data'] = [{ device_status: 1, status_count: status_1_count },
                { device_status: 2, status_count: status_2_count }, { device_status: 3, status_count: data.need_count - data.actu_count }]
                countResultList.push(data)
            }
        }
        return countResultList;
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
        let sql = `select devices.status as device_status,count(devices.status) as status_count from devices
        where devices.effective = 1
        group by devices.status`
        return new Promise((resolve, reject) => {
            HttpApi.obs({ sql }, (res) => {
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
        // console.log('copy_data:', copy_data)
        copy_data.forEach((item, index) => {
            // console.log(item);
            let dataObj = { datasource: item.count_data, title: item.label, checkMan: item.users_name, begin: item.begin, end: item.end, date: item.date, deviceIdStr: item.actu_concat, statusStr: item.status_arr }
            // console.log('dataObj:',dataObj);
            cellsArr.push(
                <Col span={8} key={index}>
                    <PieView data={dataObj} openDrawer={this.openDrawerHandler} />
                </Col>
            )
        })
        return cellsArr
    }
    openDrawerHandler = (data) => {
        this.setState({ drawerVisible: true, onePieData: data })
    }
    closeDrawerHandler = () => {
        this.setState({ drawerVisible: false })
    }

    render() {
        return (
            <div >
                <Row gutter={10}>
                    {this.renderPieView()}
                </Row>
                <Row>
                    <Col span={24}>
                        <div style={{ marginBottom: 10 }}>
                            <LineChartView />
                        </div>
                    </Col>
                </Row>
                <DeivceRecordAndStatusView {...this.props} visible={this.state.drawerVisible} data={this.state.onePieData} close={this.closeDrawerHandler} />
            </div>
        );
    }
}

export default HomePageView;