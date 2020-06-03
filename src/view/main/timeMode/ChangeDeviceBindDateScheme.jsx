import React, { Component } from 'react';
import { Modal, Form, Select, Button, Popconfirm } from 'antd';
import HttpApi from '../../util/HttpApi';
const { Option } = Select;
var options1 = [];
export default class ChangeDeviceBindDateScheme extends Component {
    constructor(props) {
        super(props);
        // console.log('ChangeDeviceBindDateScheme:', props)
        this.state = {
            visible: false,
            result: [],
        }
    }
    componentWillReceiveProps(nextProps) {
        this.setState({
            visible: nextProps.visible
        })
    }
    componentDidMount() {
        this.init();
    }
    init = async () => {
        let result = await this.getCycleDateInfo();
        let copyReslut = JSON.parse(JSON.stringify(result))
        options1 = copyReslut.map((item, index) => { return <Option value={item.id} key={index}>{item.title}</Option> })
        this.setState({ result })
    }
    getCycleDateInfo = () => {
        return new Promise((resolve, reject) => {
            let sql = `select * from scheme_of_cycleDate where effective = 1 and area0_id = ${this.props.id}`
            HttpApi.obs({ sql }, (res) => {
                let result = [];
                if (res.data.code === 0) { result = res.data.data }
                resolve(result);
            })
        })
    }
    onCancelHandler = () => {
        this.props.onCancel();
        this.refs.schemeFormRef.resetFields();
    }
    onOkHandler = () => {
        this.refs.schemeFormRef.validateFields((error, values) => {
            if (!error) {
                this.props.onOk({ id: this.props.record.id, ...values });
                this.refs.schemeFormRef.resetFields();
            }
        })
    }
    render() {
        return (
            <Modal title='变更方案' visible={this.state.visible} mask={true} maskClosable={false} onCancel={this.onCancelHandler}
                footer={<div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Popconfirm title={<div>确定要解除方案吗？<br />解除后，该巡检点就会恢复到原先的巡检场景中（每天的某个时间段中）</div>} onConfirm={() => { this.props.removeBindScheme(this.props.record.id) }}>
                        <Button type='dashed'>解除方案</Button>
                    </Popconfirm>
                    <span><Button onClick={this.onCancelHandler}>取消</Button>
                        <Button type='primary' onClick={this.onOkHandler}>确定</Button></span>
                </div>}
            >
                <SchemeForm ref={'schemeFormRef'} record={this.props.record} />
            </Modal>
        );
    }
}

function UpdateSchemeFrom(props) {
    const { getFieldDecorator } = props.form
    return <Form>
        <Form.Item label="选择日期方案:" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
            {getFieldDecorator('atm_options', {
                initialValue: props.record.sche_cyc_id ? parseInt(props.record.sche_cyc_id) : null,
                rules: [{ required: true, message: '请选择日期方案' }],
            })(<Select>{options1}</Select>)}
        </Form.Item>
    </Form>
}

const SchemeForm = Form.create({ name: 'schemeForm' })(UpdateSchemeFrom)