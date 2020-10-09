import React, { Component } from 'react';
import PieView from './PieView'
import LineChartView from './LineChartView'
import { Row, Col, Radio, Skeleton, DatePicker } from 'antd'
import HttpApi from '../../util/HttpApi'
import { getAllowTime, findCountInfoByTime, getDevicesInfoByIdListStr, filterDevicesByDateScheme, pickUpActuConcatDeviceList } from '../../util/Tool'
import DeivceRecordAndStatusView from './drawer/DeivceRecordAndStatusVIew';
import moment from 'moment';

class HomePageView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            groupData: [], ////根据巡检点类型分组后的数据
            drawerVisible: false,
            onePieData: null,
            area0_id: 1,
            groupList: [],
            selectM: moment()
        }
    }
    componentDidMount() {
        this.init();
        this.getArea0Info();
    }
    getArea0Info = () => {
        let sql = `select * from area_0 where effective = 1`
        HttpApi.obs({ sql }, (res) => {
            if (res.data.code === 0) {
                this.setState({
                    groupList: res.data.data.map((item) => { return { id: item.id, name: item.name } })
                })
            }
        })
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
        let result = await this.testHandler();
        let linkAll = [{ label: '所有巡检点', count_data: allDeviceStatusCount }, ...result]
        // console.log('linkAll:', linkAll);////如果后期看不懂，要看这里的数据结构
        this.setState({
            groupData: linkAll
        })
    }
    testHandler = async () => {
        let allowTimeList = await getAllowTime(this.state.area0_id);
        ///加个 DatePicker 目的是获取某一天的巡检记录-
        let gap_day = this.state.selectM.diff(moment(), 'day');
        // console.log('day差值：', gap_day)
        allowTimeList = allowTimeList.map((item) => {
            item.begin = moment(item.begin).add('day', gap_day).format('YYYY-MM-DD HH:mm:ss');
            item.end = moment(item.end).add('day', gap_day).format('YYYY-MM-DD HH:mm:ss')
            return item
        })
        // console.log('allowTimeList:', allowTimeList)
        let countResultList = [];
        for (let index = 0; index < allowTimeList.length; index++) {
            const element = allowTimeList[index];
            let result = await findCountInfoByTime(element);
            const data = result[0];
            if (data) {
                let devicesResult = await getDevicesInfoByIdListStr({ select_map_device: data.need_devices });
                let listAfterFilter = filterDevicesByDateScheme(devicesResult, moment().add('day', gap_day));///每个时间区间内的设备-进过方案筛选后还剩哪些设备需要巡检
                let status_1_count = 0;
                let status_2_count = 0;
                ///从 listAfterFilter 中获取 data.actu_concat 对应的设备状态
                let actu_devices = pickUpActuConcatDeviceList(data.actu_concat.split(','), listAfterFilter)
                data.actu_devices = actu_devices;
                actu_devices.forEach(element => {
                    if (element.status === 1) { status_1_count++ } else { status_2_count++ }
                });
                // console.log('status_1_count:', status_1_count, 'status_2_count:', status_2_count, 'status3_count:', listAfterFilter.length - data.actu_count)
                data['afterFilter'] = listAfterFilter;
                data['afterFilter_count'] = listAfterFilter.length;
                data['label'] = data.date === -1 ? '昨天 ' + data.begin + '~' + data.end : '今天 ' + data.begin + '~' + data.end;
                data['count_data'] = [{ device_status: 1, status_count: status_1_count },
                { device_status: 2, status_count: status_2_count }, { device_status: 3, status_count: listAfterFilter.length - data.actu_count }];
                countResultList.push(data);
            }
        }
        return countResultList;
    }
    getAllDeviceStatusCount = () => {
        let sql = `select devices.status as device_status,count(devices.status) as status_count from devices
        where devices.effective = 1 and devices.area0_id = ${this.state.area0_id}
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
        copy_data.forEach((item, index) => {
            // console.log(item);
            let dataObj = { datasource: item.count_data, title: item.label, checkMan: item.users_name, begin: item.begin, end: item.end, date: item.date, devices: item.afterFilter, actu_devices: item.actu_devices }
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
                <Row style={{ height: 56, marginTop: -66, gap: 10 }} type='flex' align='middle' justify='end'>
                    <Col>
                        <DatePicker
                            allowClear={false}
                            value={this.state.selectM}
                            disabledDate={(current) => {
                                return current > moment().endOf('day');
                            }}
                            onChange={(m) => {
                                this.setState({ selectM: m, groupData: [] }, () => {
                                    // let day = this.state.selectM.diff(moment(), 'day')
                                    this.init();
                                })
                            }} />
                    </Col>
                    <Col>
                        <Radio.Group value={this.state.area0_id} buttonStyle="solid" onChange={(e) => {
                            this.setState({ area0_id: e.target.value, groupData: [] }, () => {
                                this.init();
                            })
                        }}>
                            {this.state.groupList.map((item, index) => { return <Radio.Button key={index} value={item.id}>{item.name}</Radio.Button> })}
                        </Radio.Group>
                    </Col>
                </Row>
                <Row gutter={10} style={{ marginTop: 10 }}>
                    {this.state.groupData.length > 0 ? this.renderPieView() : <div style={{ backgroundColor: '#FFFFFF' }}><Skeleton active paragraph={{ rows: 10 }} /></div>}
                </Row>
                <Row>
                    <Col span={24}>
                        <div style={{ marginBottom: 10 }}>
                            <LineChartView />
                        </div>
                    </Col>
                </Row>
                <DeivceRecordAndStatusView {...this.props} visible={this.state.drawerVisible} data={this.state.onePieData} close={this.closeDrawerHandler} area0_id={this.state.area0_id} />
            </div>
        );
    }
}

export default HomePageView;