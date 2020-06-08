import React, { Component } from 'react';
import { Modal, Form, Input, Select } from 'antd';
import HttpApi from '../../../util/HttpApi';
const { Option } = Select;
var options = [];
/**
 * 添加area1的界面
 */
export default class AddArea1View extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false
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
        let area0result = await this.getArea0options();
        options = area0result.map((item, index) => { return <Option value={item.area0_id} key={index}>{item.area0_name}</Option> })
    }
    getArea0options = () => {
        return new Promise((resolve, reject) => {
            let sql = `select area_0.id as area0_id , area_0.name as area0_name from area_0 where effective = 1`
            HttpApi.obs({ sql }, (res) => {
                let result = [];
                if (res.data.code === 0) {
                    result = res.data.data
                }
                resolve(result)
            })
        })
    }
    onCancelHandler = () => {
        this.props.onCancel();
        this.refs.area0FormRef.resetFields();
    }
    onOkHandler = () => {
        this.refs.area0FormRef.validateFields((error, values) => {
            if (!error) {
                this.props.onOk(values);
                this.refs.area0FormRef.resetFields();
            }
        })
    }
    render() {
        return (
            <Modal
                title='添加一级巡检区域'
                visible={this.state.visible}
                onCancel={this.onCancelHandler}
                onOk={this.onOkHandler}
            >
                <Area1Form ref={'area0FormRef'} options={options} />
            </Modal>
        );
    }
}

function AddArea1From(props) {
    const { getFieldDecorator } = props.form
    return <Form>
        <Form.Item label="所属片区:" labelCol={{ span: 6 }} wrapperCol={{ span: 15 }}>
            {getFieldDecorator('area0_id', {
                rules: [{ required: true, message: '请选择所属的片区' }]
            })(<Select
                showSearch={true} filterOption={(inputValue, option) => { return option.props.children.indexOf(inputValue) !== -1 }}
                placeholder='请选择所属的片区'
            >
                {props.options}
            </Select>)}
        </Form.Item>
        <Form.Item label="一级巡检区域:" labelCol={{ span: 6 }} wrapperCol={{ span: 15 }}>
            {getFieldDecorator('area1_name', {
                rules: [{ required: true, message: '请输入一级巡检区域名称' }]
            })(<Input placeholder='请输入一级巡检区域名称'></Input>)}
        </Form.Item>
    </Form>
}

const Area1Form = Form.create({ name: 'areaForm' })(AddArea1From)