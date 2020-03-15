import React, { Component } from 'react'
import { Modal, Form, Input, TimePicker, DatePicker, Row, Col } from 'antd'
import moment from 'moment'

/**
 * 更新日志的表单界面
 *
 * @param {*} props
 * @returns
 */
function UpdateRunlogForm(props) {
    const { getFieldDecorator } = props.form
    return <Form>
        <Row>
            <Col span={12}>
                <Form.Item label="日期" labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
                    {getFieldDecorator('date', {
                        initialValue: moment(props.record.time),
                        rules: [{ required: true, message: '请选择日期' }]
                    })(<DatePicker disabledDate={(current) => { return current > moment().endOf('day'); }} />)}
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item label="时间" labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
                    {getFieldDecorator('time', {
                        initialValue: moment(props.record.time),
                        rules: [{ required: true, message: '请选择时间' }]
                    })(<TimePicker style={{ width: '100%' }} format={'HH:mm'} />)}
                </Form.Item>
            </Col>
        </Row>
        <Form.Item label="内容" labelCol={{ span: 3 }} wrapperCol={{ span: 20 }}>
            {getFieldDecorator('content', {
                initialValue: props.record.content,
                rules: [{ required: true, message: '请输入日志内容' }]
            })(<Input.TextArea autosize={{ minRows: 4, maxRows: 6 }} placeholder="请输入日志内容"></Input.TextArea>)}
        </Form.Item>
    </Form>
}

const RunlogForm = Form.create({ name: 'runlogForm' })(UpdateRunlogForm)

/**
 * 添加巡检点界面
 *
 * @export
 * @param {*} props
 * @returns
 */
export default class UpdateRunlogView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
        }
    }
    componentWillReceiveProps(nextProps) {
        this.setState({
            visible: nextProps.visible
        })
    }
    onCancelHandler = () => {
        this.props.onCancel();
        this.refs.RunlogFormRef.resetFields();
    }
    onOkHandler = () => {
        this.refs.RunlogFormRef.validateFields((error, values) => {
            if (!error) {
                let data = { id: this.props.record.id, time: `${values.date.format('YYYY-MM-DD ')}${values.time.format('HH:mm:ss')}`, content: values.content }
                this.props.onOk(data);
                this.refs.RunlogFormRef.resetFields();
            }
        })
    }
    render() {
        return <Modal
            centered
            title="修改日志"
            onOk={this.onOkHandler}
            onCancel={this.onCancelHandler}
            visible={this.state.visible}
        >
            <RunlogForm ref={'RunlogFormRef'} record={this.props.record}></RunlogForm>
        </Modal >
    }
}