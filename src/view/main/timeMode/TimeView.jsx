import React, { Component } from 'react';
import { Table, Button, TreeSelect, message } from 'antd';
import moment from 'moment';
import HttpApi from '../../util/HttpApi';
import RecordDetailByTime from './RecordDetailByTime';
import { transfromDataTo3level, combinAreaAndDevice, renderTreeNodeListByData } from '../../util/Tool'
const { TreeNode } = TreeSelect;

const today = moment().format('YYYY-MM-DD ');
const tomorrow = moment().add(1, 'day').format('YYYY-MM-DD ');
/**
 * 时间区间 模块界面
 */
class TimeView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSource: [],
            showDrawer: false,
            oneRecord: {},
            isAdmin: JSON.parse(window.localStorage.getItem('userinfo')).isadmin,
            treeNodeList: [],
        }

    }
    componentDidMount() {
        this.init();
    }
    closeHandler = () => {
        this.setState({
            showDrawer: false
        })
    }
    init = async () => {
        let result = await this.getAllowTimeInfo();
        this.getInfoAndChangeData(result);
        let resultArea123 = await this.getArea123Info();
        let deviceInfo = await this.getDeviceInfo();
        let tempData = transfromDataTo3level(resultArea123);
        let tempData2 = combinAreaAndDevice(tempData, deviceInfo);
        let treeNodeList = renderTreeNodeListByData(tempData2, TreeNode);
        this.setState({
            treeNodeList
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
    getAllowTimeInfo = () => {
        return new Promise((resolve, reject) => {
            let sql = `select * from allow_time`;
            HttpApi.obs({ sql }, (res) => {
                let result = [];
                if (res.data.code === 0) {
                    result = res.data.data
                }
                resolve(result);
            })
        })
    }
    getInfoAndChangeData = async (resultList) => {
        for (let index = 0; index < resultList.length; index++) {
            const element = resultList[index];
            let beginTime = today + element.begin
            let endTime = element.isCross === 1 ? tomorrow + element.end : today + element.end
            element.bt = beginTime;
            element.et = endTime;
            let result = await this.getCountInfoFromDB(element);
            element.actually = result[0].count;
        }
        this.setState({
            dataSource: resultList.map((item, index) => { item.key = index + ''; return item })
        })
    }

    /**
     * 从数据库查询统计数据
     */
    getCountInfoFromDB = (element) => {
        let sql = `select count(distinct(device_id)) as count from records
        where checkedAt>'${element.bt}' and checkedAt<'${element.et}'`;
        return new Promise((resolve, reject) => {
            HttpApi.obs({ sql }, (res) => {
                let result = [];
                if (res.data.code === 0) {
                    result = res.data.data
                }
                resolve(result);
            })
        })
    }

    onChange = (value, record) => {
        // console.log('onChange ', value, 'record:', record);
        let sql = `UPDATE allow_time SET selected_devices = '${JSON.stringify(value)}' where id = ${record.id}`
        HttpApi.obs({ sql }, (res) => {
            if (res.data.code === 0) {
                message.success('修改成功');
                this.init();
            } else {
                message.error('修改失败');
            }
        })
    };

    render() {
        const { dataSource } = this.state;
        const columns = [
            {
                title: '今日时间段划分',
                dataIndex: '/',
                render: (text, record) => {
                    return <div>{record.begin} ~ {record.end} （{record.name}）</div>
                }
            },
            {
                title: `今日应检测设备数量${this.state.isAdmin === 1 ? '(可编辑)' : ''}`,
                dataIndex: 'selected_devices',
                render: (text, record) => {
                    return <div style={{ display: 'flex', flexDirction: 'row' }}>
                        <TreeSelect
                            disabled={this.state.isAdmin !== 1}
                            showSearch
                            treeNodeFilterProp="title"
                            style={{ width: '85%' }}
                            value={text ? JSON.parse(text) : []}
                            dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                            placeholder="请选择需要查看的巡检点"
                            allowClear
                            multiple
                            onChange={(v) => { this.onChange(v, record) }}
                        >
                            {this.state.treeNodeList}
                        </TreeSelect>
                        <div style={{ width: '15%', textAlign: "center", paddingTop: 5 }}>{JSON.parse(text) && JSON.parse(text).length > 0 ? JSON.parse(text).length : ''}</div>
                    </div>;
                }
            },
            {
                title: '今日实际检测设备数量',
                dataIndex: 'actually',
            }, {
                title: '操作',
                dataIndex: 'actions',
                width: 150,
                render: (text, record) => (
                    <div style={{ textAlign: 'center' }}>
                        <Button size="small" type="primary" onClick={() => {
                            this.setState({
                                oneRecord: record,
                                showDrawer: true
                            })
                        }}>详情</Button>
                    </div>
                )
            }
        ]
        return (
            <div>
                <Table
                    bordered
                    columns={columns}
                    dataSource={dataSource}
                />
                <RecordDetailByTime visible={this.state.showDrawer} record={this.state.oneRecord} close={this.closeHandler} />
            </div>
        );
    }
}

export default TimeView;