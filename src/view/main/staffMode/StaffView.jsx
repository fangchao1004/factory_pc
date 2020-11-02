import { Button, Divider, message, Popconfirm, Table } from 'antd';
import React, { useEffect, useState, useCallback } from 'react';
import HttpApi from '../../util/HttpApi';
import UpdateStaffView from './UpdateStaffView';
export default () => {
    const [loading, setLoading] = useState(false)
    const [useList, setUserList] = useState([])
    const [levelOptions, setLevelOptions] = useState([])
    const [showUpdate, setShowUpdate] = useState(false)
    const [selectUser, setSelectUser] = useState({})
    const getLevelList = useCallback(async () => {
        let result = await HttpApi.getUserLevel()
        if (result.data.code === 0) {
            setLevelOptions(result.data.data.map((item) => {
                let data = {};
                data.text = item.name;
                data.value = item.id
                return data
            }))
        }
    }, [])
    const getUserList = useCallback(async () => {
        setLoading(true)
        let sql = `select users.*,levels.name as level_name,group_concat(role_map_user.role_value) as role_value_all,group_concat(roles.des) as role_des_all from users
        left join (select * from role_map_user where effective = 1) role_map_user on role_map_user.user_id = users.id
        left join roles on roles.value = role_map_user.role_value
        left join (select id,name from levels where effective = 1) levels on levels.id = users.level_id
        where users.effective = 1
        group by users.id order by users.level_id`
        let result = await HttpApi.obs({ sql })
        if (result.data.code === 0) {
            let list = result.data.data;
            setUserList(list.map((item, index) => { item.key = index; return item }))
        }
        setLoading(false)
    }, [])
    useEffect(() => {
        getLevelList();
        getUserList();
    }, [getLevelList, getUserList])
    const updateStaffOnOk = useCallback(async (newValues) => {
        setLoading(true)
        let user_id = selectUser.id;
        newValues.isadmin = newValues.isadmin ? 1 : 0
        newValues.isGroupLeader = newValues.isGroupLeader ? 1 : 0
        if (newValues.permission) newValues.permission = newValues.permission.join(',')
        HttpApi.updateUserInfo({ query: { id: user_id }, update: newValues }, data => {
            if (data.data.code === 0) {
                setShowUpdate(false)
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
                                    getUserList()
                                    message.success('更新成功')
                                }
                            })
                        } else {
                            getUserList()
                            message.success('更新成功')
                        }
                    }
                })
            } else {
                message.error(data.data.data)
            }
        })
    }, [getUserList, selectUser.id])

    const columns = [{ title: '姓名', width: 80, dataIndex: 'name', key: 'name' },
    { title: '账号', width: 120, dataIndex: 'username', key: 'username' },
    {
        title: '部门',
        filters: levelOptions,
        onFilter: (value, record) => record.level_id === value,
        width: 100, dataIndex: 'level_name', key: 'level_name'
    },
    { title: '角色', width: 200, dataIndex: 'role_des_all', key: 'role_des_all', render: (text) => { return text || '-' } },
    { title: '备注', dataIndex: 'remark', key: 'remark' },
    {
        title: '操作', width: 170, dataIndex: 'action', key: 'action', render: (text, record) => {
            return <div>
                <Button icon='edit' size="small" type='primary' onClick={() => {
                    setSelectUser(record)
                    setShowUpdate(true)
                }}>编辑</Button>
                <Divider type="vertical" />
                <Popconfirm title="确定要删除该部门吗?" onConfirm={() => { }}>
                    <Button icon='delete' size="small" type="danger">删除</Button>
                </Popconfirm>
            </div>
        }
    }]
    return <div style={styles.root}>
        <Table loading={loading} bordered size='small' columns={columns} dataSource={useList} pagination={false} />
        <UpdateStaffView staff={selectUser} onOk={(params) => { setShowUpdate(false); updateStaffOnOk(params) }}
            onCancel={() => { setShowUpdate(false) }} visible={showUpdate} />
    </div>
}
const styles = {
    root: {
        backgroundColor: '#FFFFFF',
        padding: 10
    }
}