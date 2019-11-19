import React, { useState, useEffect } from 'react'
import { Form, Input, Modal, message, Select, Button, Steps, Divider } from 'antd'
import HttpApi from '../../util/HttpApi';
import moment from 'moment'
const { Step } = Steps;

var storage = window.localStorage;
var localUserInfo = '';
/**
 * 修改缺陷的最新备注
 */
export default function ChangeRemarkView(props) {
    const remarkFormRef = React.useRef(null)
    const [bugTypeId, setBugTypeId] = useState([]);
    useEffect(() => {
        localUserInfo = storage.getItem('userinfo');
        async function fetchData() {
            const bugTypeData = await getBugTypeInfo();
            setBugTypeId(bugTypeData);
        }
        fetchData();
    }, [])
    const getBugTypeInfo = () => {
        let sql = `select bt.id,bt.name from bug_types bt where effective = 1`
        return new Promise((resolve, reject) => {
            HttpApi.obs({ sql }, (res) => {
                let result = [];
                if (res.data.code === 0) {
                    result = res.data.data
                }
                resolve(result);
            })
        })
    }
    const okHandler = () => {
        remarkFormRef.current.validateFields((error, values) => {
            if (!error) {
                let other_remark = JSON.parse(props.currentRecord.other_remark);
                if (other_remark) { other_remark.push({ time: moment().format('YYYY-MM-DD HH:mm:ss'), id: JSON.parse(localUserInfo).id, remarkText: values.remarkText, typeId: values.bugTypeId }) }
                else { other_remark = [{ time: moment().format('YYYY-MM-DD HH:mm:ss'), id: JSON.parse(localUserInfo).id, remarkText: values.remarkText, typeId: values.bugTypeId }] }
                HttpApi.updateBugInfo({ query: { id: props.oneBug.id }, update: { last_remark: values.remarkText, bug_type_id: values.bugTypeId, other_remark: JSON.stringify(other_remark) } }, (res) => {
                    if (res.data.code === 0) {
                        message.success('更新成功');
                        props.ok();
                        remarkFormRef.current.resetFields();
                    }
                })
            }
        })
    }
    const cancelHandler = () => {
        remarkFormRef.current.resetFields();
        props.cancel();
    }
    const findNameByBugTypeId = (btyId) => {
        let result = ''
        bugTypeId.forEach(element => {
            if (element.id === btyId) {
                result = element.name
            }
        });
        return result;
    }
    return <Modal
        width={500}
        centered
        title='添加备注'
        visible={props.showModal}
        onCancel={cancelHandler}
        footer={<div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
            {localUserInfo && JSON.parse(localUserInfo).permission.indexOf('0') !== -1 ? <Button type='primary' onClick={props.openRunerView}>直接消缺</Button> : <div></div>}
            <span><Button onClick={cancelHandler}>取消</Button><Button type='primary' onClick={okHandler}>确定</Button></span>
        </div>}
    >
        {props.currentRecord.other_remark ?
            <div>
                <Steps size='small' direction="vertical" current={JSON.parse(props.currentRecord.other_remark).length - 1}>
                    {JSON.parse(props.currentRecord.other_remark).map((item, index) => {
                        return <Step key={index}
                            description={<div>{item.time} {props.getLocalUserName(item.id)} <span style={{ color: index === JSON.parse(props.currentRecord.other_remark).length - 1 ? 'orange' : '#8C8C8C' }}>{findNameByBugTypeId(item.typeId)} {item.remarkText}</span> </div>} />
                    })}
                </Steps>
                <Divider type='horizontal' />
            </div>
            : null}
        <RemarkForm ref={remarkFormRef} data={bugTypeId} />
    </Modal>
}

function changeRemarkForm(props) {
    const { getFieldDecorator } = props.form
    const options = props.data.map(major => <Select.Option value={major.id} key={major.id}>{major.name}</Select.Option>)

    return <Form>
        <Form.Item label="类型" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}>
            {getFieldDecorator('bugTypeId', {
                rules: [{ required: true, message: '请选择类型' }]
            })(<Select>{options}</Select>)}
        </Form.Item>
        <Form.Item label="备注" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}>
            {getFieldDecorator('remarkText', {
                rules: [{ required: true, message: '请输入备注' }]
            })(<Input.TextArea></Input.TextArea>)}
        </Form.Item>
    </Form >
}
const RemarkForm = Form.create({ name: 'remarkForm' })(changeRemarkForm)