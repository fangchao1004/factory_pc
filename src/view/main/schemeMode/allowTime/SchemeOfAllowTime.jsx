import React, { Component } from 'react';
import HttpApi from '../../../util/HttpApi';
import { Button, Popconfirm, Table, Tag, message } from 'antd';
import AddAtmSchemeView from './AddAtmSchemeView';
import UpdateAtmSchemeView from './UpdateAtmSchemeView';

class SchemeOfAllowTime extends Component {
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
        let shemeResult = await this.getShemeInfo();///scheme_of_allowTime
        // console.log('shemeResult:', shemeResult)
        this.setState({ data: shemeResult.map((item, index) => { item.key = index; return item }) })
    }
    getShemeInfo = () => {
        return new Promise((resolve, reject) => {
            let sql = `select scheme_of_allowTime.*,
            group_concat(allow_time.id) as timeId_list,
            group_concat(concat(concat_ws('~',allow_time.begin,allow_time.end),' (',allow_time.name,')')) as timeStr_list
            from scheme_of_allowTime
            left join (select * from sche_atm_map_time where effective = 1) sche_atm_map_time on sche_atm_map_time.scheme_id = scheme_of_allowTime.id
            left join (select * from allow_time where effective = 1) allow_time on allow_time.id = sche_atm_map_time.allowTime_id
            where scheme_of_allowTime.effective = 1
            group by scheme_of_allowTime.id
            `
            HttpApi.obs({ sql }, (res) => {
                let result = [];
                if (res.data.code === 0) { result = res.data.data }
                resolve(result);
            })
        })
    }
    addSchemeCancel = () => { this.setState({ addVisible: false }); }
    updateSchemeCancel = () => { this.setState({ updateVisible: false }); }
    addSchemeOk = (value) => {
        // console.log('addSchemeOk:', value) ///{title: "zxczxcz", atm_options: [1,2]}
        this.setState({ addVisible: false });
        this.insertIntoDB(value);
    }
    /**
     * 整合sql批量插入的语句
     */
    transformSqlLanguage = (scheme_id, value) => {
        let sqlList = value.atm_options;
        let string = '';
        for (let index = 0; index < sqlList.length; index++) {
            let cellStr = '(' + scheme_id + ',' + sqlList[index] + ')' + (index === sqlList.length - 1 ? ';' : ',')
            string = string + cellStr
        }
        return string
    }
    /**
     * 批量插入 sche_cyc_map_date
     */
    insertIntoDB = (value) => {
        let sql = `insert into scheme_of_allowTime (title) value ('${value.title}');`
        HttpApi.obs({ sql }, (res) => {
            if (res.data.code === 0) {
                let sql = `select max(id) as max_id from scheme_of_allowTime`
                HttpApi.obs({ sql }, (res) => {
                    if (res.data.code === 0) {
                        let max_id = res.data.data[0].max_id;
                        let string = this.transformSqlLanguage(max_id, value);
                        let sql = `insert into sche_atm_map_time(scheme_id,allowTime_id) values ${string}`
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
        // console.log('updateSchemeOk:', value) ///{title: "zxczxcz", atm_options: [1,2]}
        this.setState({ updateVisible: false });
        this.updateInfoDB(value);
    }
    updateInfoDB = (value) => {
        let sql = `update scheme_of_allowTime set title='${value.title}' where id=${value.id}`
        HttpApi.obs({ sql }, (res) => {
            if (res.data.code === 0) {
                let sql = `update sche_atm_map_time set effective = 0 where scheme_id = ${value.id}`
                HttpApi.obs({ sql }, (res) => {
                    if (res.data.code === 0) {
                        let string = this.transformSqlLanguage(value.id, value);
                        let sql = `insert into sche_atm_map_time(scheme_id,allowTime_id) values ${string}`
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
        let sql = `update scheme_of_allowTime set effective = 0 where id = ${record.id}`
        HttpApi.obs({ sql }, (res) => {
            if (res.data.code === 0) {
                let sql = `update sche_atm_map_time set effective = 0 where scheme_id = ${record.id}`
                HttpApi.obs({ sql }, (res) => {
                    if (res.data.code === 0) {
                        let sql = `update sche_cyc_atm_map_sample set atm_scheme_id=null where atm_scheme_id = ${record.id}`
                        HttpApi.obs({ sql }, (res) => {
                            if (res.data.code === 0) {
                                let sql = `update sche_cyc_atm_map_sample set effective = 0 where atm_scheme_id is null and cyc_scheme_id is null`;
                                HttpApi.obs({ sql }, (res) => {
                                    if (res.data.code === 0) {
                                        message.success('删除时间段方案成功');
                                        this.init();
                                    } else { message.error('删除时间段方案失败'); }
                                })
                            } else {
                                message.error('删除时间段方案失败');
                            }
                        })
                    } else { message.error('删除时间段方案失败'); }
                })
            } else { message.error('删除时间段方案失败'); }
        })
    }


    render() {
        let columns = [
            {
                title: '标题',
                dataIndex: 'title',
            }, {
                title: '巡检时间段',
                dataIndex: 'timeStr_list',
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
                <Button type='primary' onClick={() => { this.setState({ addVisible: true }) }}>添加时间段方案</Button>
                <Table style={{ marginTop: 20 }} bordered columns={columns} dataSource={this.state.data} pagination={false} />
                <AddAtmSchemeView visible={this.state.addVisible} onOk={this.addSchemeOk} onCancel={this.addSchemeCancel} />
                <UpdateAtmSchemeView visible={this.state.updateVisible} onOk={this.updateSchemeOk} onCancel={this.updateSchemeCancel} record={this.state.record} />
            </div>
        );
    }
}

export default SchemeOfAllowTime;