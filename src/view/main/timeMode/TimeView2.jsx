import React, { Component, Fragment } from 'react';
import { Table, Button, TreeSelect, message, Popconfirm } from 'antd';
import moment from 'moment';
import HttpApi from '../../util/HttpApi';
import RecordDetailByTime from './RecordDetailByTime';
import { transfromDataTo3level, combinAreaAndDevice, renderTreeNodeListByData, getTodayIsOdd } from '../../util/Tool'
import UpdateTimeView from './UpdateTimeView';
import AddTimeView from './AddTimeView';
const { TreeNode } = TreeSelect;

var allowTime_map_device_name;
var allow_time_name;
/**
 * 时间区间 模块界面
 * 这个选项卡中，如果是奇数天 就显示 allow_time2
 * 偶数天 就显示 allow_time1
 */
class TimeView2 extends Component {
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
        let isOdd = getTodayIsOdd();
        ///如果是奇数天，这选项卡中就显示和操作 allow_time 表，偶数天就显示和操作 allow_time2 表
        this.exchangeSearhTarget(isOdd);
        this.init();
    }
    exchangeSearhTarget = (isOdd) => {
        allow_time_name = !isOdd ? 'allow_time' : 'allow_time2'
        allowTime_map_device_name = !isOdd ? 'allowTime_map_device' : 'allowTime_map_device2'
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
            // let sql = `select * from allow_time where effective = 1`;
            let sql = `select a_t.id,a_t.begin,a_t.end,a_t.isCross,a_t.name,GROUP_CONCAT(distinct a_m_d.device_id) as select_map_device,count(distinct a_m_d.device_id) need_count from ${allow_time_name} a_t
            left join (select * from ${allowTime_map_device_name} where effective = 1) a_m_d
            on a_t.id = a_m_d.allow_time_id
            where a_t.effective = 1
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
            const element = resultList[index];
            let beginTime = copyTime.format('YYYY-MM-DD ') + element.begin
            let endTime = element.isCross === 1 ? copyTime.add(1, 'day').format('YYYY-MM-DD ') + element.end : copyTime.format('YYYY-MM-DD ') + element.end
            element.bt = beginTime;
            element.et = endTime;
            let result = await this.getCountInfoFromDB(element);
            element.actually = result[0] ? result[0].actu_count : '/';
            element.checkMan = result[0] ? result[0].users_name : '/'
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
        // let sql = `select count(distinct(device_id)) as count from records
        // where checkedAt>'${element.bt}' and checkedAt<'${element.et}' and effective = 1`;
        let sql = `select a_t.id,a_t.begin,a_t.end,count(distinct a_m_d.device_id) actu_count,temp_table.need_count, group_concat(distinct user_name) users_name from ${allow_time_name} a_t
        left join (select * from ${allowTime_map_device_name} where effective = 1) a_m_d on a_t.id = a_m_d.allow_time_id
        inner join (select distinct device_id,user_name from records 
                    left join (select users.id,users.name as user_name from users where effective = 1) users 
                    on users.id = records.user_id  
                    where checkedAt>'${element.bt}' and checkedAt<'${element.et}' and effective = 1) actully_device_List 
        on actully_device_List.device_id = a_m_d.device_id
        left join (select a_t.id,count(distinct a_m_d.device_id) need_count from ${allow_time_name} a_t
        left join (select * from ${allowTime_map_device_name} where effective = 1) a_m_d on a_t.id = a_m_d.allow_time_id
        where a_t.id = ${element.id} and a_t.effective = 1
        group by a_t.id) temp_table on temp_table.id = a_t.id
        where a_t.id = ${element.id} and a_t.effective = 1
        group by a_t.id`
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
        let sql = `INSERT INTO ${allow_time_name} SET begin='${data.begin.format('HH:mm:ss')}', end='${data.end.format('HH:mm:ss')}', isCross=${data.isCross ? 1 : 0}, name='${data.name}'`
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
        let sql = `UPDATE ${allow_time_name} SET effective = 0
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
                title: <div><span style={{ marginRight: 10 }}>日期选择</span> </div>,
                dataIndex: '/',
                width: 280,
                align: 'center',
                render: (text, record) => {
                    return <div>{record.begin} ~ {record.end} （{record.name}）{record.isCross ? '跨天' : ''}</div>
                }
            },
            {
                title: `应检测巡检点数量${this.state.isAdmin === 1 ? '(可编辑)' : ''}`,
                dataIndex: 'select_map_device',
                render: (text, record) => {
                    return <div style={{ display: 'flex', flexDirction: 'row' }}>
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
                        </TreeSelect>
                        <div style={{ width: '15%', textAlign: "center", paddingTop: 5 }}>{record.need_count}</div>
                    </div>;
                }
            },
            // {
            //     title: '实际有效巡检数',
            //     dataIndex: 'actually',
            // },
            // {
            //     title: '巡检人员',
            //     dataIndex: 'checkMan',
            // },
            {
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
                    pagination={false}
                />
                <RecordDetailByTime visible={this.state.showDrawer} record={this.state.oneRecord} close={this.closeHandler} />
                <UpdateTimeView visible={this.state.showUpdateModal} record={this.state.oneRecord} onOk={this.UpdateTimeOk} onCancel={() => { this.setState({ showUpdateModal: false }) }} />
                <AddTimeView visible={this.state.showAddModal} onOk={this.AddTimeOk} onCancel={() => { this.setState({ showAddModal: false }) }} />
            </div>
        );
    }
}

export default TimeView2;