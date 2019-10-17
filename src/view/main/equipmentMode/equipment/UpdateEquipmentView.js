import React from 'react'
import { Modal, Form, Input, Select } from 'antd'
import HttpApi from '../../../util/HttpApi'

/**
 * 更新设备的表单界面
 *
 * @param {*} props
 * @returns
 */
function UpdateEquipmentForm(props) {
    const { getFieldDecorator } = props.form
    const areaOptions = props.areas.map(area => <Select.Option value={area.id} key={area.id}>{area.name}</Select.Option>)
    const typeOptions = props.types.map(type => <Select.Option value={type.id} key={type.id}>{type.name}</Select.Option>)
    const nfcOptions = props.nfcs.map(nfc => <Select.Option value={nfc.id} key={nfc.id}>{nfc.name}</Select.Option>)
    const statusOptions = [{ id: 1, lab: '正常' }, { id: 2, lab: '异常' }, { id: 3, lab: '待检' }].map(item => <Select.Option value={item.id} key={item.id}>{item.lab}</Select.Option>)
    return <Form>
        <Form.Item label="区域" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            {getFieldDecorator('area_id', {
                initialValue: props.device.area_id,
                rules: [{ required: true, message: '请选择巡检点区域' }]
            })(<Select>{areaOptions}</Select>)}
        </Form.Item>
        <Form.Item label="巡检点类型" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            {getFieldDecorator('type_id', {
                initialValue: props.device.type_id,
                rules: [{ required: true, message: '请选择巡检点类型' }]
            })(<Select>{typeOptions}</Select>)}
        </Form.Item>
        <Form.Item label="NFC" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            {getFieldDecorator('nfc_id', {
                initialValue: props.device.nfc_id,
                rules: [{ required: true, message: '请选择设备NFC' }]
            })(<Select>{nfcOptions}</Select>)}
        </Form.Item>
        <Form.Item label="巡检点名称" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            {getFieldDecorator('name', {
                initialValue: props.device.name,
                rules: [{ required: true, message: '请输入巡检点名称' }]
            })(<Input></Input>)}
        </Form.Item>
        <Form.Item label="设备状态" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            {getFieldDecorator('status', {
                initialValue: props.device.status,
                rules: [{ required: true, message: '请输入设备备注' }]
            })(<Select>{statusOptions}</Select>)}
        </Form.Item>
        {/* <Form.Item label="备注" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            {getFieldDecorator('remark', {
                initialValue: props.device.remark,
                rules: [{ required: false, message: '请输入设备备注' }]
            })(<Input></Input>)}
        </Form.Item> */}
    </Form>
}

const EquipmentForm = Form.create({ name: 'staffForm' })(UpdateEquipmentForm)

/**
 * 更新员工界面
 *
 * @export
 * @param {*} props
 * @returns
 */
export default function UpdateEquipmentView(props) {
    const staffFormRef = React.useRef(null)
    const [types, setTypes] = React.useState(null)
    const [nfcs, setNfcs] = React.useState(null)
    const [areas, setAreas] = React.useState(null)
    React.useEffect(() => {
        HttpApi.getDeviceTypeInfo({ effective: 1 }, data => {
            if (data.data.code === 0) {
                setTypes(data.data.data)
            }
        })
        HttpApi.getNFCInfo({ type: 2, effective: 1 }, data => {
            if (data.data.code === 0) {
                setNfcs(data.data.data)
            }
        })
        HttpApi.getDeviceAreaInfo({ effective: 1 }, data => {
            if (data.data.code === 0) {
                setAreas(data.data.data)
            }
        })
    }, [])
    const handlerOk = () => {
        staffFormRef.current.validateFields((error, values) => {
            if (!error) {
                props.onOk(values)
            }
        })
    }
    return <Modal centered title="修改设备"
        onCancel={() => {
            if (staffFormRef && staffFormRef.current) {
                staffFormRef.current.resetFields();
            }
            props.onCancel();
        }}
        onOk={() => {
            handlerOk();
            if (staffFormRef && staffFormRef.current) {
                staffFormRef.current.resetFields();
            }
        }}
        visible={props.visible}>
        <EquipmentForm ref={staffFormRef} areas={areas} types={types} nfcs={nfcs} device={props.device}></EquipmentForm>
    </Modal>
}