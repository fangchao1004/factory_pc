import React, { Component } from 'react';
import { Table, Input, Button, Popconfirm, Select, Modal, message, Row, Col } from 'antd';
import SampleViewTool from '../../util/SampleViewTool';
// import { View } from 'antd-mobile';
import HttpApi from '../../util/HttpApi'
const Option = Select.Option;

const optionsData = [{ "value": "1", "text": "文本输入框" }, { "value": "2", "text": "数字输入框" }, { "value": "3", "text": "单选" },
{ "value": "4", "text": "多选" }, { "value": "5", "text": "文本域" }, { "value": "6", "text": "图片选择器" }, { "value": "7", "text": "表单类型" }];

////测试数据， 实际数据要从设备类型表device_type表中获取
// var titleData = [{ "value": "1", "text": "水表报告单" }, { "value": "2", "text": "电表报告单" }, { "value": "3", "text": "锅炉报告单" }]
// var titleData = [];

/**
 * 表格创建区---只用于创建模版
 */
export default class EditableTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      titleData: [],
      uploadLoading: false,
      // sample_type_title:'1',////模板所对应的设备类型
      dataSource: [{
        key: '0',
        title_name: '表头',
        type_id: '7',
        default_values: '',
      }, {
        key: '1',
        title_name: '设备基本状态',
        type_id: '3',
        default_values: '正常/故障',
      }],
      count: "2",
      modalvisible: false,
      sampleView: null
    };
  }

  componentDidMount() {
    this.getTitleData();
  }

  getTitleData = () => {
    HttpApi.getDeviceTypeInfo({}, (res) => {
      if (res.data.code === 0) {
        // console.log(res.data.data);
        let copyArrData = JSON.parse(JSON.stringify(res.data.data))
        let titleDataArr = [];
        copyArrData.forEach(element => {
          titleDataArr.push({ "value": element.id + "", "text": element.sample_name })
        });
        this.setState({
          titleData: titleDataArr
        })
      }
    })
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
            <Input disabled={(record.type_id === '7' && record.key === '0') || (record.type_id === '3' && record.key === '1')}
              value={text} onChange={(e) => this.onChangeHandler(record, e.target.value, "title")}></Input>
          )
        }
      }, {
        title: '元素类型',
        dataIndex: 'type_id',
        width: '15%',
        render: (text, record) => {
          // console.log(record);
          let Options = [];
          optionsData.forEach((item) => {
            if (record.key === '0') {
              Options.push(<Option key={item.value} value={item.value}>{item.text}</Option>)
            } else {
              if (item.value !== '7') {
                Options.push(<Option key={item.value} value={item.value}>{item.text}</Option>)
              }
            }
          })
          return (
            <Select disabled={(record.type_id === '7' && record.key === '0') || (record.type_id === '3' && record.key === '1')}
              value={text} style={{ width: "100%" }} onChange={(value) => this.onChangeHandler(record, value, "type_id")} >
              {Options}
            </Select>
          )
        }
      }, {
        title: '默认值 /或/ 选择器的选项',
        dataIndex: 'default_values',
        render: (text, record) => {
          let Options = [];
          this.state.titleData.forEach((item) => {
            Options.push(<Option key={item.value} value={item.value}>{item.text}</Option>)
          })
          return (
            record.type_id === '7' ? ///标题--不可修改---是个选项
              <Select value={text} style={{ width: "100%" }}
                onChange={(value, option) => this.onChangeHandler(record, value, "default_values", option.props.children)}
              >
                {Options}
              </Select> :
              <Input
                disabled={record.type_id === '6' || (record.type_id === '3' && record.key === '1')}
                type={record.type_id === '2' ? 'number' : 'text'}
                placeholder={"设置默认值或默认选项-选项之间请用/隔开"}
                value={text}
                onChange={(e) => this.onChangeHandler(record, e.target.value, "default_values")}></Input>
          )
        }
      }, {
        title: '操作',
        dataIndex: 'operation',
        render: (text, record) => {
          if (this.state.dataSource.length >= 1) {
            if ((record.type_id === '7' && record.key === '0') || (record.type_id === '3' && record.key === '1')) {
              return null
            } else {
              return (
                <Popconfirm title="确认删除吗?" onConfirm={() => this.handleDelete(record.key)}>
                  <Button type='danger'>删除</Button>
                </Popconfirm>
              )
            }
          }
        },
      }];

    return (
      <div>
        <Row>
          <Col span={6}>
            <Button onClick={this.handleAdd} type="primary" style={{ marginBottom: 16 }}>
              添加表单项目
          </Button>
          </Col>
          <Col span={18} >
            <div style={{ display: 'flex', flexDirection: 'row-reverse' }}>
              <Button onClick={this.readyHandler} type="primary" style={{ marginBottom: 16}}>
                预览
              </Button>
            </div>
          </Col>
        </Row>
        <Table
          size={'small'}
          rowClassName={() => 'editable-row'}
          bordered
          dataSource={dataSource}
          columns={columns}
        />
        <Modal
          // confirmLoading={this.state.modalvisible}
          width={450}
          hight={500}
          title={<div><span>效果预览</span><span style={{ fontSize: 10, color: '#AAAAAA', marginLeft: 40 }}>实际效果以移动端显示为准</span></div>}
          visible={this.state.modalvisible}
          // onOk={this.handleOk}
          onCancel={this.handleCancel}
          footer={
            <div>
              <Button onClick={this.handleCancel}>取消</Button>
              <Popconfirm title="确定保存吗?" onConfirm={this.onConfirmHandler}>
                <Button type='primary' loading={this.state.uploadLoading}>确定保存</Button>
              </Popconfirm>
            </div>

          }
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
      title_name: `标题${parseInt(count) + 1}`,
      type_id: "1",
      default_values: '',
    };
    this.setState({
      dataSource: [...dataSource, newData],
      count: parseInt(count) + 1 + "",
    });
  }

  onChangeHandler = (record, val, targetField, extraData) => {
    let copyData = JSON.parse(JSON.stringify(this.state.dataSource))
    // console.log(record, 'newValue:', val, 'oldValue:', record[targetField]);

    copyData.forEach(element => {
      if (element.key === record.key) {
        element[targetField] = val
        if (targetField === 'type_id' && val === '6') {
          element['default_values'] = []
        }
        if (record.key === '0') {
          // console.log(extraData);
          element.extra_value = extraData
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
      modalvisible: true
    })
    let sample = SampleViewTool.renderTable(this.state.dataSource);
    this.setState({
      sampleView: sample
    })
  }

  onConfirmHandler = () => {
    // console.log('确定上传');
    this.checkDataConstruct()
  }

  checkDataConstruct = () => {
    // console.log(this.state.dataSource);
    let isCompleteFlag = true;
    this.state.dataSource.forEach(element => {
      if (element.key === '0' && !element.extra_value) {
        // console.error('缺少标题');
        isCompleteFlag = false
        return
      }
      else if ((element.type_id === '3' && !element.default_values) || (element.type_id === '4' && !element.default_values)) {
        // console.error('缺少选项');
        isCompleteFlag = false
        return
      }
    });
    if (isCompleteFlag) {
      // console.log('格式正确');
      this.transFromDataConstruct();
    } else {
      // console.log('格式有问题');
      message.error('请检查表单类型或选项，不能为空');
    }
  }

  /*
  [
    {key: "0", title_name: "表头", type_id: "7", default_values: "2", extra_value: "电表报告单"},
    {key: "1", title_name: "设备状态", type_id: "3", default_values: "正常/故障"},
    {key: "2", title_name: "标题3", type_id: "3", default_values: "a/v"},
  ]
  */
  transFromDataConstruct = () => {
    this.setState({
      uploadLoading: true
    })
    // console.log(this.state.dataSource);
    let device_type_id;
    let table_name;
    let contentArr = [];
    let sample_data = {};
    let copyData = JSON.parse(JSON.stringify(this.state.dataSource));
    copyData.forEach(element => {
      if (element.key === '0') {
        device_type_id = element.default_values
        table_name = element.extra_value;
      } else {
        contentArr.push(element);
      }
    });
    sample_data.device_type_id = device_type_id;
    sample_data.table_name = table_name;
    sample_data.content = JSON.stringify(contentArr);

    // console.log("模版数据L：",sample_data);
    HttpApi.uploadSample(sample_data, (res) => {
      // console.log(res);
      if (res.data.code === 0) {
        // console.log('模版上传成功');
        message.success('模版上传成功');
        this.setState({
          uploadLoading: false,
          modalvisible: false
        })
      }
    })
  }

  handleOk = () => {
    this.setState({
      modalvisible: false
    })
  }

  handleCancel = () => {
    this.setState({
      modalvisible: false
    })
  }
}