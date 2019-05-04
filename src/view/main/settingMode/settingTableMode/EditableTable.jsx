import React, { Component } from 'react';
import {
  Table, Input, Button, Popconfirm, Select, Modal
} from 'antd';
import SampleViewTool from '../../../util/SampleViewTool';
const Option = Select.Option;

const optionsData = [{"value":"1","text":"文本输入框"},{"value":"2","text":"数字输入框"},{"value":"3","text":"单选"},
{"value":"4","text":"多选"},{"value":"5","text":"文本域"},{"value":"6","text":"图片选择器"}];

/**
 * 表格创建区
 */
export default class EditableTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [{
        key: '0',
        title: '哈哈',
        type_id: '1',
        default_value: '',
      }, {
        key: '1',
        title: '温度',
        type_id: '2',
        default_value: '',
      }, {
        key: '2',
        title: '标题3',
        type_id: '3',
        default_value: '哈哈哈/qwe/123/1',
      }],
      count: "3",
      modalvisible:false,
      sampleView:null
    };
  }

  render() {
    const { dataSource } = this.state;
    // console.log('dataSource:', dataSource);

    const columns = [
      {
        title: '编号',
        dataIndex: 'key',
        width: '8%',
        render: (text, record) => (
          // <Input value={text} />
          <div>{text}</div>
        )
      }, {
        title: '标签',
        dataIndex: 'title',
        width: '15%',
        render: (text, record) => {
          return (
            <Input value={text} onChange={(e) => this.onChangeHandler(record, e.target.value, "title")}></Input>
          )
        }
      }, {
        title: '元素类型',
        dataIndex: 'type_id',
        width: '15%',
        render: (text, record) => {
          // console.log(record);
          let Options = [];
          optionsData.forEach((item)=>{
            Options.push(<Option key={item.value} value={item.value}>{item.text}</Option>)
          })
          return (
            <Select value={text} style={{ width: 120 }} onChange={(value) => this.onChangeHandler(record, value, "type_id")} >
              {Options}
            </Select>
          )
        }
      }, {
        title: '默认值 /或/ 选择器的选项',
        dataIndex: 'default_value',
        render: (text, record) => {
          return (
            <Input
              disabled={record.type_id === '6'}
              type={record.type_id === '2' ? 'number' : 'text'}
              placeholder={"设置默认值或默认选项-选项之间请用/隔开"}
              value={text}
              onChange={(e) => this.onChangeHandler(record, e.target.value, "default_value")}></Input>)
        }
      }, {
        title: '操作',
        dataIndex: 'operation',
        render: (text, record) => (
          this.state.dataSource.length >= 1
            ? (
              <Popconfirm title="确认删除吗?" onConfirm={() => this.handleDelete(record.key)}>
                <Button type='danger'>删除</Button>
              </Popconfirm>
            ) : null
        ),
      }];

    return (
      <div>
        <Button onClick={this.handleAdd} type="primary" style={{ marginBottom: 16 }}>
          添加表格项目
          </Button>
        <Button onClick={this.readyHandler} type="primary" style={{ marginBottom: 16, marginLeft: 800 }}>
          预览
          </Button>
        <Table
          size={'small'}
          rowClassName={() => 'editable-row'}
          bordered
          dataSource={dataSource}
          columns={columns}
        />
        <Modal
          width={450}
          hight={500}
          title="表格预览"
          visible={this.state.modalvisible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        >
          {this.state.sampleView}
        </Modal>
      </div>
    );
  }

  handleDelete = (key) => {
    const dataSource = [...this.state.dataSource];
    this.setState({ dataSource: dataSource.filter(item => item.key !== key) });
  }

  handleAdd = () => {
    const { count, dataSource } = this.state;
    const newData = {
      key: count,
      title: `标题${parseInt(count) + 1}`,
      type_id: "1",
      default_value: '',
    };
    this.setState({
      dataSource: [...dataSource, newData],
      count: parseInt(count) + 1 + "",
    });
  }

  onChangeHandler = (record, val, targetField) => {
    let copyData = JSON.parse(JSON.stringify(this.state.dataSource))
    // console.log(record, 'newValue:', val, 'oldValue:', record[targetField]);

    copyData.forEach(element => {
      if (element.key === record.key) {
        element[targetField] = val
        if (targetField === 'type_id' && val === '6') {
          element['default_value'] = ''
        }
      }
    });

    this.setState({
      dataSource: copyData
    })
  }

  readyHandler = () => {
    // console.log('数据：', this.state.dataSource);
    this.setState({
      modalvisible:true
    })
    let sample = SampleViewTool.renderTable(this.state.dataSource);
    this.setState({
      sampleView:sample
    })
  }

  handleOk=()=>{
    this.setState({
      modalvisible:false
    })
  }

  handleCancel=()=>{
    this.setState({
      modalvisible:false
    })
  }
}