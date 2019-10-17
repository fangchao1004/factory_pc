import React, { Component } from 'react';
import { Modal, Form, Input } from 'antd';

export default class UpdateArea1View extends Component {
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
    onCancelHandler = () => {
        this.props.onCancel();
        this.refs.area1FormRef.resetFields();
    }
    onOkHandler = () => {
        this.refs.area1FormRef.validateFields((error, values) => {
            if (!error) {
                this.props.onOk(values);
                this.refs.area1FormRef.resetFields();
            }
        })
    }
    render() {
        return (
            <Modal
                title='修改一级巡检区域'
                visible={this.state.visible}
                onCancel={this.onCancelHandler}
                onOk={this.onOkHandler}
            >
                <Area1Form ref={'area1FormRef'} area={this.props.area} />
            </Modal>
        );
    }
}

function updateArea1From(props) {
    const { getFieldDecorator } = props.form
    return <Form>
        <Form.Item label="一级巡检区域:" labelCol={{ span: 6 }} wrapperCol={{ span: 15 }}>
            {getFieldDecorator('area1_name', {
                initialValue: props.area.area1_name,
                rules: [{ required: true, message: '请输入一级巡检区域名称' }]
            })(<Input placeholder='请输入一级巡检区域名称'></Input>)}
        </Form.Item>
    </Form>
}

const Area1Form = Form.create({ name: 'areaForm' })(updateArea1From)
