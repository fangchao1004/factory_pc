import { Button, Col, Divider, Input, message, Popconfirm, Row, Table, Tooltip } from 'antd';
import React, { useEffect, useState, useCallback } from 'react';
import HttpApi from '../../util/HttpApi';
import AddStaffView from './AddStaffView';
import UpdateStaffView from './UpdateStaffView';

var originList = []
export default () => {
  const [loading, setLoading] = useState(false)
  const [useList, setUserList] = useState([])
  const [levelOptions, setLevelOptions] = useState([])
  const [showUpdate, setShowUpdate] = useState(false)
  const [selectUser, setSelectUser] = useState({})
  const [showAdd, setShowAdd] = useState(false)
  const [searchInputValue, setSearchInputValue] = useState('')

  const getLevelList = useCallback(async () => {
    let result = await HttpApi.getUserLevel({ effective: 1 })
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
    originList.length = 0
    setLoading(true)
    // let sql = `select users.*,levels.name as level_name,group_concat(roles.value) as role_value_all,group_concat(roles.des) as role_des_all from users
    // left join (select * from role_map_user where effective = 1) role_map_user on role_map_user.user_id = users.id
    // left join roles on roles.id = role_map_user.role_id
    // left join (select id,name from levels where effective = 1) levels on levels.id = users.level_id
    // where users.effective = 1
    // group by users.id order by users.level_id`
    let sql = `select temp1.*,group_concat(u_m_j.mj_id) as major_id_all, group_concat(majors.name) as major_name_all from 
        (select users.*,levels.name as level_name,group_concat(roles.value) as role_value_all,group_concat(roles.des) as role_des_all from users
                left join (select * from role_map_user where effective = 1) role_map_user on role_map_user.user_id = users.id
                left join roles on roles.id = role_map_user.role_id
                left join (select id,name from levels where effective = 1) levels on levels.id = users.level_id
                where users.effective = 1
                group by users.id order by users.level_id) temp1
                left join (select * from user_map_major where effective = 1) u_m_j on u_m_j.user_id = temp1.id
                left join (select * from majors  where effective = 1) majors on majors.id = u_m_j.mj_id
                 group by temp1.id order by CONVERT(temp1.name USING gbk)`
    let result = await HttpApi.obs({ sql })
    if (result.data.code === 0) {
      let list = result.data.data;
      originList = list.map((item, index) => { item.key = index; return item })
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
    newValues.use_whitelist = newValues.use_whitelist ? 0 : 1
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

  const addStaffOnOk = useCallback(async (newValues) => {
    // let level_group = newValues.level_id.split('_');
    ///将 组的数据 从部门 分离出来
    // if (level_group.length > 1) { newValues.level_id = parseInt(level_group[0]); newValues.group_id = parseInt(level_group[1]); }
    if (newValues.permission) {
      newValues.permission = newValues.permission.join(',')
    }
    newValues.isGroupLeader = newValues.isGroupLeader ? 1 : 0
    HttpApi.addUserInfo(newValues, res => {
      if (res.data.code === 0) {
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
              getUserList()
              message.success('添加成功')
            }
          })
        } else {
          message.success('添加成功')
        }
      } else {
        message.error(res.data.data)
      }
    })
  }, [getUserList])

  const columns = [{ title: '姓名', width: 80, dataIndex: 'name', key: 'name' },
  { title: '账号', width: 120, dataIndex: 'username', key: 'username' },
  {
    title: '部门',
    filters: levelOptions,
    onFilter: (value, record) => record.level_id === value,
    width: 100, dataIndex: 'level_name', key: 'level_name'
  },
  {
    title: '角色', width: 200, dataIndex: 'role_des_all', key: 'role_des_all', render: (text) => {
      if (text) {
        return <Tooltip title={text} placement="topLeft">
          <div className='hideText lineClamp2'>{text}</div>
        </Tooltip>
      } else {
        return '-'
      }
    }
  },
  {
    title: '专业', width: 200, dataIndex: 'major_name_all', key: 'major_name_all', render: (text) => {
      if (text) {
        return <Tooltip title={text} placement="topLeft">
          <div className='hideText lineClamp2'>{text}</div>
        </Tooltip>
      } else {
        return '-'
      }
    }
  },
  {
    title: '备注', dataIndex: 'remark', key: 'remark', render: (text) => {
      if (text) {
        return <Tooltip title={text} placement="topLeft">
          <div className='hideText lineClamp2'>{text}</div>
        </Tooltip>
      } else {
        return '-'
      }
    }
  },
  {
    title: '操作', width: 170, dataIndex: 'action', key: 'action', render: (text, record) => {
      return <div>
        <Button icon='edit' size="small" type='primary' onClick={() => {
          setSelectUser(record)
          setShowUpdate(true)
        }}>编辑</Button>
        <Divider type="vertical" />
        <Popconfirm title="确定要删除该员工吗?" onConfirm={() => {
          HttpApi.updateUserInfo({ query: { id: record.id }, update: { effective: 0 } }, res => {
            if (res.data.code === 0) { message.success('删除成功'); getUserList(); }
          })
        }}>
          <Button icon='delete' size="small" type="danger">删除</Button>
        </Popconfirm>
      </div>
    }
  }]
  return <div style={styles.root}>
    <Row>
      <Col span={18}>
        <Button style={styles.button} icon='plus' size='small' type='primary' onClick={() => {
          setShowAdd(true)
        }}>添加人员</Button>
      </Col>
      <Col span={6}><Input.Search size='small' value={searchInputValue} placeholder="姓名筛选-支持模糊查询" allowClear
        onSearch={(value) => {
          if (value.length === 0) {
            setUserList(originList.map((item, index) => { item.key = index; return item }))
          } else {
            let result_after_filter = originList.filter((item) => { return item.name && item.name.indexOf(value) !== -1 })
            setUserList(result_after_filter)
          }
        }}
        onChange={(e) => {
          setSearchInputValue(e.target.value)
          if (e.target.value.length === 0) { setUserList(originList.map((item, index) => { item.key = index; return item })) }
        }}
        enterButton />
      </Col>
    </Row>
    <Table loading={loading} bordered size='small' columns={columns} dataSource={useList} pagination={false} />
    <UpdateStaffView staff={selectUser} onOk={(params) => { setShowUpdate(false); updateStaffOnOk(params) }}
      onCancel={() => { setShowUpdate(false) }} visible={showUpdate} />
    <AddStaffView visible={showAdd} onCancel={() => { setShowAdd(false) }} onOk={(params) => { setShowAdd(false); addStaffOnOk(params) }} />
  </div>
}
const styles = {
  root: {
    backgroundColor: '#FFFFFF',
    padding: 10
  },
  button: {
    marginBottom: 10
  }
}