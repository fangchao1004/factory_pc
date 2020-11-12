import { Button, Input, message, Popconfirm } from 'antd';
import React, { useState, useEffect, useCallback } from 'react';
import InfoBar from '../../../../compontent/InfoBar';
import HttpApi from '../../../util/HttpApi';
import moment from 'moment';
const { TextArea } = Input
export default props => {
    var storage = window.localStorage;
    const localUserInfo = storage.getItem('userinfo');
    const [isAdmin] = useState(localUserInfo && JSON.parse(localUserInfo).isadmin === 1)
    const [noticeList, setNoticeList] = useState([])
    const [text, setText] = useState('')
    const getNoticeList = useCallback(async () => {
        let sql = `select * from notices where effective = 1 order by id desc limit 200`
        let res = await HttpApi.obs({ sql });
        if (res.data.code === 0) {
            setNoticeList(res.data.data)
        }
    }, [])
    const addNotice = useCallback(async ({ time, content, name }) => {
        let sql = `insert into notices (time, content, name) values ('${time}','${content}','${name}')`
        let res = await HttpApi.obs({ sql });
        if (res.data.code === 0) { message.success('发送成功'); getNoticeList(); setText('') }
        else { message.error('发送失败。可能包含不支持的字符') }
    }, [getNoticeList])
    const removeNotice = useCallback(async (id) => {
        let sql = `update notices set effective = 0 where id = ${id}`
        let res = await HttpApi.obs({ sql });
        if (res.data.code === 0) { message.success('删除成功'); getNoticeList(); }
    }, [getNoticeList])
    useEffect(() => {
        getNoticeList();
        let noticeLoop = setInterval(() => { getNoticeList() }, 5 * 1 * 1000)
        return () => { clearInterval(noticeLoop) }
    }, [getNoticeList])
    return <div style={styles.root}>
        <div style={styles.title} >
            <h2 style={{ marginTop: 4, borderLeft: 4, borderLeftColor: "#3080fe", borderLeftStyle: 'solid', paddingLeft: 5, fontSize: 16 }}>通知栏</h2>
        </div>
        <div style={{ overflow: 'auto', height: isAdmin ? 'calc(100% - 172px)' : 'calc(100% - 40px)' }}>
            {renderInfoList(noticeList, removeNotice)}
        </div>
        {isAdmin ?
            <div style={styles.textarea}>
                <TextArea allowClear value={text} rows={4} onChange={(e) => { setText(e.target.value); }} />
                <div style={styles.btnBar}>
                    <Popconfirm title='确定要发送吗?' onConfirm={() => {
                        if (!text) { message.error('通知不可为空'); return }
                        addNotice({ content: text, time: moment().format('YYYY-MM-DD HH:mm:ss'), name: JSON.parse(localUserInfo).name })
                    }} okText='确定' >
                        <Button icon='upload' size="small" type="primary">发布通知</Button>
                    </Popconfirm>
                </div>
            </div> : null}
    </div>
}
function renderInfoList(list, removeNotice) {
    if (list.length === 0) { return null }
    return list.map((item, index) => {
        return <InfoBar key={index} data={item} removeNotice={removeNotice} />
    })
}
const styles = {
    title: {
        display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        borderBottomStyle: 'solid',
        borderBottomWidth: 3,
        borderBottomColor: '#F1F2F5'
    },
    icon: {
        fontSize: 24
    },
    root: {
        overflow: 'auto',
        height: '100%'
    },
    main: {
        overflow: 'auto',
        height: 'calc(100% - 172px)'
    },
    textarea: {
        padding: '5px 10px 0 10px'
        // borderTopStyle: 'solid',
        // borderTopWidth: 3,
        // borderTopColor: '#F1F2F5'
    },
    btnBar: {
        textAlign: 'right', marginTop: 5
    }
}