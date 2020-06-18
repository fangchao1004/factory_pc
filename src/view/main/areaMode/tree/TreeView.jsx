import React, { Component } from 'react';
import { Tree, Col, Row } from 'antd';
import HttpApi from '../../../util/HttpApi';
import { combinAreaAndDevice, renderTreeNodeListByData, translate } from '../../../util/Tool'
import "./treeView.css"
import DeviceInfoView from './DeviceInfoView';
const { TreeNode } = Tree;
/**
 * 巡检区域
 * 分级展示界面
 */
export default class TreeView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedDeviceObj: null,
            areaAndDeivceList: [],
        }
    }
    componentDidMount() {
        this.init();
    }
    init = async () => {
        let resultArea0123 = await HttpApi.getArea0123Info();
        let deviceInfo = await this.getDeviceInfo();
        let result = translate(['area0_id', 'area1_id', 'area2_id', 'area3_id'], resultArea0123)
        let tempData2 = combinAreaAndDevice(result, deviceInfo);
        this.setState({
            areaAndDeivceList: tempData2
        })
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
    getArea0List = () => {
        return new Promise((resolve, reject) => {
            let sql = `select * from area_0 where effective = 1`;
            HttpApi.obs({ sql }, (res) => {
                let result = [];
                if (res.data.code === 0) {
                    result = res.data.data
                }
                resolve(result)
            })
        })
    }
    // getArea0123Info = () => {
    //     return new Promise((resolve, reject) => {
    //         let sql = `select area_0.id as area0_id , area_0.name as area0_name, area_1.id as area1_id , area_1.name as area1_name, area_2.id as area2_id ,area_2.name as area2_name,area_3.id as area3_id,area_3.name as area3_name 
    //         from area_0
    //         left join (select * from area_1 where effective = 1)area_1 on area_0.id = area_1.area0_id
    //         left join (select * from area_2 where effective = 1)area_2 on area_1.id = area_2.area1_id
    //         left join (select * from area_3 where effective = 1)area_3 on area_2.id = area_3.area2_id
    //         where area_0.effective = 1
    //         order by area_0.id,area_1.id`;
    //         HttpApi.obs({ sql }, (res) => {
    //             let result = [];
    //             if (res.data.code === 0) {
    //                 result = res.data.data
    //             }
    //             resolve(result)
    //         })
    //     })
    // }
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
                            {renderTreeNodeListByData(this.state.areaAndDeivceList, TreeNode)}
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