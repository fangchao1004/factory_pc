import React, { useState } from 'react'
import { Card } from 'antd'
import ToDoListOfMineU from './ToDoListOfMineU';
import BugPageOfMineC from './BugPageOfMineC';
const tabListNoTitle = [
    {
        key: 'ToDoListOfMineU',
        tab: <div style={{ fontSize: 13 }}>相关待处理</div>,
    },
    {
        key: 'BugPageOfMineC',
        tab: <div style={{ fontSize: 13 }}>相关已完成</div>,
    }];
const contentListNoTitle = {
    ToDoListOfMineU: <ToDoListOfMineU />,
    BugPageOfMineC: <BugPageOfMineC />,
}
export default props => {
    const [noTitleKey, setNoTitleKey] = useState('ToDoListOfMineU')
    return <Card
        hoverable={true}
        size="small"
        style={{ width: '100%' }}
        tabList={tabListNoTitle}
        activeTabKey={noTitleKey}
        onTabChange={(key) => { setNoTitleKey(key) }}
    >
        {contentListNoTitle[noTitleKey]}
    </Card>
}