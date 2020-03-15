import React, { Component } from 'react';
import { Modal, Form, Select, Input } from 'antd';
import HttpApi from '../../../util/HttpApi';
const { Option } = Select;
var options1 = [];
export default class UpdateAtmSchemeView extends Component {
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
        options1 = copyReslut.map((item, index) => { return <Option value={item.id} key={index}>{item.begin + '~' + item.end + ' (' + item.name + ')'}</Option> })
        this.setState({ result })
    }
    getCycleDateInfo = () => {
        return new Promise((resolve, reject) => {
            let sql = `select * from allow_time where effective = 1`
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

    getDateOptionsByCycleDateId = (cycleDate_id) => {
        let result = null;
        this.state.result.forEach((item) => {
            if (item.id === cycleDate_id) { result = item }
        })
        return result
    }
    render() {
        return (
            <Modal title='添加时间段方案' visible={this.state.visible} onCancel={this.onCancelHandler} onOk={this.onOkHandler} mask={true} maskClosable={false}>
                <SchemeForm ref={'schemeFormRef'} changeDateOpions={this.changeDateOpions} record={this.props.record} />
            </Modal>
        );
    }
}


function UpdateSchemeFrom(props) {
    const { getFieldDecorator } = props.form
    let initData = props.record.timeId_list ? { initialValue: props.record.timeId_list.split(',').map((item) => parseInt(item)) } : {}
    return <Form>
        <Form.Item label="方案名称:" labelCol={{ span: 5 }} wrapperCol={{ span: 19 }}>
            {getFieldDecorator('title', {
                initialValue: props.record.title,
                rules: [{ required: true, message: '请输入方案名称' }]
            })(<Input placeholder='请输入方案名称' />)}
        </Form.Item>
        <Form.Item label="选择时间段:" labelCol={{ span: 5 }} wrapperCol={{ span: 19 }}>
            {getFieldDecorator('atm_options', {
                ...initData,
                rules: [{ required: true, message: '请选择时间段' }],
            })(<Select mode="multiple">{options1}</Select>)}
        </Form.Item>
    </Form>
}

const SchemeForm = Form.create({ name: 'schemeForm' })(UpdateSchemeFrom)