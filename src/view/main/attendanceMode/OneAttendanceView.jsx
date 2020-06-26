import React, { Component } from 'react';
import moment from 'moment'
import HttpApi from '../../util/HttpApi';
import { Table, Divider, Tag, Radio, Icon, Tooltip } from 'antd';

var periodsList;/// 分班时间点数据
/**
 * 某个人的考勤记录
 */
class OneAttendanceView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            countData: [{ lab: '总计', count: 0 }, { lab: '正常', count: 0 }, { lab: '迟到', count: 0 }].map((item, index) => { item.key = index; return item }),
            lateCount: 0,///迟到计数
            dayCount: 0,
            currentPage: 1,
            monthSelect: 'now',
        }
    }
    componentDidMount() {
        // console.log('this.props:', this.props);
        this.init(1, this.props);
        this.countHandler(this.state.monthSelect, this.props);///统计
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.show) {
            this.init(1, nextProps);
            this.countHandler(this.state.monthSelect, nextProps);/// 统计
        }
    }
    init = async (currentPage, props) => {
        this.setState({ currentPage })
        periodsList = await this.getPeriods();///上下班的标准时刻表
        // console.log('periodsList:', periodsList);
        let { name, lastTime, dayCount, groupid } = props /// lastTime 该人员最新的一次考勤打卡记录
        // if (groupid === null) { periods = periodsList[1] } else { periods = periodsList[0] }///上下班的标准时刻表
        console.log('dayCount:', dayCount);
        this.setState({ dayCount })///总共有多少天的考勤记录
        // console.log('name:', name, 'lastTime:', lastTime, 'dayCount:', dayCount, 'groupid:', groupid);
        let topTimeOnTable = moment(lastTime).add(-((currentPage - 1) * 10), 'day').utcOffset(0).endOf('day').format('YYYY-MM-DD HH:mm:ss');/// 分页后 每一页的第一条数据
        let bottomTimeOnTable = moment(topTimeOnTable).add(-9, 'day').startOf('day').format('YYYY-MM-DD HH:mm:ss')
        let timeList = [bottomTimeOnTable, topTimeOnTable]
        // console.log('timeList:', timeList);/// 10天的时间区间 实际显示10天 
        // console.log('有名称 name:1', name);///有名称
        let result = await this.getSomeDayData(name, timeList);/// 对象10天的考勤记录
        // console.log('对象10天的考勤记录:', result);
        if (result.length > 0) {
            ///如果数据存在，则开始数据结构的转换
            if (groupid === null) {
                let sampleList = await this.changeDataConstructNormal(10, timeList, result, name);///首页10天记录
                // console.log('某一页10天记录 普通:', sampleList);///需要进入统计函数加工
                let sampleListWithStatus = this.countSample(false, true, sampleList);
                // console.log('某一页10天记录 普通 有状态了:', sampleListWithStatus);
                this.setState({ data: sampleListWithStatus.map((item, index) => { item.key = index; return item }) })
                this.forceUpdate();
            } else { /// 是生产部的成员，有分组。进行特殊处理
                /// 先知道 这10天区间内 该组的排班表
                // console.log('有名称 name:2', name);///有名称
                let schedule = await this.getShedule(timeList, groupid, name, 1);
                // console.log('schedule123:', schedule);
                let sampleList = this.changeDataConstructSpecial(10, timeList, result, schedule, groupid);
                // console.log('某一页10天记录 轮班:', sampleList);///需要进入统计函数加工
                let lastdaySchedule = await this.getLastdaySchedule(moment(timeList[0]).add(-1, 'day').format('YYYY-MM-DD'), props.groupid);
                let sampleListWithStatus = this.countSample(false, true, sampleList, lastdaySchedule);///lastdaySchedule有可能为空[];
                // console.log('某一页10天记录 轮班 有状态了:', sampleListWithStatus);
                this.setState({ data: sampleListWithStatus.map((item, index) => { item.key = index; return item }) })
                this.forceUpdate();
            }
        } else {
            this.setState({ data: [] });
            this.forceUpdate();
        }
    }
    /**
     * 统计状态 ， 当月 上月
     * 需要获取，当月 或 上月的考勤记录，再结合上（某人的最终的排班表-（schedules+adjustments））
     */
    countHandler = async (monthSelect, props) => {
        // console.log('有名称 props:', props.name);///有名称
        let name = props.name;
        let thisMonth = [moment().utcOffset(0).startOf('month').format('YYYY-MM-DD HH:mm:ss'), moment().utcOffset(0).endOf('day').format('YYYY-MM-DD HH:mm:ss')];
        let lastMonth = [moment().utcOffset(0).add(-1, 'month').startOf('month').format('YYYY-MM-DD HH:mm:ss'), moment().utcOffset(0).add(-1, 'month').endOf('month').format('YYYY-MM-DD HH:mm:ss')];
        let selectMonth = monthSelect === 'now' ? thisMonth : lastMonth;
        // console.log('selectMonth:',selectMonth);
        ///查询 当月或上月的 某个人的 所有考勤记录
        let recordList = await this.getSomeDayData(name, selectMonth);
        // console.log('考勤记录:', recordList, props.name);
        /// 利用selectMonth 时间区间 生成模版 对所有的考勤数据 根据日期进行分组 如果不是轮班分组就为[] 就需要独立的去查询adjustment调班表的数据再手动的去日期匹配
        let schedule = await this.getShedule(selectMonth, props.groupid, name, 1);
        // console.log('schedule:', schedule);
        let duringDate = moment(selectMonth[1]).date() - moment(selectMonth[0]).date() + 1;
        if (props.groupid === null) {///普通班 就需要独立的去查询adjustment调班表的数据再手动的去日期匹配
            let sampleList = await this.changeDataConstructNormal(duringDate, selectMonth, recordList, props.name);///当月或上月
            // console.log('普通模版当月或上月（包含了调班后的结果）统计:', sampleList);
            ///对模版数据进行遍历，判断当中的有打卡记录的是多少天，其中正常的，和迟到的有多少（正常和迟到的判断标准会根据对应的班次，和worktime 来判断）
            this.countSample(true, true, sampleList);
        } else {///分组轮班
            let sampleList = this.changeDataConstructSpecial(duringDate, selectMonth, recordList, schedule, props.groupid);
            // console.log('轮班模版当月或上月（包含了调班后的结果）:', sampleList);
            let lastdaySchedule = await this.getLastdaySchedule(moment(selectMonth[0]).add(-1, 'day').format('YYYY-MM-DD'), props.groupid);
            this.countSample(true, false, sampleList, lastdaySchedule[0]);
        }
    }
    /**
     * 统计函数 并且给每组(天)数据 添加上status状态
     * isCount 是否统计个数并且渲染到底部表格
     * isNormal 是否为普通班次
     * sampleList 模版数据
     * lastdaySchedule 顶部昨天班次数据
     */
    countSample = (isCount, isNormal, sampleList, lastdaySchedule = null) => {
        // console.log('lastdaySchedule:', lastdaySchedule);///当 为普通班时，不需要考虑昨天的班次
        // console.log('输入的模版:sampleList:', sampleList);
        let totallCount = 0;///总共
        let lateCount = 0;///迟到
        let lostCount = 0;///缺卡(只有一次打卡记录，默认为缺少了下班卡)
        let earlyleaveCount = 0;///早退
        let kuangGongCount = 0;///旷工
        let copySampleList = JSON.parse(JSON.stringify(sampleList));
        for (let index = 0; index < copySampleList.length; index++) {
            const item = copySampleList[index];
            item.status = [];
            const beforeOneItem = index === copySampleList.length - 1 ? lastdaySchedule : copySampleList[index + 1];///因为是反的，所以日期上的前一天是数组上的后一位
            totallCount++;
            if (item.group_val === 2) {///中班 取头尾两个打卡记录。如果打卡记录只有一个就取一个
                if (beforeOneItem.group_val === 2) {
                    /// 如果是昨天是中班，今天也是中班，那么就至少需要两个打卡记录。才算不缺卡
                    if (item.list.length === 1) {///缺卡
                        lostCount++;
                        item.status.push('缺卡');
                        // console.log('是昨天是中班，今天也是中班: 缺卡了', item);
                    } else if (item.list.length >= 2) {
                        let sbk = moment(item.list[0].time).utcOffset(0).format('HH:mm:ss');///今天的上班卡
                        let xbk = moment(item.list[item.list.length - 1].time).utcOffset(0).format('HH:mm:ss'); ///昨天的下班卡
                        if (sbk > item.work_time.split(',')[0]) {
                            lateCount++;  ///今天的中班迟到+1
                            item.status.push('迟到');
                            // console.log('今天的中班迟到:', item);
                        }
                        if (xbk < item.work_time.split(',')[1]) {
                            earlyleaveCount++; ///昨天的中班早退了+1
                            item.status.push('早退');
                            // console.log('昨天的中班早退了:', item);
                        }
                    } else if (item.list.length === 0) {
                        kuangGongCount++;
                        item.status.push('旷工');
                        // console.log('旷工:', item);
                    }
                } else {
                    ///如果昨天不是中班，那么这是一个周期中的第一个中班，只要有一个今天的上班卡。就算不缺卡
                    if (item.list.length === 0) {///缺上班卡
                        lostCount++;
                        item.status.push('缺卡');
                        // console.log('第一个中班-缺上班卡:', item);
                    } else {
                        let sbk = moment(item.list[0].time).utcOffset(0).format('HH:mm:ss');///今天的上班卡
                        if (sbk > item.work_time.split(',')[0]) {
                            lateCount++;  ///今天的中班迟到+1
                            item.status.push('迟到');
                            // console.log('今天的中班迟到:', item);
                        }
                    }
                }
            } else if (item.group_val === 0) {///休息 取头 (即有普通班的休息，又有轮班的休息)
                if (isNormal === true && beforeOneItem && beforeOneItem.group_val === 2) {/// 如果是昨天是中班，今天是休息，那么就至少需要一个打卡记录。才算不缺卡
                    if (item.list.length === 1) {
                        let xbk = moment(item.list[0].time).utcOffset(0).format('HH:mm:ss');
                        // console.log('如果是昨天是中班，今天是休息--------:', item);
                        if (xbk < beforeOneItem.work_time.split(',')[1]) {
                            earlyleaveCount++; ///昨天的中班早退了+1
                            item.status.push('早退');
                            // console.log('休息日-昨天的中班早退了:', item);
                        }
                    } else if (item.list.length === 0) {
                        lostCount++; ///缺一个中班的下班卡
                        item.status.push('缺卡');
                        // console.log('休息日-缺一个中班的下班卡:', item);
                    }
                }
            } else if (item.group_val === 5 || item.group_val === 1 || item.group_val === 3) {///普通班 早班 晚班
                // console.log('普通班（早班-晚班） item:', item.work_time, item.list)
                if (item.list.length > 1) { ///取头尾
                    let sbk = moment(item.list[item.list.length - 1].time).utcOffset(0).format('HH:mm:ss'); ///今天的上班卡
                    let xbk = moment(item.list[0].time).utcOffset(0).format('HH:mm:ss');///今天的下班卡
                    if (sbk > item.work_time.split(',')[0]) {
                        lateCount++;  ///上班迟到+1
                        item.status.push('迟到');
                        // console.log('上班迟到日期：', item);
                    }
                    if (xbk < item.work_time.split(',')[1]) {
                        earlyleaveCount++; ///下班早退+1
                        item.status.push('早退');
                        // console.log('下班早退日期：', item);
                    }
                } else if (item.list.length === 1) {
                    lostCount++;///缺少下班卡 缺卡+1
                    item.status.push('缺卡');
                    // console.log('缺卡日期：', item);
                } else if (item.list.length === 0) {
                    kuangGongCount++;
                    item.status.push('旷工');
                    // console.log('旷工:', item);
                }
            }
        }
        // console.log('总共:', totallCount);
        // console.log('迟到:', lateCount);
        // console.log('早退:', earlyleaveCount);
        // console.log('缺卡:', lostCount);
        // console.log('旷工:', kuangGongCount);
        if (isCount) {
            this.setState({
                countData: [{ lab: '总共（天）', count: totallCount }, { lab: '迟到（次）', count: lateCount }, { lab: '早退（次）', count: earlyleaveCount }, { lab: '缺卡（次）', count: lostCount }, { lab: '旷工（次）', count: kuangGongCount }].map((item, index) => { item.key = index; return item })
            })
        }
        // console.log('当月或上月的统计过后:', copySampleList);
        this.forceUpdate();
        return copySampleList;
    }
    getLastdaySchedule = (day, groupid) => {
        return new Promise((resolve, reject) => {
            let sql = `select schedules.id,time,schedules.group_${groupid}_val as group_val,schedules.group_${groupid}_lab as group_lab,periods.p_time as work_time from schedules 
            left join periods 
            on periods.p_val = schedules.group_${groupid}_val
            where schedules.time = '${day}'`;
            HttpApi.obs({ sql }, (res) => {
                let result = []
                if (res.data.code === 0) { result = res.data.data }
                resolve(result);
            })
        })
    }
    getAdjustment = (name, is_group) => {///针对普通班的调班表数据 （因为轮班已经和schedule表结合联合查询了）
        return new Promise((resolve, reject) => {
            let sql = `select * from adjustments where is_group = ${is_group}`;
            HttpApi.obs({ sql }, (res) => {
                let result = []
                if (res.data.code === 0) { result = res.data.data }
                resolve(result);
            })
        })
    }
    getPeriods = () => {
        return new Promise((resolve, reject) => {
            let sql = `select * from periods where p_val = 5`;
            HttpApi.obs({ sql }, (res) => {
                let result = []
                if (res.data.code === 0) { result = res.data.data }
                resolve(result);
            })
        })
    }
    getShedule = (timeList, groupid, name, is_group) => {
        return new Promise((resolve, reject) => {
            let sql = `select s.time,s.group_${groupid}_val,s.group_${groupid}_lab,ads.shift_lab,ads.shift_val,ps.p_time as group_work_time,ps2.p_time as shift_work_time from schedules as s
            left join
            (select * from adjustments where name = '${name}' and is_group = ${is_group}) as ads
            on s.time = ads.time
            left join periods as ps
            on ps.p_val = s.group_${groupid}_val 
            left join periods as ps2
            on ps2.p_val = ads.shift_val
            where s.time >= '${moment(timeList[0]).format('YYYY-MM-DD')}' and s.time <= '${moment(timeList[1]).format('YYYY-MM-DD')}' 
            order by s.time desc`
            HttpApi.obs({ sql }, (res) => {
                let result = []
                if (res.data.code === 0) { result = res.data.data }
                resolve(result);
            })
        })
    }
    /**
     * 结合 调班数据 生成新的模版数据
     */
    combinSampleAndAjust = (sampleList, adjustmentList) => {
        // console.log(sampleList,adjustmentList);
        sampleList.forEach(sample => {
            adjustmentList.forEach(adjustment => {
                let time1 = moment(sample.start).format('YYYY-MM-DD');
                if (time1 === adjustment.time) { ///找到同一天的 更新原先模版表中对应的班次
                    sample.group_val = adjustment.shift_val;
                    sample.group_lab = adjustment.shift_lab;
                }
            });
        });
        return sampleList;
    }
    changeDataConstructSpecial = (day, timeList, resultList, schedule, groupid) => {
        // console.log(timeList, resultList, schedule, groupid);
        ///schedule中 以及合并包含了调班信息
        let sampleList = [];
        for (let index = 0; index < day; index++) {///生成空模版
            let sampleCell = {};
            sampleCell.start = moment(timeList[1]).add(-index, 'day').startOf('day').format('YYYY-MM-DD HH:mm:ss');
            sampleCell.end = moment(timeList[1]).add(-index, 'day').endOf('day').format('YYYY-MM-DD HH:mm:ss');
            sampleCell.group_val = null;
            sampleCell.group_lab = null;
            sampleCell.list = [];
            const timeSample = moment(sampleCell.start).format('YYYY-MM-DD');
            schedule.forEach(item => {
                if (timeSample === item.time) {
                    sampleCell[`group_lab`] = item[`group_${groupid}_lab`];
                    sampleCell[`group_val`] = item[`group_${groupid}_val`];
                    sampleCell[`work_time`] = item[`group_work_time`];
                    if (item.shift_lab !== null && item.shift_val !== null) {
                        sampleCell[`group_lab`] = item[`shift_lab`];
                        sampleCell[`group_val`] = item[`shift_val`];
                        sampleCell[`work_time`] = item[`shift_work_time`];
                    }
                }
            });
            sampleList.push(sampleCell);
        }///给模块中所有的 日期都配上 班次 名-值（考虑到调班后shift数据）
        // console.log('某人的某个时间段内的所有的考勤记录 resultList:', resultList);///某人的某个时间段内的所有的考勤记录
        resultList.forEach((item) => {
            sampleList.forEach((sample) => {
                let itemTime = moment(item.time).utcOffset(0).format('YYYY-MM-DD HH:mm:ss');
                if (itemTime > sample.start && itemTime < sample.end) {
                    sample.list.push(item);
                }
            })
        })
        return sampleList;
    }
    changeDataConstructNormal = async (day, timeList, resultList, name) => {
        // console.log('有名称 changeDataConstructNormal name', name);///有名称
        ///创建数据模板 针对一般的员工(group_id = null) 不涉及中班跨天问题
        // console.log('时间区间:', timeList);
        /// 由于没有schedule数据 所有没有调班信息。要后面手动的取查，再匹配替换
        let sampleList = [];
        for (let index = 0; index < day; index++) {
            let sampleCell = {};
            sampleCell.start = moment(timeList[1]).add(-index, 'day').startOf('day').format('YYYY-MM-DD HH:mm:ss');
            sampleCell.end = moment(timeList[1]).add(-index, 'day').endOf('day').format('YYYY-MM-DD HH:mm:ss');
            sampleCell.group_val = (moment(sampleCell.start).format('dddd') === '星期六' || moment(sampleCell.start).format('dddd') === '星期日') ? 0 : 5
            sampleCell.group_lab = (moment(sampleCell.start).format('dddd') === '星期六' || moment(sampleCell.start).format('dddd') === '星期日') ? '休息' : '普通班'
            sampleCell.work_time = periodsList[0][`p_time`]
            sampleCell.list = [];
            sampleList.push(sampleCell);
        }
        resultList.forEach((item) => {
            sampleList.forEach((sample) => {
                // console.log('考勤记录item:', item);
                let itemTime = moment(item.time).utcOffset(0).format('YYYY-MM-DD HH:mm:ss');
                if (itemTime > sample.start && itemTime < sample.end) {
                    sample.list.push(item);
                }
            })
        })
        let adjustments = await this.getAdjustment(name, 0);
        let sampleList2 = this.combinSampleAndAjust(sampleList, adjustments);///结合模版和调整表 得到最后的模版
        return sampleList2;
    }
    getSomeDayData = (name, timeList) => {
        return new Promise((resolve, reject) => {
            let sql = `select * from records where name = '${name}' and time >= '${timeList[0]}' and time <= '${timeList[1]}' order by time desc`
            HttpApi.obsForks({ sql }, (res) => {
                let result = []
                if (res.data.code === 0) { result = res.data.data }
                resolve(result);
            })
        })
    }
    shouldComponentUpdate(nextProps, nextState) {
        if (!nextProps.show) { return false }
        return JSON.stringify(nextProps) !== JSON.stringify(this.props)
    }
    render() {
        const columns = [
            {
                title: '日期',
                dataIndex: 'start',
                render: (text, record) => (
                    <div>
                        <span>{moment(text).format('YYYY-MM-DD')}</span>
                        <span> {moment(text).format('dddd')}</span>
                    </div>
                )
            }, {
                title: '班次',
                dataIndex: 'group_lab',
                render: (text, record) => {
                    let str = ''
                    if (!text) {
                        str = '/'
                    } else { str = text }
                    return <div>{str}</div>
                }
            }, {
                title: '打卡时间',
                dataIndex: 'list',
                render: (text, record) => {
                    // console.log('record:', record);
                    const statusList = record.status;
                    let color1 = '';
                    let color2 = '';
                    let isLost = false;
                    let isKuang = false;
                    if (statusList && statusList.length > 0) {
                        if (statusList.indexOf('迟到') !== -1) {
                            if (record.group_val === 2) {
                                color2 = 'red';
                            } else {
                                color1 = 'red';
                            }
                        }
                        if (statusList.indexOf('早退') !== -1) {
                            if (record.group_val === 2) {
                                color1 = 'blue';
                            } else {
                                color2 = 'blue';
                            }
                        }
                        if (statusList.indexOf('缺卡') !== -1) {
                            isLost = true;
                        }
                        if (statusList.indexOf('旷工') !== -1) {
                            isKuang = true;
                        }
                    }
                    // console.log(color1,color2);
                    let newList = [];
                    if (text.length > 1) {
                        ///提取当天的头尾两个打卡数据 取两个有效的打卡数据
                        newList.push(moment(text[0].time).utcOffset(0).format('HH:mm:ss'));///一天的时间点上靠后 放在数组后一位
                        newList.unshift(moment(text[text.length - 1].time).utcOffset(0).format('HH:mm:ss'));///一天的时间点上靠前 放在数组前一位
                    } else if (text.length === 1) {
                        newList.push(moment(text[0].time).utcOffset(0).format('HH:mm:ss'));
                    }
                    if (text.length === 0) {
                        if (isLost) {
                            return <Tag color="volcano">缺卡</Tag>
                        } else if (isKuang) {
                            return <Tag color="#f50">旷工</Tag>
                        }
                        return <div>/</div>
                    } else if (text.length === 1) {
                        if (isLost) {
                            return <div><Tag color={color1} >{newList[0]}</Tag><Divider type="vertical" /><Tag color="volcano">缺卡</Tag> </div>
                        }
                        return <div><Tag color={record.group_val === 2 ? color2 : color1} >{newList[0]}</Tag></div>
                    } else {
                        return <div><Tag color={color1}>{newList[0]}</Tag><Divider type="vertical" /><Tag color={color2}>{newList[1]}</Tag></div>
                    }
                }
            }
        ];
        const { currentPage, dayCount } = this.state;
        const paginationProps = {
            current: currentPage,
            onChange: (page) => { this.init(page, this.props); },
            total: dayCount,
        }
        const columns2 = [
            {
                title: '类型',
                dataIndex: 'lab',
            },
            {
                title: '计数',
                dataIndex: 'count',
            }
        ]
        return (
            <div>
                <Table
                    bordered
                    dataSource={this.state.data}
                    columns={columns}
                    pagination={paginationProps}
                />
                <Divider orientation="left">统计</Divider>
                <Radio.Group defaultValue={this.state.monthSelect} buttonStyle="solid" onChange={(e) => { this.setState({ monthSelect: e.target.value }); this.countHandler(e.target.value, this.props); }}>
                    <Radio.Button value="now">当月</Radio.Button>
                    <Radio.Button value="last">上月</Radio.Button>
                </Radio.Group>
                <Tooltip placement="topLeft" title={'统计当月(当天～本月起始日)或上月所有的包含了打卡记录天数，以及其中正常和迟到的天数'}>
                    <Icon type="info-circle" theme="twoTone" style={{ fontSize: 20, marginLeft: 20 }} />
                </Tooltip>
                <Table
                    style={{ marginTop: 10 }}
                    bordered
                    dataSource={this.state.countData}
                    columns={columns2}
                />
            </div>
        );
    }
}

export default OneAttendanceView;