import React, { Component } from 'react';
import HttpApi from '../../../util/HttpApi';
import { Table, Button, message, Popconfirm, Tag } from 'antd';
import UpdateDateSchemeView from './UpdateDateSchemeView';
import AddDateSchemeView from './AddDateSchemeView';

/**
 * 巡检方案----针对设备个体
 * 由于设备已经有了 allow_time 巡检时间的映射关系
 * 再在其基础上 映射上某个方案，方案中包含了某些周期日期。
 * 
 */
class SchemeOfDate extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            addVisible: false,
            updateVisible: false,
            record: null
        }
    }
    componentDidMount() {
        this.init();
    }
    init = async () => {
        let shemeResult = await this.getShemeInfo();///scheme_of_cycleDate
        // console.log('shemeResult:', shemeResult)
        this.setState({ data: shemeResult.map((item, index) => { item.key = index; return item }) })
    }
    /**
     * 查询 日期方案
     */
    getShemeInfo = () => {
        return new Promise((resolve, reject) => {
            let sql = `select scheme_of_cycleDate.*,cycle_date.name as cycleDate_name,group_concat(date_value) date_list from scheme_of_cycleDate
            left join (select * from cycle_date where effective = 1)cycle_date on cycle_date.id = scheme_of_cycleDate.cycleDate_id
            left join (select * from sche_cyc_map_date where effective = 1)sche_cyc_map_date on sche_cyc_map_date.scheme_id = scheme_of_cycleDate.id
            where scheme_of_cycleDate.effective = 1
            group by scheme_of_cycleDate.id`
            HttpApi.obs({ sql }, (res) => {
                let result = [];
                if (res.data.code === 0) { result = res.data.data }
                resolve(result);
            })
        })
    }
    updateSchemeCancel = () => {
        this.setState({ updateVisible: false })
    }
    addSchemeCancel = () => {
        this.setState({ addVisible: false })
    }
    addSchemeOk = (value) => {
        /// title: "方案三",cycleDate_id: 2,date_options: ["31", "30"]
        this.setState({ addVisible: false })
        this.insertIntoDB(value);
    }
    /**
     * 整合sql批量插入的语句
     */
    transformSqlLanguage = (scheme_id, value) => {
        let sqlList = [];
        value.date_options.forEach((item) => {
            sqlList.push({ 'cycleDate_id': value.cycleDate_id, 'date_value': parseInt(item) })
        })
        let string = '';
        for (let index = 0; index < sqlList.length; index++) {
            let cellStr = '(' + scheme_id + ',' + sqlList[index].date_value + ')' + (index === sqlList.length - 1 ? ';' : ',')
            string = string + cellStr
        }
        return string
    }
    /**
     * 批量插入 sche_cyc_map_date
     */
    insertIntoDB = (value) => {
        let sql = `insert into scheme_of_cycleDate (title,cycleDate_id) value ('${value.title}',${value.cycleDate_id});`
        HttpApi.obs({ sql }, (res) => {
            if (res.data.code === 0) {
                let sql = `select max(id) as max_id from scheme_of_cycleDate`
                HttpApi.obs({ sql }, (res) => {
                    if (res.data.code === 0) {
                        let max_id = res.data.data[0].max_id;
                        let string = this.transformSqlLanguage(max_id, value);
                        let sql = `insert into sche_cyc_map_date(scheme_id,date_value) values ${string}`
                        HttpApi.obs({ sql }, (res) => {
                            if (res.data.code === 0) {
                                message.success('添加方案成功');
                                this.init();
                            } else { message.error('添加方案失败'); }
                        })
                    } else { message.error('添加方案失败'); }
                })
            } else { message.error('添加方案失败'); }
        })
    }
    updateSchemeOk = (value) => {
        ///{id:10, title: "方案1", cycleDate_id: 1, date_options: ["1","5"]}
        this.setState({ updateVisible: false })
        this.updateInfoDB(value);
    }
    updateInfoDB = (value) => {
        let sql = `update scheme_of_cycleDate set title='${value.title}',cycleDate_id=${value.cycleDate_id} where id=${value.id}`
        HttpApi.obs({ sql }, (res) => {
            if (res.data.code === 0) {
                let sql = `update sche_cyc_map_date set effective = 0 where scheme_id = ${value.id}`
                HttpApi.obs({ sql }, (res) => {
                    if (res.data.code === 0) {
                        let string = this.transformSqlLanguage(value.id, value);
                        let sql = `insert into sche_cyc_map_date(scheme_id,date_value) values ${string}`
                        HttpApi.obs({ sql }, (res) => {
                            if (res.data.code === 0) {
                                message.success('修改方案成功');
                                this.init();
                            } else { message.error('修改方案失败'); }
                        })
                    } else { message.error('修改方案失败'); }
                })
            } else { message.error('修改方案失败'); }
        })
    }
    deleteScheme = (record) => {
        let sql = `update scheme_of_cycleDate set effective = 0 where id = ${record.id}`
        HttpApi.obs({ sql }, (res) => {
            if (res.data.code === 0) {
                let sql = `update sche_cyc_map_date set effective = 0 where scheme_id = ${record.id}`
                HttpApi.obs({ sql }, (res) => {
                    if (res.data.code === 0) {
                        let sql = `update sche_cyc_map_device set effective = 0 where scheme_id = ${record.id}`
                        HttpApi.obs({ sql }, (res) => {
                            if (res.data.code === 0) {
                                let sql = `update sche_cyc_atm_map_sample set cyc_scheme_id=null where cyc_scheme_id = ${record.id}`
                                HttpApi.obs({ sql }, (res) => {
                                    if (res.data.code === 0) {
                                        let sql = `update sche_cyc_atm_map_sample set effective = 0 where atm_scheme_id is null and cyc_scheme_id is null`;
                                        HttpApi.obs({ sql }, (res) => {
                                            if (res.data.code === 0) {
                                                message.success('删除日期方案成功');
                                                this.init();
                                            } else { message.error('删除日期方案失败'); }
                                        })
                                    } else { message.error('删除日期方案失败'); }
                                })
                            } else { message.error('删除日期方案失败'); }
                        })
                    } else { message.error('删除日期方案失败'); }
                })
            } else { message.error('删除日期方案失败'); }
        })
    }

    render() {
        let columns = [
            {
                title: '标题',
                dataIndex: 'title',
            }
            , {
                title: '周期',
                dataIndex: 'cycleDate_name',
            }, {
                title: '日期',
                dataIndex: 'date_list',
                render: (text, record) => {
                    if (text) {
                        return text.split(',').map((item, index) => { return <Tag color='#2db7f5' key={index}>{item}</Tag> })
                    } else {
                        return <div>/</div>
                    }
                }
            }, {
                title: '操作',
                dataIndex: 'action',
                width: 100,
                render: (text, record) => {
                    return <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Button type='primary' size="small" onClick={() => { this.setState({ record, updateVisible: true }) }} >修改</Button>
                        <div style={{ borderBottomStyle: 'solid', borderBottomColor: '#D0D0D0', borderBottomWidth: 1, margin: 10 }} />
                        <Popconfirm title="确定要删除该方案吗?" onConfirm={() => { this.deleteScheme(record); }}>
                            <Button type="danger" size="small" >删除</Button>
                        </Popconfirm>
                    </div>
                }
            }
        ]
        return (
            <div>
                <Button type='primary' onClick={() => { this.setState({ addVisible: true }) }}>添加日期方案</Button>
                <Table style={{ marginTop: 20 }} bordered columns={columns} dataSource={this.state.data} pagination={false} />
                <AddDateSchemeView visible={this.state.addVisible} onOk={this.addSchemeOk} onCancel={this.addSchemeCancel} />
                <UpdateDateSchemeView visible={this.state.updateVisible} onOk={this.updateSchemeOk} onCancel={this.updateSchemeCancel} record={this.state.record} />
            </div>
        );
    }
}

export default SchemeOfDate;