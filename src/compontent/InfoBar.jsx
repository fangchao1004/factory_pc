import { Avatar, Dropdown, Menu, message } from 'antd';
import React, { useState } from 'react';
import copy from 'copy-to-clipboard';
///通知组件
export default props => {
    var storage = window.localStorage;
    const localUserInfo = storage.getItem('userinfo');
    const [isAdmin] = useState(localUserInfo && JSON.parse(localUserInfo).isadmin === 1)
    return <Dropdown overlay={
        <Menu onClick={({ key }) => {
            if (key === '1') {
                // console.log('删除操作', props.data)
                props.removeNotice(props.data.id)
            } else if (key === '2') {
                copy(props.data.content)
                message.success('复制成功')
            }
        }}>
            {isAdmin ? <Menu.Item key="1">删除</Menu.Item> : null}
            <Menu.Item key="2">复制</Menu.Item>
        </Menu>
    } trigger={['contextMenu']}>
        <div style={styles.root}>
            <div style={styles.timeBar}>{props.data.time}</div>
            <div style={styles.infoArea}>
                <div style={styles.gap}>
                    <Avatar shape="square" size={40} style={{ backgroundColor: '#597ef7' }}>{props.data.name}</Avatar>
                </div>
                <div style={styles.infoPanel}>
                    {props.data.content}
                </div>
            </div>
        </div>
    </Dropdown>
}

const styles = {
    root: {
        padding: '0px 14px 0px 10px',
        marginBottom: 24
    },
    timeBar: {
        marginBottom: 4,
        color: '#bfbfbf',
        fontSize: 10,
        textAlign: 'center'
    },
    infoArea: {
        display: 'flex', direction: 'row'
    },
    gap: {
        marginRight: 8
    },
    infoPanel: {
        backgroundColor: '#bae7ff',
        padding: 10,
        borderRadius: 4,
        color: '#595959'
    }
}