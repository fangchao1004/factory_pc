import React, { Component } from 'react';
import { Table, Progress, DatePicker, Alert } from 'antd';
import moment from 'moment';
import HttpApi from '../../util/HttpApi';
import { getDevicesInfoByIdListStr, filterDevicesByDateScheme } from '../../util/Tool'

var allowTime_map_device_name;
var allow_time_name;
/**
 * 时间区间 模块界面
 * 这个选项卡中，如果是奇数天 就显示 allow_time
 */
export default class InspectCountByTime extends Component {
    constructor(props) {
        super(props);
        // console.log('InspectCountByTime:', props)
        this.state = {
            loading: false,
            dataSource: [],
            progressValue: 0,
            isAdmin: JSON.parse(window.localStorage.getItem('userinfo')).isadmin,
            timeStampCheckList: [moment().add('day', -1).format('YYYY-MM-DD'), moment().add('day', -1).format('YYYY-MM-DD')],/// 时间段区间默认是今日 ['2019-01-01 00:00:00','2019-01-01 23:59:59']
        }
    }
    componentDidMount() {
        allow_time_name = "allow_time"
        allowTime_map_device_name = "allowTime_map_device"
        this.init();
    }
    init = async () => {
        this.setState({ loading: true })
        let resultTime = await this.getAllowTimeInfo();
        let day = moment(this.state.timeStampCheckList[1]).diff(moment(this.state.timeStampCheckList[0]), 'day');
        let allCountInfo = [];
        for (let index = 0; index <= day; index++) {
            let date = moment(this.state.timeStampCheckList[0]).add(index, 'day').format('YYYY-MM-DD')
            let oneDayCountResult = await this.getInfoAndChangeData(resultTime, date);
            allCountInfo = [...allCountInfo, ...oneDayCountResult]
            if (day > 0) {
                this.setState({ progressValue: parseInt((parseFloat(index / day) * 100).toFixed(0)) })
            }
        }
        // console.log('allCountInfo:', allCountInfo)
        this.setState({ loading: false, dataSource: allCountInfo.map((item, index) => { item.key = index; return item }) })
    }
    getAllowTimeInfo = () => {
        return new Promise((resolve, reject) => {
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
    ///这里是获取一天的统计
    getInfoAndChangeData = async (resultList, date) => {
        // console.log('这里是获取日期 date', date)
        const copyTime = date;
        return new Promise(async (resolve, reject) => {
            let tempList = []
            for (let index = 0; index < resultList.length; index++) {
                const element = resultList[index];
                let beginTime = date + ' ' + element.begin
                let endTime = element.isCross === 1 ? moment(date).add(1, 'day').format('YYYY-MM-DD ') + element.end : date + ' ' + element.end
                element.bt = beginTime;
                element.et = endTime;
                let result = await this.getCountInfoFromDB(element);
                element.actually = result[0] ? result[0].actu_count : '/';
                element.checkMan = result[0] ? result[0].users_name : '/'
                // element.actu_des_list = result[0] ? result[0].actu_des_list : '/'
                let devicesResult = await getDevicesInfoByIdListStr(element);
                let listAfterFilter = filterDevicesByDateScheme(devicesResult, moment(date));///每个时间区间内的设备-进过方案筛选后还剩哪些设备需要巡检
                element.afterFilter = listAfterFilter.length;
                // element.afterFilter_list = listAfterFilter;///经过方案过滤后，剩余应该巡检的设备列表
                let lostList = []
                if (listAfterFilter) {
                    listAfterFilter.forEach((deviceItem) => {
                        if (!result[0] || (result[0] && result[0].actu_des_list.split(',').indexOf(String(deviceItem.id)) === -1)) {
                            lostList.push(deviceItem);
                        }
                    })
                }
                element.lostList = lostList;
                if (lostList.length > 0) {
                    tempList.push({ ...element }); ///创建一个新对象 否则会被后续循环数据污染
                }
            }
            // console.log("resultList132:", copyTime, tempList) ///到此已经可以知道哪些设备漏检了
            ///再根据 每个时间段内的缺检查的设备进行分割  timeItem 元素是每个时间区间  {id: 12, begin: "01:10:00", end: "04:50:00", isCross: 0, name: "夜班一巡", …}
            let lostDataList = [];
            tempList.forEach((timeItem) => {
                timeItem.lostList.forEach((deviceItem) => {
                    lostDataList.push({
                        date: copyTime,///日期
                        name: timeItem.name,
                        begin: timeItem.begin,
                        end: timeItem.end,
                        deviceInfo: deviceItem.name,
                        checkMan: timeItem.checkMan,
                    })
                })
            })
            // console.log('lostDataList:', lostDataList)
            resolve(lostDataList)
        })
    }

    /**
     * 从数据库查询统计数据
     */
    getCountInfoFromDB = (element) => {
        let sql = `select a_t.id,a_t.begin,a_t.end,count(distinct a_m_d.device_id) actu_count,group_concat(distinct a_m_d.device_id) actu_des_list,temp_table.need_count, group_concat(distinct user_name) users_name from ${allow_time_name} a_t
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
    disabledDate = (current) => {
        return current > moment().endOf('day');
    }
    render() {
        const { dataSource } = this.state;
        const columns = [
            {
                title: '日期',
                dataIndex: 'date',
                width: 150,
                align: 'center',
                sorter: (a, b) => {
                    return moment(a.date).toDate().getTime() - moment(b.date).toDate().getTime()
                }
            },
            {
                title: '时间段',
                dataIndex: '/',
                align: 'center',
                width: 300,
                render: (text, record) => {
                    return <div>{record.begin} ~ {record.end} （{record.name}）{record.isCross ? '跨天' : ''}</div>
                }
            },
            {
                title: '漏检点',
                dataIndex: 'deviceInfo',
                align: 'center'
            },
            {
                title: '巡检人员',
                dataIndex: 'checkMan',
                width: 150,
                align: 'center'
            }
        ]
        return (
            <div>
                <>
                    {this.state.progressValue > 0 && this.state.progressValue < 100 ? <Progress style={{ marginBottom: 10 }} status="active" percent={this.state.progressValue} /> : null}
                    {/* <span style={{ fontWeight: 800, fontSize: 16, marginRight: 15 }}>日期区间</span> */}
                    <span style={{ borderLeft: 4, borderLeftColor: "#3080fe", borderLeftStyle: 'solid', paddingLeft: 5, fontSize: 16, fontWeight: 800, marginRight: 15 }}>日期区间</span>
                    <DatePicker.RangePicker
                        style={{ marginBottom: 10 }}
                        disabledDate={(current) => {
                            return (current > moment().add('day', -1).endOf('day') || current < moment().add('month', -6).startOf('day'))
                        }}
                        ranges={{
                            '本月': [moment().startOf('month'), moment().add(-1, 'day')],
                            '上月': [moment().add(-1, 'month').startOf('month'), moment().add(-1, 'month').endOf('month')],
                        }}
                        defaultValue={this.state.timeStampCheckList.map((item) => moment(item))}
                        onChange={(momentArr) => {
                            if (momentArr.length === 2) {
                                let timeStampCheckList = [momentArr[0].format('YYYY-MM-DD'), momentArr[1].format('YYYY-MM-DD')]
                                this.setState({ timeStampCheckList }, () => {
                                    this.init();
                                })
                            }
                        }} />
                </>
                <Alert style={{ marginBottom: 10 }} type="info" showIcon message={<span>共有<span style={{ color: '#1790FF', marginLeft: 5, marginRight: 5, fontWeight: 800, fontSize: 16 }}>{this.state.dataSource.length}</span>个巡检点漏检</span>} />
                <Table
                    loading={this.state.loading}
                    bordered
                    columns={columns}
                    dataSource={dataSource}
                    pagination={{
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '50', '100'],
                        defaultPageSize: 100
                    }}
                />
            </div>
        );
    }
}
