import React from 'react'
import {Table} from 'antd'
import HttpApi from '../../util/HttpApi'

export default class EmployeeType extends React.Component {
    state = {
        filteredInfo: null,
        sortedInfo: null,
        data: []
    };
    componentDidMount() {
        this.init()
    }
    init = async () => {
        let testData = await this.getUserLevelList()
        this.setState({
            data: testData.map(test => {
                test.key = test.id;
                return test
            })
        })
    }
    getUserLevelList() {
        return new Promise((resolve, reject) => {
            let result = []
            HttpApi.getUserLevel({
                effective: 1
            }, data => {
                if (data.data.code === 0) {
                    result = data.data.data
                    // resolve(data.data.data)
                }
                console.log(result)
                resolve(result)
            })
        })
    }

    render() {
        const columns = [{
            title: '部门',
            dataIndex: 'name',
            key: 'name',
        },

        ];
        return (
            <Table
                columns={columns}
                dataSource={this.state.data}
            />
        );
    }
}