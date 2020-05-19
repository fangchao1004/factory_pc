import React, { Component } from 'react';
import { Select, TreeSelect, Input, message, Modal, Form, Tooltip } from 'antd'
import HttpApi from '../../util/HttpApi'
import { transfromDataTo3level } from '../../util/Tool'
import moment from 'moment'

const { TextArea } = Input;
var storage = window.localStorage;
var localUserInfo = '';
const bug_level_Options = [{ id: 1, name: '一级' }, { id: 2, name: '二级' }, { id: 3, name: '三级' }].map(bug_level => <Select.Option value={bug_level.id} key={bug_level.id}>{bug_level.name}</Select.Option>)
var major_Options = [];///专业选项
// var bugType_Options = [];///缺陷类型
var area123_List = [];///三级区域选项 (树形结构 利用TreeSelect组件 直接提供对应的json数据结构)

const valueMap = {};

function loops(list, parent) {
    return (list || []).map(({ children, value, title }) => {
        const node = (valueMap[value] = {
            parent,
            value,
            title
        });
        node.children = loops(children, node);
        return node;
    });
}

function getPathAndTitle(value) {
    const pathAndTitle = [];
    let current = valueMap[value];
    while (current) {
        pathAndTitle.unshift({
            value: current.value,
            name: current.title
        });
        current = current.parent;
    }
    return pathAndTitle;
}

/**
 * 添加缺陷界面
 */
class AddBugView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showModal: false,
            ////添加bug
            bug_level_select_id: null,
            major_select_id: null,
            area_remark: null, /// ///选择器上显示的 多级区域文字值
            bug_text: null,
        }
    }
    componentDidMount() {
        this.init();
        localUserInfo = storage.getItem('userinfo');
    }
    componentWillReceiveProps(nextProps) {
        this.setState({
            showModal: nextProps.showModal
        })
    }
    init = async () => {
        let result = await HttpApi.getArea123Info();
        area123_List = transfromDataTo3level(result);/// 获取三级区域数据后，给添加的区域的对话框中，选择区域的树形组件添加数据源
        loops(area123_List);
        let marjorData = await this.getMajorInfo();
        major_Options = marjorData.map((major, index) => <Select.Option value={major.id} key={major.id}><Tooltip key={index} title={major.name}>{major.name}</Tooltip></Select.Option>)
        this.forceUpdate();
    }
    reset = () => {
        this.setState({
            bug_level_select_id: null,
            major_select_id: null,
            area_remark: null, /// ///选择器上显示的 多级区域文字值
            bug_text: null,
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
    onCancelHandler = () => {
        this.props.cancel()
        this.refs.bugFormRef.resetFields();
    }
    onOkHandler = () => {
        this.refs.bugFormRef.validateFields((error, values) => {
            if (!error) {
                values.area_remark = getPathAndTitle(values.area_remark).map((item) => item.name).join('/')
                let valueObj = {
                    user_id: JSON.parse(localUserInfo).id,
                    major_id: values.major_id,
                    content: JSON.stringify({ select: '', text: values.bug_text, imgs: [] }),
                    buglevel: values.level_id,
                    area_remark: values.area_remark,
                    status: 0,
                    checkedAt: moment().format('YYYY-MM-DD HH:mm:ss'),
                    last_status_time: moment().format('YYYY-MM-DD HH:mm:ss'),
                }
                HttpApi.addBugInfo(valueObj, (res) => {
                    if (res.data.code === 0) {
                        message.success('上传成功');
                        this.props.ok();
                        this.onCancelHandler();
                        let sql = `select distinct user_id from user_map_major where mj_id = ${values.major_id} and effective = 1`
                        HttpApi.obs({ sql }, (res) => {
                            if (res.data.code === 0 && res.data.data.length > 0) {
                                let useridList = res.data.data.map((item) => { return item.user_id })
                                console.log('待推送useridList:', useridList)
                                // HttpApi.pushnotice({ user_id: useridList, title: '缺陷通知', text: '您有最新的相关缺陷,请注意查看' })
                            }
                        })
                    }
                })
            }
        })
    }
    render() {
        return (
            <Modal
                title="添加缺陷"
                visible={this.state.showModal}
                onCancel={this.onCancelHandler}
                onOk={this.onOkHandler}
                width={520}
            >
                <BugForm ref={'bugFormRef'} />
            </Modal>
        );
    }
}

export default AddBugView;


function AddBugFrom(props) {
    const { getFieldDecorator } = props.form
    return <Form>
        <Form.Item label="紧急类型:" labelCol={{ span: 6 }} wrapperCol={{ span: 15 }}>
            {getFieldDecorator('level_id', {
                rules: [{ required: true, message: '请选择紧急类型' }]
            })(<Select style={{ width: '100%' }} placeholder="请选择在紧急类型">{bug_level_Options}</Select>)}
        </Form.Item>
        <Form.Item label="缺陷专业:" labelCol={{ span: 6 }} wrapperCol={{ span: 15 }}>
            {getFieldDecorator('major_id', {
                rules: [{ required: true, message: '请选择缺陷专业' }]
            })(<Select style={{ width: '100%' }} placeholder="请选择缺陷专业">{major_Options}</Select>)}
        </Form.Item>
        <Form.Item label="所在范围:" labelCol={{ span: 6 }} wrapperCol={{ span: 15 }}>
            {getFieldDecorator('area_remark', {
                rules: [{ required: true, message: '请选择在范围' }]
            })(
                <TreeSelect style={{ width: '100%' }} treeNodeFilterProp="title" showSearch dropdownStyle={{ maxHeight: 400, overflow: 'auto' }} treeData={area123_List} placeholder="请选择在范围" />
            )}
        </Form.Item>
        {/* <Form.Item label="描述类别:" labelCol={{ span: 6 }} wrapperCol={{ span: 15 }}>
            {getFieldDecorator('bug_type_id', {
                rules: [{ required: true, message: '请选择类别' }]
            })(<Select style={{ width: '100%' }} placeholder="请选择类别">{bugType_Options}</Select>)}
        </Form.Item> */}
        <Form.Item label="问题描述:" labelCol={{ span: 6 }} wrapperCol={{ span: 15 }}>
            {getFieldDecorator('bug_text', {
                rules: [{ required: true, message: '请输入问题描述' }]
            })(<TextArea style={{ width: '100%' }} placeholder='请输入问题描述'></TextArea>)}
        </Form.Item>
    </Form>
}

const BugForm = Form.create({ name: 'bugForm' })(AddBugFrom)