import React from 'react'
import { TimePicker, Modal, Form, Switch, message } from 'antd';
import moment from 'moment'

export default props => {
    const SelectTimeRef = React.useRef(null);
    const onCancel = () => {
        props.onCancel();
        if (SelectTimeRef.current) {
            SelectTimeRef.current.resetFields()
        }
    }
    const onOk = () => {
        SelectTimeRef.current.validateFields((error, values) => {
            if (!error) {
                props.onOk(values);
            }
        })
    }
    return <Modal
        title={'时间段修改'}
        visible={props.visible}
        onCancel={onCancel}
        onOk={onOk}
    >
        <SelectTimeFrom ref={SelectTimeRef} record={props.record} />
    </Modal>
}

function TimeFrom(props) {
    const { getFieldDecorator } = props.form
    return <Form>
        <Form.Item label="开始时间" labelCol={{ span: 6 }} wrapperCol={{ span: 15 }}>
            {getFieldDecorator('begin', {
                initialValue: moment(props.record.begin, 'HH:mm:ss'),
                rules: [{ required: true, message: '请选择开始时间' }]
            })(<TimePicker style={{ width: '100%' }} />)}
        </Form.Item>
        <Form.Item label="结束时间" labelCol={{ span: 6 }} wrapperCol={{ span: 15 }}>
            {getFieldDecorator('end', {
                initialValue: moment(props.record.end, 'HH:mm:ss'),
                rules: [{ required: true, message: '请选择结束时间' }]
            })(<TimePicker style={{ width: '100%' }} />)}
        </Form.Item>
        <Form.Item label="是否跨天" labelCol={{ span: 6 }} wrapperCol={{ span: 15 }}>
            {getFieldDecorator('isCross', {
                initialValue: props.record.isCross === 1,
                valuePropName: 'checked'
            })(<Switch checkedChildren="是" unCheckedChildren="否" onChange={() => { message.warning('注意！请自行确保当前选择符合逻辑常识，否则可能会出现某些意想不到的问题'); }} />)}
        </Form.Item>
    </Form>
}

const SelectTimeFrom = Form.create({ name: 'timeForm' })(TimeFrom)