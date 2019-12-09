import React, { Component } from 'react';
import { Modal, Form, Input, Select } from 'antd';
import HttpApi from '../../../util/HttpApi';
const { Option } = Select;
var options = [];

export default class UpdateArea2View extends Component {
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
        let area1result = await this.getArea1options();
        this.setState({ area1Data: area1result })
        options = this.state.area1Data.map((item, index) => { return <Option value={item.area1_id} key={index}>{item.area1_name}</Option> })
        this.forceUpdate();
    }
    getArea1options = () => {
        return new Promise((resolve, reject) => {
            let sql = `select area_1.id as area1_id , area_1.name as area1_name from area_1 where effective = 1`
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
        this.refs.area2FormRef.resetFields();
    }
    onOkHandler = () => {
        this.refs.area2FormRef.validateFields((error, values) => {
            if (!error) {
                this.props.onOk(values);
                this.refs.area2FormRef.resetFields();
            }
        })
    }
    render() {
        return (
            <Modal
                title='修改区域位置'
                visible={this.state.visible}
                onCancel={this.onCancelHandler}
                onOk={this.onOkHandler}
            >
                <Area2Form ref={'area2FormRef'} area={this.props.area} />
            </Modal>
        );
    }
}

function updateArea2From(props) {
    const { getFieldDecorator } = props.form
    return <Form>
        <Form.Item label="所属一级区域:" labelCol={{ span: 6 }} wrapperCol={{ span: 15 }}>
            {getFieldDecorator('area1_id', {
                initialValue: props.area.area1_id,
                rules: [{ required: true, message: '请选则所属的一级区域' }]
            })(<Select showSearch={true} filterOption={(inputValue, option)=>{return option.props.children.indexOf(inputValue)!==-1}}>
                {options}
            </Select>)}
        </Form.Item>
        <Form.Item label="二级巡检位置:" labelCol={{ span: 6 }} wrapperCol={{ span: 15 }}>
            {getFieldDecorator('area2_name', {
                initialValue: props.area.area2_name,
                rules: [{ required: true, message: '请输入二级巡检位置名称' }]
            })(<Input></Input>)}
        </Form.Item>
    </Form>
}

const Area2Form = Form.create({ name: 'areaForm' })(updateArea2From)
