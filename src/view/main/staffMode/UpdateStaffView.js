import React from 'react'
import { Modal, Form, Input, Select, Switch } from 'antd'
import HttpApi from '../../util/HttpApi'

const permissionOptions = [{ name: '专工权限', value: 0 }, { name: '运行权限', value: 1 }].map(
    permission => <Select.Option value={permission.value} key={permission.value}>{permission.name}</Select.Option>
)

/**
 * 更新员工的表单界面
 *
 * @param {*} props
 * @returns
 */
function UpdateStaffForm(props) {
    const { getFieldDecorator } = props.form
    const levelOptions = props.levels.map(level => <Select.Option value={level.id} key={level.id}>{level.name}</Select.Option>)
    const nfcOptions = props.nfcs.map(nfc => <Select.Option value={nfc.id} key={nfc.id}>{nfc.name}</Select.Option>)
    return <Form>
        <Form.Item label="登陆账户" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            {getFieldDecorator('username', {
                initialValue: props.staff.username,
                rules: [{ required: true, message: '请输入员工登陆账户' }]
            })(<Input></Input>)}
        </Form.Item>
        <Form.Item label="姓名" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            {getFieldDecorator('name', {
                initialValue: props.staff.name,
                rules: [{ required: true, message: '请输入员工姓名' }]
            })(<Input></Input>)}
        </Form.Item>
        <Form.Item label="部门" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            {getFieldDecorator('level_id', {
                initialValue: props.staff.level_id,
                rules: [{ required: true, message: '请选择员工部门' }]
            })(<Select>{levelOptions}</Select>)}
        </Form.Item>
        <Form.Item label="密码" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            {getFieldDecorator('password', {
                initialValue: props.staff.password,
                rules: [{ required: true, message: '请输入员工密码' }]
            })(<Input></Input>)}
        </Form.Item>
        <Form.Item label="联系方式" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            {getFieldDecorator('phonenumber', {
                initialValue: props.staff.phonenumber,
                rules: [{ required: true, message: '请输入员工联系方式' }]
            })(<Input></Input>)}
        </Form.Item>
        <Form.Item label="员工工卡" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            {getFieldDecorator('nfc_id', {
                initialValue: props.staff.nfc_id,
                rules: [{ required: false, message: '请选择员工工卡' }]
            })(<Select>{nfcOptions}</Select>)}
        </Form.Item>
        <Form.Item label="员工权限" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            {getFieldDecorator('permission', {
                initialValue: props.staff.permission && props.staff.permission.split(',').map(permission => parseInt(permission)),
                rules: [{ required: false, message: '请选择员工权限' }]
            })(<Select mode="multiple">{permissionOptions}</Select>)}
        </Form.Item>
        <Form.Item label="员工备注" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            {getFieldDecorator('remark', {
                rules: [{ required: false, message: '请输入员工备注' }]
            })(<Input></Input>)}
        </Form.Item>
        <Form.Item label="管理员" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            {getFieldDecorator('isadmin', {
                initialValue: props.staff.isadmin === 1,
                valuePropName: 'checked'
            })(<Switch checkedChildren="是" unCheckedChildren="否"></Switch>)}
        </Form.Item>
    </Form>
}

const StaffForm = Form.create({ name: 'staffForm' })(UpdateStaffForm)


/**
 * 更新员工界面
 *
 * @export
 * @param {*} props
 * @returns
 */
export default function UpdateStaffView(props) {
    const staffFormRef = React.useRef(null)
    const [levels, setLevels] = React.useState(null)
    const [nfcs, setNfcs] = React.useState(null)

    React.useEffect(() => {
        HttpApi.getUserLevel({}, data => {
            if (data.data.code === 0) {
                setLevels(data.data.data)
            }
        })
        HttpApi.getNFCInfo({ type: 1 }, data => {
            if (data.data.code === 0) {
                setNfcs(data.data.data)
            }
        })
    }, [])

    React.useEffect(() => {
        if (staffFormRef.current) {
            staffFormRef.current.resetFields()
        }
    }, [props.staff])

    const handlerOk = () => {
        staffFormRef.current.validateFields((error, values) => {
            if (!error) {
                props.onOk(values)
            }
        })
    }

    return <Modal centered onOk={handlerOk} title="修改员工"
        onCancel={props.onCancel}
        visible={props.visible}>
        <StaffForm ref={staffFormRef} staff={props.staff} levels={levels} nfcs={nfcs}></StaffForm>
    </Modal>
}