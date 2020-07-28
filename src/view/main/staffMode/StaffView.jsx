import React, { Component } from 'react'
import { Row, Col, Table, Button, message, Popconfirm, Input, Tooltip } from 'antd'
import HttpApi from '../../util/HttpApi'
import AddStaffView from './AddStaffView';
import UpdateStaffView from './UpdateStaffView';
import { permisstion } from '../../util/AppData'
// import { send, emitter } from '../../socket/Socket'
var level_filter = [];///用于筛选部门的数据 选项
var major_filter = [];///用于筛选专业的数据 选项
var permission_filter = [];///用于权限的数据 选项
const { Search } = Input;

class StaffView extends Component {

    state = { users: null, addStaffVisible: false, updateStaffVisible: false, updateStaffData: null }

    componentDidMount() {
        this.getUsersData();
        // emitter.addListener('toClient', (msg) => {
        //     console.log('StaffView:', msg);
        // })
    }
    async getUsersData() {
        level_filter.length = 0;
        major_filter.length = 0;
        permission_filter.length = 0;
        let levelData = await this.getLevelInfo();
        levelData.forEach((item) => { level_filter.push({ text: item.name, value: item.id }) })
        let majorData = await this.getMajorInfo();
        majorData.forEach((item) => { major_filter.push({ text: item.name, value: item.id }) })
        permisstion.forEach((item) => { permission_filter.push({ text: item.name, value: item.value }) })

        var usersData = await this.getUserList()
        this.setState({
            users: usersData.map(user => {
                user.key = user.id
                return user
            }),
        })
    }
    getMajorInfo = () => {
        let sqlText = 'select id,name from majors where effective = 1'
        return new Promise((resolve, reject) => {
            HttpApi.obs({ sql: sqlText }, (res) => {
                let result = [];
                if (res.data.code === 0) {
                    result = res.data.data
                }
                resolve(result);
            })
        })
    }
    getLevelInfo = () => {
        let sqlText = 'select levels.id,levels.name from levels where effective = 1'
        return new Promise((resolve, reject) => {
            HttpApi.obs({ sql: sqlText }, (res) => {
                let result = [];
                if (res.data.code === 0) {
                    result = res.data.data
                }
                resolve(result);
            })
        })
    }
    getUserList = () => {
        return new Promise((resolve, reject) => {
            // let sql = `select users.*,levels.name as level_name from users 
            // left join (select * from levels where effective = 1)levels on levels.id = users.level_id
            // where users.effective = 1
            // order by level_id`;
            let sql = `select users.* ,group_concat(u_m_j.mj_id) as major_id_all, group_concat(majors.name) as major_name_all,levels.name as level_name from users
            left join (select * from levels where effective = 1)levels on levels.id = users.level_id
            left join (select * from user_map_major where effective = 1) u_m_j on u_m_j.user_id = users.id
            left join (select * from majors  where effective = 1) majors on majors.id = u_m_j.mj_id
            where users.effective = 1
            group by users.id
            order by level_id`
            let result = [];
            HttpApi.obs({ sql }, (res) => {
                if (res.data.code === 0) { result = res.data.data }
                resolve(result);
            })
        })
    }

    addStaff() {
        this.setState({ addStaffVisible: true })
    }
    ///添加员工-确定
    addStaffOnOk = (newValues) => {
        // let level_group = newValues.level_id.split('_');
        ///将 组的数据 从部门 分离出来
        // if (level_group.length > 1) { newValues.level_id = parseInt(level_group[0]); newValues.group_id = parseInt(level_group[1]); }
        if (newValues.permission) {
            newValues.permission = newValues.permission.join(',')
        }
        newValues.isGroupLeader = newValues.isGroupLeader ? 1 : 0
        HttpApi.addUserInfo(newValues, res => {
            if (res.data.code === 0) {
                this.setState({ addStaffVisible: false })
                let lastUserId = res.data.data.id; ///刚刚添加的一个user的数据库id
                let str = '';
                if (newValues.major_id) { ///数组
                    newValues.major_id.forEach((major_id) => {
                        str = str + `(${lastUserId},${major_id}),`
                    })
                    str = str.substring(0, str.length - 1)
                    let sql = `insert into user_map_major (user_id,mj_id) VALUES ${str}`
                    HttpApi.obs({ sql }, (res) => {
                        if (res.data.code === 0) {
                            this.getUsersData()
                            message.success('添加成功')
                        }
                    })
                }
            } else {
                message.error(res.data.data)
            }
        })
    }
    addStaffOnCancel = () => {
        this.setState({ addStaffVisible: false })
    }
    updateStaff(record) {
        this.setState({ updateStaffVisible: true, updateStaffData: record })
    }
    ///更新员工-确定
    updateStaffOnOk = (newValues) => {
        let user_id = this.state.updateStaffData.id;
        newValues.isadmin = newValues.isadmin ? 1 : 0
        newValues.isGroupLeader = newValues.isGroupLeader ? 1 : 0
        if (newValues.permission) newValues.permission = newValues.permission.join(',')
        HttpApi.updateUserInfo({ query: { id: user_id }, update: newValues }, data => {
            if (data.data.code === 0) {
                this.setState({ updateStaffVisible: false })
                let sql = `update user_map_major set effective = 0 where user_id = ${user_id}`
                HttpApi.obs({ sql }, (res) => {
                    if (res.data.code === 0) {
                        if (newValues.major_id && newValues.major_id.length > 0) { ///数组
                            let str = ''
                            newValues.major_id.forEach((major_id) => {
                                str = str + `(${user_id},${major_id}),`
                            })
                            str = str.substring(0, str.length - 1)
                            let sql = `insert into user_map_major (user_id,mj_id) VALUES ${str}`
                            HttpApi.obs({ sql }, (res) => {
                                if (res.data.code === 0) {
                                    this.getUsersData()
                                    message.success('更新成功')
                                }
                            })
                        } else {
                            this.getUsersData()
                            message.success('更新成功')
                        }
                    }
                })
            } else {
                message.error(data.data.data)
            }
        })
    }
    updateStaffOnCancel = () => {
        this.setState({ updateStaffVisible: false })
    }
    deleteStaffConfirm = (record) => {
        HttpApi.obs({ sql: `update users set effective = 0 where id = ${record.id} ` }, (data) => {
            // HttpApi.removeUserInfo({ id: record.id }, data => {
            if (data.data.code === 0) {
                message.success('删除成功')
                this.getUsersData()
            } else {
                message.error(data.data.data)
            }
        })
    }
    onSearch = async (value) => {
        if (value === '') { message.info('请输入有效字符'); return; }
        // console.log('onSearch:', value);
        let usersData = await this.searchUserData(value);
        this.setState({
            users: usersData.map(user => {
                user.key = user.id
                return user
            })
        })
    }
    onChange = async (value) => {
        if (value !== '') { return; }
        // console.log('init')
        var usersData = await this.getUserList()
        if (usersData.length !== this.state.users.length) {
            // console.log('需要重新渲染所有');
            this.setState({
                users: usersData.map(user => {
                    user.key = user.id
                    return user
                })
            })
        }
        // else { console.log('不需要重新渲染所有'); }
    }
    searchUserData(value) {
        return new Promise((resolve, reject) => {
            // let sql = `select users.*,levels.name as level_name from users 
            // left join levels on levels.id = users.level_id
            // where users.effective = 1 and users.name like '%${value}%'
            // order by users.level_id`;
            let sql = `select users.* ,group_concat(u_m_j.mj_id) as major_id_all, group_concat(majors.name) as major_name_all,levels.name as level_name from users
            left join (select * from levels where effective = 1)levels on levels.id = users.level_id
            left join (select * from user_map_major where effective = 1) u_m_j on u_m_j.user_id = users.id
            left join (select * from majors  where effective = 1) majors on majors.id = u_m_j.mj_id
            where users.effective = 1 and users.name like '%${value}%'
            group by users.id
            order by users.level_id`
            let result = [];
            HttpApi.obs({ sql }, (res) => {
                if (res.data.code === 0) { result = res.data.data }
                resolve(result);
            })
        })
    }
    getPermissionLabByIdStr = (idStr) => {
        if (idStr) {
            let nameList = [];
            idStr.split(',').forEach((id) => {
                permisstion.forEach((item) => {
                    if (String(item.value) === id) { nameList.push(item.name) }
                })
            })
            return nameList.join(',')
        }
    }

    render() {
        const columns = [
            {
                title: '登陆账户',
                dataIndex: 'username',
                width: 130,
                align: 'center',
                render: (text, record) => (
                    <div>{text}</div>
                )
            },
            {
                title: '姓名',
                dataIndex: 'name',
                width: 80,
                align: 'center',
                render: (text, record) => (
                    <div>{text}</div>
                )
            },
            {
                title: '部门',
                dataIndex: 'level_id',
                width: 120,
                filters: level_filter,
                align: 'center',
                onFilter: (value, record) => record.level_id === value,
                render: (text, record, index) => {
                    return <div>{record.level_name}</div>;
                }
            },
            // {
            //     title: '组别',
            //     dataIndex: 'group_id',
            //     render: (text) => {
            //         if (text === null) {
            //             return {
            //                 children: null,
            //                 props: {
            //                     colSpan: 0,
            //                 },
            //             }
            //         }
            //         return <div>{text === 1 ? '甲组' : (text === 2 ? '乙组' : (text === 3 ? '丙组' : '丁组'))}</div>;
            //     }
            // },
            {
                title: '密码',
                dataIndex: 'password',
                width: 120,
                align: 'center',
                render: (text, record) => (
                    <div>{text}</div>
                )
            },
            {
                title: '联系方式',
                dataIndex: 'phonenumber',
                width: 130,
                align: 'center',
                render: (text, record) => (
                    <div>{text}</div>
                )
            },
            {
                title: '权限',
                dataIndex: 'permission',
                width: 120,
                filters: permission_filter,
                align: 'center',
                onFilter: (value, record) => {
                    if (record.permission) {
                        return record.permission.split(',').indexOf(String(value)) !== -1
                    } else {
                        return false
                    }
                },
                render: (text, record) => {
                    let result = this.getPermissionLabByIdStr(text);
                    return <div className='hideText lineClamp5'>
                        <Tooltip title={result}>{result || '/'}
                        </Tooltip>
                    </div>
                }
            },
            {
                title: '专业',
                dataIndex: 'major_id_all',
                filters: major_filter,
                align: 'center',
                onFilter: (value, record) => {
                    if (record.major_id_all) {
                        return record.major_id_all.split(',').indexOf(String(value)) !== -1
                    } else {
                        return false
                    }
                },
                render: (text, record) => (
                    <div className='hideText lineClamp5'>
                        <Tooltip title={record.major_name_all}>{record.major_name_all || '/'}</Tooltip>
                    </div>
                )
            },
            {
                title: '备注',
                dataIndex: 'remark',
                align: 'center',
                render: (text, record) => (
                    <div className='hideText lineClamp5'>
                        <Tooltip title={text}>
                            <span>{text || '/'}</span>
                        </Tooltip>
                    </div>
                )
            },
            {
                title: '操作',
                dataIndex: 'actions',
                width: 120,
                align: 'center',
                render: (text, record) => (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Popconfirm title="确定要删除该员工吗?" onConfirm={this.deleteStaffConfirm.bind(null, record)}>
                            <Button size="small" type="danger">删除</Button>
                        </Popconfirm>
                        <div style={{ borderBottomStyle: 'solid', borderBottomColor: '#D0D0D0', borderBottomWidth: 1, margin: 10 }} />
                        <Button size="small" type="primary" onClick={this.updateStaff.bind(this, record)}>修改</Button></div>
                )
            }
        ];

        return (
            <div>
                {/* <Button type="primary" style={{ marginBottom: 10 }} onClick={() => {
                    send({ name: 'tom' });
                }}>aaa</Button> */}
                <Row>
                    <Col span={6}>
                        <Button type="primary" style={{ marginBottom: 10 }} onClick={this.addStaff.bind(this)}>
                            添加员工
                         </Button>
                    </Col>
                    <Col span={18} style={{ display: 'flex', flexDirection: 'row-reverse' }}>
                        <Search style={{ width: 400 }} allowClear placeholder="支持姓名模糊查询" onSearch={value => this.onSearch(value)} onChange={e => this.onChange(e.currentTarget.value)} enterButton />
                    </Col>
                </Row>
                <Table
                    bordered
                    dataSource={this.state.users}
                    columns={columns}
                    pagination={{
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '50', '100'],
                    }}
                />
                <AddStaffView onOk={this.addStaffOnOk} onCancel={this.addStaffOnCancel} visible={this.state.addStaffVisible} />
                <UpdateStaffView staff={this.state.updateStaffData} onOk={this.updateStaffOnOk}
                    onCancel={this.updateStaffOnCancel} visible={this.state.updateStaffVisible} />
            </div>
        )
    }
}

export default StaffView;