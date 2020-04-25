import React, { Component } from 'react';
import { Modal, Form, InputNumber, Row, Col } from 'antd';
import { getDuration } from '../../util/Tool';

/**
 * 更新时间区间的表单界面
 *
 * @param {*} props
 * @returns
 */
function UpdateDurationForm(props) {
    const { getFieldDecorator } = props.form
    let day = 0;
    let hour = 0;
    let minute = 0;
    let temp = getDuration(props.data.duration_time, 2);
    day = temp.daysRound;
    hour = temp.hoursRound;
    minute = temp.minutesRound;
    return <Form>
        <Row>
            <Col span={8}>
                <Form.Item label="天" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
                    {getFieldDecorator('day', {
                        initialValue: day,
                        rules: [{ required: false, message: '小时' }]
                    })(<InputNumber min={0} style={{ width: '90%' }}></InputNumber>)}
                </Form.Item>
            </Col>
            <Col span={8}>
                <Form.Item label="小时" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
                    {getFieldDecorator('hour', {
                        initialValue: hour,
                        rules: [{ required: false, message: '小时' }]
                    })(<InputNumber min={0} style={{ width: '90%' }}></InputNumber>)}
                </Form.Item>
            </Col>
            <Col span={8}>
                <Form.Item label="分钟" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
                    {getFieldDecorator('minute', {
                        initialValue: minute,
                        rules: [{ required: false, message: '分钟' }]
                    })(<InputNumber min={0} style={{ width: '90%' }}></InputNumber>)}
                </Form.Item>
            </Col>
        </Row>
    </Form>
}

const DurationForm = Form.create({ name: 'DurationForm' })(UpdateDurationForm)

class UpdateBugDurationView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            data: {}
        }
    }
    componentWillReceiveProps(nextProps) {
        this.setState({
            visible: nextProps.visible,
            data: nextProps.data
        })
    }
    onCancelHandler = () => {
        this.props.onCancel();
        this.refs.DurationFormRef.resetFields();
    }
    onOkHandler = () => {
        this.refs.DurationFormRef.validateFields((error, values) => {
            if (!error) {
                // console.log('values:', values)
                this.props.onOk(values);
                this.refs.DurationFormRef.resetFields();
            }
        })
    }

    render() {
        return (
            <Modal
                destroyOnClose
                centered
                title="修改时间区间"
                onOk={this.onOkHandler}
                onCancel={this.onCancelHandler}
                visible={this.state.visible}
            >
                <DurationForm ref='DurationFormRef' data={this.state.data}></DurationForm>
            </Modal>
        );
    }
}

export default UpdateBugDurationView;