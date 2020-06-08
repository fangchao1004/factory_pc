import React, { Component } from 'react';
import { Modal, Form, Input } from 'antd';

/**
 * 添加area0的界面
 */
export default class AddArea0View extends Component {
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
                title='添加片区'
                visible={this.state.visible}
                onCancel={this.onCancelHandler}
                onOk={this.onOkHandler}
            >
                <Area0Form ref={'area0FormRef'} />
            </Modal>
        );
    }
}

function AddArea0From(props) {
    const { getFieldDecorator } = props.form
    return <Form>
        <Form.Item label="片区:" labelCol={{ span: 6 }} wrapperCol={{ span: 15 }}>
            {getFieldDecorator('area0_name', {
                rules: [{ required: true, message: '请输入片区名称' }]
            })(<Input placeholder='请输入片区名称'></Input>)}
        </Form.Item>
    </Form>
}

const Area0Form = Form.create({ name: 'areaForm' })(AddArea0From)