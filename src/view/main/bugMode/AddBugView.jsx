import React, { Component } from 'react';
import { Row, Col, Select, TreeSelect, Input, Button, message, Modal } from 'antd'
import HttpApi from '../../util/HttpApi'
import { transfromDataTo3level } from '../../util/Tool'

const { TextArea } = Input;
var storage = window.localStorage;
var localUserInfo = '';
const bug_level_Options = [{ id: 1, name: '一级' }, { id: 2, name: '二级' }, { id: 3, name: '三级' }].map(bug_level => <Select.Option value={bug_level.id} key={bug_level.id}>{bug_level.name}</Select.Option>)
var major_Options = [];///专业选项
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
        major_Options = marjorData.map(major => <Select.Option value={major.id} key={major.id}>{major.name}</Select.Option>)
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
    render() {
        return (
            <div>
                <Modal
                    title="添加缺陷"
                    visible={this.state.showModal}
                    onCancel={() => { this.setState({ showModal: false }) }}
                    footer={null}
                    width={520}
                >
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
                            <span>所在范围:</span>
                        </Col>
                        <Col span={18}>
                            <TreeSelect
                                style={{ width: '100%' }}
                                treeNodeFilterProp="title"
                                showSearch
                                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                                treeData={area123_List}
                                placeholder="请选择在范围"
                                value={this.state.area_remark}
                                onChange={(v, e) => {
                                    let pathAndTitle = getPathAndTitle(v);
                                    let titleArr = pathAndTitle.map((item) => {
                                        return item.name
                                    })
                                    let titleStr = titleArr.join('/');
                                    this.setState({
                                        area_remark: titleStr
                                    })
                                }}
                            />
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
                                this.reset();
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
                                        if (res.data.code === 0) {
                                            message.success('上传成功');
                                            this.reset();
                                            this.props.ok();
                                        }
                                    })
                                } else { message.error('请完善相关信息') }
                            }}>确定</Button>
                        </Col>
                    </Row>
                </Modal>
            </div>
        );
    }
}

export default AddBugView;