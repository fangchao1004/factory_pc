import React, { Component } from 'react'
import { Table, Drawer, Input, Button, Popconfirm, Select, message, Row, Col } from 'antd';
import { tableCellOptionsData } from '../../util/AppData'
import HttpApi from '../../util/HttpApi';
import { DndProvider, DragSource, DropTarget } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import update from 'immutability-helper';
let dragingIndex = -1;
const Option = Select.Option;

const rowSource = {
    beginDrag(props) {
        dragingIndex = props.index;
        return {
            index: props.index,
        };
    },
};

const rowTarget = {
    drop(props, monitor) {
        const dragIndex = monitor.getItem().index;
        const hoverIndex = props.index;

        // Don't replace items with themselves
        if (dragIndex === hoverIndex) {
            return;
        }

        // Time to actually perform the action
        props.moveRow(dragIndex, hoverIndex);

        // Note: we're mutating the monitor item here!
        // Generally it's better to avoid mutations,
        // but it's good here for the sake of performance
        // to avoid expensive index searches.
        monitor.getItem().index = hoverIndex;
    },
};

const DragableBodyRow = DropTarget('row', rowTarget, (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
}))(
    DragSource('row', rowSource, connect => ({
        connectDragSource: connect.dragSource(),
    }))(BodyRow),
);

/**
 * 修改Table界面
 * @export
 * @param {*} props
 */
export default class ChangeTableView extends Component {

    render() {
        return <Drawer
            title='修改表单'
            placement="left"
            width={1000}
            visible={this.props.visible}
            onClose={this.props.onClose}
        >
            <EditTable data={this.props.data} onOk={this.props.onOk} />
        </Drawer >
    }
}

class EditTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSource: [],
            loading: false,
            id: null
        }
    }
    componentDidMount() {
        const { id, content } = this.props.data
        this.setState({
            dataSource: JSON.parse(content),
            id: id
        })
    }
    componentWillReceiveProps(nextProps) {
        const { id, content } = nextProps.data
        this.setState({
            dataSource: JSON.parse(content),
            id: id
        })
    }
    columns = [
        {
            title: '标签',
            dataIndex: 'title_name',
            render: (text, record) => {
                return (
                    <Input disabled={record.type_id === '7' && record.key === '0'}
                        value={text} onChange={(e) => this.onChangeHandler(record, e.target.value, "title_name")}></Input>
                )
            }
        }, {
            title: '标题备注',
            dataIndex: 'title_remark',
            render: (text, record) => {
                return (
                    <Input disabled={record.type_id !== '12'}
                        placeholder={record.type_id === '12' ? '可以输入标题备注' : '/'}
                        value={text} onChange={(e) => this.onChangeHandler(record, e.target.value, "title_remark")}></Input>
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
                        value={text} style={{ width: "100%" }} onChange={(value) => this.onChangeHandler(record, value, "type_id")} >
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
                        onChange={(e) => this.onChangeHandler(record, e.target.value, "default_values")}></Input>
                )
            }
        }, {
            title: '操作',
            dataIndex: 'operation',
            width: 150,
            render: (text, record) => {
                if (this.state.dataSource.length >= 1) {
                    if ((record.type_id === '7' && record.key === '0') || (record.type_id === '3' && record.key === '1')) {
                        return null
                    } else {
                        return (
                            <Popconfirm title="确认删除吗?" onConfirm={() => this.handleDelete(record.key)}>
                                <Button type='danger'>删除</Button>
                            </Popconfirm>
                        )
                    }
                }
            },
        }];

    onChangeHandler = (record, val, targetField, extraData) => {
        // console.log(record, val, targetField, extraData);
        let copyDataSource = JSON.parse(JSON.stringify(this.state.dataSource));
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
        this.setState({
            dataSource: copyDataSource
        })
    }
    handleDelete = (key) => {
        this.setState({
            dataSource: this.state.dataSource.filter(item => item.key !== key)
        })
    }
    handleAdd = () => {
        const newData = {
            key: this.state.dataSource.length + 1 + '',
            title_name: `标题${parseInt(this.state.dataSource.length + 1)}`,
            type_id: "12", ///默认添加的是 id=12 的 通用组件（无需默认值）
            default_values: '',
            title_remark: '',///标题备注
        };
        this.setState({
            dataSource: [...this.state.dataSource, newData]
        })
    }
    okHandler = () => {
        this.setState({
            loading: true
        })
        HttpApi.updateSampleInfo({ query: { id: this.state.id }, update: { content: JSON.stringify(this.state.dataSource) } }, (res) => {
            if (res.data.code === 0) {
                this.setState({
                    loading: false
                })
                message.success('修改成功');
                this.props.onOk();
            }
        })
    }
    components = {
        body: {
            row: DragableBodyRow,
        },
    };

    moveRow = (dragIndex, hoverIndex) => {
        const dragRow = this.state.dataSource[dragIndex];
        this.setState(update(this.state, {
            dataSource: {
                $splice: [[dragIndex, 1], [hoverIndex, 0, dragRow]],
            },
        }))
    };
    render() {
        return <div>
            <Row>
                <Col span={6}>
                    <Button onClick={this.handleAdd} type="primary" style={{ marginBottom: 16 }}>
                        添加表单项目
          </Button>
                </Col>
                <Col span={18}>
                    <div style={{ display: 'flex', flexDirection: 'row-reverse' }}>
                        <Popconfirm placement='leftTop' title="请您再次确认要提交修改后的表单吗?" onConfirm={this.okHandler}>
                            <Button loading={this.state.loading} type='danger'>确定上传</Button>
                        </Popconfirm>
                    </div>
                </Col>
            </Row>
            <DndProvider backend={HTML5Backend}>
                <Table
                    rowClassName={() => 'editable-row'}
                    bordered
                    dataSource={this.state.dataSource}
                    components={this.components}
                    columns={this.columns}
                    pagination={{
                        pageSize: 100
                    }}
                    onRow={(record, index) => ({
                        index,
                        moveRow: this.moveRow
                    })}
                />
            </DndProvider>
        </div>
    }
}

function BodyRow(props) {
    const { isOver, connectDragSource, connectDropTarget, moveRow, ...restProps } = props;
    const style = { ...restProps.style, cursor: 'move' };

    let { className } = restProps;
    if (isOver) {
        if (restProps.index > dragingIndex) {
            className += ' drop-over-downward';
        }
        if (restProps.index < dragingIndex) {
            className += ' drop-over-upward';
        }
    }

    return connectDragSource(
        connectDropTarget(<tr {...restProps} className={className} style={style} />),
    );
}



