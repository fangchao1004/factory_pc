import React, { Component } from 'react';
import { Card } from 'antd';
import EditableTable from './EditableTable'
import TableTypeView from './TableTypeView'

const tabListNoTitle = [{
    key: 'createTale',
    tab: '创建表单',
}, {
    key: 'tableType',
    tab: '表单类型',
}];

const contentListNoTitle = {
    createTale: <EditableTable />,
    tableType: <TableTypeView />,
};

class SettingTableModeRoot extends Component {
    state = {
        key: 'createTale',
        noTitleKey: 'createTale',
    }

    onTabChange = (key) => {
        this.setState({ noTitleKey: key });
    }

    render() {
        return (
            <div>
                <Card
                    style={{ width: '100%' }}
                    tabList={tabListNoTitle}
                    activeTabKey={this.state.noTitleKey}
                    onTabChange={(key) => { this.onTabChange(key); }}
                >
                    {contentListNoTitle[this.state.noTitleKey]}
                </Card>
            </div>
        );
    }
}

export default SettingTableModeRoot;