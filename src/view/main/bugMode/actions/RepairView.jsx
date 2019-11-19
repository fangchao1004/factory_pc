import React, { Component } from 'react';
import { Drawer, Button, Row, Col, Input } from 'antd';

var storage = window.localStorage;
var localUserInfo = '';
// var bugType_Options = [];///缺陷类型

/**
 * 维修界面
 * 
 * 以及维修专工
 * 如果当前缺陷状态为0，且自己有维修专工权限。则回退按钮禁用，去完成按钮点后，会在0字段处自动添加 领取缺陷的记录
 */
class RepairView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showModal: false,
            step_1_remark: '',///维修界面的备注
            bug_status: 0,///当前缺陷的状态
            isRepairManager: false,///是否有维修专工权限
            bug_type_id: null,///缺陷类型id
        }
    }
    componentDidMount() {
        localUserInfo = storage.getItem('userinfo');
        this.setState({
            isRepairManager: JSON.parse(localUserInfo).permission && JSON.parse(localUserInfo).permission.indexOf('3') !== -1
        })
    }
    componentWillReceiveProps(nextProps) {
        this.setState({
            showModal: nextProps.showModal,
            bug_status: nextProps.status
        })
    }
    ////维修工的界面
    renderWorkerModal = () => {
        return (
            <div>
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
                <Row gutter={16}>
                    <Col span={5}>
                        <span>备注:</span>
                    </Col>
                    <Col span={18}>
                        <Input.TextArea value={this.state.step_1_remark} style={{ width: '100%' }} placeholder='可用来说明相关情况' onChange={(e) => { this.setState({ step_1_remark: e.target.value }) }}></Input.TextArea>
                    </Col>
                </Row>
                <div style={{ marginTop: 20 }}>
                    {/* <Button type={'ghost'}
                        onClick={() => {
                            //// 人员选择完毕。改变bug中的数据。status 和 remark
                            let remarkText = this.state.step_1_remark ? this.state.step_1_remark : '暂缓维修工作';
                            this.props.changeBugStatus(1, 1, remarkText, JSON.parse(localUserInfo).id);
                            this.setState({ step_1_remark: '' })
                            this.props.onClose();
                        }}>暂缓工作</Button> */}
                    <Button type={'danger'}
                        disabled={this.state.isRepairManager && this.state.bug_status === 0}
                        style={{ marginLeft: 20 }}
                        onClick={() => {
                            //// 人员选择完毕。改变bug中的数据。status 和 remark
                            let remarkText = this.state.step_1_remark ? this.state.step_1_remark : '回退工作,重新分配';
                            this.props.changeBugStatus(0, 1, remarkText, this.state.bug_type_id, JSON.parse(localUserInfo).id);
                            this.reset();
                            this.props.onClose();
                        }}>回退工作</Button>
                    <Button type={'primary'}
                        style={{ marginLeft: 20 }}
                        onClick={() => {
                            const bug_type_id = this.state.bug_type_id;
                            //// 人员选择完毕。改变bug中的数据。status 和 remark
                            let remarkText = this.state.step_1_remark ? this.state.step_1_remark : '完成维修工作,等待专工验收';
                            if (this.state.isRepairManager && this.state.bug_status === 0) {
                                this.props.changeBugStatus(1, 0, '维修专工自行处理', this.state.bug_type_id, JSON.parse(localUserInfo).id, JSON.parse(localUserInfo).id);
                            }
                            setTimeout(() => {
                                this.props.changeBugStatus(2, 1, remarkText, bug_type_id, JSON.parse(localUserInfo).id);
                            }, 500);
                            this.reset();
                            this.props.onClose();
                        }}>完成工作</Button>
                </div>
            </div>
        )
    }

    reset = () => {
        this.setState({ step_1_remark: '', bug_type_id: null });
    }

    render() {
        return (
            < Drawer
                title="维修处理"
                placement='right'
                visible={this.state.showModal}
                onClose={() => { this.props.onClose(); this.reset() }}
                width={450}
            >
                {this.renderWorkerModal()}
            </Drawer >
        );
    }
}

export default RepairView;