import React, { useEffect, useState, useCallback } from 'react';
import { Button, Select, InputNumber, message, Input, Card, Form, Modal } from 'antd';
import moment from 'moment';
import HttpApi from '../../util/HttpApi'
const storage = window.localStorage;
const localUserInfo = storage.getItem('userinfo');
const { Option } = Select;
/**
 * 发起申请消费-界面
 */
export default _ => {
    const [foodList, setFoodList] = useState([])
    const init = useCallback(async () => {
        // console.log('init')
        let sql = `select * from foods`
        let res = await HttpApi.obs({ sql });
        if (res.data.code === 0) {
            setFoodList(res.data.data)
        }
    }, [])
    useEffect(() => {
        init();
    }, [init])
    return <Card hoverable={true} >
        <ApplyForm foodList={foodList} />
    </Card>
}
function TempForm(props) {
    const { getFieldDecorator } = props.form
    return <Form onSubmit={(e) => {
        e.preventDefault();
        props.form.validateFields((err, values) => {
            if (!err) {
                Modal.confirm({
                    title: `确认要提交吗？`,
                    okText: '确定',
                    okType: 'danger',
                    onOk: async function () {
                        let total_price = getTotalPrice(props.foodList, values.food_list, values.people_count);
                        let apply_id = JSON.parse(storage.getItem('userinfo')).id;
                        let apply_time = moment().format('YYYY-MM-DD HH:mm:ss');
                        let type = values.food_list.join(',')
                        let sql = `insert into applyRecords(total_price,apply_id,apply_time,type,people_count,remark) values (${total_price},${apply_id},'${apply_time}','${type}',${values.people_count},'${values.remark}') `;
                        let res = await HttpApi.obs({ sql })
                        if (res.data.code === 0) { message.success('申请提交成功'); props.form.resetFields() } else { message.error('申请提交失败') }
                    }
                })
            }
        });
    }}>
        <Form.Item label="消费类型:" labelCol={{ span: 8 }} wrapperCol={{ span: 8 }}>
            {getFieldDecorator('food_list', {
                initialValue: [1],
                rules: [{ required: true }]
            })(<Select
                mode="multiple"
                placeholder="请选择消费类型"
            >
                {props.foodList.map((item, index) => { return <Option key={item.id} value={item.id}> {item.type}--{item.price} </Option> })}
            </Select>)}
        </Form.Item>
        <Form.Item label="人数:" labelCol={{ span: 8 }} wrapperCol={{ span: 8 }}>
            {getFieldDecorator('people_count', {
                initialValue: 1,
                rules: [{ required: true, message: '请输入人数' }]
            })(<InputNumber style={{ width: '100%' }} min={1} max={99} ></InputNumber>)}
        </Form.Item>
        <Form.Item label="备注:" labelCol={{ span: 8 }} wrapperCol={{ span: 8 }}>
            {getFieldDecorator('remark', {
                rules: [{ required: true, message: '请填写备注说明事由' }]
            })(<Input.TextArea rows={4} allowClear placeholder='请填写备注说明事由'></Input.TextArea>)}
        </Form.Item>
        <Form.Item label="日期:" labelCol={{ span: 8 }} wrapperCol={{ span: 8 }}>
            {getFieldDecorator('date', {
                initialValue: moment().format('YYYY-MM-DD'),
                rules: [{ required: true }]
            })(<Input disabled></Input>)}
        </Form.Item>
        <Form.Item label="申请人:" labelCol={{ span: 8 }} wrapperCol={{ span: 8 }}>
            {getFieldDecorator('apply_user_id', {
                initialValue: JSON.parse(localUserInfo).name,
                rules: [{ required: true }]
            })(<Input disabled ></Input>)}
        </Form.Item>
        <Form.Item wrapperCol={{ span: 16 }}>
            <div style={{ textAlign: 'right' }}>
                <Button size="small" type="danger" htmlType="submit">提交</Button>
            </div>
        </Form.Item>
    </Form>
}
const ApplyForm = Form.create({ name: 'Form' })(TempForm)

function getTotalPrice(foodList, selectfoods, peopleNum) {
    let count_price = 0;
    selectfoods.forEach((foodid) => {
        foodList.forEach((item) => {
            if (foodid === item.id) {
                count_price = count_price + item.price
            }
        })
    })
    return count_price * peopleNum;
}