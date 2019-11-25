import React from 'react'
import { Modal, Form, Input, Select, TreeSelect, Switch } from 'antd'
import HttpApi from '../../util/HttpApi'
import { permisstion } from '../../util/AppData'

const permissionOptions = permisstion.map(
    permission => <Select.Option value={permission.value} key={permission.value}>{permission.name}</Select.Option>
)

function getTreeData(levels) { ///目的是 让生产运行部 产生子选项 甲乙丙丁组
    // console.log('levelsL;', levels);
    let tempList = [];
    levels.forEach((item) => {
        let cellObj = {};
        cellObj.title = item.name;
        cellObj.value = item.id + '';
        cellObj.key = item.id + '';
        if (item.name === '生产运行部') { /// 直接用名称匹配了 因为 甲乙丙丁分组和部门之间没有id的关联性 
            cellObj.children = [{ title: '生产运行部-甲组', value: item.id + '_1', key: item.id + '_1' }, { title: '生产运行部-乙组', value: item.id + '_2', key: item.id + '_2' }, { title: '生产运行部-丙组', value: item.id + '_3', key: item.id + '_3' }, { title: '生产运行部-丁组', value: item.id + '_4', key: item.id + '_4' }]
            cellObj.selectable = false;///屏蔽 生产运行部 大选项 使用户只用选中子选选项
        }
        tempList.push(cellObj);
    })
    return tempList
}

/**
 * 添加员工的表单界面
 *
 * @param {*} props
 * @returns
 */
function AddStaffForm(props) {
    const { getFieldDecorator } = props.form
    const nfcOptions = props.nfcs.map(nfc => <Select.Option value={nfc.id} key={nfc.id}>{nfc.name}</Select.Option>)
    let treeData = getTreeData(props.levels) ///部门 选项数据

    return <Form>
        <Form.Item label="登陆账户" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            {getFieldDecorator('username', {
                rules: [{ required: true, message: '请输入员工用户名' }]
            })(<Input></Input>)}
        </Form.Item>
        <Form.Item label="姓名" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            {getFieldDecorator('name', {
                rules: [{ required: true, message: '请输入员工昵称' }]
            })(<Input></Input>)}
        </Form.Item>
        <Form.Item label="部门" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            {getFieldDecorator('level_id', {
                rules: [{ required: true, message: '请选择员工部门' }]
            })(
                <TreeSelect
                    dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                    treeData={treeData}
                />
            )}
        </Form.Item>
        <Form.Item label="密码" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            {getFieldDecorator('password', {
                rules: [{ required: true, message: '请输入员工密码' }]
            })(<Input></Input>)}
        </Form.Item>
        <Form.Item label="联系方式" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            {getFieldDecorator('phonenumber', {
                rules: [{ required: true, message: '请输入员工电话号码' }]
            })(<Input></Input>)}
        </Form.Item>
        <Form.Item label="员工工卡" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            {getFieldDecorator('nfc_id', {
                rules: [{ required: false, message: '请选择员工NFC' }]
            })(<Select>{nfcOptions}</Select>)}
        </Form.Item>
        <Form.Item label="员工权限" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            {getFieldDecorator('permission', {
                rules: [{ required: false, message: '请选择员工权限' }]
            })(<Select mode="multiple">{permissionOptions}</Select>)}
        </Form.Item>
        <Form.Item label="员工备注" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            {getFieldDecorator('remark', {
                rules: [{ required: false, message: '请输入员工备注' }]
            })(<Input></Input>)}
        </Form.Item>
        <Form.Item label="值长" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            {getFieldDecorator('isGroupLeader', {
                initialValue: false,
                valuePropName: 'checked'
            })(<Switch checkedChildren="是" unCheckedChildren="否"></Switch>)}
        </Form.Item>
    </Form>
}

const StaffForm = Form.create({ name: 'staffForm' })(AddStaffForm)


/**
 * 添加员工界面
 *
 * @export
 * @param {*} props
 * @returns
 */
export default function AddStaffView(props) {
    const staffFormRef = React.useRef(null)
    const [levels, setLevels] = React.useState(null)
    const [nfcs, setNfcs] = React.useState(null)
    React.useEffect(() => {
        HttpApi.getUserLevel({ effective: 1 }, data => {
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
    const handlerOk = () => {
        staffFormRef.current.validateFields((error, values) => {
            if (!error) {
                props.onOk(values)
            }
        })
    }
    return <Modal centered onOk={handlerOk} title="添加员工"
        onCancel={props.onCancel}
        visible={props.visible}>
        <StaffForm ref={staffFormRef} levels={levels} nfcs={nfcs}></StaffForm>
    </Modal>
}