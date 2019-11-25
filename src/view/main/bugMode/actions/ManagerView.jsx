import React, { Component } from 'react';
import { Drawer, Button, Row, Col, Input, message, TreeSelect } from 'antd';
import HttpApi from '../../../util/HttpApi';
import { transfromDataToRunerAndGroupLeader } from '../../../util/Tool'
const { SHOW_CHILD } = TreeSelect;

// var runner_Options = [];///运行选项

// var bugType_Options = [];///缺陷类型
var storage = window.localStorage;
var localUserInfo = '';
/**
 * 专工界面
 */
class ManagerView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showModal: false,
            step_2_remark: '',///专工验收界面的备注
            runner_select_id: null,///选择的运行人员id
            bug_type_id: null,///缺陷类型id
            ableGoBackRepair: true,
            myTest: null,
            treeData: [],
            selectRunerList: [],
        }
    }
    componentDidMount() {
        this.init();
        localUserInfo = storage.getItem('userinfo');
    }
    componentWillReceiveProps(nextProps) {
        this.setState({
            showModal: nextProps.showModal,
            ableGoBackRepair: nextProps.ableGoBackRepair
        })
    }
    init = async () => {
        let runnerData = await this.getRunnerInfo();///获取有运行权限的人员
        this.setState({
            treeData: transfromDataToRunerAndGroupLeader(runnerData)
        })
        // runner_Options = runnerData.map(userInfo => <Select.Option value={userInfo.id} key={userInfo.id}>{userInfo.name}</Select.Option>)
        // let bugTypeData = await this.getBugTypeInfo();
        // bugType_Options = bugTypeData.map(major => <Select.Option value={major.id} key={major.id}>{major.name}</Select.Option>)
    }
    getRunnerInfo = () => {
        return new Promise((resolve, reject) => {
            let sqlText = `select * from users where permission like '%1%' and effective = 1`
            HttpApi.obs({ sql: sqlText }, (res) => {
                let result = [];
                if (res.data.code === 0) {
                    result = res.data.data
                }
                resolve(result);
            })
        })
    }
    // getBugTypeInfo = () => {
    //     let sql = `select bt.id,bt.name from bug_types bt where effective = 1`
    //     return new Promise((resolve, reject) => {
    //         HttpApi.obs({ sql }, (res) => {
    //             let result = [];
    //             if (res.data.code === 0) {
    //                 result = res.data.data
    //             }
    //             resolve(result);
    //         })
    //     })
    // }
    /////专工界面
    renderManagerModal = () => {
        return (
            <div>
                <Row gutter={16}>
                    <Col span={5}>
                        <span>运行人员选择(必选):</span>
                    </Col>
                    <Col span={18}>
                        {/* <Select showSearch={true} value={this.state.runner_select_id} defaultValue={null} style={{ width: '100%' }}
                            onChange={(v) => { this.setState({ runner_select_id: v }) }}
                            filterOption={(input, option) =>
                                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                        >{runner_Options}</Select> */}
                        <TreeSelect
                            style={{ width: '100%' }}
                            treeData={this.state.treeData}
                            value={this.state.selectRunerList}
                            onChange={(v) => { this.setState({ selectRunerList: v }) }}
                            treeCheckable={true}
                            allowClear={true}
                            treeDefaultExpandedKeys={['1']}
                            showCheckedStrategy={SHOW_CHILD}
                            treeNodeFilterProp="title"
                            searchPlaceholder='选择运行人员' />
                    </Col>
                </Row>
                {/* <Row gutter={16} style={{ marginTop: 20 }}>
                    <Col span={5}>
                        <span>备注类别(非必选):</span>
                    </Col>
                    <Col span={18}>
                        <Select style={{ width: '100%' }} value={this.state.bug_type_id} onChange={(v) => {
                            this.setState({ bug_type_id: v })
                        }}>{bugType_Options}</Select>
                    </Col>
                </Row> */}
                <Row gutter={16} style={{ marginTop: 20 }}>
                    <Col span={5}>
                        <span>备注文本(非必填):</span>
                    </Col>
                    <Col span={18}>
                        <Input.TextArea value={this.state.step_2_remark} style={{ width: '100%' }} placeholder='可用来说明相关情况' onChange={(e) => { this.setState({ step_2_remark: e.target.value }) }}></Input.TextArea>
                    </Col>
                </Row>
                <div style={{ marginTop: 20 }}>
                    {/* <Button type={'ghost'}
                        onClick={() => {
                            //// 人员选择完毕。改变bug中的数据。status 和 remark
                            let remarkText = this.state.step_2_remark ? this.state.step_2_remark : '暂缓验收工作';
                            this.props.changeBugStatus(2, 2, remarkText, JSON.parse(localUserInfo).id);
                            this.setState({ step_2_remark: '' })
                            this.props.onClose();
                        }}>暂缓工作</Button> */}
                    <Button type={'danger'}
                        style={{ marginLeft: 20 }}
                        disabled={!this.state.ableGoBackRepair}
                        onClick={() => {
                            //// 人员选择完毕。改变bug中的数据。status 和 remark
                            let remarkText = this.state.step_2_remark ? this.state.step_2_remark : '验收不通过，重新维修';
                            this.props.changeBugStatus(1, 2, remarkText, JSON.parse(localUserInfo).id);
                            this.reset();
                            this.props.onClose();
                        }}>重新维修</Button>
                    <Button type={'primary'}
                        style={{ marginLeft: 20 }}
                        onClick={() => {
                            if (this.state.selectRunerList.length === 0) { message.error('请选择运行人员进行下一步验收工作'); return }
                            /// 人员选择完毕。改变bug中的数据。status 和 remark
                            let remarkText = this.state.step_2_remark ? this.state.step_2_remark : '完成验收,等待运行验收';
                            this.props.changeBugStatus(3, 2, remarkText, JSON.parse(localUserInfo).id, [null, ...this.state.selectRunerList, null]);
                            this.reset();
                            this.props.onClose();
                        }}>完成验收</Button>
                </div>
            </div >
        )
    }

    reset = () => {
        this.setState({ step_2_remark: '', runner_select_id: null, bug_type_id: null, selectRunerList: [] });
    }

    render() {
        return (
            < Drawer
                title="专工验收处理"
                placement='right'
                visible={this.state.showModal}
                onClose={() => { this.reset(); this.props.onClose(); }}
                width={450}
            >
                {this.renderManagerModal()}
            </Drawer >
        );
    }
}

export default ManagerView;
