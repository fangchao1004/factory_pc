import React, { Component } from 'react';
import { Table, Button, Form, message, InputNumber } from 'antd';
import moment from 'moment';
import HttpApi from '../../util/HttpApi';
import RecordDetailByTime from './RecordDetailByTime';

const storage = window.localStorage;
const localUserInfo = storage.getItem('userinfo')
const today = moment().format('YYYY-MM-DD ');
const tomorrow = moment().add(1, 'day').format('YYYY-MM-DD ');
/**
 * 时间区间 模块界面
 */
class TimeView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isAdmin: localUserInfo && JSON.parse(localUserInfo).isadmin === 1,
            dataSource: [],
            showDrawer: false,
            oneRecord: {}
        }
        this.columns = [
            {
                title: '今日时间段划分',
                dataIndex: '/',
                render: (text, record) => {
                    return <div>{record.begin} ~ {record.end} （{record.name}）</div>
                }
            },
            {
                title: '今日应检测设备数量',
                dataIndex: 'should',
                editable: true,
                render: (text, record) => {
                    return <div>{text !== null ? text : '/'}</div>
                }
            },
            {
                title: '今日实际检测设备数量',
                dataIndex: 'actually',
            }, {
                title: '操作',
                dataIndex: 'actions',
                width: 150,
                render: (text, record) => (
                    <div style={{ textAlign: 'center' }}>
                        <Button size="small" type="primary" onClick={() => {
                            this.setState({
                                oneRecord: record,
                                showDrawer: true
                            })
                        }}>详情</Button>
                    </div>
                )
            }
        ]
    }
    componentDidMount() {
        this.init();
    }
    closeHandler = () => {
        this.setState({
            showDrawer: false
        })
    }
    init = async () => {
        let result = await this.getAllowTimeInfo();
        // console.log('result:', result);
        this.getInfoAndChangeData(result);
    }
    getAllowTimeInfo = () => {
        return new Promise((resolve, reject) => {
            let sql = `select * from allow_time`;
            HttpApi.obs({ sql }, (res) => {
                let result = [];
                if (res.data.code === 0) {
                    result = res.data.data
                }
                resolve(result);
            })
        })
    }
    getInfoAndChangeData = async (resultList) => {
        for (let index = 0; index < resultList.length; index++) {
            const element = resultList[index];
            let beginTime = today + element.begin
            let endTime = element.isCross === 1 ? tomorrow + element.end : today + element.end
            element.bt = beginTime;
            element.et = endTime;
            let result = await this.getCountInfoFromDB(element);
            element.actually = result[0].count;
        }
        this.setState({
            dataSource: resultList.map((item, index) => { item.key = index + ''; return item })
        })
    }

    /**
     * 从数据库查询统计数据
     */
    getCountInfoFromDB = (element) => {
        let sql = `select count(distinct(device_id)) as count from records
        where checkedAt>'${element.bt}' and checkedAt<'${element.et}'`;
        return new Promise((resolve, reject) => {
            HttpApi.obs({ sql }, (res) => {
                let result = [];
                if (res.data.code === 0) {
                    result = res.data.data
                }
                resolve(result);
            })
        })
    }

    /**
     * 保存到数据库
     */
    handleSave = async (data) => {
        console.log('data:', data);
        let result = await this.changeShouldNum(data);
        if (result) { message.success('设置成功'); this.init() }
        else { message.error('设置失败') }
    }

    changeShouldNum = (data) => {
        return new Promise((resolve, reject) => {
            let sql = `UPDATE allow_time SET should=${parseInt(data.should)} where id = ${data.id}`
            let result = false;
            HttpApi.obs({ sql }, data => {
                if (data.data.code === 0) {
                    result = true
                }
                resolve(result);
            })
        })
    }


    render() {
        const { dataSource } = this.state;
        const components = {
            body: {
                row: EditableFormRow,
                cell: EditableCell,
            },
        };
        const columns = this.columns.map(col => {
            if (!col.editable) {
                return col;
            }
            return {
                ...col,
                onCell: record => ({
                    record,
                    editable: col.editable,
                    dataIndex: col.dataIndex,
                    title: col.title,
                    handleSave: this.handleSave,
                }),
            };
        });
        return (
            <div>
                <Table
                    components={components}
                    rowClassName={() => 'editable-row'}
                    bordered
                    columns={columns}
                    dataSource={dataSource}
                />
                <RecordDetailByTime visible={this.state.showDrawer} record={this.state.oneRecord} close={this.closeHandler} />
            </div>
        );
    }
}

export default TimeView;

const EditableContext = React.createContext();

const EditableRow = ({ form, index, ...props }) => (
    <EditableContext.Provider value={form}>
        <tr {...props} />
    </EditableContext.Provider>
);

const EditableFormRow = Form.create()(EditableRow);

class EditableCell extends React.Component {
    state = {
        editing: false,
    };

    toggleEdit = () => {
        const editing = !this.state.editing;
        this.setState({ editing }, () => {
            if (editing) {
                this.input.focus();
            }
        });
    };

    save = e => {
        const { record, handleSave } = this.props;
        this.form.validateFields((error, values) => {
            if (error && error[e.currentTarget.id]) {
                return;
            }
            this.toggleEdit();
            handleSave({ ...record, ...values });
        });
    };

    renderCell = form => {
        this.form = form;
        const { children, dataIndex, record, title } = this.props;
        const { editing } = this.state;
        return editing ? (
            <Form.Item style={{ margin: 0 }}>
                {form.getFieldDecorator(dataIndex, {
                    rules: [
                        {
                            required: true,
                            message: `${title} 不可为空！`,
                        },
                    ],
                    initialValue: record[dataIndex],
                })(<InputNumber style={{ width: '100%' }} ref={node => (this.input = node)} onPressEnter={this.save} onBlur={this.save} />)}
            </Form.Item>
        ) : (
                <div
                    className="editable-cell-value-wrap"
                    style={{ paddingRight: 24 }}
                    onClick={this.toggleEdit}
                >
                    {children}
                </div>
            );
    };

    render() {
        const {
            editable,
            dataIndex,
            title,
            record,
            index,
            handleSave,
            children,
            ...restProps
        } = this.props;
        return (
            <td {...restProps}>
                {editable ? (
                    <EditableContext.Consumer>{this.renderCell}</EditableContext.Consumer>
                ) : (
                        children
                    )}
            </td>
        );
    }
}