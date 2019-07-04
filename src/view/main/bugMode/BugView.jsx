import React, { Component } from 'react';
import { Table, Tag, Modal, Popconfirm, Button, Divider, Steps, Select, message, Input, Row, Col } from 'antd'
import HttpApi, { Testuri } from '../../util/HttpApi'
import moment from 'moment'
const { Step } = Steps;
var major_filter = [];///用于筛选任务专业的数据 选项
var status_filter = [{ text: '待分配', value: 0 }, { text: '维修中', value: 1 },
{ text: '专工验收中', value: 2 }, { text: '运行验收中', value: 3 }, { text: '处理完毕', value: 4 }];///用于筛选状态的数据
var storage = window.localStorage;
var localUserInfo = '';
var userOptions = [];

export default class BugView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            showModal: false,
            showModal2: false,
            showModal3: false,
            showModal4: false,
            showModal5: false,
            showModal6: false,
            imguuid: null,
            userData: [],
            currentRecord: {},///当前选择的某一行。某一个缺陷对象

            user_select_id: null, ///分配的维修人员的id
            step_0_remark: '',///分配时的备注
            step_1_remark: '',///维修界面的备注
            step_2_remark: '',///专工验收界面的备注
            step_3_remark: ''///运行验收界面的备注
        }
    }
    componentDidMount() {
        this.init();
        localUserInfo = storage.getItem('userinfo');
        // console.log(localUserInfo);
    }
    init = async () => {
        major_filter.length = 0;
        let marjorData = await this.getMajorInfo();
        marjorData.forEach((item) => { major_filter.push({ text: item.name, value: item.id }) })
        // console.log('marjorData:', marjorData);
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
    getBugsInfo = () => {
        let sql1 = ' select bugs.*,des.name as device_name,urs.name as user_name,mjs.name as major_name,areas.name as area_name from bugs'
        let sql2 = ' left join devices des on bugs.device_id = des.id '
        let sql3 = ' left join users urs on bugs.user_id = urs.id'
        let sql4 = ' left join majors mjs on bugs.major_id = mjs.id'
        let sql5 = ' left join areas on des.area_id = areas.id'
        let sqlText = sql1 + sql2 + sql3 + sql4 + sql5;
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
    actionsHandler = (record) => {
        // console.log('详情：', record);
        // console.log('localUserInfo:',localUserInfo);
        this.setState({ showModal2: true, currentRecord: record })
    }
    deleteBugs = (record) => {
        // console.log('删除：', record);
    }
    ///根据userid 查找 username
    getLocalUserName = (userId) => {
        let name = '';
        if (this.state.userData && this.state.userData.length > 0) { this.state.userData.forEach((item) => { if (item.id === userId) { name = item.name } }) }
        return name;
    }
    ////缺陷分配界面
    renderSelectWorkerModal = () => {
        return (<div>
            <Row gutter={16}>
                <Col span={4}>
                    <span>人员选择:</span>
                </Col>
                <Col span={18}>
                    <Select value={this.state.user_select_id} defaultValue={null} style={{ width: '100%' }}
                        onChange={(v) => { this.setState({ user_select_id: v }) }}
                    >{userOptions}</Select>
                </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: 20 }}>
                <Col span={4}>
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
                    <Col span={4}>
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
                    <Col span={4}>
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
                    <Col span={4}>
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
            if (toId) {
                remarkCopy[currentStep].push({ from: fromId, to: toId, remark: remarkText, time: moment().format('YYYY-MM-DD HH:mm:ss') });
            } else {
                remarkCopy[currentStep].push({ from: fromId, remark: remarkText, time: moment().format('YYYY-MM-DD HH:mm:ss') });
            }
        } else {
            if (toId) {
                remarkCopy[currentStep] = [{ from: fromId, to: toId, remark: remarkText, time: moment().format('YYYY-MM-DD HH:mm:ss') }]
            } else {
                remarkCopy[currentStep] = [{ from: fromId, remark: remarkText, time: moment().format('YYYY-MM-DD HH:mm:ss') }]
            }
        }
        ///将最新的 remark 数据 更新到 bugs 表中。并且判断要把 status 改到哪一步
        HttpApi.updateBugInfo({ query: { id: this.state.currentRecord.id }, update: { status: targetStatus, remark: JSON.stringify(remarkCopy) } }, (res) => {
            if (res.data.code === 0) {
                ///成功以后要立即刷新当前的bug数据。
                HttpApi.getBugInfo({ id: this.state.currentRecord.id }, (res) => {
                    if (res.data.code === 0) {
                        message.success('发布成功');
                        this.setState({ currentRecord: res.data.data[0] })
                    }
                })
            }
        })
        ////同时要刷新整个表中的数据
        this.init();
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
                renderArr.forEach((item) => {
                    let text = ''
                    let remarkText = item.remark ? '  备注:' + item.remark : '';
                    if (item.to) {
                        text = item.time + '  ' + this.getLocalUserName(item.from) + '  分配给 ' + this.getLocalUserName(item.to) + remarkText;
                    } else {
                        text = item.time + '  ' + this.getLocalUserName(item.from) + remarkText;
                    }
                    oneStepContent.push(<div key={oneStepContent.length}>{text}</div>)
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
            if (localUserInfo && JSON.parse(localUserInfo).id && this.state.currentRecord.remark && this.state.currentRecord.status === 1) {
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

    render() {
        const columns = [
            {
                key: 'createdAt', dataIndex: 'createdAt', title: '时间',
                // width: 190,
                sorter: (a, b) => {
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                },
                defaultSortOrder: 'descend',
                render: (text, record) => { return <div>{moment(text).format('YYYY-MM-DD HH:mm:ss')}</div> }
            },
            {
                key: 'device_name', dataIndex: 'device_name', title: '设备',
                // width: 120, 
                render: (text) => {
                    let result = '/'
                    if (text && text !== '') { result = text }
                    return <div>{result}</div>
                }
            },
            {
                key: 'user_name', dataIndex: 'user_name', title: '上报人',
                // width: 80 
            },
            // { key: 'status', dataIndex: 'status', title: '状态', width: 80 },
            {
                key: 'area_remark', dataIndex: 'area_remark', title: '区域',
                // width: 100, 
                render: (text, record) => {
                    let result = '/'
                    if (text) { result = text }
                    else { result = record.area_name }
                    return <div>{result}</div>
                }
            },
            {
                key: 'buglevel', dataIndex: 'buglevel', title: '等级',
                // width: 80, 
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
                                this.setState({
                                    imguuid: item.uuid,
                                    showModal: true
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
                onFilter: (value, record) => record.status === value,
                render: (text, record) => {
                    let str = '';
                    if (text === 0) { str = '待分配' } else if (text === 1) { str = '维修中' } else if (text === 2) { str = '专工验收中' }
                    else if (text === 3) { str = '运行验收中' } else if (text === 4) { str = '处理完毕' }
                    return str;
                }
            },
            {
                title: '操作',
                dataIndex: 'actions',
                width: 150,
                render: (text, record) => (
                    <div style={{ textAlign: 'center' }}>
                        <Popconfirm title={<div><div>确定要删除该缺陷记录吗?</div><div>可能会造成设备的巡检记录显示不全</div></div>} onConfirm={() => { this.deleteBugs(record) }}>
                            <Button size="small" type="danger">删除</Button>
                        </Popconfirm>
                        <Divider type="vertical" />
                        <Button size="small" type="primary" onClick={() => { this.actionsHandler(record) }}>处理</Button>
                    </div>
                )
            }
        ]
        return (
            <div>
                <Table
                    bordered
                    dataSource={this.state.data}
                    columns={columns}
                />
                <Modal
                    title="图片查看"
                    visible={this.state.showModal}
                    onCancel={() => { this.setState({ showModal: false }) }}
                    footer={null}
                    width={500}
                >
                    <img alt='' src={Testuri + 'get_jpg?uuid=' + this.state.imguuid} style={{ width: 450, height: 600 }} />
                </Modal>
                {/* 进度界面 */}
                <Modal
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
                <Modal
                    title="分配维修人员"
                    visible={this.state.showModal3}
                    onCancel={() => { this.setState({ user_select_id: null, step_0_remark: '', showModal3: false }) }}
                    footer={null}
                    width={520}
                >
                    {this.renderSelectWorkerModal()}
                </Modal>
                {/* 维修人员操作界面 */}
                <Modal
                    title="维修处理"
                    visible={this.state.showModal4}
                    onCancel={() => { this.setState({ step_1_remark: '', showModal4: false }) }}
                    footer={null}
                    width={520}
                >
                    {this.renderWorkerModal()}
                </Modal>
                {/* 专工验收操作界面 */}
                <Modal
                    title="专工验收处理"
                    visible={this.state.showModal5}
                    onCancel={() => { this.setState({ step_2_remark: '', showModal5: false }) }}
                    footer={null}
                    width={520}
                >
                    {this.renderManagerModal()}
                </Modal>
                {/* 运行验收操作界面 */}
                <Modal
                    title="运行验收处理"
                    visible={this.state.showModal6}
                    onCancel={() => { this.setState({ step_3_remark: '', showModal6: false }) }}
                    footer={null}
                    width={520}
                >
                    {this.renderRunerModal()}
                </Modal>
            </div>
        );
    }
}