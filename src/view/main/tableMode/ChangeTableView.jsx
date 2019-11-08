import React, { useState, useEffect } from 'react'
import { Table, Drawer, Input, Button, Popconfirm, Select, message, Row, Col } from 'antd';
import { tableCellOptionsData } from '../../util/AppData'
import HttpApi from '../../util/HttpApi';
const Option = Select.Option;


/**
 * 修改Table界面
 * @export
 * @param {*} props
 */
export default function ChangeTableView(props) {
    return <Drawer
        title='修改表单'
        placement="left"
        width={1000}
        visible={props.visible}
        onClose={props.onClose}
    >
        <EditTable data={props.data} onOk={props.onOk} />
    </Drawer>
}

function EditTable(props) {
    const { id, content } = props.data
    const [dataSource, setDataSource] = useState(JSON.parse(content));
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        setDataSource(JSON.parse(content))
    }, [content])
    const columns = [
        {
            title: '标签',
            dataIndex: 'title_name',
            render: (text, record) => {
                return (
                    <Input disabled={record.type_id === '7' && record.key === '0'}
                        value={text} onChange={(e) => onChangeHandler(record, e.target.value, "title_name")}></Input>
                )
            }
        }, {
            title: '标题备注',
            dataIndex: 'title_remark',
            render: (text, record) => {
                return (
                    <Input disabled={record.type_id !== '12'}
                        placeholder={record.type_id === '12' ? '可以输入标题备注' : '/'}
                        value={text} onChange={(e) => onChangeHandler(record, e.target.value, "title_remark")}></Input>
                )
            }
        }, {
            title: '元素类型',
            dataIndex: 'type_id',
            render: (text, record) => {
                // console.log(record);
                let Options = [];
                tableCellOptionsData.forEach((item) => {
                    if (record.key === '0') {
                        Options.push(<Option key={item.value} value={item.value}>{item.text}</Option>)
                    } else {
                        if (item.value !== '7') {
                            Options.push(<Option key={item.value} value={item.value}>{item.text}</Option>)
                        }
                    }
                })
                return (
                    <Select disabled={(record.type_id === '7' && record.key === '0') || (record.type_id === '3' && record.key === '1')}
                        value={text} style={{ width: "100%" }} onChange={(value) => onChangeHandler(record, value, "type_id")} >
                        {Options}
                    </Select>
                )
            }
        }, {
            title: '选择器的选项',
            dataIndex: 'default_values',
            render: (text, record) => {
                return (
                    <Input
                        value={text}
                        disabled={record.type_id !== '4'}
                        placeholder={record.type_id !== '4' ? "/" : "请设置选项-选项之间请用/隔开"}
                        onChange={(e) => onChangeHandler(record, e.target.value, "default_values")}></Input>
                )
            }
        }, {
            title: '操作',
            dataIndex: 'operation',
            width: 150,
            render: (text, record) => {
                if (dataSource.length >= 1) {
                    if ((record.type_id === '7' && record.key === '0') || (record.type_id === '3' && record.key === '1')) {
                        return null
                    } else {
                        return (
                            <Popconfirm title="确认删除吗?" onConfirm={() => handleDelete(record.key)}>
                                <Button type='danger'>删除</Button>
                            </Popconfirm>
                        )
                    }
                }
            },
        }];

    const onChangeHandler = (record, val, targetField, extraData) => {
        // console.log(record, val, targetField, extraData);
        let copyDataSource = JSON.parse(JSON.stringify(dataSource));
        copyDataSource.forEach(element => {
            if (element.key === record.key) {
                element[targetField] = val
                if (targetField === 'type_id' && val === '12') {
                    element['default_values'] = ''
                } else if (targetField === 'type_id' && val !== '12') {
                    element['title_remark'] = ''
                }
                if (record.key === '0') {
                    element.extra_value = extraData
                }
            }
        });
        setDataSource(copyDataSource);
    }
    const handleDelete = (key) => {
        setDataSource(dataSource.filter(item => item.key !== key))
    }
    const handleAdd = () => {
        const newData = {
            key: dataSource.length + 1 + '',
            title_name: `标题${parseInt(dataSource.length + 1)}`,
            type_id: "12", ///默认添加的是 id=12 的 通用组件（无需默认值）
            default_values: '',
            title_remark: '',///标题备注
        };
        setDataSource([...dataSource, newData])
    }
    const okHandler = () => {
        setLoading(true);
        HttpApi.updateSampleInfo({ query: { id }, update: { content: JSON.stringify(dataSource) } }, (res) => {
            if (res.data.code === 0) {
                setLoading(false);
                message.success('修改成功');
                props.onOk();
            }
        })
    }
    return <div>
        <Row>
            <Col span={6}>
                <Button onClick={handleAdd} type="primary" style={{ marginBottom: 16 }}>
                    添加表单项目
          </Button>
            </Col>
            <Col span={18}>
                <div style={{ display: 'flex', flexDirection: 'row-reverse' }}>
                    <Popconfirm placement='leftTop' title="请您再次确认要提交修改后的表单吗?" onConfirm={okHandler}>
                        <Button loading={loading} type='danger'>确定上传</Button>
                    </Popconfirm>
                </div>
            </Col>
        </Row>
        <Table
            rowClassName={() => 'editable-row'}
            bordered
            dataSource={dataSource}
            columns={columns}
        />
    </div>
}