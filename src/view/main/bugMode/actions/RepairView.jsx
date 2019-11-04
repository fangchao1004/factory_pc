import React, { Component } from 'react';
import { Drawer, Button, Row, Col, Input } from 'antd';

var storage = window.localStorage;
var localUserInfo = '';

/**
 * 维修界面
 */
class RepairView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showModal: false,
            step_1_remark: '',///维修界面的备注
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
    init = () => {

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
                            this.props.changeBugStatus(1, 1, remarkText, JSON.parse(localUserInfo).id);
                            this.setState({ step_1_remark: '' })
                            this.props.onClose();
                        }}>暂缓工作</Button>
                    <Button type={'danger'}
                        style={{ marginLeft: 20 }}
                        onClick={() => {
                            //// 人员选择完毕。改变bug中的数据。status 和 remark
                            let remarkText = this.state.step_1_remark ? this.state.step_1_remark : '回退工作,重新分配';
                            this.props.changeBugStatus(0, 1, remarkText, JSON.parse(localUserInfo).id);
                            this.setState({ step_1_remark: '' })
                            this.props.onClose();
                        }}>回退工作</Button>
                    <Button type={'primary'}
                        style={{ marginLeft: 20 }}
                        onClick={() => {
                            //// 人员选择完毕。改变bug中的数据。status 和 remark
                            let remarkText = this.state.step_1_remark ? this.state.step_1_remark : '完成维修工作,等待专工验收';
                            this.props.changeBugStatus(2, 1, remarkText, JSON.parse(localUserInfo).id);
                            this.setState({ step_1_remark: '' })
                            this.props.onClose();
                        }}>完成工作</Button>
                </div>
            </div>
        )
    }

    render() {
        return (
            < Drawer
                title="维修处理"
                placement='right'
                visible={this.state.showModal}
                onClose={() => { this.setState({ step_1_remark: '' }); this.props.onClose(); }}
                width={450}
            >
                {this.renderWorkerModal()}
            </Drawer >
        );
    }
}

export default RepairView;