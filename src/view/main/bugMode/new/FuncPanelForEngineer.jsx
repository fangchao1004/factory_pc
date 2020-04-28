import React, { Component } from 'react';
import { Modal, Input, Radio, Row, Col, Select, message } from 'antd';
import HttpApi from '../../../util/HttpApi';

/**
 * 专工人员操作界面
 */
export default class FuncPanelForEngineer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            record: {},
            visible: false,
            selectValue: 4,
            majorList: [],
            freezeList: [],
            selectMajorId: null,
            selectFreezeId: null,
            remarkText: '',
        }
    }
    componentDidMount() {
        this.init();
    }
    init = async () => {
        let majorList = await this.getMajorList();
        let freezeList = await this.getFreezeList();
        this.setState({ majorList, freezeList })
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
                if (res.data.code === 0) { result = res.data.data }
                resolve(result);
            })
        })
    }
    componentWillReceiveProps(nextProps) {
        // console.log('nextProps.record:', nextProps.record)
        let selectValue = nextProps.record.bug_step_tag_id === 16 ? 6 : 4
        let selectMajorId = null;
        let selectFreezeId = null;
        switch (nextProps.record.status) {
            case 6:
                selectValue = 1; ///转专业
                selectMajorId = nextProps.record.bug_step_major_id
                break;
            case 7:
                selectValue = 2; ///挂起
                selectFreezeId = nextProps.record.bug_freeze_id
                break;
            case 5:
                selectValue = 3; ///解除挂起
                break;
            default:
                break;
        }
        this.setState({
            selectValue,
            selectMajorId,
            selectFreezeId,
            visible: nextProps.visible,
            record: nextProps.record || {}
        })

    }
    reset = () => {
        this.setState({
            selectValue: 4,
            selectMajorId: null,
            selectFreezeId: null,
            remarkText: '',
        })
    }
    onCancelHandler = () => {
        this.props.onCancel();
        this.reset();
    }
    onOkHandler = () => {
        let selectValue = this.state.selectValue;
        let remarkText = this.state.remarkText;
        let selectMajorId = this.state.selectMajorId;
        let selectFreezeId = this.state.selectFreezeId;
        if ((selectValue === 1 && !selectMajorId) || (selectValue === 2 && !selectFreezeId)) { message.error('请选择相关选项'); return }
        this.props.onOk({ selectValue, selectMajorId, selectFreezeId, remarkText });
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
                width={550}
                title='专工处理面板'
                visible={this.state.visible}
                onCancel={this.onCancelHandler}
                onOk={this.onOkHandler}
            >
                <Row>
                    <Col span={3}>功能:</Col>
                    <Col span={21}>
                        <Radio.Group size='small' value={this.state.selectValue} buttonStyle="solid" onChange={(e) => {
                            this.setState({ selectValue: e.target.value })
                            if (e.target.value >= 3) { this.setState({ selectMajorId: null, selectFreezeId: null }) }
                        }}>
                            <Radio.Button value={1}>转专业</Radio.Button>
                            <Radio.Button value={2}>挂起</Radio.Button>
                            <Radio.Button value={3}>恢复维修流程</Radio.Button>
                            <Radio.Button value={6}>无需处理</Radio.Button>
                            <Radio.Button disabled={
                                this.state.record.status === 5 ||
                                this.state.record.status === 7
                            } value={4}>验收通过</Radio.Button>
                            <Radio.Button disabled={
                                this.state.record.status === 5 ||
                                this.state.record.status === 7
                            } value={5}>验收不通过</Radio.Button>
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
            </Modal >
        );
    }
}


