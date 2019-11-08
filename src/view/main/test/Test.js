import React from 'react'
import {
    Table
} from 'antd'
import HttpApi from '../../util/HttpApi'

export default class App extends React.Component {
    state = {
        filteredInfo: null,
        sortedInfo: null,
        data: [],
    };

    handleChange = (pagination, filters, sorter) => {
        console.log('Various parameters', pagination, filters, sorter);
        this.setState({
            filteredInfo: filters,
            sortedInfo: sorter,
        });
    };
    componentDidMount() {
        this.init()
    }
    init = async () => {
        let testData = await this.getUserInfo()
        this.setState({
            data: testData.map(test => {
                test.key = test.id;
                return test
            })
        })
    }
    getUserInfo = () => {
        return new Promise((resolve, reject) => {
            let result = [];
            HttpApi.getUserInfo({
                effective: 1
            }, data => {
                if (data.data.code === 0) {
                    result = data.data.data
                }
                console.log(result)
                resolve(result);
            })
        })
    }

    render() {
        const columns = [{
            title: '员工',
            dataIndex: 'name',
            key: 'name',
        }];
        return (<div >
            <Table columns={columns}dataSource={this.state.data} />
        </div >);
    }
}