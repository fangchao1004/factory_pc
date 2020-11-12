import React, { Component } from 'react';
import { Modal, Input, Radio, Row, Col, Select, message } from 'antd';
import HttpApi from '../../../util/HttpApi';

/**
 * 维修人员操作界面
 */
export default class FuncPanelForRepair extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            selectValue: 3,
            freezeList: [],
            majorList: [],
            remarkText: '',
            selectMajorId: null,
            selectFreezeId: null,
        }
    }
    componentDidMount() {
        this.init();
    }
    init = async () => {
        let freezeList = await this.getFreezeList();
        let majorList = await this.getMajorList();
        this.setState({
            freezeList, majorList
        })
    }
    getMajorList = () => {
        return new Promise((resolve, reject) => {
            let sql = `select * from majors where effective = 1`
            let result = [];
            HttpApi.obs({ sql }, (res) => {
                if (res.data.code === 0) { result = res.data.data }
                resolve(result);
            })
        })
    }
    getFreezeList = () => {
        return new Promise((resolve, reject) => {
            let sql = `select * from bug_freeze_status where effective = 1`
            let result = [];
            HttpApi.obs({ sql }, (res) => {
                if (res.data.code === 0) {
                    result = res.data.data;
                }
                resolve(result);
            })
        })
    }
    componentWillReceiveProps(nextProps) {
        this.setState({
            visible: nextProps.visible
        })
    }
    reset = () => {
        this.setState({
            selectValue: 3,
            remarkText: '',
            selectMajorId: null,
            selectFreezeId: null,
        })
    }
    onCancelHandler = () => {
        this.props.onCancel();
        this.reset();
    }
    onOkHandler = () => {
        let selectValue = this.state.selectValue;
        let selectMajorId = this.state.selectMajorId;
        let selectFreezeId = this.state.selectFreezeId;
        let remarkText = this.state.remarkText;
        if (selectValue === 2 && !selectFreezeId) { message.error('请选择相关挂起选项'); return; }
        else if (selectValue === 1 && !selectMajorId) { message.error('请选择相关专业'); return; }
        this.props.onOk({ selectValue, remarkText, selectMajorId, selectFreezeId });
        this.reset();
    }
    renderPanelViewBySelectValue = (v) => {
        let node = null;
        switch (v) {
            case 1:
                node = <>
                    <Col span={3}>专业:</Col>
                    <Col span={21}>
                        <Select value={this.state.selectMajorId} style={{ width: '100%' }} onChange={(v) => { this.setState({ selectMajorId: v }) }}>
                            {this.state.majorList.map((item, index) => { return <Select.Option key={index} value={item.id}>{item.name}</Select.Option> })}
                        </Select>
                    </Col>
                </>
                break;
            case 2:
                node = <>
                    <Col span={3}>选项:</Col>
                    <Col span={21}>
                        <Select value={this.state.selectFreezeId} style={{ width: '100%' }} onChange={(v) => { this.setState({ selectFreezeId: v }) }}>
                            {this.state.freezeList.map((item, index) => { return <Select.Option key={index} value={item.id}>{item.des}</Select.Option> })}
                        </Select>
                    </Col>
                </>
                break;
            default:
                break;
        }
        return node
    }
    render() {
        return (
            <Modal
                destroyOnClose
                width={550}
                title='维修处理面板'
                visible={this.state.visible}
                onCancel={this.onCancelHandler}
                onOk={this.onOkHandler}
            >
                <Row>
                    <Col span={3}>功能:</Col>
                    <Col span={21}>
                        <Radio.Group size='small' value={this.state.selectValue} buttonStyle="solid" onChange={(e) => { this.setState({ selectValue: e.target.value }) }}>
                            <Radio.Button value={1}>申请转专业</Radio.Button>
                            <Radio.Button value={2}>无法维修(申请挂起)</Radio.Button>
                            <Radio.Button value={4}>无需处理</Radio.Button>
                            <Radio.Button value={3}>完成维修</Radio.Button>
                        </Radio.Group>
                    </Col>
                </Row>
                <Row style={{ marginTop: 10 }}>
                    {this.renderPanelViewBySelectValue(this.state.selectValue)}
                </Row>
                <Row style={{ marginTop: 10 }}>
                    <Col span={3}>备注:</Col>
                    <Col span={21}><Input.TextArea value={this.state.remarkText} rows={3} placeholder={'非必填'} onChange={(e) => {
                        this.setState({ remarkText: e.target.value })
                    }} /></Col>
                </Row>
            </Modal>
        );
    }
}


