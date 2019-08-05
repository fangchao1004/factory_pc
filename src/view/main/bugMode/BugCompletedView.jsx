import React, { Component, Fragment } from 'react';
import { Table, Tag, Modal, Button, Steps, Select, message, Input, Row, Col, Spin, Drawer, Popconfirm, Divider } from 'antd'
import HttpApi, { Testuri } from '../../util/HttpApi'
import moment from 'moment'
const { Step } = Steps;
const { TextArea } = Input;
var major_filter = [];///用于筛选任务专业的数据 选项
var storage = window.localStorage;
var localUserInfo = '';
var userOptions = [];///人员选项
const bug_level_Options = [{ id: 1, name: '一级' }, { id: 2, name: '二级' }, { id: 3, name: '三级' }].map(bug_level => <Select.Option value={bug_level.id} key={bug_level.id}>{bug_level.name}</Select.Option>)
var major_Options = [];///专业选项

export default class BugCompletedView extends Component {
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
            imguuid: null,
            userData: [],
            currentRecord: {},///当前选择的某一行。某一个缺陷对象

            user_select_id: null, ///分配的维修人员的id
            step_0_remark: '',///分配时的备注
            step_1_remark: '',///维修界面的备注
            step_2_remark: '',///专工验收界面的备注
            step_3_remark: '',///运行验收界面的备注

            ////添加bug
            bug_level_select_id: null,
            major_select_id: null,
            area_remark: null,
            bug_text: null,
        }
    }
    componentDidMount() {
        this.init();
        localUserInfo = storage.getItem('userinfo');
    }
    init = async () => {
        major_filter.length = 0;
        let marjorData = await this.getMajorInfo();
        marjorData.forEach((item) => { major_filter.push({ text: item.name, value: item.id }) })
        // console.log('marjorData:', marjorData);
        major_Options = marjorData.map(major => <Select.Option value={major.id} key={major.id}>{major.name}</Select.Option>)

        let finallyData = await this.getBugsInfo();///从数据库中获取最新的bugs数据
        finallyData.forEach((item) => { item.key = item.id + '' })
        // console.log('bug数据：', finallyData);
        let userData = await this.getUsersInfo();
        // console.log('userData:', userData);
        userOptions = userData.map(user => <Select.Option value={user.id} key={user.id}>{user.name}</Select.Option>)
        this.setState({
            data: finallyData,
            userData
        })
    }
    getUsersInfo = () => {
        return new Promise((resolve, reject) => {
            let sqlText = 'select * from users order by convert(name using gbk) ASC'
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
    getBugsInfo = () => {
        let sqlText = `select bugs.*,des.name as device_name,urs.name as user_name,mjs.name as major_name,areas.name as area_name from bugs
        left join devices des on bugs.device_id = des.id
        left join users urs on bugs.user_id = urs.id
        left join majors mjs on bugs.major_id = mjs.id
        left join areas on des.area_id = areas.id
        where bugs.status = 4 and bugs.effective = 1
        `;
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
    ////缺陷分配界面
    renderSelectWorkerModal = () => {
        return (<div>
            <Row gutter={16}>
                <Col span={5}>
                    <span>人员选择:</span>
                </Col>
                <Col span={18}>
                    <Select
                        showSearch
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                        value={this.state.user_select_id} defaultValue={null} style={{ width: '100%' }}
                        onChange={(v) => { this.setState({ user_select_id: v }) }}
                    >{userOptions}</Select>
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
                            this.setState({ user_select_id: null, step_0_remark: '', showModal3: false })
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
                            //// 人员选择完毕。改变bug中的数据。status 和 remark
                            let remarkText = this.state.step_2_remark ? this.state.step_2_remark : '完成验收,等待运行验收';
                            this.changeBugStatus(3, 2, remarkText, JSON.parse(localUserInfo).id);
                            this.setState({ step_2_remark: '', showModal5: false })
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
        if (toId !== null) {
            newValue.fix_id = toId;
        }
        HttpApi.updateBugInfo({ query: { id: this.state.currentRecord.id }, update: newValue }, (res) => {
            if (res.data.code === 0) {
                ///成功以后要立即刷新当前的bug数据。
                HttpApi.getBugInfo({ id: this.state.currentRecord.id }, (res) => {
                    if (res.data.code === 0) {
                        message.success('发布成功');
                        this.setState({ currentRecord: res.data.data[0] })
                        ////如果是状态4 则说明这个bug已经解决了。要把这个bug对应的record给更新（复制原有数据，本地修改，再作为新数据插入数据库record表）
                        if (targetStatus === 4) { this.changeRecordData(); }
                    }
                })
            }
        })
        ////同时要刷新整个表中的数据
        this.init();
    }

    ////改变包含了这个bug_id 的record 再数据库中的值。
    changeRecordData = async () => {
        let bugId = this.state.currentRecord.id;
        ///1，要根据bug_id 去bugs表中去查询该条数据，获取其中的 device_id 字段信息
        let oneBugInfo = await this.getOneBugInfo(bugId);
        let device_id = oneBugInfo.device_id;
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
            ///有运行权限，且 status = 3 时 可用。disableFlag = false;
            if (localUserInfo && JSON.parse(localUserInfo).permission && this.state.currentRecord.remark) {
                if (JSON.parse(localUserInfo).permission && JSON.parse(localUserInfo).permission.indexOf('1') !== -1 && this.state.currentRecord.status === 3) {
                    disabledFlag = false;
                }
            }
        }
        return disabledFlag;
    }

    deleteBugsHandler = (record) => {
        HttpApi.obs({ sql: `update bugs set effective= 0 where id = ${record.id} ` }, (res) => {
            if (res.data.code === 0) {
                message.success('移除缺陷成功');
                this.init();
            }
        })
    }

    render() {
        const columns = [
            {
                key: 'id',
                dataIndex: 'id',
                title: 'id',
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
                    return <div>{resultCom}</div>
                }
            },
            {
                key: 'content', dataIndex: 'content', title: '内容', render: (text, record) => {
                    let obj = JSON.parse(text);
                    return <div><div style={{ color: '#438ef7' }}>{record.title_name}</div><div>{obj.select}</div><div>{obj.text}</div></div>
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
                        comArr.push(<span key={item.uuid} style={{ color: '#438ef7', marginRight: 10, cursor: "pointer" }}
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
                align: 'center',
                render: (text, record) => {
                    let str = '';
                    let color = '#888888'
                    if (text === 0) { str = '待分配' } else if (text === 1) { str = '维修中'; color = '#FF9999' } else if (text === 2) { str = '专工验收中'; color = '#6699CC' }
                    else if (text === 3) { str = '运行验收中'; color = '#9933CC' } else if (text === 4) { str = '处理完毕'; color = '#87d068' }
                    return <Tag color={color}>{str}</Tag>;
                }
            },
            {
                title: '操作',
                dataIndex: 'actions',
                width: 150,
                render: (text, record) => (
                    <div style={{ textAlign: 'center' }}>
                        <Button size="small" type="primary" onClick={() => { this.actionsHandler(record) }}>查看</Button>
                        {JSON.parse(localUserInfo).isadmin === 1 ?
                            <Fragment>
                                <Divider type="vertical" />
                                <Popconfirm title="确定要删除该专业吗?" onConfirm={() => { this.deleteBugsHandler(record); }}>
                                    <Button size="small" type="danger">删除</Button>
                                </Popconfirm>
                            </Fragment> : null
                        }
                    </div>
                )
            }
        ]
        return (
            <div>
                {/* <Button type={'primary'} style={{ marginBottom: 20 }} onClick={() => { this.setState({ showModal7: true }) }}>添加缺陷</Button> */}
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
                    width={500}
                >
                    {this.renderAddBugModal()}
                </Modal>
                {/* 进度界面 */}
                <Modal
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
                </Modal>
                {/* 分配人员操作界面 */}
                <Drawer
                    title="分配维修人员"
                    placement='right'
                    visible={this.state.showModal3}
                    onClose={() => { this.setState({ user_select_id: null, step_0_remark: '', showModal3: false }) }}
                    width={450}
                >
                    {this.renderSelectWorkerModal()}
                </Drawer>
                {/* 维修人员操作界面 */}
                <Drawer
                    title="维修处理"
                    placement='right'
                    visible={this.state.showModal4}
                    onClose={() => { this.setState({ step_1_remark: '', showModal4: false }) }}
                    width={450}
                >
                    {this.renderWorkerModal()}
                </Drawer>
                {/* 专工验收操作界面 */}
                <Drawer
                    title="专工验收处理"
                    placement='right'
                    visible={this.state.showModal5}
                    onClose={() => { this.setState({ step_2_remark: '', showModal5: false }) }}
                    width={450}
                >
                    {this.renderManagerModal()}
                </Drawer>
                {/* 运行验收操作界面 */}
                <Drawer
                    title="运行验收处理"
                    placement='right'
                    visible={this.state.showModal6}
                    onClose={() => { this.setState({ step_3_remark: '', showModal6: false }) }}
                    width={450}
                >
                    {this.renderRunerModal()}
                </Drawer>
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
            </div>
        );
    }
}