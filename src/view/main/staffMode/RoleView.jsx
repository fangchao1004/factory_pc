import React, { useState, useEffect, useCallback } from 'react'
import HttpApi from '../../util/HttpApi'
import { Row, Col, Table, List, Avatar, Tag, Alert, Switch, message } from 'antd'

function sortByLevel(list) {
    let copyList = JSON.parse(JSON.stringify(list))
    return copyList.sort((a, b) => { return a.level_id - b.level_id });
}
export default props => {
    const [roleList, setRoleList] = useState([])
    const [userList, setUserList] = useState([])
    const [selectRoleValue, setSelectRoleValue] = useState(0)///默认选中的是value 0 即 专工
    const [levelOptions, setLevelOptions] = useState([])
    const [loading, setLoading] = useState(false)
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
    const getRoleList = useCallback(async () => {
        let sql = `select * from roles order by sort_num`
        let result = await HttpApi.obs({ sql })
        if (result.data.code === 0) {
            setRoleList(result.data.data.map((item, index) => { item.key = index; return item }))
        }
    }, [setRoleList])
    const getUserList = useCallback(async (whoHasList) => {
        let sql = `select users.*,levels.name as level_name,group_concat(role_map_user.role_value) as role_value_all,group_concat(roles.des) as role_des_all from users
        left join (select * from role_map_user where effective = 1) role_map_user on role_map_user.user_id = users.id
        left join roles on roles.value = role_map_user.role_value
        left join (select id,name from levels where effective = 1) levels on levels.id = users.level_id
        where users.effective = 1
        group by users.id order by users.level_id`
        let result = await HttpApi.obs({ sql })
        if (result.data.code === 0) {
            let list = result.data.data;
            let tempListhasRole = [];
            let tempListWithoutRole = [];
            list.forEach((item, index) => {
                if (whoHasList.indexOf(item.id) !== -1) {
                    item.hasCurrentRole = true;
                    tempListhasRole.push(item)
                } else {
                    item.hasCurrentRole = false;
                    tempListWithoutRole.push(item)
                }
            })
            let tempListHasRole_af = sortByLevel(tempListhasRole)
            let tempListWithoutRole_af = sortByLevel(tempListWithoutRole)
            let tempList = [...tempListHasRole_af, ...tempListWithoutRole_af];
            setUserList(tempList.map((item, index) => { item.key = index; return item }))
        }
    }, [])
    const getOneRoleWhoIsHas = useCallback(async () => {
        let sql = `select * from role_map_user where effective = 1 and role_value = ${selectRoleValue}`
        let result = await HttpApi.obs({ sql })
        let tempList = [];
        if (result.data.code === 0) {
            tempList = result.data.data.map((item) => item.user_id);
        }
        getUserList(tempList);
    }, [selectRoleValue, getUserList])
    const getInfoByValue = useCallback(() => {
        let result = roleList.filter((item) => {
            return item.value === selectRoleValue
        });
        return result[0] || {}
    }, [selectRoleValue, roleList])
    const addNewRoleToMap = useCallback(async (user_id, role_value) => {
        setLoading(true)
        let sql = `insert into role_map_user (user_id,role_value) VALUES (${user_id},${role_value})`
        console.log('sql:', sql)
        let result = await HttpApi.obs({ sql })
        if (result.data.code === 0) {
            message.success('开启成功')
            getRoleList();
            getOneRoleWhoIsHas();
        }
        setLoading(false)
    }, [getRoleList, getOneRoleWhoIsHas])
    const closeOneUserRole = useCallback(async (user_id, role_value) => {
        setLoading(true)
        let sql = `update role_map_user set effective = 0 where user_id = ${user_id} and role_value = ${role_value}`
        let result = await HttpApi.obs({ sql })
        if (result.data.code === 0) {
            message.success('关闭成功')
            getRoleList();
            getOneRoleWhoIsHas();
        }
        setLoading(false)
    }, [getRoleList, getOneRoleWhoIsHas])
    useEffect(() => {
        getLevelList()
        getRoleList();
        getOneRoleWhoIsHas();
    }, [getRoleList, getOneRoleWhoIsHas, getLevelList])
    const columns = [
        {
            title: '操作', width: 100, dataIndex: 'hasCurrentRole', key: 'hasCurrentRole', render: (text, record) => {
                return <Switch checkedChildren='开启' unCheckedChildren='关闭' checked={text} onChange={(value) => {
                    if (value) {
                        addNewRoleToMap(record.id, selectRoleValue)
                    } else {
                        closeOneUserRole(record.id, selectRoleValue)
                    }
                }} />
            }
        },
        { title: '姓名', dataIndex: 'name', key: 'name' },
        {
            title: '部门',
            filters: levelOptions,
            align: 'center',
            onFilter: (value, record) => record.level_id === value,
            dataIndex: 'level_name', key: 'level_name'
        },
        { title: '已开启角色', dataIndex: 'role_des_all', key: 'des', render: (text) => { return text || '-' } }]
    return <div style={styles.root}>
        <Alert style={{ marginBottom: 10 }} message={'点击选择左侧角色列表项；再为人员设置开启或关闭对应属性'} />
        <Row gutter={10}>
            <Col span={6}>
                <div style={styles.list}>
                    <List
                        size="small"
                        header={<div><Tag color='#fa541c'>角色-当前选中:</Tag><Tag color={getInfoByValue().color}>{getInfoByValue().des}</Tag></div>}
                        bordered
                        dataSource={roleList}
                        renderItem={item => (
                            <List.Item style={{ cursor: 'pointer' }}>
                                <List.Item.Meta
                                    onClick={() => {
                                        setSelectRoleValue(item.value)
                                    }}
                                    avatar={<Avatar style={{ backgroundColor: item.color }} >{item.des}</Avatar>}
                                    title={<span>{item.des}</span>}
                                />
                            </List.Item>
                        )}
                    />
                </div>
            </Col>
            <Col span={18}>
                <Table size="small"
                    loading={loading}
                    bordered
                    columns={columns}
                    dataSource={userList}
                    pagination={false} />
            </Col>
        </Row>
    </div>
}
const styles = {
    root: {
        // minHeight: '100vh',
        backgroundColor: '#FFFFFF',
        padding: 10
    },
    list: {
        height: '100vh',
        overflow: 'auto'
    }
}