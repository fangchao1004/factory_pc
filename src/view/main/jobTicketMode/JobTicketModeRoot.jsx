import React, { useState } from 'react'
import { Card } from 'antd';
import JobTicketOfCplt from './JobTicketOfCplt'
import JobTicketOfUncplt from './JobTicketOfUncplt'


const tabListNoTitle = [{
    key: 'JobTicketOfUncplt',
    tab: '待处理',
}, {
    key: 'JobTicketOfCplt',
    tab: '已处理',
}];

const contentListNoTitle = {
    JobTicketOfCplt: <JobTicketOfCplt />,
    JobTicketOfUncplt: <JobTicketOfUncplt />
};
export default function JobTicketModeRoot() {
    const [noTitleKey, setNoTitleKey] = useState('JobTicketOfUncplt')
    return (
        <Card
            bodyStyle={{ padding: 10, backgroundColor: '#F1F2F5' }}
            bordered={false}
            style={{ width: '100%' }}
            tabList={tabListNoTitle}
            activeTabKey={noTitleKey}
            onTabChange={(key) => { setNoTitleKey(key) }}
        >
            {contentListNoTitle[noTitleKey]}
        </Card>
    )
}
