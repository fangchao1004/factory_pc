import React, { Component } from 'react';
import { Drawer, Table, Alert } from 'antd';
import HttpApi from '../../../util/HttpApi';

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
        }
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.data) {
            this.setState({
                visible: nextProps.visible,
                data: nextProps.data
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
            let sql = `select devices.id,devices.name as device_name,concat_ws('/',area_1.name,area_2.name,area_3.name) as area_name from devices 
            left join (select * from area_3 where effective = 1) area_3 on devices.area_id = area_3.id
            left join (select * from area_2 where effective = 1) area_2 on area_3.area2_id = area_2.id
            left join (select * from area_1 where effective = 1) area_1 on area_2.area1_id = area_1.id
            where devices.effective = 1 and devices.status = ${status}`
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
        let deviceIdList = data.deviceIdStr.split(',')
        let statusList = data.statusStr.split(',')
        let deviceStatusList = deviceIdList.map((item, index) => { return { id: parseInt(deviceIdList[index]), status: parseInt(statusList[index]) } })
        let result = await this.getAllowTimeDeivceList(data);
        result.forEach((item) => {
            deviceStatusList.forEach((cell) => {
                if (item.device_id === cell.id) { item.status = cell.status }
            })
        })
        let filterList = [];
        switch (data.item) {
            case '正常':
                this.setState({ alertType: 'success' })
                filterList = result.filter((item) => { return item.status === 1 })
                break;
            case '故障':
                this.setState({ alertType: 'error' })
                filterList = result.filter((item) => { return item.status === 2 })
                break;
            case '待检':
                this.setState({ alertType: 'info' })
                filterList = result.filter((item) => { return !item.status })
                break;
            default:
                break;
        }
        this.setState({ list: filterList.map((item, index) => { item.key = index; return item }) })
    }
    getAllowTimeDeivceList = (data) => {
        return new Promise((resolve, reject) => {
            let sql = `select a_m_d.device_id,devices.name as device_name,concat_ws('/',area_1.name,area_2.name,area_3.name) as area_name from
            (select id  from allow_time where effective = 1 and begin ='${data.begin}' and end = '${data.end}') target_allow_time
            left join (select * from allowTime_map_device where effective = 1) as a_m_d on a_m_d.allow_time_id= target_allow_time.id
            left join (select * from devices where effective = 1) devices on devices.id = a_m_d.device_id
            left join (select * from area_3 where effective = 1) area_3 on devices.area_id = area_3.id
            left join (select * from area_2 where effective = 1) area_2 on area_3.area2_id = area_2.id
            left join (select * from area_1 where effective = 1) area_1 on area_2.area1_id = area_1.id`
            HttpApi.obs({ sql }, (res) => {
                let result = [];
                if (res.data.code === 0) {
                    result = res.data.data;
                }
                resolve(result);
            })
        })
    }
    render() {
        const columns = [
            {
                title: '巡检点',
                dataIndex: 'device_name'
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
                        pageSizeOptions: ['10', '20', '50', '80', '100'],
                    }}
                />
            </Drawer>
        );
    }
}

export default DeivceRecordAndStatusView;