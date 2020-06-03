import React, { Component } from 'react';
import { Modal, Form, Input } from 'antd';

export default class UpdateArea0View extends Component {
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
                title='修改一级巡检区域'
                visible={this.state.visible}
                onCancel={this.onCancelHandler}
                onOk={this.onOkHandler}
            >
                <Area0Form ref={'area0FormRef'} area={this.props.area} />
            </Modal>
        );
    }
}

function updateArea0From(props) {
    const { getFieldDecorator } = props.form
    return <Form>
        <Form.Item label="一级巡检区域:" labelCol={{ span: 6 }} wrapperCol={{ span: 15 }}>
            {getFieldDecorator('area0_name', {
                initialValue: props.area.area0_name,
                rules: [{ required: true, message: '请输入一级巡检区域名称' }]
            })(<Input placeholder='请输入一级巡检区域名称'></Input>)}
        </Form.Item>
    </Form>
}

const Area0Form = Form.create({ name: 'areaForm' })(updateArea0From)
