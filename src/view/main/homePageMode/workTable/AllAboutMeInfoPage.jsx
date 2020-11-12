import { Avatar, Button, Icon, List, Tag } from 'antd';
import React, { useContext, useState } from 'react';
import { AppDataContext } from '../../../../redux/AppRedux';
// import taskIcon from '../../../../assets/taskIcon.png';
import fixIcon from '../../../../assets/fixIcon.png';
import fixIcon_red from '../../../../assets/fixIcon_red.png';
import fixIcon_pause from '../../../../assets/fixIcon_pause.png';
import { omitTextLength } from '../../../util/Tool'

import moment from 'moment';
import BugInfoPanelPage from './BugInfoPanelPage';
export default props => {
    const { appState } = useContext(AppDataContext)
    const [bugPanelVisible, setBugPanelVisible] = useState(false)
    const [selectBugItem, setSelectBugItem] = useState(null)
    return <div style={styles.root}>
        {/* <List
            size="small"
            style={{ maxHeight: 380, overflow: 'scroll', borderRadius: 2, backgroundColor: '#FFFFFF', marginBottom: 10, }}
            header={<div style={styles.title}>
                <span>我的任务</span>
                {appState.aboutMeTaskList.length > 0 ? <Tag color='blue'>{'# ' + appState.aboutMeTaskList.length}</Tag> : null}
            </div>}
            bordered
            dataSource={appState.aboutMeTaskList}
            renderItem={item => (
                <List.Item
                    extra={<Button size="small" type={'link'}>查看</Button>}
                >
                    <List.Item.Meta
                        avatar={<Avatar shape="square" src={taskIcon} />}
                        title={<><Tag color='#ff7a45'>{moment(item.createdAt).format('YYYY-MM-DD')}</Tag><Tag color='blue'>{'编号:' + item.id}</Tag></>}
                        description={item.content}
                    />
                </List.Item>
            )}
        /> */}
        <List
            style={{ maxHeight: 380, overflow: 'scroll', borderRadius: 2, backgroundColor: '#FFFFFF' }}
            size="small"
            header={<div style={styles.title}>
                <span>相关缺陷</span>
                {appState.allAboutMeBugList.length > 0 ? <Tag color='blue'>{'# ' + appState.allAboutMeBugList.length}</Tag> : null}
            </div>}
            bordered
            dataSource={appState.allAboutMeBugList}
            renderItem={item => (
                <List.Item
                    extra={<Button size="small" type={'link'} onClick={() => { setBugPanelVisible(true); setSelectBugItem(item) }}>查看</Button>}
                >
                    <List.Item.Meta
                        avatar={<Avatar shape="square" src={item.status === 5 ? fixIcon_pause : (item.is_red ? fixIcon_red : fixIcon)} />}
                        title={<><Tag color={item.is_red ? '#f5222d' : (item.status === 5 ? '#9254de' : '#52c41a')}>{'编号:' + item.id}</Tag>
                            <Tag color={item.is_red ? '#f5222d' : (item.status === 5 ? '#9254de' : '#1890ff')}>{moment(item.createdAt).format('YYYY-MM-DD')}</Tag>
                            <Tag color='orange'>{omitTextLength(item.major_name, 8)}</Tag></>}
                        description={
                            <div>
                                <Tag color={statusToDes(item).color}>{statusToDes(item).des}</Tag>
                                {JSON.parse(item.content).text}
                            </div> || ''}
                    />
                </List.Item>
            )}
        />
        <BugInfoPanelPage bug={selectBugItem} visible={bugPanelVisible} onCancel={() => { setBugPanelVisible(false) }} />
    </div>
}
const styles = {
    root: {
        height: 600
    },
    title: {
        display: 'flex', justifyContent: 'space-between', color: '#1890ff'
    },
}
export function statusToDes(record) {
    let str = '';
    let color = record.status === 5 ? '#9254de' : 'blue'
    switch (record.status) {
        case 0:
            str = '待维修'
            break;
        case 1:
            str = '维修中'
            break;
        case 2:
            str = '专工验收中'
            break;
        case 3:
            str = '运行验收中'
            break;
        case 4:
            str = '完毕'
            break;
        case 5:
            str = record.bug_freeze_des || '状态被删除'
            break;
        case 6:
            str = '申请转专业中'
            break;
        case 7:
            str = '申请挂起中'
            break;
        default:
            break;
    }
    return { des: str, color }
}