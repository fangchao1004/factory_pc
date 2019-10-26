import React, { Component } from 'react';
import { Row, Col, DatePicker, Checkbox, Modal, Button, message } from 'antd'
import HttpApi from '../../util/HttpApi'
import ExportJsonExcel from 'js-export-excel'
import moment from 'moment';

const { RangePicker } = DatePicker;
const CheckboxGroup = Checkbox.Group;
const majorPlainOptions = [];
const completeStatusPlainOptions = [{ label: '已完成', value: 4 }, { label: '未完成', value: 0 }];

/**
 * 导出缺陷的界面
 */
class ExportBugView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showModal: false,
            ///导出Excel部分
            completeStatusCheckList: [],/// 完成状态 [0,4]
            timeStampCheckList: [moment().startOf('day').format('YYYY-MM-DD HH:ss:mm'), moment().endOf('day').format('YYYY-MM-DD HH:ss:mm')],/// 时间段区间默认是今日 ['2019-01-01 00:00:00','2019-01-01 23:59:59']
            majorCheckList: [],///['A','B',...] 专业A,B,...
            majorCheckAll: false,
            completeStatusCheckAll: false,
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
            majorPlainOptions.push({ label: item.name, value: item.id })
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
    getBugsInfo = (sql = null) => {
        if (!sql) {
            sql = `select bugs.*,des.name as device_name,urs.name as user_name,mjs.name as major_name,
            area_1.name as area1_name,area_1.id as area1_id,
            area_2.name as area2_name,area_2.id as area3_id,
            area_3.name as area3_name,area_3.id as area3_id,
            concat_ws('/',area_1.name,area_2.name,area_3.name) as area_name
            from bugs
            left join (select * from devices where effective = 1) des on bugs.device_id = des.id
            left join (select * from users where effective = 1) urs on bugs.user_id = urs.id
            left join (select * from majors where effective = 1) mjs on bugs.major_id = mjs.id
            left join (select * from area_3 where effective = 1) area_3 on des.area_id = area_3.id
            left join (select * from area_2 where effective = 1) area_2 on area_3.area2_id = area_2.id
            left join (select * from area_1 where effective = 1) area_1 on area_2.area1_id = area_1.id
            where bugs.status != 4 and bugs.effective = 1`
        }
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
    transConstract = (result) => {
        let tempList = {};
        result.forEach(item => {
            let tempObj = {};
            tempObj.id = item.id + '';
            tempObj.time = moment(item.createdAt).format('YYYY-MM-DD HH:mm:ss');
            tempObj.device = item.device_name ? item.device_name : '/';
            tempObj.uploadman = item.user_name;
            tempObj.area = item.area_name ? item.area_name : (item.area_remark ? item.area_remark : '/')
            tempObj.level = item.buglevel ? (item.buglevel === 1 ? '一级' : (item.buglevel === 2 ? '二级' : '三级')) : '/';
            tempObj.content = item.title_name ? item.title_name + ' ' + JSON.parse(item.content).select + ' ' + JSON.parse(item.content).text : JSON.parse(item.content).select + ' ' + JSON.parse(item.content).text;
            tempObj.major = item.major_name;
            tempObj.status = item.status === 0 ? '待分配' : (item.status === 1 ? '维修中' : (item.status === 2 ? '专工验收中' : (item.status === 3 ? '运行验收中' : '处理完毕')));
            tempObj.nowdoman = item.status === 4 || item.status === 0 ? '/' : (item.status === 2 ? '专工' : this.getusernameById(JSON.parse(item.remark)[item.status === 1 ? 0 : 2][JSON.parse(item.remark)[item.status === 1 ? 0 : 2].length - 1].to));
            if (tempList[item.major_name]) { tempList[item.major_name].push(tempObj) }
            else { tempList[item.major_name] = [tempObj] }
        });
        // console.log(tempList);
        let excelOptionList = [];
        for (const key in tempList) {
            // console.log(key);
            // console.log(tempList[key]);
            excelOptionList.push({
                sheetData: tempList[key],
                sheetName: key,
                sheetFilter: ['id', 'time', 'device', 'uploadman', 'area', 'level', 'content', 'major', 'status', 'nowdoman'],
                sheetHeader: ['编号', '上报时间', '巡检点名称', '上报人', '区域', '等级', '内容', '专业', '当前状态', '当前处理人'],
                columnWidths: ['3', '8', '10', '5', '5', '5', '15', '5', '5', '5'], // 列宽
            })
        }
        // console.log('excelOptionList:', excelOptionList);
        return excelOptionList;
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
        let mca = this.state.majorCheckAll;
        if (mjl.length === 0 || csl.length === 0) { message.error('请完善选项'); return }
        ///开始整合生成sql语句
        let sql1 = '';///条件语句1
        if (csl.length === 1) {
            if (csl[0] === 4) {
                sql1 = `and status = 4`
            } else { sql1 = `and status != 4` }
        }
        let sql2 = '';///条件语句2
        if (!mca) { sql2 = 'and (' + (mjl.map((item) => { item = 'major_id = ' + item; return item })).join(' or ') + ')'; }
        let sql3 = '';///条件语句3
        sql3 = `and createdAt > '${tsl[0]}' and createdAt < '${tsl[1]}'`
        let sqlText = `select * from bugs where effective = 1 ${sql3} ${sql1} ${sql2}`
        let finallySql = `select t1.*,des.name device_name,
        concat_ws('/',area_1.name,area_2.name,area_3.name) as area_name,
        majors.name major_name,users.name user_name from (${sqlText}) t1
        left join (select * from devices where effective = 1) des on des.id = t1.device_id
        left join (select * from area_3 where effective = 1) area_3 on area_3.id = des.area_id
        left join (select * from area_2 where effective = 1) area_2 on area_3.area2_id = area_2.id
        left join (select * from area_1 where effective = 1) area_1 on area_2.area1_id = area_1.id
        left join (select * from majors where effective = 1) majors on majors.id = t1.major_id
        left join users on users.id = t1.user_id
        order by major_id
        `;
        let result = await this.getBugsInfo(finallySql);///获取符合条件的缺陷数据
        if (result.length === 0) { message.warn('没有查询到符合条件的缺陷数据-请修改查询条件'); return }
        this.setState({ exporting: true })
        let data = this.transConstract(result);///数据结构进行转换
        let option = {};
        option.fileName = moment().format('YYYY-MM-DD-HH-mm-ss') + '-缺陷统计列表'
        option.datas = data;
        let toExcel = new ExportJsonExcel(option);
        toExcel.saveExcel();
        this.setState({ exporting: false })
        this.props.cancel();
        this.reset();
        message.info('正在导出Excel文件，请从浏览器下载文件夹中查看');
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
                            ranges={{
                                '今日': [moment(), moment()],
                                '本月': [moment().startOf('month'), moment().endOf('month')],
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
                <Row gutter={16} style={{ marginTop: 20 }}>
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
                <Row gutter={16} style={{ marginTop: 20 }}>
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
            </div>
        )
    }
    render() {
        return (
            <Modal
                title="导出Excel选项"
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