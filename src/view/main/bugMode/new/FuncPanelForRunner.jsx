import React, { Component } from 'react';
import { Modal, Input, Radio, Row, Col } from 'antd';

/**
 * 运行人员操作界面
 */
export default class FuncPanelForRunner extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            selectValue: 1,
            remarkText: '',
        }
    }
    componentWillReceiveProps(nextProps) {
        this.setState({
            visible: nextProps.visible
        })
    }
    reset = () => {
        this.setState({
            remarkText: '',
            selectValue: 1,
        })
    }
    onCancelHandler = () => {
        this.props.onCancel();
        this.reset();
    }
    onOkHandler = () => {
        let selectValue = this.state.selectValue;
        let remarkText = this.state.remarkText;
        this.props.onOk({ selectValue, remarkText });
        this.reset();
    }
    render() {
        return (
            <Modal
                destroyOnClose
                width={550}
                title='运行处理面板'
                visible={this.state.visible}
                onCancel={this.onCancelHandler}
                onOk={this.onOkHandler}
            >
                <Row>
                    <Col span={3}>功能:</Col>
                    <Col span={21}>
                        <Radio.Group size='small' value={this.state.selectValue} buttonStyle="solid" onChange={(e) => {
                            this.setState({ selectValue: e.target.value })
                        }}>
                            <Radio.Button value={1}>验收通过</Radio.Button>
                            <Radio.Button value={2}>验收不通过</Radio.Button>
                        </Radio.Group>
                    </Col>
                </Row>
                <Row style={{ marginTop: 10 }}>
                    <Col span={3}>备注:</Col>
                    <Col span={21}><Input.TextArea value={this.state.remarkText} rows={3} placeholder={'非必填'} onChange={(e) => {
                        this.setState({ remarkText: e.target.value })
                    }} /></Col>
                </Row>
            </Modal >
        );
    }
}


