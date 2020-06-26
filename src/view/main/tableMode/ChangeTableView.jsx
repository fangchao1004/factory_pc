import React, { Component } from 'react'
import { Table, Drawer, Input, Button, Popconfirm, Select, message, Row, Col, Icon } from 'antd';
import { tableCellOptionsData } from '../../util/AppData'
import HttpApi from '../../util/HttpApi';
import { DndProvider, DragSource, DropTarget } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import update from 'immutability-helper';
let dragingIndex = -1;
const Option = Select.Option;
var OptionsOfDateScheme = [];
var OptionsOfAllowTimeScheme = [];
var stopIsFilterOptions = [<Option key={0} value={'0'}>否</Option>, <Option key={1} value={'1'}>是</Option>];
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
            destroyOnClose
            title='修改表单'
            placement="left"
            width={1300}
            visible={this.props.visible}
            onClose={this.props.onClose}
        >
            <EditTable {...this.props} data={this.props.data} onOk={this.props.onOk} />
        </Drawer >
    }
}
class EditTable extends Component {
    constructor(props) {
        super(props);
        // console.log('props:',props)
        this.state = {
            dataSource: [],
            loading: false,
            id: null
        }
    }
    componentDidMount() {
        this.init();
    }
    init = async () => {
        const { id, content, scheme_data } = this.props.data
        // console.log("id:", id)
        let finaResult = this.changeDataConstruct(content, scheme_data);
        console.log('finaResult:', finaResult)
        await this.getDateSchemeData();
        await this.getAllowTimeSchemeData();
        this.setState({
            dataSource: finaResult,
            id: id
        })
    }
    changeDataConstruct = (content, scheme_data) => {
        let contentList = JSON.parse(content);
        contentList.forEach((item) => {
            item.cyc_scheme_id = null;
            item.atm_scheme_id = null;
            if (scheme_data) {
                scheme_data.forEach((schemeItem) => {
                    if (item.key === String(schemeItem.key_id)) {
                        item.cyc_scheme_id = schemeItem['scheme_info'][0].cyc_scheme_id;
                        item.atm_scheme_id = schemeItem['scheme_info'][0].atm_scheme_id;
                    }
                })
            }
        })
        return contentList;
    }
    getDateSchemeData = () => {
        return new Promise((resolve, reject) => {
            let sql = `select * from scheme_of_cycleDate where effective = 1 and area0_id = ${this.props.id}`
            HttpApi.obs({ sql }, (res) => {
                if (res.data.code === 0) {
                    // console.log('getDateSchemeData:', res.data.data);
                    OptionsOfDateScheme.length = 0;
                    res.data.data.forEach((item, index) => {
                        OptionsOfDateScheme.push(<Option key={index} value={item.id}>{item.title}</Option>)
                    })
                    resolve(1);
                }
            })
        })
    }
    getAllowTimeSchemeData = () => {
        return new Promise((resolve, reject) => {
            let sql = `select * from scheme_of_allowTime where effective = 1 and area0_id = ${this.props.id}`
            HttpApi.obs({ sql }, (res) => {
                if (res.data.code === 0) {
                    // console.log('getAllowTimeSchemeData:', res.data.data);
                    OptionsOfAllowTimeScheme.length = 0;
                    res.data.data.forEach((item, index) => {
                        OptionsOfAllowTimeScheme.push(<Option key={index} value={item.id}>{item.title}</Option>)
                    })
                    resolve(1);
                }
            })
        })
    }
    columns = [
        {
            title: '标签',
            dataIndex: 'title_name',
            align: 'center',
            render: (text, record) => {
                return (
                    <Input disabled={record.type_id === '7' && record.key === '0'}
                        value={text} onChange={(e) => this.onChangeHandler(record, e.target.value, "title_name")}></Input>
                )
            }
        }, {
            title: '说明',
            dataIndex: 'title_remark',
            align: 'center',
            render: (text, record) => {
                return (
                    <Input disabled={record.type_id !== '12' && record.type_id !== '2'}
                        placeholder={record.type_id === '12' ? '可以输入标题备注' : (record.type_id === '2' ? '可以输入单位' : '/')}
                        value={text} onChange={(e) => this.onChangeHandler(record, e.target.value, "title_remark")}></Input>
                )
            }
        }, {
            title: '元素类型',
            dataIndex: 'type_id',
            align: 'center',
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
            title: '停运过滤',
            dataIndex: 'stopIsFilter',
            align: 'center',
            render: (text, record) => {
                if (record.type_id === '7') { return null }
                return <div style={{ display: 'flex', justifyContent: 'space-between' }}><Select placeholder='空' style={{ width: "100%" }} value={text}
                    onChange={(value, option) => this.onChangeHandler(record, value, "stopIsFilter")}
                >{stopIsFilterOptions}</Select></div>
            }
        }, {
            title: '日期方案',
            dataIndex: 'cyc_scheme_id',
            align: 'center',
            render: (text, record) => {
                if (record.type_id === '7') { return null }
                return <div style={{ display: 'flex', justifyContent: 'space-between' }}><Select style={{ width: "100%" }} value={text}
                    onChange={(value, option) => this.onChangeHandler(record, value, "cyc_scheme_id")}
                >{OptionsOfDateScheme}</Select><Icon type="minus-circle" theme="twoTone" style={{ fontSize: 20, marginLeft: 15, alignSelf: 'center', cursor: "pointer" }}
                    onClick={() => { this.onChangeHandler(record, null, "cyc_scheme_id") }}
                    /></div>
            }
        }, {
            title: '时间段方案',
            dataIndex: 'atm_scheme_id',
            align: 'center',
            render: (text, record) => {
                if (record.type_id === '7') { return null }
                return <div style={{ display: 'flex', justifyContent: 'space-between' }}><Select style={{ width: "100%" }} value={text}
                    onChange={(value, option) => this.onChangeHandler(record, value, "atm_scheme_id")}
                >{OptionsOfAllowTimeScheme}</Select><Icon type="minus-circle" theme="twoTone" style={{ fontSize: 20, marginLeft: 15, alignSelf: 'center', cursor: "pointer" }}
                    onClick={() => { this.onChangeHandler(record, null, "atm_scheme_id") }}
                    /></div>
            }
        },
        {
            title: '操作',
            dataIndex: 'operation',
            width: 100,
            align: 'center',
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
        let copyDataSource = JSON.parse(JSON.stringify(this.state.dataSource.map((item, index) => { item.key = String(index + 1); return item })));
        console.log('onChangeHandler copyDataSource:', copyDataSource)
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
        ///每次删除都要重置key
        let temp = (this.state.dataSource.filter(item => item.key !== key)).map((item, index) => { item.key = String(index + 1); return item })
        this.setState({
            dataSource: temp
        }, () => {
            console.log('删除后的数据：', this.state.dataSource)
        })
    }
    handleAdd = () => {
        const newData = {
            key: this.state.dataSource.length + 1 + '',
            title_name: `标题${parseInt(this.state.dataSource.length + 1)}`,
            type_id: "12", ///默认添加的是 id=12 的 通用组件（无需默认值）
            default_values: '',
            title_remark: '',///标题备注
            cyc_scheme_id: null,
            atm_scheme_id: null,
        };
        this.setState({
            dataSource: [...this.state.dataSource, newData]
        })
    }
    okHandler = () => {
        // console.log('okHandler this.state.dataSource:', this.state.dataSource)
        this.setState({
            loading: true
        })
        this.transFromDataConstruct();
    }
    ///改变数据结构
    transFromDataConstruct = () => {
        let schemeList = [];/// 将方案重新提取处理
        let contentArr = [];///content 内容
        let schemeListHasSampleId = [];
        let copyData = JSON.parse(JSON.stringify(this.state.dataSource));
        copyData.forEach((element) => {
            if (element.cyc_scheme_id || element.atm_scheme_id) {
                schemeList.push({ "key_id": parseInt(element.key), "cyc_scheme_id": element.cyc_scheme_id, "atm_scheme_id": element.atm_scheme_id });
            }
            delete element.cyc_scheme_id;
            delete element.atm_scheme_id;
            contentArr.push(element);
        })
        console.log('copyData:', copyData)
        console.log("方案:", schemeList)
        console.log("content:", contentArr)
        // return;
        ///无论这个sample之前有没有管理的方案  都要先将 sche_cyc_atm_map_sample 表中 该 sample_id原有的映射关系全部置0，再插入最新的映射数据
        let sql = `update sche_cyc_atm_map_sample set effective = 0 where sample_id = ${this.state.id}`
        HttpApi.obs({ sql }, (res) => {
            if (res.data.code === 0) {
                if (schemeList.length > 0) {///有最新的方案
                    schemeList.forEach((item, key) => {
                        schemeListHasSampleId.push({ sample_id: this.state.id, ...item })
                    })
                    let sqlString = this.transformSqlLanguage(schemeListHasSampleId);
                    let sql = `insert into sche_cyc_atm_map_sample (sample_id,key_id,cyc_scheme_id,atm_scheme_id) values ${sqlString}`
                    HttpApi.obs({ sql }, (res) => {
                        if (res.data.code === 0) {
                            HttpApi.updateSampleInfo({ query: { id: this.state.id }, update: { content: JSON.stringify(contentArr) } }, (res) => {
                                if (res.data.code === 0) {
                                    this.setState({
                                        loading: false
                                    })
                                    message.success('修改表单以及方案成功');
                                    this.props.onOk();
                                } else { message.error('修改表单以及方案失败'); }
                            })
                        } else { message.error('修改表单以及方案失败'); }
                    })
                } else {///没有方案？
                    console.log('没有方案-直接修改表单')
                    HttpApi.updateSampleInfo({ query: { id: this.state.id }, update: { content: JSON.stringify(contentArr) } }, (res) => {
                        if (res.data.code === 0) {
                            this.setState({
                                loading: false
                            })
                            message.success('修改表单成功');
                            this.props.onOk();
                        } else {
                            message.error('修改表单失败');
                        }
                    })
                    console.log('不需要添加日期方案和时间段方案 与 模版直接的映射关系了')
                }
            } else { message.error('修改表单以及方案失败'); }
        })
    }
    transformSqlLanguage = (schemeListHasSampleId) => {
        let string = '';
        for (let index = 0; index < schemeListHasSampleId.length; index++) {
            let elememt = schemeListHasSampleId[index];
            let cellStr = '(' + elememt.sample_id + ',' + elememt.key_id + ',' + elememt.cyc_scheme_id + ',' + elememt.atm_scheme_id + ')' + (index === schemeListHasSampleId.length - 1 ? ';' : ',')
            string = string + cellStr
        }
        return string
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
        }), () => {///每次拖动都要重置key
            this.setState({
                dataSource: this.state.dataSource.map((item, index) => { item.key = String(index + 1); return item })
            }, () => {
                console.log('每次拖动都要重置key:', this.state.dataSource)
            })
        })

    };
    render() {
        return <div>
            <Row>
                <Col span={6}>
                    <Button onClick={this.handleAdd} type="primary" style={{ marginBottom: 10 }}>添加表单项目</Button>
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
                    pagination={false}
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



