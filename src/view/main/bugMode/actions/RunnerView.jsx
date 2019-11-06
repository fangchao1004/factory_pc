import React, { Component } from 'react';
import { Drawer, Button, Row, Col, Input, Select } from 'antd';
import HttpApi from '../../../util/HttpApi';

var storage = window.localStorage;
var localUserInfo = '';
var bugType_Options = [];///缺陷类型

/**
 * 运行人员界面
 */
class RunnerView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showModal: false,
            step_3_remark: '',
            bug_type_id: null,///缺陷类型id
        }
    }
    componentDidMount() {
        localUserInfo = storage.getItem('userinfo');
        this.init();
    }
    componentWillReceiveProps(nextProps) {
        this.setState({
            showModal: nextProps.showModal
        })
    }
    init = async () => {
        let bugTypeData = await this.getBugTypeInfo();
        bugType_Options = bugTypeData.map(major => <Select.Option value={major.id} key={major.id}>{major.name}</Select.Option>)
    }
    getBugTypeInfo = () => {
        let sql = `select bt.id,bt.name from bug_types bt where effective = 1`
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
    ////运行验收界面
    renderRunerModal = () => {
        return (
            <div>
                <Row gutter={16} style={{ marginTop: 20 }}>
                    <Col span={5}>
                        <span>备注类别(非必选):</span>
                    </Col>
                    <Col span={18}>
                        <Select style={{ width: '100%' }} value={this.state.bug_type_id} onChange={(v) => {
                            this.setState({ bug_type_id: v })
                        }}>{bugType_Options}</Select>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={5}>
                        <span>备注:</span>
                    </Col>
                    <Col span={18}>
                        <Input.TextArea value={this.state.step_3_remark} style={{ width: '100%' }} placeholder='可用来说明相关情况' onChange={(e) => { this.setState({ step_3_remark: e.target.value }) }}></Input.TextArea>
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
                            this.props.changeBugStatus(2, 3, remarkText, this.state.bug_type_id, JSON.parse(localUserInfo).id);
                            this.reset();
                            this.props.onClose();
                        }}>验收失败</Button>
                    <Button type={'primary'}
                        style={{ marginLeft: 20 }}
                        onClick={() => {
                            //// 人员选择完毕。改变bug中的数据。status 和 remark
                            let remarkText = this.state.step_3_remark ? this.state.step_3_remark : '完成验收';
                            this.props.changeBugStatus(4, 3, remarkText, this.state.bug_type_id, JSON.parse(localUserInfo).id);
                            this.reset();
                            this.props.onClose();
                        }}>完成验收</Button>
                </div>
            </div>
        )
    }
    reset = () => {
        this.setState({ step_3_remark: '', bug_type_id: null });
    }
    render() {
        return (
            < Drawer
                title="运行验收处理"
                placement='right'
                visible={this.state.showModal}
                onClose={() => { this.reset(); this.props.onClose(); }}
                width={450}
            >
                {this.renderRunerModal()}
            </Drawer >
        );
    }
}

export default RunnerView;