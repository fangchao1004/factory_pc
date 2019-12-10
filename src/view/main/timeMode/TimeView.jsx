import React, { Component, Fragment } from 'react';
import { Table, Button, TreeSelect, message, DatePicker, Popconfirm } from 'antd';
import moment from 'moment';
import HttpApi from '../../util/HttpApi';
import RecordDetailByTime from './RecordDetailByTime';
import { transfromDataTo3level, combinAreaAndDevice, renderTreeNodeListByData } from '../../util/Tool'
import UpdateTimeView from './UpdateTimeView';
import AddTimeView from './AddTimeView';
const { TreeNode } = TreeSelect;

/**
 * 时间区间 模块界面
 */
class TimeView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSource: [],
            showDrawer: false,
            showUpdateModal: false,
            showAddModal: false,
            oneRecord: {},
            isAdmin: JSON.parse(window.localStorage.getItem('userinfo')).isadmin,
            treeNodeList: [],
            selectTime: moment(),
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
            let sql = `select * from allow_time where effective = 1`;
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
        let copyTime = moment(this.state.selectTime.format('YYYY-MM-DD'));
        for (let index = 0; index < resultList.length; index++) {
            const element = resultList[index];
            let beginTime = copyTime.format('YYYY-MM-DD ') + element.begin
            let endTime = element.isCross === 1 ? copyTime.add(1, 'day').format('YYYY-MM-DD ') + element.end : copyTime.format('YYYY-MM-DD ') + element.end
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
        // console.log('element:', element);
        let sql = `select count(distinct(device_id)) as count from records
        where checkedAt>'${element.bt}' and checkedAt<'${element.et}' and effective = 1`;
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

    disabledDate = (current) => {
        return current > moment().endOf('day');
    }
    AddTimeOk = (data) => {
        let sql = `INSERT INTO allow_time SET begin='${data.begin.format('HH:mm:ss')}', end='${data.end.format('HH:mm:ss')}', isCross=${data.isCross ? 1 : 0}, name='${data.name}'`
        HttpApi.obs({ sql }, (res) => {
            console.log('res.data:', res.data);
            if (res.data.code === 0) {
                message.success('添加成功');
                this.init();
            }
        })
        this.setState({
            showAddModal: false
        })
    }
    UpdateTimeOk = (data) => {
        let sql = `UPDATE allow_time SET begin='${data.begin.format('HH:mm:ss')}', end='${data.end.format('HH:mm:ss')}', isCross=${data.isCross ? 1 : 0}, name='${data.name}'
        where id = ${this.state.oneRecord.id}`
        HttpApi.obs({ sql }, (res) => {
            if (res.data.code === 0) {
                message.success('更新成功');
                this.init();
            }
        })
        this.setState({
            showUpdateModal: false
        })
    }
    deleteTimeHandler = (recordValue) => {
        let sql = `UPDATE allow_time SET effective = 0
        where id = ${recordValue.id}`
        HttpApi.obs({ sql }, (res) => {
            if (res.data.code === 0) {
                message.success('删除成功');
                this.init();
            }
        })
    }

    render() {
        const { dataSource } = this.state;
        const columns = [
            {
                title: <div><span style={{ marginRight: 10 }}>日期选择</span> <DatePicker disabledDate={this.disabledDate} value={this.state.selectTime} onChange={(v) => {
                    if (v) { this.setState({ selectTime: v }, () => { this.init() }) } else { message.warn('请选则日期'); }
                }} /></div>,
                dataIndex: '/',
                width: 280,
                align: 'center',
                render: (text, record) => {
                    return <div>{record.begin} ~ {record.end} （{record.name}）{record.isCross ? '跨天' : ''}</div>
                }
            },
            {
                title: `应检测巡检点数量${this.state.isAdmin === 1 ? '(可编辑)' : ''}`,
                dataIndex: 'selected_devices',
                render: (text, record) => {
                    return <div style={{ display: 'flex', flexDirction: 'row' }}>
                        <TreeSelect
                            maxTagCount={5}
                            maxTagTextLength={8}
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
                title: '实际检测巡检点数量',
                dataIndex: 'actually',
            }, {
                title: '操作',
                dataIndex: 'actions',
                render: (text, record) => (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Button size="small" type="primary" onClick={() => {
                            this.setState({
                                oneRecord: record,
                                showDrawer: true
                            })
                        }}>详情</Button>
                        {this.state.isAdmin ?
                            <Fragment>
                                <div style={{ borderBottomStyle: 'solid', borderBottomColor: '#D0D0D0', borderBottomWidth: 1, margin: 10 }} />
                                <Button size="small" type='ghost' onClick={() => { this.setState({ oneRecord: record, showUpdateModal: true }) }}>修改</Button>
                                <div style={{ borderBottomStyle: 'solid', borderBottomColor: '#D0D0D0', borderBottomWidth: 1, margin: 10 }} />
                                <Popconfirm title="确定要删除该时间端吗?" onConfirm={() => { this.deleteTimeHandler(record); }}>
                                    <Button size="small" type="danger">删除</Button>
                                </Popconfirm>
                            </Fragment>
                            : null}

                    </div>
                )
            }
        ]
        return (
            <div>
                {this.state.isAdmin ?
                    <Button type={'primary'} style={{ marginBottom: 20 }} onClick={() => { this.setState({ showAddModal: true }) }}>添加时间段</Button> : null}
                <Table
                    bordered
                    columns={columns}
                    dataSource={dataSource}
                    pagination={{
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '50', '80', '100'],
                    }}
                />
                <RecordDetailByTime visible={this.state.showDrawer} record={this.state.oneRecord} close={this.closeHandler} />
                <UpdateTimeView visible={this.state.showUpdateModal} record={this.state.oneRecord} onOk={this.UpdateTimeOk} onCancel={() => { this.setState({ showUpdateModal: false }) }} />
                <AddTimeView visible={this.state.showAddModal} onOk={this.AddTimeOk} onCancel={() => { this.setState({ showAddModal: false }) }} />
            </div>
        );
    }
}

export default TimeView;