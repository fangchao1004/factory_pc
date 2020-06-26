import React, { Component } from 'react';
import { Table, Select, Button, Popconfirm, Input, message } from 'antd'
import HttpApi from '../../util/HttpApi';
const { Option } = Select;
const childrenForWeek = [1, 2, 3, 4, 5, 6, 7].map((item) => { return <Option key={item} value={String(item)}>周{item}</Option> });
const childrenForMonth = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31].map((item) => { return <Option key={item} value={String(item)}>{item}日</Option> });
const childrenForLoop = [<Option key={1} value={1}>每周</Option>, <Option key={2} value={2}>每月</Option>]
export default class SchemeView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isEditing: false,///是否处于编辑模式下
            schemeData: [],
        };
    }
    componentDidMount() {
        this.init();
    }
    init = async () => {
        let result = await this.getSchemeData();
        let schemeData = result.map((item, index) => { item.key = index; return item });
        this.setState({ schemeData })
    }
    getSchemeData = () => {
        return new Promise((resolve, reject) => {
            let sql = `select scheme.*,group_concat(scheme_map_value.date_value) as date_value from scheme
            left join scheme_map_value on scheme.id = scheme_map_value.scheme_id
            group by scheme.id`
            HttpApi.obs({ sql }, (res) => {
                let result = [];
                if (res.data && res.data.code === 0) {
                    result = res.data.data
                }
                resolve(result);
            })
        })
    }
    /**
     * @params record 某行数据-某个对象 利用对象中的key【索引】 找到数据中的对应位置
     * @params targetCell 要改动的对象属性
     * @params newValue 新值
     */
    changeTableData = (record, targetCell, newValue) => {
        let data = this.state.schemeData;
        data[record.key][targetCell] = newValue
        this.setState({
            schemeData: data
        })
    }

    /**
     * 当周期选择发生变化时，要清空日期选择
     * @params record 某行数据-某个对象 利用对象中的key【索引】 找到数据中的对应位置
     */
    clearDateSelect = (record) => {
        let data = this.state.schemeData;
        data[record.key]['date_value'] = null
        this.setState({
            schemeData: data
        })
    }
    /**
     * 检查数据中 是否有空的情况
     */
    checkData = () => {
        let isOK = true;
        this.state.schemeData.forEach((item) => {
            if (!item.date_value || item.date_value === '') { isOK = false }
        })
        return isOK
    }

    /**
     * 删除的时候，就要去数据库查询，这个方案有没有设备已经挂载了。如果已经有了，就不允许删除。只能修改值。
     */
    checkAllowDelete = (record) => {
        let sql = `select count(*) count from scheme_map_device where scheme_id = ${record.id}`
        HttpApi.obs({ sql }, (res) => {
            if (res.data && res.data.code === 0) {
                console.log('res.data.data[0].count:', res.data.data[0].count)
                if (res.data.data[0].count > 0) { message.error('该方案已经挂载过了某些设备，只能修改数值，不能删除'); } else {
                    console.log('可以删除')
                    let data = this.state.schemeData;
                    let newResult = data.filter((item) => {
                        return item.key !== record.key
                    })
                    this.setState({ schemeData: newResult.map((item, index) => { item.key = index; return item }) })
                }
            }
        })
    }
    render() {
        const schemeCloums = [
            {
                title: '标题',
                dataIndex: 'title',
                render: (text, record) => {
                    return <Input disabled={!this.state.isEditing} value={text} onChange={(e) => {
                        this.changeTableData(record, 'title', e.target.value);
                    }}></Input>
                }
            },
            {
                title: '周期',
                dataIndex: 'cycle_id',
                render: (text, record) => {
                    return <Select
                        disabled={!this.state.isEditing}
                        style={{ width: '100%' }}
                        placeholder="Please select"
                        value={text}
                        onChange={(v) => {
                            this.changeTableData(record, 'cycle_id', v);
                            this.clearDateSelect(record);
                        }}
                    >
                        {childrenForLoop}
                    </Select>
                }
            }, {
                title: '班次',
                dataIndex: '啊啊啊是',
                render: (text, record) => {
                    return <Select
                        disabled={!this.state.isEditing}
                        style={{ width: '100%' }}
                        placeholder="Please select"
                        value={text}
                        onChange={(v) => {
                            this.changeTableData(record, 'cycle_id', v);
                            this.clearDateSelect(record);
                        }}
                    >
                        {childrenForLoop}
                    </Select>
                }
            }, {
                title: '日期/星期(可选)',
                dataIndex: 'date_value',
                render: (text, record) => {
                    // console.log('record:', record)
                    return <div>
                        <Select
                            disabled={!this.state.isEditing}
                            mode="multiple"
                            style={{ width: '100%' }}
                            placeholder="Please select"
                            value={(text && text.split(',')) || []}
                            onChange={(e) => {
                                this.changeTableData(record, 'date_value', e.join(','));
                            }}
                            maxTagCount={10}
                        >
                            {record.cycle_id === 1 ? childrenForWeek : childrenForMonth}
                        </Select>
                    </div>
                }
            }, {
                title: '操作',
                dataIndex: 'action',
                width: 100,
                render: (text, record) => {
                    return <Popconfirm title='确认删除吗?' onConfirm={() => {

                        /// 删除的时候，就要去数据库查询，这个方案有没有设备已经挂载了。如果已经有了，就不允许删除。只能修改值。
                        this.checkAllowDelete(record);
                    }}><Button disabled={!this.state.isEditing} type='danger'>删除</Button></Popconfirm>
                }
            }
        ]
        return <div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                {this.state.isEditing ? <Button type='primary' onClick={() => {
                    this.state.schemeData.push({
                        id: new Date().getTime(),
                        effective: 1,
                        cycle_id: 1,
                        cycle_name: "每周",
                        title: "方案" + (this.state.schemeData.length + 1),
                        date_value: "",
                        key: this.state.schemeData.length,
                    })
                    // console.log('newData:', this.state.schemeData)
                    this.setState({ schemeData: this.state.schemeData })
                }}>添加新方案</Button> : <span />}
                {this.state.isEditing ? <div>
                    <Popconfirm title='确定恢复重置吗？' onConfirm={() => {
                        this.setState({ isEditing: false })
                        this.init();
                    }}><Button style={{ marginRight: 20 }} type='dashed'>取消-恢复重置</Button></Popconfirm>
                    <Popconfirm title='确定提交修改吗？' onConfirm={() => {
                        /// 要修改scheme表和scheme_map_value表。
                        /// 在更新scheme_map_value表的时候，要怎么数据汇总处理呢? 只能整体替换scheme_map_value表。设备挂载的是scheme表的id,映射表的整体替换不会引用已有的设备和方案的映射关系
                        let isOK = this.checkData();
                        console.log('isOK:', isOK)
                        if (!isOK) { message.error('日期不可为空'); }
                        else {
                            this.setState({ isEditing: false })
                            console.log('确定提交修改吗？:', this.state.schemeData);

                        }
                    }}><Button type='danger' >确认修改</Button></Popconfirm>
                </div> :
                    <Button type='primary' onClick={() => { this.setState({ isEditing: true }) }}>开始编辑</Button>}</div>
            <Table style={{ marginTop: 10 }} bordered columns={schemeCloums} dataSource={this.state.schemeData} pagination={false} />
        </div >
    }

}