import { Table, DatePicker } from 'antd'
import React, { useEffect, useCallback, useState } from 'react'
import HttpApi from '../../util/HttpApi'
import moment from 'moment'
const { RangePicker } = DatePicker;
const formatDate = 'YYYY-MM-DD HH:mm:ss'
export default function AccessView() {
    const [list, setList] = useState([])
    const [dateList, setDateList] = useState([moment(), moment()])
    const [userFilterList, setUserFilterList] = useState([])
    const [doorFilterList, setDoorFilterList] = useState([])
    const getFilterList = useCallback((list) => {
        let tempUserList = [];
        let tempDoorList = [];
        list.forEach((item) => {
            if (item.employeeName && tempUserList.indexOf(item.employeeName) === -1) {
                tempUserList.push(item.employeeName)
            }
            if (item.door_name && tempDoorList.indexOf(item.door_name) === -1) {
                tempDoorList.push(item.door_name)
            }
        })
        setUserFilterList(tempUserList.map((item) => { return { text: item, value: item } }))
        setDoorFilterList(tempDoorList.map((item) => { return { text: item, value: item } }))
    }, [])
    const init = useCallback(async () => {
        let startTime = dateList[0].startOf('day').format(formatDate)
        let endTime = dateList[1].endOf('day').format(formatDate)
        const sql = `select employeeName,departmentName,time,dv_door.name as door_name from r_record_access
        left join dv_door on dv_door.recordid = r_record_access.doorId
        where time>='${startTime}' and time<='${endTime}'
        order by time desc
        `
        let result = await HttpApi.obsForAccess({ sql })
        if (result.data.code === 0) {
            setList(result.data.data.map((item, index) => { item.key = index; return item }))
            getFilterList(result.data.data)
        }
    }, [dateList, getFilterList])
    useEffect(() => {
        init()
    }, [init])
    const columns = [{
        title: '时间', dataIndex: 'time', key: 'time', width: 200, render: (text) => { return moment(text).add(-8, 'hours').format(formatDate) }
    }, {
        title: '人员', dataIndex: 'employeeName', key: 'employeeName',
        filters: userFilterList,
        onFilter: (value, record) => record.employeeName === value,
        render: (text) => { return text || '-' }
    }, {
        title: '部门', dataIndex: 'departmentName', key: 'departmentName',
        render: (text) => { return text || '-' }
    }, {
        title: '门禁', dataIndex: 'door_name', key: 'door_name', filters: doorFilterList, onFilter: (value, record) => record.door_name === value,
    }]
    return (
        <div style={styles.root}>
            <div style={styles.body}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h2 style={{ borderLeft: 4, borderLeftColor: "#3080fe", borderLeftStyle: 'solid', paddingLeft: 5, fontSize: 16 }}>通行记录</h2>
                    <RangePicker size="small" value={dateList} allowClear={false} disabledDate={(current) => current > moment().endOf('day')} ranges={{
                        '今日': [moment(), moment()],
                        '本月': [moment().startOf('month'), moment().endOf('day')],
                        '上月': [moment().add(-1, 'month').startOf('month'), moment().add(-1, 'month').endOf('month')],
                    }} onChange={(v) => {
                        if (v && v.length > 0) {
                            setDateList(v)
                        }
                    }} />
                </div>
                <Table
                    size="small"
                    bordered
                    columns={columns}
                    dataSource={list}
                />
            </div>
        </div>
    )
}
const styles = {
    root: {
        backgroundColor: '#F1F2F5',
        width: '100%',
        height: '100vh',
        padding: 10,
    },
    body: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        marginBottom: 10,
    },
    picker: {
        marginBottom: 10
    }
}