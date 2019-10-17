import React from 'react'
import { Modal, Form, Input, Select } from 'antd'
import HttpApi from '../../../util/HttpApi'

/**
 * 添加员工的表单界面
 *
 * @param {*} props
 * @returns
 */
function AddEquipmentForm(props) {
    const { getFieldDecorator } = props.form
    const areaOptions = props.areas.map(area => <Select.Option value={area.id} key={area.id}>{area.name}</Select.Option>)
    const typeOptions = props.types.map(type => <Select.Option value={type.id} key={type.id}>{type.name}</Select.Option>)
    const nfcOptions = props.nfcs.map(nfc => <Select.Option value={nfc.id} key={nfc.id}>{nfc.name}</Select.Option>)

    return <Form>
        <Form.Item label="区域" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            {getFieldDecorator('area_id', {
                rules: [{ required: true, message: '请选择巡检点区域' }]
            })(<Select>{areaOptions}</Select>)}
        </Form.Item>
        <Form.Item label="巡检点类型" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            {getFieldDecorator('type_id', {
                rules: [{ required: true, message: '请选择巡检点类型' }]
            })(<Select>{typeOptions}</Select>)}
        </Form.Item>
        <Form.Item label="NFC" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            {getFieldDecorator('nfc_id', {
                rules: [{ required: true, message: '请选择设备NFC' }]
            })(<Select>{nfcOptions}</Select>)}
        </Form.Item>
        <Form.Item label="巡检点名称" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            {getFieldDecorator('name', {
                rules: [{ required: true, message: '请输入巡检点名称' }]
            })(<Input></Input>)}
        </Form.Item>
        {/* <Form.Item label="备注" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            {getFieldDecorator('remark', {
                rules: [{ required: false, message: '请输入设备备注' }]
            })(<Input></Input>)}
        </Form.Item> */}
    </Form>
}

const EquipmentForm = Form.create({ name: 'staffForm' })(AddEquipmentForm)

/**
 * 添加员工界面
 *
 * @export
 * @param {*} props
 * @returns
 */
export default function AddEquipmentView(props) {
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
    return <Modal centered onOk={handlerOk} title="添加巡检点"
        onCancel={props.onCancel}
        visible={props.visible}>
        <EquipmentForm ref={staffFormRef} areas={areas} types={types} nfcs={nfcs}></EquipmentForm>
    </Modal>
}