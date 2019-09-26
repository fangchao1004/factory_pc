import React, { Component, Fragment } from 'react';
import { Table, Tag, Modal, Button, Steps, Select, message, Input, Row, Col, Spin, Drawer, TreeSelect, Popconfirm, Divider, DatePicker, Checkbox } from 'antd'
import ExportJsonExcel from 'js-export-excel'
import HttpApi, { Testuri } from '../../util/HttpApi'
import moment from 'moment'
import Store from '../../../redux/store/Store';
import { showBugNum } from '../../../redux/actions/BugAction';

const CheckboxGroup = Checkbox.Group;
const majorPlainOptions = [];
const completeStatusPlainOptions = [{ label: '已完成', value: 4 }, { label: '未完成', value: 0 }];
const { RangePicker } = DatePicker;
const { Step } = Steps;
const { TextArea } = Input;
var major_filter = [];///用于筛选任务专业的数据 选项
const status_filter = [{ text: '待分配', value: 0 }, { text: '维修中', value: 1 },
{ text: '专工验收中', value: 2 }, { text: '运行验收中', value: 3 }];///用于筛选状态的数据
var storage = window.localStorage;
var localUserInfo = '';
const bug_level_Options = [{ id: 1, name: '一级' }, { id: 2, name: '二级' }, { id: 3, name: '三级' }].map(bug_level => <Select.Option value={bug_level.id} key={bug_level.id}>{bug_level.name}</Select.Option>)
var major_Options = [];///专业选项
var runner_Options = [];///运行选项

export default class BugView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            showModal1: false,///img显示框
            showLoading: true,///现实loading图片
            preImguuid: null,///上一次加载的图片的uuid
            showModal2: false,
            showModal3: false,
            showModal4: false,
            showModal5: false,
            showModal6: false,
            showModal7: false,///添加缺陷显示框
            showModal8: false,///导出缺陷显示框
            imguuid: null,
            userData: [],
            currentRecord: {},///当前选择的某一行。某一个缺陷对象

            user_select_id: null, ///分配的维修人员的id
            user_select_title: null,///分配的维修人员的title
            runner_select_id: null,///分配的运行人员的id
            step_0_remark: '',///分配时的备注
            step_1_remark: '',///维修界面的备注
            step_2_remark: '',///专工验收界面的备注
            step_3_remark: '',///运行验收界面的备注

            ////添加bug
            bug_level_select_id: null,
            major_select_id: null,
            area_remark: null,
            bug_text: null,

            userLevels: [],
            ///导出Excel部分
            completeStatusCheckList: [],/// 完成状态 [0,4]
            timeStampCheckList: [moment().startOf('day').format('YYYY-MM-DD HH:ss:mm'), moment().endOf('day').format('YYYY-MM-DD HH:ss:mm')],/// 时间段区间默认是今日 ['2019-01-01 00:00:00','2019-01-01 23:59:59']
            majorCheckList: [],///['A','B',...] 专业A,B,...
            // majorIndeterminate: false,
            majorCheckAll: false,
            completeStatusCheckAll: false,
            exporting: false,
        }
    }
    componentDidMount() {
        this.init();
        localUserInfo = storage.getItem('userinfo');
    }

    // socketTest() {
    //     let message = messageFormat('我在bugView');
    //     // console.log('BugView中向服务器发送的socket信息', message);
    //     sendMessageToS('to_server', message);
    //     getMessageFromS(`to_${JSON.parse(localUserInfo).username}`, (data) => { console.log('BugView中收到 来自服务器的socket信息:', data); });
    // }

    init = async () => {
        major_filter.length = 0;
        majorPlainOptions.length = 0;
        let marjorData = await this.getMajorInfo();
        marjorData.forEach((item) => {
            major_filter.push({ text: item.name, value: item.id });
            majorPlainOptions.push({ label: item.name, value: item.id })
        })
        // console.log('marjorData:', marjorData);
        major_Options = marjorData.map(major => <Select.Option value={major.id} key={major.id}>{major.name}</Select.Option>)

        let finallyData = await this.getBugsInfo();///从数据库中获取最新的bugs数据
        finallyData.forEach((item) => { item.key = item.id + '' })
        // console.log('bug数据：', finallyData);
        let userData = await this.getUsersInfo();
        let userLevels = await this.getUsersLevels();
        let runnerData = await this.getRunnerInfo();///获取有运行权限的人员
        // console.log('runnerData:', runnerData);
        runner_Options = runnerData.map(userInfo => <Select.Option value={userInfo.id} key={userInfo.id}>{userInfo.name}</Select.Option>)
        // console.log('userLevels:',userLevels);
        // console.log('userData:', userData);
        userLevels.forEach((oneLevel) => {
            // console.log(oneLevel);
            let tempArr = [];
            userData.forEach((oneUser) => {
                if (oneLevel.level_id === oneUser.level_id) {
                    // console.log(oneUser);
                    tempArr.push(oneUser);
                }
            })
            // console.log(tempArr);
            oneLevel.children = tempArr
            oneLevel.selectable = false
        })
        // console.log(userLevels);

        // userOptions = userData.map(user => <Select.Option value={user.id} key={user.id}>{user.name}</Select.Option>)
        this.setState({
            data: finallyData,
            userData,
            userLevels
        })
    }
    getUsersLevels = () => {
        return new Promise((resolve, reject) => {
            // let sqlText = 'select * from users order by convert(name using gbk) ASC'
            let sqlText = `select distinct users.level_id, users.level_id as 'value',levels.name as title from users
            left join levels
            on levels.id = users.level_id
            order by level_id`
            HttpApi.obs({ sql: sqlText }, (res) => {
                let result = [];
                if (res.data.code === 0) {
                    result = res.data.data
                }
                resolve(result);
            })
        })
    }
    getRunnerInfo = () => {
        return new Promise((resolve, reject) => {
            // let sqlText = 'select * from users order by convert(name using gbk) ASC'
            let sqlText = `select * from users where permission like '%1%'`
            HttpApi.obs({ sql: sqlText }, (res) => {
                let result = [];
                if (res.data.code === 0) {
                    result = res.data.data
                }
                resolve(result);
            })
        })
    }
    getUsersInfo = () => {
        return new Promise((resolve, reject) => {
            // let sqlText = 'select * from users order by convert(name using gbk) ASC'
            let sqlText = `select users.*,users.name as title,levels.name level_name,  CONCAT(users.level_id,'-',users.id) 'key',CONCAT(users.level_id,'-',users.id) 'value' from users
            left join levels
            on users.level_id = levels.id
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
        let sqlText = 'select m.id,m.name from majors m'
        return new Promise((resolve, reject) => {
            HttpApi.obs({ sql: sqlText }, (res) => {
                let result = [];
                if (res.data.code === 0) {
                    result = res.data.data
                }
                resolve(result);
            })
        })
    }
    getOneBugInfo = (bug_id) => {
        let sql1 = ' select bugs.* from bugs where id = ' + bug_id;
        let sqlText = sql1;
        return new Promise((resolve, reject) => {
            HttpApi.obs({ sql: sqlText }, (res) => {
                let result = null;
                if (res.data.code === 0) {
                    result = res.data.data[0]
                }
                resolve(result);
            })
        })
    }
    getBugsInfo = (sql = null) => {
        if (!sql) {
            sql = `select bugs.*,des.name as device_name,urs.name as user_name,mjs.name as major_name,areas.name as area_name from bugs
        left join devices des on bugs.device_id = des.id
        left join users urs on bugs.user_id = urs.id
        left join majors mjs on bugs.major_id = mjs.id
        left join areas on des.area_id = areas.id
        where bugs.status != 4 and bugs.effective = 1
        `;
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
    getOneRecordInfo = (device_id) => {
        let sql1 = ' select * from records rds where device_id = ' + device_id + ' order by rds.id desc limit 1';
        let sqlText = sql1;
        return new Promise((resolve, reject) => {
            HttpApi.obs({ sql: sqlText }, (res) => {
                let result = null;
                if (res.data.code === 0) {
                    result = res.data.data[0]
                }
                resolve(result);
            })
        })
    }
    actionsHandler = (record) => {
        // console.log('详情：', record);
        // console.log('localUserInfo:',localUserInfo);
        this.setState({ showModal2: true, currentRecord: record })
    }
    ///根据userid 查找 username
    getLocalUserName = (userId) => {
        let name = '';
        if (this.state.userData && this.state.userData.length > 0) { this.state.userData.forEach((item) => { if (item.id === userId) { name = item.name } }) }
        return name;
    }
    ///添加缺陷
    renderAddBugModal = () => {
        return (<div>
            <Row gutter={16}>
                <Col span={4}>
                    <span>紧急类型:</span>
                </Col>
                <Col span={18}>
                    <Select value={this.state.bug_level_select_id} defaultValue={null} style={{ width: '100%' }}
                        onChange={(v) => { this.setState({ bug_level_select_id: v }) }}
                    >{bug_level_Options}</Select>
                </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: 20 }}>
                <Col span={4}>
                    <span>缺陷专业:</span>
                </Col>
                <Col span={18}>
                    <Select value={this.state.major_select_id} defaultValue={null} style={{ width: '100%' }}
                        onChange={(v) => { this.setState({ major_select_id: v }) }}
                    >{major_Options}</Select>
                </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: 20 }}>
                <Col span={4}>
                    <span>所在区域:</span>
                </Col>
                <Col span={18}>
                    <Input value={this.state.area_remark} style={{ width: '100%' }} placeholder='请填写位置信息' onChange={(e) => { this.setState({ area_remark: e.target.value }) }} allowClear></Input>
                </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: 20 }}>
                <Col span={4}>
                    <span>问题描述:</span>
                </Col>
                <Col span={18}>
                    <TextArea value={this.state.bug_text} style={{ width: '100%' }} placeholder='请填写缺陷信息' onChange={(e) => { this.setState({ bug_text: e.target.value }) }}></TextArea>
                </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: 20 }}>
                <Col span={4}>
                </Col>
                <Col span={18} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button type={'ghost'} onClick={() => {
                        this.setState({
                            bug_level_select_id: null,
                            major_select_id: null,
                            area_remark: null,
                            bug_text: null,
                        })
                    }}>重置</Button>
                    <Button type={'primary'} onClick={() => {
                        if (this.state.bug_level_select_id && this.state.major_select_id && this.state.area_remark && this.state.bug_text) {
                            let valueObj = {};
                            valueObj.user_id = JSON.parse(localUserInfo).id;
                            valueObj.major_id = this.state.major_select_id;
                            valueObj.content = JSON.stringify({ select: '', text: this.state.bug_text, imgs: [] });
                            valueObj.buglevel = this.state.bug_level_select_id;
                            valueObj.area_remark = this.state.area_remark;
                            valueObj.status = 0;
                            HttpApi.addBugInfo(valueObj, (res) => {
                                if (res.data.code === 0) { message.success('上传成功'); this.init(); this.setState({ showModal7: false }) }
                            })
                        } else { message.error('请完善相关信息') }
                    }}>确定</Button>
                </Col>
            </Row>
        </div>)
    }
    /// 导出Excel界面
    renderExportExcelView = () => {
        return <div>
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
                                // console.log('timeStampCheckList:', timeStampCheckList);
                                // console.log('this.state.timeStampCheckList1:', this.state.timeStampCheckList);
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
                                // majorIndeterminate: !!majorCheckList.length && majorCheckList.length < majorPlainOptions.length,
                                majorCheckAll: majorCheckList.length === majorPlainOptions.length,
                            });
                        }}
                    />
                    <Checkbox
                        // indeterminate={this.state.majorIndeterminate}
                        checked={this.state.majorCheckAll}
                        onChange={(e) => {
                            this.setState({
                                majorCheckList: e.target.checked ? majorPlainOptions.map((item) => (item.value)) : [],
                                // majorIndeterminate: false,
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
    }
    ////缺陷分配界面
    renderSelectWorkerModal = () => {
        return (<div>
            <Row gutter={16}>
                <Col span={5}>
                    <span>人员选择:</span>
                </Col>
                <Col span={18}>
                    <TreeSelect
                        value={this.state.user_select_title}
                        style={{ width: '100%' }}
                        treeNodeFilterProp="title"
                        placeholder="请选择维修人员"
                        treeCheckable={false}
                        treeData={this.state.userLevels}
                        onSelect={(v, node, extra) => {
                            console.log(v, node, '选中的title:', extra.selectedNodes[0].props.title);
                            if (v.split('-').length === 2) {
                                let user_select_id = parseInt(v.split('-')[1]);
                                let user_select_title = extra.selectedNodes[0].props.title;
                                this.setState({ user_select_id, user_select_title })
                            }
                        }}
                    ></TreeSelect>
                </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: 20 }}>
                <Col span={5}>
                    <span>备注:</span>
                </Col>
                <Col span={18}>
                    <Input value={this.state.step_0_remark} style={{ width: '100%' }} placeholder='可用来说明相关情况' onChange={(e) => { this.setState({ step_0_remark: e.target.value }) }} allowClear></Input>
                </Col>
            </Row>
            <div style={{ marginTop: 20 }}>
                <Button type={'primary'}
                    onClick={() => {
                        if (this.state.user_select_id !== null) {
                            //// 人员选择完毕。改变bug中的数据。status 和 remark
                            this.changeBugStatus(1, 0, this.state.step_0_remark, JSON.parse(localUserInfo).id, this.state.user_select_id);
                            this.setState({ user_select_title: null, user_select_id: null, step_0_remark: '', showModal3: false })
                        } else { message.error('请分配人员'); }
                    }}>确定人员</Button>
            </div>
        </div >)
    }
    ////维修工的界面
    renderWorkerModal = () => {
        return (
            <div>
                <Row gutter={16}>
                    <Col span={5}>
                        <span>备注:</span>
                    </Col>
                    <Col span={18}>
                        <Input value={this.state.step_1_remark} style={{ width: '100%' }} placeholder='可用来说明相关情况' onChange={(e) => { this.setState({ step_1_remark: e.target.value }) }} allowClear></Input>
                    </Col>
                </Row>
                <div style={{ marginTop: 20 }}>
                    <Button type={'ghost'}
                        onClick={() => {
                            //// 人员选择完毕。改变bug中的数据。status 和 remark
                            let remarkText = this.state.step_1_remark ? this.state.step_1_remark : '暂缓维修工作';
                            this.changeBugStatus(1, 1, remarkText, JSON.parse(localUserInfo).id);
                            this.setState({ step_1_remark: '', showModal4: false })
                        }}>暂缓工作</Button>
                    <Button type={'danger'}
                        style={{ marginLeft: 20 }}
                        onClick={() => {
                            //// 人员选择完毕。改变bug中的数据。status 和 remark
                            let remarkText = this.state.step_1_remark ? this.state.step_1_remark : '回退工作,重新分配';
                            this.changeBugStatus(0, 1, remarkText, JSON.parse(localUserInfo).id);
                            this.setState({ step_1_remark: '', showModal4: false })
                        }}>回退工作</Button>
                    <Button type={'primary'}
                        style={{ marginLeft: 20 }}
                        onClick={() => {
                            //// 人员选择完毕。改变bug中的数据。status 和 remark
                            let remarkText = this.state.step_1_remark ? this.state.step_1_remark : '完成维修工作,等待专工验收';
                            this.changeBugStatus(2, 1, remarkText, JSON.parse(localUserInfo).id);
                            this.setState({ step_1_remark: '', showModal4: false })
                        }}>完成工作</Button>
                </div>
            </div>
        )
    }
    /////专工界面
    renderManagerModal = () => {
        return (
            <div>
                <Row gutter={16}>
                    <Col span={5}>
                        <span>运行人员选择:</span>
                    </Col>
                    <Col span={18}>
                        <Select value={this.state.runner_select_id} defaultValue={null} style={{ width: '100%' }}
                            onChange={(v) => { this.setState({ runner_select_id: v }) }}
                        >{runner_Options}</Select>
                    </Col>
                </Row>
                <Row gutter={16} style={{ marginTop: 20 }}>
                    <Col span={5}>
                        <span>备注:</span>
                    </Col>
                    <Col span={18}>
                        <Input value={this.state.step_2_remark} style={{ width: '100%' }} placeholder='可用来说明相关情况' onChange={(e) => { this.setState({ step_2_remark: e.target.value }) }} allowClear></Input>
                    </Col>
                </Row>
                <div style={{ marginTop: 20 }}>
                    <Button type={'ghost'}
                        onClick={() => {
                            //// 人员选择完毕。改变bug中的数据。status 和 remark
                            let remarkText = this.state.step_2_remark ? this.state.step_2_remark : '暂缓验收工作';
                            this.changeBugStatus(2, 2, remarkText, JSON.parse(localUserInfo).id);
                            this.setState({ step_2_remark: '', showModal5: false })
                        }}>暂缓工作</Button>
                    <Button type={'danger'}
                        style={{ marginLeft: 20 }}
                        onClick={() => {
                            //// 人员选择完毕。改变bug中的数据。status 和 remark
                            let remarkText = this.state.step_2_remark ? this.state.step_2_remark : '验收不通过，重新维修';
                            this.changeBugStatus(1, 2, remarkText, JSON.parse(localUserInfo).id);
                            this.setState({ step_2_remark: '', showModal5: false })
                        }}>重新维修</Button>
                    <Button type={'primary'}
                        style={{ marginLeft: 20 }}
                        onClick={() => {
                            if (this.state.runner_select_id === null) { message.error('请选择运行人员进行下一步验收工作'); return }
                            /// 人员选择完毕。改变bug中的数据。status 和 remark
                            let remarkText = this.state.step_2_remark ? this.state.step_2_remark : '完成验收,等待运行验收';
                            this.changeBugStatus(3, 2, remarkText, JSON.parse(localUserInfo).id, this.state.runner_select_id);
                            this.setState({ step_2_remark: '', showModal5: false, runner_select_id: null })
                        }}>完成验收</Button>
                </div>
            </div>
        )
    }
    ////运行验收界面
    renderRunerModal = () => {
        return (
            <div>
                <Row gutter={16}>
                    <Col span={5}>
                        <span>备注:</span>
                    </Col>
                    <Col span={18}>
                        <Input value={this.state.step_3_remark} style={{ width: '100%' }} placeholder='可用来说明相关情况' onChange={(e) => { this.setState({ step_3_remark: e.target.value }) }} allowClear></Input>
                    </Col>
                </Row>
                <div style={{ marginTop: 20 }}>
                    <Button type={'ghost'}
                        onClick={() => {
                            //// 人员选择完毕。改变bug中的数据。status 和 remark
                            let remarkText = this.state.step_3_remark ? this.state.step_3_remark : '暂缓验收工作';
                            this.changeBugStatus(3, 3, remarkText, JSON.parse(localUserInfo).id);
                            this.setState({ step_3_remark: '', showModal6: false })
                        }}>暂缓工作</Button>
                    <Button type={'danger'}
                        style={{ marginLeft: 20 }}
                        onClick={() => {
                            //// 人员选择完毕。改变bug中的数据。status 和 remark
                            let remarkText = this.state.step_3_remark ? this.state.step_3_remark : '验收不通过，发回专工处理';
                            this.changeBugStatus(2, 3, remarkText, JSON.parse(localUserInfo).id);
                            this.setState({ step_3_remark: '', showModal6: false })
                        }}>验收失败</Button>
                    <Button type={'primary'}
                        style={{ marginLeft: 20 }}
                        onClick={() => {
                            //// 人员选择完毕。改变bug中的数据。status 和 remark
                            let remarkText = this.state.step_3_remark ? this.state.step_3_remark : '完成验收';
                            this.changeBugStatus(4, 3, remarkText, JSON.parse(localUserInfo).id);
                            this.setState({ step_3_remark: '', showModal6: false })
                        }}>完成验收</Button>
                </div>
            </div>
        )
    }
    /**
     * statusValue  当前bug的状态status字段。（0，1，2，3，4)
     * 0 -- 等待分配
     * 1 -- 分配完成，等待维修
     * 2 -- 维修完成，等待专工验收
     * 3 -- 专工验收完成，等待运行验收
     * 4 -- 运行验收完成，流程结束
     */
    changeBugStatus = (targetStatus, currentStep, remarkText, fromId, toId = null) => {
        // console.log('要将bug的status置成：', targetStatus, '当前流程在哪一步：', currentStep, '备注的文本：', remarkText, '操作人：', fromId, '目标对象：', toId);
        // return;
        ////首先要先把当前的bug的remak信息全copy一份。
        // console.log("this.state.currentRecord.remark:", this.state.currentRecord.remark);
        let remarkCopy = {};
        if (this.state.currentRecord.remark) {
            remarkCopy = JSON.parse(this.state.currentRecord.remark);
        }
        // console.log('remarkCopy:', remarkCopy);
        if (remarkCopy && remarkCopy[currentStep]) {
            ///如果remark已经存在。
            // console.log(remarkCopy[currentStep]);
            if (toId !== null) {
                remarkCopy[currentStep].push({ from: fromId, to: toId, remark: remarkText, time: moment().format('YYYY-MM-DD HH:mm:ss') });
            } else {
                remarkCopy[currentStep].push({ from: fromId, remark: remarkText, time: moment().format('YYYY-MM-DD HH:mm:ss') });
            }
        } else {
            if (toId !== null) {
                remarkCopy[currentStep] = [{ from: fromId, to: toId, remark: remarkText, time: moment().format('YYYY-MM-DD HH:mm:ss') }]
            } else {
                remarkCopy[currentStep] = [{ from: fromId, remark: remarkText, time: moment().format('YYYY-MM-DD HH:mm:ss') }]
            }
        }
        ///将最新的 remark 数据 更新到 bugs 表中。并且判断要把 status 改到哪一步
        let newValue = { status: targetStatus, remark: JSON.stringify(remarkCopy) }
        if (targetStatus === 4) { ///当 运行验收后， 状态为 4 此时还要记录一下缺陷的解决时间，为什么不用 updatedAt 来判断？ 因为怕 混乱 
            newValue = { status: targetStatus, remark: JSON.stringify(remarkCopy), closedAt: moment().format('YYYY-MM-DD HH:mm:ss') }
        }
        if (toId !== null) {
            newValue.fix_id = toId;
        }
        HttpApi.updateBugInfo({ query: { id: this.state.currentRecord.id }, update: newValue }, (res) => {
            if (res.data.code === 0) {
                this.init();
                if (targetStatus === 1 || targetStatus === 4) {
                    this.updateDataByRedux();
                }
                ///成功以后要立即刷新当前的bug数据。
                HttpApi.getBugInfo({ id: this.state.currentRecord.id }, (res) => {
                    if (res.data.code === 0) {
                        message.success('发布成功');
                        this.setState({ currentRecord: res.data.data[0] })
                        ////如果是状态4 则说明这个bug已经解决了。要把这个bug对应的record给更新（复制原有数据，本地修改，再作为新数据插入数据库record表）
                        if (targetStatus === 4) {
                            this.changeRecordData(); setTimeout(() => {
                                this.setState({ showModal2: false })
                            }, 1000);
                        }
                    }
                })
            }
        })
    }

    ////改变包含了这个bug_id 的record 再数据库中的值。
    changeRecordData = async () => {
        let bugId = this.state.currentRecord.id;
        ///1，要根据bug_id 去bugs表中去查询该条数据，获取其中的 device_id 字段信息
        let oneBugInfo = await this.getOneBugInfo(bugId);
        let device_id = oneBugInfo.device_id;
        if (!device_id) { return }
        ///2，根据 device_id 去record 表中 找到 这个设备最新的一次record。 获取到后，在本地修改。再最为一条新数据插入到records表中
        let oneRecordInfo = await this.getOneRecordInfo(device_id);
        let bug_content = JSON.parse(oneRecordInfo.content);
        ///content 数组。找到其中bug_id 不为null的。把bug_id 和 bugId 相同的给至null,再手动判断是不是bug_id字段都是null了。如果是device_status就要至1（正常）
        let bug_id_count = 0;
        ///先知道 有多少个 bug_id 不为null
        bug_content.forEach((oneSelect) => {
            if (oneSelect.bug_id !== null) {
                bug_id_count++;
            }
        })
        // console.log('这个设备还有几个bug:', bug_id_count);
        if (bug_id_count > 0) {
            ///如果找到对应的bug_id。将它至null,说明这个缺陷已经解决了。就不要再出现在record中了。同时bug_id_count减1
            bug_content.forEach((oneSelect) => {
                if (oneSelect.bug_id === bugId) {
                    oneSelect.bug_id = null;
                    bug_id_count--;
                }
            })
            // console.log('处理完一个bug后的content为:', bug_content);
            oneRecordInfo.content = JSON.stringify(bug_content);
            if (bug_id_count === 0) {
                oneRecordInfo.device_status = 1;
            }
        }
        // oneRecordInfo.user_id = JSON.parse(localUserInfo).id;///更新record的上传人。
        delete oneRecordInfo.id;
        delete oneRecordInfo.createdAt;
        delete oneRecordInfo.updatedAt;
        // console.log('待入库的最新record:', oneRecordInfo);
        HttpApi.insertRecordInfo(oneRecordInfo, (res) => {
            if (res.data.code === 0) {
                // console.log('入库成功。');
                if (oneRecordInfo.device_status === 1) {
                    ///手动更新数据库中，对应设备的状态
                    HttpApi.updateDeviceInfo({ query: { id: device_id }, update: { status: 1 } }, (res) => {
                        if (res.data.code === 0) { message.success('对应设备最新巡检记录更新-设备状态恢复正常'); }
                    })
                } else {
                    HttpApi.updateDeviceInfo({ query: { id: device_id }, update: { status: 2 } }, (res) => {
                        if (res.data.code === 0) { message.info('对应设备最新巡检记录更新'); } ///这么做的目的是只要有record上传，就要更新对应设备的updateAt
                    })
                }
            }
        })
    }

    ///////////////////////////////////////
    ///////////////////////////////////////
    ///////////////////////////////////////

    ///状态0 时渲染的界面
    renderStatusX = (statusValue) => {
        let oneStepContent = [];///每一步的所以内容
        if (this.state.currentRecord.remark) {
            let stepRemarkObj = JSON.parse(this.state.currentRecord.remark);
            // console.log("每一步的操作流程数据：", stepRemarkObj[statusValue]);
            if (stepRemarkObj[statusValue]) {
                let renderArr = stepRemarkObj[statusValue];
                renderArr.forEach((item, index) => {
                    let text = ''
                    let remarkText = item.remark ? item.remark : '';
                    /////////////////
                    let result_arr = [];
                    let comArr = [];///组件数组
                    if (item.imgs) {
                        item.imgs.forEach((item, index) => {
                            result_arr.push({ key: index + item, name: ('图片' + (index + 1)), uuid: item });
                        })
                        result_arr.forEach((item, index) => {
                            comArr.push(<Button size={'small'} type={'primary'} key={item.uuid} style={{ marginLeft: 10, cursor: "pointer" }}
                                onClick={e => {
                                    if (this.state.preImguuid !== item.uuid) {
                                        this.setState({
                                            showLoading: true,
                                        })
                                    } else {
                                        this.setState({
                                            showLoading: false,
                                        })
                                    }
                                    this.setState({
                                        imguuid: item.uuid,
                                        showModal1: true,
                                        preImguuid: item.uuid,
                                    })
                                }}>{item.name}</Button>)
                        });
                    }
                    /////////////////
                    if (item.to || item.to >= 0) {
                        // text = '  ' + this.getLocalUserName(item.from) + '  分配给 ' + this.getLocalUserName(item.to);
                        text = <Fragment><span style={{ color: renderArr.length - 1 === index ? '#888888' : '#888888' }}>{item.time}</span>
                            <span style={{ color: renderArr.length - 1 === index ? '#888888' : '#888888' }}>{' ' + this.getLocalUserName(item.from)}</span>
                            <span> 分配给 </span>
                            <span style={{ color: renderArr.length - 1 === index ? '#888888' : '#888888' }}>{' ' + this.getLocalUserName(item.to)}</span>
                            {remarkText ? <span style={{ color: '#888888' }}> 备注: </span> : null}
                            <span style={{ color: renderArr.length - 1 === index ? 'orange' : '#888888' }}>{remarkText}</span>
                        </Fragment>
                    } else {
                        text = '  ' + this.getLocalUserName(item.from);
                        text = <Fragment><span style={{ color: renderArr.length - 1 === index ? '#888888' : '#888888' }}>{item.time}</span>
                            <span style={{ color: renderArr.length - 1 === index ? '#888888' : '#888888' }}>{' ' + this.getLocalUserName(item.from)}</span>
                            {remarkText ? <span style={{ color: '#888888' }}> 备注: </span> : null}
                            <span style={{ color: renderArr.length - 1 === index ? 'orange' : '#888888' }}>{remarkText}</span>
                        </Fragment>
                    }
                    oneStepContent.push(<div key={index}>
                        {text}
                        {comArr}
                    </div>)
                })
            }
        }
        return oneStepContent
    }

    /////判断每一个button 在各种情况下，是否禁用
    checkDisable = (btnV) => {
        let disabledFlag = true;
        if (btnV === 0) {
            ///有专工权限，且 status <= 1 时 可用。disableFlag = false;
            if (localUserInfo && JSON.parse(localUserInfo).permission) {
                if (JSON.parse(localUserInfo).permission && JSON.parse(localUserInfo).permission.indexOf('0') !== -1 && this.state.currentRecord.status <= 1) {
                    disabledFlag = false;
                }
            }
        } else if (btnV === 1) {
            ////当前用户是不是 0 数组中最后一位的 to  且 当前status 的值 =1
            if (localUserInfo && this.state.currentRecord.remark && this.state.currentRecord.status === 1) {
                let stepData_0_arr = JSON.parse(this.state.currentRecord.remark)['0'];
                if (stepData_0_arr) {
                    let to_id = stepData_0_arr[stepData_0_arr.length - 1].to; ////最新一次任务分配给了谁。
                    disabledFlag = to_id !== JSON.parse(localUserInfo).id;/// 如果不等于 则禁用
                }
            }
        } else if (btnV === 2) {
            ///有专工权限，且 status = 2 时 可用。disableFlag = false;
            if (localUserInfo && JSON.parse(localUserInfo).permission && this.state.currentRecord.remark) {
                if (JSON.parse(localUserInfo).permission && JSON.parse(localUserInfo).permission.indexOf('0') !== -1 && this.state.currentRecord.status === 2) {
                    disabledFlag = false;
                }
            }
        } else if (btnV === 3) {
            // ///有运行权限，且 status = 3 时 可用。disableFlag = false;
            // if (localUserInfo && JSON.parse(localUserInfo).permission && this.state.currentRecord.remark) {
            //     if (JSON.parse(localUserInfo).permission && JSON.parse(localUserInfo).permission.indexOf('1') !== -1 && this.state.currentRecord.status === 3) {
            //         disabledFlag = false;
            //     }
            // }
            ////当前用户是不是 2 数组中最后一位的 to  且 当前status 的值 =3
            if (localUserInfo && this.state.currentRecord.remark && this.state.currentRecord.status === 3) {
                let stepData_2_arr = JSON.parse(this.state.currentRecord.remark)['2'];
                if (stepData_2_arr) {
                    let to_id = stepData_2_arr[stepData_2_arr.length - 1].to; ////最新一次任务分配给了谁。
                    disabledFlag = to_id !== JSON.parse(localUserInfo).id;/// 如果不等于 则禁用
                    // console.log('运行_to_id:',to_id);
                }
            }
        }
        return disabledFlag;
    }

    deleteBugsHandler = (record) => {
        HttpApi.obs({ sql: `update bugs set effective = 0 where id = ${record.id} ` }, (res) => {
            if (res.data.code === 0) {
                message.success('移除缺陷成功');
                this.init();
                ///要利用redux刷新 mainView处的徽标数
                this.updateDataByRedux();
            }
        })
    }
    updateDataByRedux = () => {
        ///每次删除
        Store.dispatch(showBugNum(null)) ///随便派发一个值，目的是让 mainView处监听到 执行init();
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
        let finallySql = `select t1.*,des.name device_name,areas.name area_name,majors.name major_name,users.name user_name from
        (${sqlText}) t1
        left join devices des on des.id = t1.device_id
        left join areas on areas.id = des.area_id
        left join majors on majors.id = t1.major_id
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
        this.setState({ exporting: false, showModal8: false })
        message.info('正在导出Excel文件，请从浏览器下载文件夹中查看');
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
    render() {
        const columns = [
            {
                key: 'id',
                dataIndex: 'id',
                title: '编号',
                render: (text, record) => {
                    return <div>{text}</div>
                }
            },
            {
                key: 'createdAt', dataIndex: 'createdAt', title: '时间',
                sorter: (a, b) => {
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                },
                defaultSortOrder: 'descend',
                render: (text, record) => { return <div>{moment(text).format('YYYY-MM-DD HH:mm:ss')}</div> }
            },
            {
                key: 'device_name', dataIndex: 'device_name', title: '设备',
                render: (text) => {
                    let result = '/'
                    if (text && text !== '') { result = text }
                    return <div>{result}</div>
                }
            },
            {
                key: 'user_name', dataIndex: 'user_name', title: '上报人',
            },
            {
                key: 'area_remark', dataIndex: 'area_remark', title: '区域',
                render: (text, record) => {
                    let result = '/'
                    if (text) { result = text }
                    else { result = record.area_name }
                    return <div>{result}</div>
                }
            },
            {
                key: 'buglevel', dataIndex: 'buglevel', title: '等级',
                render: (text) => {
                    let result = null;
                    let resultCom = '/'
                    let color = '#505659';
                    if (text) {
                        if (text === 1) { result = '一级'; color = '#f50' }
                        else if (text === 2) { result = '二级'; color = '#FF9900' }
                        else if (text === 3) { result = '三级'; color = '#87d068' }
                        resultCom = <Tag color={color}>{result}</Tag>
                    }
                    return resultCom
                }
            },
            {
                key: 'content', dataIndex: 'content', title: '内容', render: (text, record) => {
                    let obj = JSON.parse(text);
                    return <div><div style={{ color: '#000', fontWeight: 900 }}>{record.title_name}</div><div>{obj.select}</div><div>{obj.text}</div></div>
                }
            },
            {
                key: 'major_name', dataIndex: 'major_name', title: '专业',
                filters: major_filter,
                onFilter: (value, record) => record.major_id === value,
                render: (text, record) => {
                    return <div>{text}</div>
                }
            },
            {
                key: 'img', dataIndex: 'content', title: '图片', render: (text) => {
                    let obj = JSON.parse(text);
                    let imgs_arr = JSON.parse(JSON.stringify(obj.imgs));
                    let result_arr = [];
                    imgs_arr.forEach((item, index) => {
                        result_arr.push({ key: index + item, name: ('图片' + (index + 1)), uuid: item });
                    })
                    let comArr = [];
                    result_arr.forEach((item, index) => {
                        comArr.push(<span key={item.uuid} style={{ color: '#438ef7', fontWeight: 500, marginRight: 10, cursor: "pointer" }}
                            onClick={e => {
                                if (this.state.preImguuid !== item.uuid) {
                                    this.setState({
                                        showLoading: true,
                                    })
                                } else {
                                    this.setState({
                                        showLoading: false,
                                    })
                                }
                                this.setState({
                                    imguuid: item.uuid,
                                    showModal1: true,
                                    preImguuid: item.uuid,
                                })
                            }}>{item.name}</span>)
                    });
                    let result = '/'
                    if (comArr.length > 0) { result = comArr }
                    return <div>{result}</div>
                }
            },
            {
                title: '缺陷状态',
                dataIndex: 'status',
                filters: status_filter,
                align: 'center',
                onFilter: (value, record) => record.status === value,
                render: (text, record) => {
                    let str = '';
                    let color = '#888888'
                    if (text === 0) { str = '待分配' } else if (text === 1) { str = '维修中'; color = '#FF9999' } else if (text === 2) { str = '专工验收中'; color = '#6699CC' }
                    else if (text === 3) { str = '运行验收中'; color = '#9933CC' } else if (text === 4) { str = '处理完毕'; color = '#87d068' }
                    return <Tag color={color}>{str}</Tag>;
                }
            },
            {
                title: '当前处理人员',
                dataIndex: 'a',
                render: (text, record) => {
                    let remarkObj = JSON.parse(record.remark);
                    let currentStatus = record.status;
                    let str = '/';
                    if (currentStatus === 1 && remarkObj) {
                        // console.log('id:', record.id,'数组长度:',remarkObj['0'].length,'最新:',remarkObj['0'][remarkObj['0'].length-1]);
                        // console.log('最新的维修人员id:',remarkObj['0'][remarkObj['0'].length-1].to);
                        let currentUserID = remarkObj['0'][remarkObj['0'].length - 1].to;
                        this.state.userData.forEach((item) => {
                            if (item.id === currentUserID) {
                                str = item.name
                            }
                        })
                    }
                    if (currentStatus === 2) {
                        str = '专工'
                    } else if (currentStatus === 3) {
                        // str = '运行人员'
                        let currentUserID = remarkObj['2'][remarkObj['2'].length - 1].to;
                        this.state.userData.forEach((item) => {
                            if (item.id === currentUserID) {
                                str = item.name
                            }
                        })
                    } else if (currentStatus === 4) {
                        str = '/'
                    }
                    return <div>{str}</div>;
                }
            },
            {
                title: '操作',
                dataIndex: 'actions',
                width: 150,
                render: (text, record) => (
                    <div style={{ textAlign: 'center' }}>
                        <Button size="small" type="primary" onClick={() => { this.actionsHandler(record) }}>处理</Button>
                        {JSON.parse(localUserInfo).isadmin === 1 ?
                            <Fragment>
                                <Divider type="vertical" />
                                <Popconfirm title="确定要删除该缺陷吗?" onConfirm={() => { this.deleteBugsHandler(record); }}>
                                    <Button size="small" type="danger">删除</Button>
                                </Popconfirm>
                            </Fragment> : null
                        }
                    </div>
                )
            }
        ]
        return (
            <Fragment>
                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
                    <Button type={'primary'} style={{ marginBottom: 20 }} onClick={() => { this.setState({ showModal7: true }) }}>添加缺陷</Button>
                    {localUserInfo && JSON.parse(localUserInfo).isadmin === 1 ? <Button type={'primary'} style={{ marginBottom: 20 }} onClick={() => { this.setState({ showModal8: true }) }}>导出缺陷</Button> : null}
                </div>
                <Table
                    bordered
                    dataSource={this.state.data}
                    columns={columns}
                />
                <Modal
                    title="添加缺陷"
                    visible={this.state.showModal7}
                    onCancel={() => { this.setState({ showModal7: false }) }}
                    footer={null}
                    width={520}
                >
                    {this.renderAddBugModal()}
                </Modal>
                <Modal
                    title="导出Excel选项"
                    visible={this.state.showModal8}
                    onCancel={() => { this.setState({ showModal8: false }) }}
                    // footer={null}
                    footer={[
                        <Button key='cancel' onClick={() => { this.setState({ showModal8: false }) }}>
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
                {/* 进度界面 */}
                < Modal
                    mask={false}
                    title="当前进度"
                    visible={this.state.showModal2}
                    onCancel={() => { this.setState({ showModal2: false }) }}
                    footer={null}
                    width={520}
                >
                    <Steps direction="vertical" size="small" current={this.state.currentRecord.status}>
                        <Step title='工作分配' description={this.renderStatusX(0)} />
                        <Step title='开始维修' description={this.renderStatusX(1)} />
                        <Step title='专工验收' description={this.renderStatusX(2)} />
                        <Step title='运行验收' description={this.renderStatusX(3)} />
                        <Step title='已完成' description={this.renderStatusX(4)} />
                    </Steps>
                    <Button type={'primary'}
                        disabled={this.checkDisable(0)}
                        onClick={() => { this.setState({ showModal3: true }) }}
                    >分配维修人员</Button>
                    <Button style={{ marginLeft: 20 }} type={'primary'}
                        disabled={this.checkDisable(1)}
                        onClick={() => { this.setState({ showModal4: true }) }}
                    >维修处理</Button>
                    <Button style={{ marginLeft: 20 }} type={'primary'}
                        disabled={this.checkDisable(2)}
                        onClick={() => { this.setState({ showModal5: true }) }}
                    >专工验收</Button>
                    <Button style={{ marginLeft: 20 }} type={'primary'}
                        disabled={this.checkDisable(3)}
                        onClick={() => { this.setState({ showModal6: true }) }}
                    >运行人员验收</Button>
                </Modal >
                {/* 分配人员操作界面 */}
                < Drawer
                    title="分配维修人员"
                    placement='right'
                    visible={this.state.showModal3}
                    onClose={() => { this.setState({ user_select_title: null, user_select_id: null, step_0_remark: '', showModal3: false }) }}
                    width={450}
                >
                    {this.renderSelectWorkerModal()}
                </Drawer >
                {/* 维修人员操作界面 */}
                < Drawer
                    title="维修处理"
                    placement='right'
                    visible={this.state.showModal4}
                    onClose={() => { this.setState({ step_1_remark: '', showModal4: false }) }}
                    width={450}
                >
                    {this.renderWorkerModal()}
                </Drawer >
                {/* 专工验收操作界面 */}
                < Drawer
                    title="专工验收处理"
                    placement='right'
                    visible={this.state.showModal5}
                    onClose={() => { this.setState({ step_2_remark: '', showModal5: false, runner_select_id: null }) }}
                    width={450}
                >
                    {this.renderManagerModal()}
                </Drawer >
                {/* 运行验收操作界面 */}
                < Drawer
                    title="运行验收处理"
                    placement='right'
                    visible={this.state.showModal6}
                    onClose={() => { this.setState({ step_3_remark: '', showModal6: false }) }}
                    width={450}
                >
                    {this.renderRunerModal()}
                </Drawer >
                <Drawer
                    title="查看图片"
                    placement="left"
                    visible={this.state.showModal1}
                    onClose={() => { this.setState({ showModal1: false }); }}
                    width={450}
                    bodyStyle={{ padding: 10 }}
                >
                    <div style={{ textAlign: 'center', display: this.state.showLoading ? 'block' : 'none' }}><Spin tip='努力加载中。。。' /></div>
                    <img alt='' src={Testuri + 'get_jpg?uuid=' + this.state.imguuid} style={{ width: 430, height: 430 / 3 * 4, display: this.state.showLoading ? 'none' : 'block' }} onLoad={() => { console.log('图片加载完成'); this.setState({ showLoading: false }) }} />
                </Drawer>
            </Fragment >
        );
    }
}