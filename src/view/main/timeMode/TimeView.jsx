import React, { Component, Fragment } from 'react';
import { Table, Button, TreeSelect, message, DatePicker, Tag, Alert } from 'antd';
import moment from 'moment';
import HttpApi from '../../util/HttpApi';
import RecordDetailByTime from './RecordDetailByTime';
import { translate, getDevicesInfoByIdListStr, filterDevicesByDateScheme, combinAreaAndDeviceTest, renderTreeNodeListByDataTest, sortByOrderKey2 } from '../../util/Tool'
import UpdateTimeView from './UpdateTimeView';
import AddTimeView from './AddTimeView';
import ExportRecordView from './ExportRecordView';
const { TreeNode } = TreeSelect;

var allowTime_map_device_name;
var allow_time_name;
/**
 * 时间区间 模块界面
 * 这个选项卡中，如果是奇数天 就显示 allow_time
 */
class TimeView extends Component {
    constructor(props) {
        super(props);
        console.log('TimeView:', props)
        this.state = {
            loading: false,
            dataSource: [],
            showDrawer: false,
            showUpdateModal: false,
            showAddModal: false,
            oneRecord: {},
            isAdmin: JSON.parse(window.localStorage.getItem('userinfo')).isadmin,
            treeNodeList: [],
            selectTime: moment(),
            showExportRecordView: false,
        }
    }
    componentDidMount() {
        allow_time_name = "allow_time"
        allowTime_map_device_name = "allowTime_map_device"
        this.init();
    }
    closeHandler = () => {
        this.setState({
            showDrawer: false
        })
    }
    init = async () => {
        this.setState({ loading: true })
        // console.log("1:::", new Date().getTime())
        let resultTime = await this.getAllowTimeInfo();
        this.getInfoAndChangeData(resultTime);
        let resultArea0123 = await this.getArea0123InfoByArea0Id();
        let deviceInfo = await this.getDeviceInfo();
        let result = translate(['area1_id', 'area2_id', 'area3_id'], resultArea0123)
        let tempData2 = combinAreaAndDeviceTest(sortByOrderKey2(result), deviceInfo, 2);
        let treeNodeList = renderTreeNodeListByDataTest(tempData2, TreeNode, 3);
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
    getArea0123InfoByArea0Id = () => {
        return new Promise((resolve, reject) => {
            let sql = `select area_1.order_key, area_0.id as area0_id, area_0.name as area0_name, area_1.id as area1_id , area_1.name as area1_name, area_2.id as area2_id ,area_2.name as area2_name,area_3.id as area3_id,area_3.name as area3_name 
            from area_0
            left join (select * from area_1 where effective = 1)area_1 on area_0.id = area_1.area0_id
            left join (select * from area_2 where effective = 1)area_2 on area_1.id = area_2.area1_id
            left join (select * from area_3 where effective = 1)area_3 on area_2.id = area_3.area2_id
            where area_0.effective = 1 and area_0.id = ${this.props.id}
            order by area_0.id,area_1.order_key,area_1.id`;
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
            // let sql = `select * from allow_time where effective = 1`;
            let sql = `select a_t.id,a_t.begin,a_t.end,a_t.isCross,a_t.name,GROUP_CONCAT(distinct a_m_d.device_id) as select_map_device,count(distinct a_m_d.device_id) need_count 
            from ${allow_time_name} a_t
            left join (select * from ${allowTime_map_device_name} where effective = 1) a_m_d
            on a_t.id = a_m_d.allow_time_id
            where a_t.effective = 1 and a_t.area0_id = ${this.props.id}
            group by a_t.id`
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
            // let time2 = new Date().getTime();
            const element = resultList[index];
            let beginTime = copyTime.format('YYYY-MM-DD ') + element.begin
            let endTime = element.isCross === 1 ? copyTime.add(1, 'day').format('YYYY-MM-DD ') + element.end : copyTime.format('YYYY-MM-DD ') + element.end
            element.bt = beginTime;
            element.et = endTime;
            let result = await this.getCountInfoFromDB(element);
            // let time3 = new Date().getTime();
            // console.log("getCountInfoFromDB 花费时间：", time3 - time2)
            element.actually = result[0] ? result[0].actu_count : '/';
            element.checkMan = result[0] ? result[0].users_name : '/'
            element.actu_des_list = result[0] ? result[0].actu_des_list : '/'
            let devicesResult = await getDevicesInfoByIdListStr(element);
            // let time4 = new Date().getTime();
            // console.log("getDevicesInfoByIdListStr 花费时间：", time4 - time3)
            let listAfterFilter = filterDevicesByDateScheme(devicesResult, this.state.selectTime);///每个时间区间内的设备-进过方案筛选后还剩哪些设备需要巡检
            // let time5 = new Date().getTime();
            // console.log("filterDevicesByDateScheme 花费时间：", time5 - time4)
            element.afterFilter = listAfterFilter.length;
            // element.afterFilter_list = listAfterFilter;///经过方案过滤后，剩余应该巡检的设备列表
            let lostList = []
            if (listAfterFilter) {
                listAfterFilter.forEach((deviceItem) => {
                    if (result[0] && result[0].actu_des_list.split(',').indexOf(String(deviceItem.id)) === -1) {
                        lostList.push(deviceItem);
                    }
                })
            }
            element.lostList = lostList;

        }
        // console.log("4:::", new Date().getTime())
        this.setState({
            loading: false,
            dataSource: resultList.map((item, index) => { item.key = index; return item })
        })
    }

    /**
     * 从数据库查询统计数据
     */
    getCountInfoFromDB = (element) => {
        // console.log('element:', element);
        // let sql = `select count(distinct(device_id)) as count from records
        // where checkedAt>'${element.bt}' and checkedAt<'${element.et}' and effective = 1`;
        let sql = `select a_t.id,a_t.begin,a_t.end,count(distinct a_m_d.device_id) actu_count,group_concat(distinct a_m_d.device_id) actu_des_list,temp_table.need_count, group_concat(distinct user_name) users_name from ${allow_time_name} a_t
        left join (select * from ${allowTime_map_device_name} where effective = 1) a_m_d on a_t.id = a_m_d.allow_time_id
        inner join (select distinct device_id,user_name from records 
                    left join (select users.id,users.name as user_name from users where effective = 1) users 
                    on users.id = records.user_id  
                    where checkedAt>'${element.bt}' and checkedAt<'${element.et}' and effective = 1 and (is_clean = 0 || is_clean is NULL)) actully_device_List 
        on actully_device_List.device_id = a_m_d.device_id
        left join (select a_t.id,count(distinct a_m_d.device_id) need_count from ${allow_time_name} a_t
        left join (select * from ${allowTime_map_device_name} where effective = 1) a_m_d on a_t.id = a_m_d.allow_time_id
        where a_t.id = ${element.id} and a_t.effective = 1
        group by a_t.id) temp_table on temp_table.id = a_t.id
        where a_t.id = ${element.id} and a_t.effective = 1
        group by a_t.id`
        // console.log('sql:', sql)
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

    onChange = (extra, record) => {
        // console.log(extra.selected, extra.triggerValue, record)
        let device_id = parseInt(extra.triggerValue);
        let allow_time_id = record.id;
        let sql = '';
        if (extra.selected) { /// 增加一条记录到 时间段和设备的映射关系表中
            // console.log('增加一条记录到 时间段和设备的映射关系表中', device_id, allow_time_id)
            sql = `INSERT INTO ${allowTime_map_device_name} SET allow_time_id=${allow_time_id}, device_id=${device_id}`
        } else { /// 将对应的某一条映射关系 置成 effective = 0
            // console.log('将对应的某一条映射关系 置成 effective = 0', device_id, allow_time_id)
            sql = `UPDATE ${allowTime_map_device_name} SET effective = 0 where allow_time_id=${allow_time_id} and device_id=${device_id}`
        }
        HttpApi.obs({ sql }, (res) => {
            if (res.data.code === 0) {
                message.success('修改成功');
                this.init();
            } else {
                message.error('修改失败');
            }
        })
        return;
    };

    disabledDate = (current) => {
        return current > moment().endOf('day');
    }
    AddTimeOk = (data) => {
        let sql = `INSERT INTO ${allow_time_name} SET area0_id = ${this.props.id}, begin='${data.begin.format('HH:mm:ss')}', end='${data.end.format('HH:mm:ss')}', isCross=${data.isCross ? 1 : 0}, name='${data.name}'`
        HttpApi.obs({ sql }, (res) => {
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
        let sql = `UPDATE ${allow_time_name} SET begin='${data.begin.format('HH:mm:ss')}', end='${data.end.format('HH:mm:ss')}', isCross=${data.isCross ? 1 : 0}, name='${data.name}'
        where id = ${this.state.oneRecord.id} and area0_id = ${this.props.id}`
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
        let sql = `UPDATE ${allow_time_name} SET effective = 0
        where id = ${recordValue.id} and area0_id = ${this.props.id}`
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
                    if (v) {
                        this.setState({ selectTime: v }, () => {
                            this.init()
                        })
                    } else { message.warn('请选择日期'); }
                }} /></div>,
                dataIndex: '/',
                width: 300,
                align: 'center',
                render: (text, record) => {
                    return <div>{record.begin} ~ {record.end} （{record.name}）{record.isCross ? '跨天' : ''}</div>
                }
            },
            {
                title: `巡检点数量${this.state.isAdmin === 1 ? '(可编辑)' : ''}`,
                dataIndex: 'select_map_device',
                align: 'center',
                render: (text, record) => {
                    return <div style={{ display: 'flex', flexDirction: 'row', justifyContent: 'space-around' }}>
                        {this.state.isAdmin === 1 ?
                            <TreeSelect
                                maxTagCount={5}
                                maxTagTextLength={8}
                                disabled={this.state.isAdmin !== 1}
                                showSearch
                                treeNodeFilterProp="title"
                                style={{ width: '85%' }}
                                value={text ? text.split(',') : []}
                                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                                placeholder="请选择需要查看的巡检点"
                                allowClear
                                multiple
                                onChange={(value, label, extra) => { this.onChange(extra, record) }}
                            >
                                {this.state.treeNodeList}
                            </TreeSelect> : null}
                        <Tag color='blue' style={{ alignSelf: "center", marginLeft: 15 }}>共{record.need_count}</Tag>
                    </div>;
                }
            },
            {
                title: '待检数',
                dataIndex: 'afterFilter',
                width: 80,
                align: 'center'
            },
            {
                title: '实检数',
                dataIndex: 'actually',
                width: 80,
                align: 'center'
            },
            {
                title: '巡检人员',
                dataIndex: 'checkMan',
                width: 140,
                align: 'center'
            }, {
                title: '操作',
                dataIndex: 'actions',
                width: 80,
                align: 'center',
                render: (text, record) => (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Button icon='search' size="small" type="primary" onClick={() => {
                            this.setState({
                                oneRecord: record,
                                showDrawer: true
                            })
                        }}>详情</Button>
                        {this.state.isAdmin ?
                            <Fragment>
                                <div style={{ borderBottomStyle: 'solid', borderBottomColor: '#D0D0D0', borderBottomWidth: 1, margin: 10 }} />
                                <Button icon='edit' size="small" type='ghost' onClick={() => { this.setState({ oneRecord: record, showUpdateModal: true }) }}>修改</Button>
                                {/* <div style={{ borderBottomStyle: 'solid', borderBottomColor: '#D0D0D0', borderBottomWidth: 1, margin: 10 }} />
                                <Popconfirm title="确定要删除该时间端吗?" onConfirm={() => { this.deleteTimeHandler(record); }}>
                                    <Button size="small" type="danger">删除</Button>
                                </Popconfirm> */}
                            </Fragment>
                            : null}

                    </div>
                )
            }
        ]
        return (
            <div style={{ backgroundColor: '#FFFFFF', padding: 10 }}>
                <Alert style={{ marginBottom: 10 }} type='info' message='拥有管理员权限可以编辑巡检点数量, 待检数: 经过方案筛选后的巡检点数量统计 ' />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    {this.state.isAdmin ?
                        <Button icon='plus' size="small" type={'primary'} style={{ marginBottom: 10 }} onClick={() => { this.setState({ showAddModal: true }) }}>添加时间段</Button>
                        : <span></span>}
                    <Button size="small" icon={'export'} style={{ marginBottom: 10 }} onClick={() => { this.setState({ showExportRecordView: true }) }}>导出文件</Button>
                </div>
                <Table
                    size="small"
                    loading={this.state.loading}
                    bordered
                    columns={columns}
                    dataSource={dataSource}
                    pagination={false}
                />
                <RecordDetailByTime visible={this.state.showDrawer} record={this.state.oneRecord} close={this.closeHandler} {...this.props} />
                <UpdateTimeView visible={this.state.showUpdateModal} record={this.state.oneRecord} onOk={this.UpdateTimeOk} onCancel={() => { this.setState({ showUpdateModal: false }) }} />
                <AddTimeView visible={this.state.showAddModal} onOk={this.AddTimeOk} onCancel={() => { this.setState({ showAddModal: false }) }} />
                <ExportRecordView showModal={this.state.showExportRecordView} cancel={() => { this.setState({ showExportRecordView: false }) }} {...this.props} />
            </div>
        );
    }
}

export default TimeView;