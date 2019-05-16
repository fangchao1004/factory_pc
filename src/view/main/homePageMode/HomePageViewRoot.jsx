import React, { Component } from 'react';
import PieView from './PieView'
import LineChartView from './LineChartView'
import { Row, Col } from 'antd'
import HttpApi from '../../util/HttpApi'

var allDeviceTypes = [];
class HomePageViewRoot extends Component {
    constructor(props) {
        super(props);
        this.state = {
            groupData: [], ////根据设备类型分组后的数据
        }
    }
    componentDidMount() {
        this.init();
    }
    init = async () => {
        let all_devices = await this.getDevicesData();
        allDeviceTypes = await this.getDeviceTypesData();
        let b = {};
        for (let item of all_devices) {
            if (b.hasOwnProperty(item.type_id)) {
                b[item.type_id].push(item)
            } else {
                b[item.type_id] = [item]
            }
            item.type_name = await this.findTypeName(item)
        }
        let group_data_by_typeId = [{ device_type_id: 0, device_Info: all_devices }];
        for (var i in b) {
            // console.log("设备类型:",i,"设备数量:",b[i].length,'设备的数据:',b[i])
            group_data_by_typeId.push({
                device_type_id: parseInt(i),
                device_Info: b[i]
            });
        }
        this.setState({
            groupData: group_data_by_typeId,
        })
    }
    getDevicesData = () => {
        let p = new Promise((resolve, reject) => {
            HttpApi.getDeviceInfo({}, (res) => {
                if (res.data.code === 0) {
                    resolve(res.data.data);
                }
            })
        })
        return p;
    }
    getDeviceTypesData = () => {
        let p = new Promise((resolve, reject) => {
            HttpApi.getDeviceTypeInfo({}, (res) => {
                if (res.data.code === 0) {
                    resolve(res.data.data);
                }
            })
        })
        return p;
    }
    findTypeName = (deviceItem) => {
        let p = new Promise((resolve, reject) => {
            allDeviceTypes.forEach((item) => {
                if (item.id === deviceItem.type_id) {
                    resolve(item.name)
                }
            })
        })
        return p;
    }
    renderPieView = () => {
        let cellsArr = [];
        // console.log('分组的数据：', this.state.groupData);
        let copy_data = JSON.parse(JSON.stringify(this.state.groupData))
        if (copy_data.length === 0) { return null }
        copy_data.forEach((item, index) => {
            let dataObj = { datasouce: item.device_Info, isAll: item.device_Info.length === allDeviceTypes.length }
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
            <div style={{marginTop:-16}}>
                <Row gutter={5}>
                    {this.renderPieView()}
                </Row>
                <Row gutter={10}>
                    <Col span={24}>
                        <div style={{marginTop:16}}>
                            <LineChartView />
                        </div>
                    </Col>
                </Row>
            </div>
        );
    }
}

export default HomePageViewRoot;