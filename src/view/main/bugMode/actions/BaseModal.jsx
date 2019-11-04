import React, { Component } from 'react';
import { Modal, Steps, Button } from 'antd'
const { Step } = Steps;

/**
 * 基本交互弹窗
 */
class BaseModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showModal: false,
            currentStatus: 0
        }
    }
    componentWillReceiveProps(nextProps) {
        this.setState({
            showModal: nextProps.showModal,
            currentStatus: nextProps.currentStatus
        })
    }

    render() {
        return (
            < Modal
                mask={false}
                title="当前进度"
                visible={this.state.showModal}
                onCancel={() => { this.props.onClose() }}
                footer={null}
                width={520}
            >
                <Steps direction="vertical" size="small" current={this.state.currentStatus}>
                    <Step title='工作分配' description={this.props.renderStatusX(0)} />
                    <Step title='开始维修' description={this.props.renderStatusX(1)} />
                    <Step title='专工验收' description={this.props.renderStatusX(2)} />
                    <Step title='运行验收' description={this.props.renderStatusX(3)} />
                    <Step title='已完成' description={this.props.renderStatusX(4)} />
                </Steps>
                <Button type={'primary'}
                    disabled={this.props.checkDisable(0)}
                    onClick={() => { this.props.openDrawer({ showModal3: true }) }}
                >分配维修人员</Button>
                <Button style={{ marginLeft: 20 }} type={'primary'}
                    disabled={this.props.checkDisable(1)}
                    onClick={() => { this.props.openDrawer({ showModal4: true }) }}
                >维修处理</Button>
                <Button style={{ marginLeft: 20 }} type={'primary'}
                    disabled={this.props.checkDisable(2)}
                    onClick={() => { this.props.openDrawer({ showModal5: true }) }}
                >专工验收</Button>
                <Button style={{ marginLeft: 20 }} type={'primary'}
                    disabled={this.props.checkDisable(3)}
                    onClick={() => { this.props.openDrawer({ showModal6: true }) }}
                >运行人员验收</Button>
            </Modal >
        );
    }
}

export default BaseModal;