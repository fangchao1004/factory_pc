import React, { Component } from 'react';
import { Drawer, Button, Row, Col, Input } from 'antd';

var storage = window.localStorage;
var localUserInfo = '';
/**
 * 运行人员界面
 */
class RunnerView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showModal: false,
            step_3_remark: ''
        }
    }
    componentDidMount() {
        localUserInfo = storage.getItem('userinfo');
    }
    componentWillReceiveProps(nextProps) {
        this.setState({
            showModal: nextProps.showModal
        })
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
                    {/* <Button type={'ghost'}
                        onClick={() => {
                            //// 人员选择完毕。改变bug中的数据。status 和 remark
                            let remarkText = this.state.step_3_remark ? this.state.step_3_remark : '暂缓验收工作';
                            this.props.changeBugStatus(3, 3, remarkText, JSON.parse(localUserInfo).id);
                            this.setState({ step_3_remark: '' })
                            this.props.onClose();
                        }}>暂缓工作</Button> */}
                    <Button type={'danger'}
                        style={{ marginLeft: 20 }}
                        onClick={() => {
                            //// 人员选择完毕。改变bug中的数据。status 和 remark
                            let remarkText = this.state.step_3_remark ? this.state.step_3_remark : '验收不通过，发回专工处理';
                            this.props.changeBugStatus(2, 3, remarkText, JSON.parse(localUserInfo).id);
                            this.setState({ step_3_remark: '' })
                            this.props.onClose();
                        }}>验收失败</Button>
                    <Button type={'primary'}
                        style={{ marginLeft: 20 }}
                        onClick={() => {
                            //// 人员选择完毕。改变bug中的数据。status 和 remark
                            let remarkText = this.state.step_3_remark ? this.state.step_3_remark : '完成验收';
                            this.props.changeBugStatus(4, 3, remarkText, JSON.parse(localUserInfo).id);
                            this.setState({ step_3_remark: '' })
                            this.props.onClose();
                        }}>完成验收</Button>
                </div>
            </div>
        )
    }
    render() {
        return (
            < Drawer
                title="运行验收处理"
                placement='right'
                visible={this.state.showModal}
                onClose={() => { this.setState({ step_3_remark: '' }); this.props.onClose(); }}
                width={450}
            >
                {this.renderRunerModal()}
            </Drawer >
        );
    }
}

export default RunnerView;