import React, { Component } from 'react';
import { Row, Col, DatePicker, Checkbox, Modal, Button, message } from 'antd'
import HttpApi from '../../util/HttpApi'
import ExportJsonExcel from 'js-export-excel'
import moment from 'moment';
import { omitTextLength, calcStepSpendTime, calcOverTimeByStepList, getDuration } from '../../util/Tool'

const { RangePicker } = DatePicker;
const CheckboxGroup = Checkbox.Group;
const majorPlainOptions = [];
const completeStatusPlainOptions = [{ label: '已完成', value: 4 }, { label: '未完成', value: 0 }];
const overTimePlainOptions = [{ label: '已超时', value: true }, { label: '正常', value: false }];
/**
 * 导出缺陷的界面
 */
class ExportBugView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showModal: false,
            ///导出Excel部分
            timeStampCheckList: [moment().startOf('day').format('YYYY-MM-DD HH:ss:mm'), moment().endOf('day').format('YYYY-MM-DD HH:ss:mm')],/// 时间段区间默认是今日 ['2019-01-01 00:00:00','2019-01-01 23:59:59']
            completeStatusCheckList: [],/// 完成状态 [0,4]
            completeStatusCheckAll: false,
            majorCheckList: [],///['A','B',...] 专业A,B,...
            majorCheckAll: false,
            overTimeList: [],///['已超时','正常']
            overTimeCheckAll: false,
            exporting: false,
        }
    }
    componentDidMount() {
        this.init();
    }
    componentWillReceiveProps(nextProps) {
        this.setState({
            showModal: nextProps.showModal
        })
    }
    init = async () => {
        majorPlainOptions.length = 0;
        let marjorData = await this.getMajorInfo();
        marjorData.forEach((item) => {
            majorPlainOptions.push({ label: item.name.length > 31 ? omitTextLength(item.name, 28) : item.name, value: item.id })
        })
        let userData = await this.getUsersInfo();
        this.setState({ userData })
    }
    reset = () => {
        this.setState({
            completeStatusCheckList: [],/// 完成状态 [0,4]
            timeStampCheckList: [moment().startOf('day').format('YYYY-MM-DD HH:ss:mm'), moment().endOf('day').format('YYYY-MM-DD HH:ss:mm')],/// 时间段区间默认是今日 ['2019-01-01 00:00:00','2019-01-01 23:59:59']
            majorCheckList: [],///['A','B',...] 专业A,B,...
            majorCheckAll: false,
            completeStatusCheckAll: false,
            exporting: false,
        })
    }
    getUsersInfo = () => {
        return new Promise((resolve, reject) => {
            // let sqlText = 'select * from users order by convert(name using gbk) ASC'
            let sqlText = `select users.*,users.name as title,levels.name level_name,  CONCAT(users.level_id,'-',users.id) 'key',CONCAT(users.level_id,'-',users.id) 'value' from users
            left join (select * from levels where effective = 1)levels
            on users.level_id = levels.id
            where users.effective = 1
            order by users.level_id`
            HttpApi.obs({ sql: sqlText }, (res) => {
                let result = [];
                if (res.data.code === 0) {
                    result = res.data.data
                }
                resolve(result);
            })
        })
    }
    getMajorInfo = () => {
        let sql = `select m.id,m.name from majors m where effective = 1`
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
    getBugsInfo = (sql) => {
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
    getBugStepLogs = (bugIdList) => {
        let sql = `select bug_step_log.*,users.name as user_name,bug_tag_status.des as tag_des,bug_tag_status.bug_next_status as bug_next_status from bug_step_log
        left join (select * from users where effective = 1) users on users.id = bug_step_log.user_id
        left join (select * from bug_tag_status where effective = 1) bug_tag_status on bug_tag_status.id = bug_step_log.tag_id
        where bug_step_log.effective = 1 and bug_step_log.bug_id in (${bugIdList.join(',')})`
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
    getBugStatusDuration = () => {
        let sql = `select * from bug_status_duration  where effective = 1`
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
    bugStatusToStr = (item) => {
        let str = '/';
        switch (item.status) {
            case 0:
                str = '待维修'
                break;
            case 1:
                str = '维修中'
                break;
            case 2:
                str = '专工验收中'
                break;
            case 3:
                str = '运行验收中'
                break;
            case 4:
                str = '完毕'
                break;
            case 5:
                str = item.bug_freeze_des || '该挂起子状态被删除'
                break;
            case 6:
                str = '申请转专业中'
                break;
            case 7:
                str = '申请挂起中'
                break;
            default:
                break;
        }
        return str;
    }
    transConstract = (result) => {
        let tempList = {};
        result.forEach(item => {
            let tempObj = {};
            tempObj.id = String(item.id);
            tempObj.time = item.checkedAt;
            tempObj.device = item.device_name ? item.device_name : item.area_remark;
            tempObj.uploadman = item.user_name;
            tempObj.area = item.area_name ? item.area_name : (item.area_remark ? item.area_remark : '/')
            tempObj.level = item.buglevel ? (item.buglevel === 1 ? '一级' : (item.buglevel === 2 ? '二级' : '三级')) : '/';
            tempObj.content = item.title_name ? item.title_name + (item.title_remark || '') + '' + JSON.parse(item.content).select + '' + JSON.parse(item.content).text : JSON.parse(item.content).select + '' + JSON.parse(item.content).text;
            tempObj.major = item.major_name;
            tempObj.status = this.bugStatusToStr(item);
            tempObj.over = item.isOver ? (item.step_list.length > 0 ? (this.getIsOverStepFromStepList(item.step_list)).join('/') : '') : ''
            if (tempList[item.major_name]) { tempList[item.major_name].push(tempObj) }
            else { tempList[item.major_name] = [tempObj] }
        });
        // console.log("tempList:", tempList);
        // return;
        let excelOptionList = [];
        for (const key in tempList) {
            // console.log(key);
            // console.log(tempList[key]);
            excelOptionList.push({
                sheetData: tempList[key],
                sheetName: key.length > 31 ? omitTextLength(key, 28) : key,
                sheetFilter: ['id', 'time', 'device', 'uploadman', 'area', 'content', 'level', 'major', 'status', 'over'],
                sheetHeader: ['编号', '上报时间', '巡检点', '发现人', '位置', '内容', '等级', '专业', '当前状态', '超时记录'],
                columnWidths: ['3', '8', '15', '5', '15', '20', '5', '10', '5', '30'], // 列宽
            })
        }
        // console.log('excelOptionList:', excelOptionList);
        return excelOptionList;
    }
    getIsOverStepFromStepList = (stepList) => {
        let isOverList = [];
        stepList.forEach((item) => {
            if (item.isExtra) {
                if (item.isOver) {
                    isOverList.push(
                        (item.user_name || '') + '(' + item.des + '-用时:' + getDuration(item.spendTime) + ')'
                    )
                }
            } else {
                if (item.isOver) {
                    isOverList.push(
                        item.user_name + '(' + item.tag_des + '-用时:' + getDuration(item.spendTime) + ')'
                    )
                }
            }
        })
        return isOverList
    }
    getusernameById = (id) => {
        let result = '/'
        this.state.userData.forEach((item) => {
            if (item.id === id) {
                result = item.name
            }
        })
        return result
    }
    exportHandler = async () => {
        let mjl = this.state.majorCheckList;
        let csl = this.state.completeStatusCheckList;
        let tsl = this.state.timeStampCheckList;
        let otl = this.state.overTimeList
        let mca = this.state.majorCheckAll;
        let tca = this.state.overTimeCheckAll;
        if (mjl.length === 0 || csl.length === 0 || otl.length === 0) { message.error('请完善选项'); return }
        ///开始整合生成sql语句
        let sql1 = '';///条件语句1
        if (csl.length === 1) {
            if (csl[0] === 4) {
                sql1 = `and bugs.status = 4`
            } else { sql1 = `and bugs.status != 4` }
        }
        let sql2 = '';///条件语句2
        if (!mca) { sql2 = 'and bugs.major_id in (' + mjl.join(',') + ')'; }
        let sql3 = '';///条件语句3
        sql3 = `and bugs.checkedAt > '${tsl[0]}' and bugs.checkedAt < '${tsl[1]}'`
        let sqlText = `select bugs.*,bsd.duration_time as bsd_duration_time,
        bld.duration_time as bld_duration_time from bugs 
        left join (select * from bug_level_duration where effective = 1) bld on bld.level_value = bugs.buglevel
        left join (select * from bug_status_duration where effective = 1) bsd on bsd.status = bugs.status
        where bugs.effective = 1 ${sql3} ${sql1} ${sql2}`
        let finallySql = `select t1.*,des.name device_name,
        concat_ws('/',area_1.name,area_2.name,area_3.name) as area_name,
        majors.name major_name,users.name user_name,
        tmp_freeze_table.freeze_id as bug_freeze_id,
        tmp_freeze_table.freeze_des as bug_freeze_des
        from (${sqlText}) t1
        left join (select * from devices where effective = 1) des on des.id = t1.device_id
        left join (select * from area_3 where effective = 1) area_3 on area_3.id = des.area_id
        left join (select * from area_2 where effective = 1) area_2 on area_3.area2_id = area_2.id
        left join (select * from area_1 where effective = 1) area_1 on area_2.area1_id = area_1.id
        left join (select * from majors where effective = 1) majors on majors.id = t1.major_id
        left join (select * from users where effective = 1) users on users.id = t1.user_id
        left join (select t2.*,bug_tag_status.des as tag_des,bug_freeze_status.des as freeze_des 
            from (select bug_id,max(id) as max_id from bug_step_log where effective = 1 group by bug_id) t1
         left join (select * from bug_step_log where effective = 1) t2 on t2.id = t1.max_id
         left join (select * from bug_tag_status where effective = 1) bug_tag_status on bug_tag_status.id = t2.tag_id
         left join (select * from bug_freeze_status where effective = 1) bug_freeze_status on bug_freeze_status.id = t2.freeze_id
         ) tmp_freeze_table on tmp_freeze_table.bug_id = t1.id
        order by major_id
        `;
        // console.log('finallySql:', finallySql)
        let result = await this.getBugsInfo(finallySql);///获取符合条件的缺陷数据
        if (result.length === 0) { message.warn('没有查询到符合条件的缺陷数据-请修改查询条件'); return }
        let result_bsd = await this.getBugStatusDuration();
        result.forEach((item) => { item.bsd_duration_list = result_bsd })
        let tempBugIdList = result.map((item) => { return item.id }) ///查出来的待处理的缺陷的id数组。接下来查询所有这些bug_id 对应的bug_step_log
        let bugStepResult = await this.getBugStepLogs(tempBugIdList)
        result = calcStepSpendTime(result, bugStepResult)///计算每步的耗时
        let afterCalcResult = calcOverTimeByStepList(result)///计算每个缺陷是否超时，超时的step是哪一个
        // console.log('afterCalcResult:', afterCalcResult)
        // return;
        let afterFilterByUserSelect = [];
        if (tca) {
            afterFilterByUserSelect = afterCalcResult;
        } else {
            ///如果超时选项不是选了所有，那么就要进行过滤
            afterFilterByUserSelect = afterCalcResult.filter((item) => {
                return item.isOver === otl[0]
            })
        }
        if (afterFilterByUserSelect.length === 0) { message.warn('没有相关符合条件的数据', 3); return }
        // console.log('afterFilterByUserSelect:', afterFilterByUserSelect)
        // return;
        this.setState({ exporting: true })
        let data = this.transConstract(afterFilterByUserSelect);///数据结构进行转换
        // console.log('data:', data)
        // return;
        let option = {};
        option.fileName = '缺陷统计表-' + moment().format('YYYY-MM-DD-HH-mm-ss')
        option.datas = data;
        let toExcel = new ExportJsonExcel(option);
        toExcel.saveExcel();
        this.setState({ exporting: false })
        this.props.cancel();
        this.reset();
        message.info('正在导出Excel文件，请从浏览器下载文件夹中查看');
    }
    disabledDate = (current) => {
        return current > moment().endOf('day');
    }
    renderExportExcelView = () => {
        return (
            <div>
                <Row gutter={16}>
                    <Col span={5}>
                        <span>时间段选择:</span>
                    </Col>
                    <Col span={19}>
                        <RangePicker
                            disabledDate={this.disabledDate}
                            ranges={{
                                '今日': [moment(), moment()],
                                '本月': [moment().startOf('month'), moment().endOf('day')],
                                '上月': [moment().add(-1, 'month').startOf('month'), moment().add(-1, 'month').endOf('month')],
                            }}
                            defaultValue={[moment().startOf('day'), moment().endOf('day')]}
                            onChange={(momentArr) => {
                                if (momentArr.length === 2) {
                                    let timeStampCheckList = [momentArr[0].startOf('day').format('YYYY-MM-DD HH:ss:mm'),
                                    momentArr[1].endOf('day').format('YYYY-MM-DD HH:ss:mm')]
                                    this.setState({ timeStampCheckList })
                                }
                            }}
                        />
                    </Col>
                </Row>
                <Row gutter={16} style={{ marginTop: 10 }}>
                    <Col span={5}>
                        <span>专业选择:</span>
                    </Col>
                    <Col span={19}>
                        <CheckboxGroup
                            options={majorPlainOptions}
                            value={this.state.majorCheckList}
                            onChange={(majorCheckList) => {
                                this.setState({
                                    majorCheckList,
                                    majorCheckAll: majorCheckList.length === majorPlainOptions.length,
                                });
                            }}
                        />
                        <Checkbox
                            checked={this.state.majorCheckAll}
                            onChange={(e) => {
                                this.setState({
                                    majorCheckList: e.target.checked ? majorPlainOptions.map((item) => (item.value)) : [],
                                    majorCheckAll: e.target.checked,
                                });
                            }}
                        >
                            全选
                    </Checkbox>
                    </Col>
                </Row>
                <Row gutter={16} style={{ marginTop: 10 }}>
                    <Col span={5}>
                        <span>状态选择:</span>
                    </Col>
                    <Col span={19}>
                        <CheckboxGroup
                            options={completeStatusPlainOptions}
                            value={this.state.completeStatusCheckList}
                            onChange={(completeStatusCheckList) => {
                                this.setState({
                                    completeStatusCheckList,
                                    completeStatusCheckAll: completeStatusCheckList.length === completeStatusPlainOptions.length,
                                });
                            }}
                        />
                        <Checkbox
                            checked={this.state.completeStatusCheckAll}
                            onChange={(e) => {
                                this.setState({
                                    completeStatusCheckList: e.target.checked ? completeStatusPlainOptions.map((item) => (item.value)) : [],
                                    completeStatusCheckAll: e.target.checked,
                                });
                            }}
                        >
                            全选
                    </Checkbox>
                    </Col>
                </Row>

                <Row gutter={16} style={{ marginTop: 10 }}>
                    <Col span={5}>
                        <span>超时选择:</span>
                    </Col>
                    <Col span={19}>
                        <CheckboxGroup
                            options={overTimePlainOptions}
                            value={this.state.overTimeList}
                            onChange={(overTimeList) => {
                                this.setState({
                                    overTimeList,
                                    overTimeCheckAll: overTimeList.length === overTimePlainOptions.length,
                                });
                            }}
                        />
                        <Checkbox
                            checked={this.state.overTimeCheckAll}
                            onChange={(e) => {
                                this.setState({
                                    overTimeList: e.target.checked ? overTimePlainOptions.map((item) => (item.value)) : [],
                                    overTimeCheckAll: e.target.checked,
                                });
                            }}
                        >
                            全选
                    </Checkbox>
                    </Col>
                </Row>
            </div>
        )
    }
    render() {
        return (
            <Modal
                title="导出缺陷选项"
                visible={this.state.showModal}
                onCancel={() => { this.props.cancel() }} /// this.setState({ showModal: false })
                footer={[
                    <Button key='cancel' onClick={() => { this.props.cancel() }}>
                        取消
                        </Button>,
                    <Button key='ok' type="primary" loading={this.state.exporting} onClick={this.exportHandler}>
                        确定导出
                        </Button>,
                ]}
                width={520}
            >
                {this.renderExportExcelView()}
            </Modal>
        );
    }
}

export default ExportBugView;