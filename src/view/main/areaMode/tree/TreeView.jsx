import React, { Component } from 'react';
import { Tree, Col, Row } from 'antd';
import HttpApi from '../../../util/HttpApi';
import { transfromDataTo3level, combinAreaAndDevice, renderTreeNodeListByData } from '../../../util/Tool'
import "./treeView.css"
import DeviceInfoView from './DeviceInfoView';

var treeNodeList = null;
export default class TreeView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedDeviceObj: null
        }
    }

    componentDidMount() {
        this.init();
    }
    init = async () => {
        let resultArea123 = await this.getArea123Info();
        let deviceInfo = await this.getDeviceInfo();
        let tempData = transfromDataTo3level(resultArea123);
        let tempData2 = combinAreaAndDevice(tempData, deviceInfo);
        treeNodeList = renderTreeNodeListByData(tempData2);
        this.forceUpdate();
    }

    getDeviceInfo = () => {
        return new Promise((resolve, reject) => {
            HttpApi.getDeviceInfo({ effective: 1 }, (res) => {
                let result = [];
                if (res.data.code === 0) {
                    result = res.data.data
                }
                resolve(result)
            })
        })
    }
    getArea123Info = () => {
        return new Promise((resolve, reject) => {
            let sql = `select area_1.id as area1_id , area_1.name as area1_name, area_2.id as area2_id ,area_2.name as area2_name,area_3.id as area3_id,area_3.name as area3_name from area_1
            left join (select * from area_2 where effective = 1)area_2 on area_1.id = area_2.area1_id
            left join (select * from area_3 where effective = 1)area_3 on area_2.id = area_3.area2_id
            where area_1.effective = 1
            order by area_1.id`;
            HttpApi.obs({ sql }, (res) => {
                let result = [];
                if (res.data.code === 0) {
                    result = res.data.data
                }
                resolve(result)
            })
        })
    }
    onSelect = (selectedKeys, info) => {
        // console.log('selected', selectedKeys, info.node.props);
        let deviceInfo = {};
        if (selectedKeys[0]) {
            deviceInfo.id = selectedKeys[0];
            deviceInfo.title = info.node.props.title;
        }
        this.setState({
            selectedDeviceObj: selectedKeys[0] ? deviceInfo : null
        })
    };
    render() {
        return (
            <div>
                <Row>
                    <Col span={10} style={{ borderRight: 2, borderRightColor: "#DDDDDD", borderRightStyle: 'dashed' }}>
                        <Tree showLine className="hide-file-icon" showIcon onSelect={this.onSelect}>
                            {treeNodeList}
                        </Tree>
                    </Col>
                    <Col span={14} style={{ paddingLeft: 10, paddingRight: 10 }}>
                        <DeviceInfoView deviceObj={this.state.selectedDeviceObj} />
                    </Col>
                </Row>
            </div>
        );
    }
}