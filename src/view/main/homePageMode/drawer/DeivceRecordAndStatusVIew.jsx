import React, { Component } from 'react';
import { Drawer, Table, Alert } from 'antd';
import HttpApi from '../../../util/HttpApi';
import { getNoCheckDevices } from '../../../util/Tool';

/**
 * 巡检点的当前时间区间内的巡检状态列表
 * 抽屉形式展示
 */
class DeivceRecordAndStatusView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            data: {},
            list: [],
            alertType: 'info',
            situation: 1, ///所有设备1 还是 时间段2
            area0_id: 1,
        }
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.data) {
            this.setState({
                visible: nextProps.visible,
                data: nextProps.data,
                area0_id: nextProps.area0_id,
            })
        }
        if (nextProps.visible && nextProps.data) {
            this.setState({ title: nextProps.data.item || '' })
            if (nextProps.data.begin) { ///所有设备状态均是当次的巡检状态
                this.setState({
                    situation: 2,
                    // title: `当前时间区间巡检结果为${nextProps.data.item || ''}巡检点`
                })
                this.getInfo(nextProps.data);
            } else { ///选的是第一个环形图-所有设备状态
                this.setState({
                    situation: 1,
                    // title: `所有${nextProps.data.item || ''}巡检点`
                })
                this.getAllInfo(nextProps.data);
            }
        }
    }
    /**
     * 情况一
     */
    getAllInfo = async (data) => {
        let deviceInfoList = await this.getDeviceInfoList(data);
        this.setState({ list: deviceInfoList.map((item, index) => { item.key = index; return item }) })
    }
    getDeviceInfoList = (data) => {
        let status = 1;
        switch (data.item) {
            case '正常':
                status = 1;
                this.setState({ alertType: 'success' })
                break;
            case '故障':
                status = 2;
                this.setState({ alertType: 'error' })
                break;
            case '待检':
                status = 3;
                this.setState({ alertType: 'info' })
                break;
            default:
                break;
        }
        return new Promise((resolve, reject) => {
            let sql = `select devices.id,devices.name as name,concat_ws('/',area_1.name,area_2.name,area_3.name) as area_name from devices 
            left join (select * from area_3 where effective = 1) area_3 on devices.area_id = area_3.id
            left join (select * from area_2 where effective = 1) area_2 on area_3.area2_id = area_2.id
            left join (select * from area_1 where effective = 1) area_1 on area_2.area1_id = area_1.id
            where devices.effective = 1 and devices.status = ${status} and devices.area0_id = ${this.state.area0_id}`
            HttpApi.obs({ sql }, (res) => {
                let result = [];
                if (res.data.code === 0) {
                    result = res.data.data;
                }
                resolve(result);
            })
        })
    }
    /////////////////////////////////////////////
    /**
     * 情况二
     */
    getInfo = async (data) => {
        // console.log('data2:', data)
        let filterList = [];
        if (data.devices && data.devices.length > 0) {
            switch (data.item) {
                case '正常':
                    this.setState({ alertType: 'success' })
                    filterList = data.actu_devices.filter((item) => { return item.status === 1 })
                    break;
                case '故障':
                    this.setState({ alertType: 'error' })
                    filterList = data.actu_devices.filter((item) => { return item.status === 2 })
                    break;
                case '待检':
                    this.setState({ alertType: 'info' })
                    filterList = getNoCheckDevices(data.actu_devices, data.devices);
                    break;
                default:
                    break;
            }
            this.setState({ list: filterList.map((item, index) => { item.key = index; return item }) })
        }

    }
    render() {
        const columns = [
            {
                title: '巡检点',
                dataIndex: 'name'
            },
            {
                title: '区域',
                dataIndex: 'area_name'
            },
        ]
        return (
            <Drawer
                title={this.state.situation === 1 ? `所有${this.state.data.item || ''}巡检点` : `当前时间区间巡检结果为${this.state.data.item || ''}巡检点`}
                placement='left'
                width={800}
                visible={this.state.visible}
                destroyOnClose
                onClose={() => { this.props.close(); this.setState({ list: [] }) }}>
                <Alert type={this.state.alertType} message={<span>{`更多信息请在${this.state.situation === 1 ? '巡检点' : '巡检时间段'}模块中查看`}
                    {/* <Button type='link' onClick={() => { this.props.history.push(`/mainView/${this.state.situation === 1 ? 'equipment' : 'time'}`) }}>前往</Button> */}
                </span>} />
                <Table
                    style={{ marginTop: 10 }}
                    bordered
                    dataSource={this.state.list}
                    columns={columns}
                    pagination={{
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '50', '100'],
                    }}
                />
            </Drawer>
        );
    }
}

export default DeivceRecordAndStatusView;