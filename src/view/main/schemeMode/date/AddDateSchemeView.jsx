import React, { Component } from 'react';
import { Modal, Form, Select, Input } from 'antd';
import HttpApi from '../../../util/HttpApi';
const { Option } = Select;
var options1 = [];
var options2 = [];
export default class AddDateSchemeView extends Component {
    constructor(props) {
        super(props);
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
        // console.log('result:', result)
        options1 = copyReslut.map((item, index) => { return <Option value={item.id} key={index}>{item.name}</Option> })
        this.setState({ result })
    }
    getCycleDateInfo = () => {
        return new Promise((resolve, reject) => {
            let sql = `select * from cycle_date where effective = 1`
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
                this.props.onOk(values);
                this.refs.schemeFormRef.resetFields();
            }
        })
    }
    changeDateOpions = (cycleDate_id) => {
        let reslut = this.getDateOptionsByCycleDateId(cycleDate_id)
        options2 = reslut.date_options.split(',').map((item, index) => { return <Option value={item} key={index}>{item}</Option> })
        this.refs.schemeFormRef.setFieldsValue({ 'date_options': [] });
    }
    getDateOptionsByCycleDateId = (cycleDate_id) => {
        let result = null;
        this.state.result.forEach((item) => {
            if (item.id === cycleDate_id) { result = item }
        })
        return result
    }
    render() {
        return (
            <Modal title='添加日期方案' visible={this.state.visible} onCancel={this.onCancelHandler} onOk={this.onOkHandler} mask={true} maskClosable={false}>
                <SchemeForm ref={'schemeFormRef'} changeDateOpions={this.changeDateOpions} />
            </Modal>
        );
    }
}


function AddSchemeFrom(props) {
    const { getFieldDecorator } = props.form
    return <Form>
        <Form.Item label="方案名称:" labelCol={{ span: 5 }} wrapperCol={{ span: 19 }}>
            {getFieldDecorator('title', {
                rules: [{ required: true, message: '请输入方案名称' }]
            })(<Input placeholder='请输入方案名称' />)}
        </Form.Item>
        <Form.Item label="选择周期:" labelCol={{ span: 5 }} wrapperCol={{ span: 19 }}>
            {getFieldDecorator('cycleDate_id', {
                rules: [{ required: true, message: '请选择周期' }]
            })(<Select onChange={(v) => {
                props.changeDateOpions(v);
            }}>{options1}</Select>)}
        </Form.Item>
        <Form.Item label="选择日期:" labelCol={{ span: 5 }} wrapperCol={{ span: 19 }}>
            {getFieldDecorator('date_options', {
                rules: [{ required: true, message: '请选择日期' }],
            })(<Select mode="multiple">{options2}</Select>)}
        </Form.Item>
    </Form>
}

const SchemeForm = Form.create({ name: 'schemeForm' })(AddSchemeFrom)