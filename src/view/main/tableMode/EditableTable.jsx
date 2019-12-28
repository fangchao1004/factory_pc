import React, { Component } from 'react';
import { Table, Input, Button, Popconfirm, Select, Modal, message, Row, Col } from 'antd';
import SampleViewTool from '../../util/SampleViewTool';
import HttpApi from '../../util/HttpApi'
import { tableCellOptionsData } from '../../util/AppData'
const Option = Select.Option;

/**
 * 表格创建区---只用于创建模版
 */
export default class EditableTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      titleData: [],
      uploadLoading: false,
      dataSource: [{
        key: '0',
        title_name: '表头',
        type_id: '7',
        default_values: '',
        title_remark: ''
      }],
      count: "1",
      modalvisible: false,
      sampleView: null,
      haveExistSampleIDs: []
    };
  }

  componentDidMount() {
    this.getTitleData();
    this.getSampleData();
  }

  getTitleData = () => {
    HttpApi.getDeviceTypeInfo({ effective: 1 }, (res) => {
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

  getSampleData = () => {
    HttpApi.getSampleInfo({ effective: 1 }, (res) => {
      if (res.data.code === 0) {
        // console.log(res.data.data);
        let sampleIdArr = [];
        res.data.data.forEach(element => {
          sampleIdArr.push(element.device_type_id + "")
        });
        this.setState({
          haveExistSampleIDs: sampleIdArr
        })
      }
    })
  }


  render() {
    const { dataSource } = this.state;
    const columns = [
      {
        title: '标签',
        dataIndex: 'title_name',
        // width: '15%',
        render: (text, record) => {
          return (
            <Input disabled={record.type_id === '7' && record.key === '0'}
              value={text} onChange={(e) => this.onChangeHandler(record, e.target.value, "title_name")}></Input>
          )
        }
      }, {
        title: '标题备注',
        dataIndex: 'title_remark',
        render: (text, record) => {
          return (
            <Input disabled={record.type_id !== '12' && record.type_id !== '2'}
              placeholder={record.type_id === '12' ? '可以输入标题备注' : (record.type_id === '2' ? '可以输入单位' : '/')}
              value={text} onChange={(e) => this.onChangeHandler(record, e.target.value, "title_remark")}></Input>
          )
        }
      }, {
        title: '元素类型',
        dataIndex: 'type_id',
        render: (text, record) => {
          // console.log(record);
          let Options = [];
          tableCellOptionsData.forEach((item) => {
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
        title: '选择器的选项',
        dataIndex: 'default_values',
        render: (text, record) => {
          let Options = [];
          this.state.titleData.forEach((item) => {
            Options.push(<Option key={item.value} disabled={this.state.haveExistSampleIDs.indexOf(item.value) !== -1} value={item.value}>{item.text}</Option>)
          })
          return (
            record.type_id === '7' ? ///标题--不可修改---是个选项
              <Select showSearch={true} filterOption={(inputValue, option)=>{return option.props.children.indexOf(inputValue)!==-1}} style={{ width: "100%" }}
                placeholder='请选择表单类型'
                onChange={(value, option) => this.onChangeHandler(record, value, "default_values", option.props.children)}
              >
                {Options}
              </Select> :
              <Input
                value={text}
                disabled={record.type_id !== '4'}
                placeholder={record.type_id !== '4' ? "/" : "请设置选项-选项之间请用/隔开"}
                onChange={(e) => this.onChangeHandler(record, e.target.value, "default_values")}></Input>
          )
        }
      }, {
        title: '操作',
        dataIndex: 'operation',
        width: 150,
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
              <Button onClick={this.readyHandler} type="primary" style={{ marginBottom: 16 }}>
                预览
              </Button>
            </div>
          </Col>
        </Row>
        <Table
          rowClassName={() => 'editable-row'}
          bordered
          dataSource={dataSource}
          columns={columns}
          pagination={false}
        />
        <Modal
          // confirmLoading={this.state.modalvisible}
          centered
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
      title_name: `标题${parseInt(count)}`,
      type_id: "12", ///默认添加的是 id=12 的 通用组件（无需默认值）
      default_values: '',
      title_remark: '',///标题备注
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
        if (targetField === 'type_id' && val === '12') {
          element['default_values'] = ''
        } else if (targetField === 'type_id' && val !== '12') {
          element['title_remark'] = ''
        }
        if (record.key === '0') {
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
    let isCompleteFlag = true;
    this.state.dataSource.forEach(element => {
      if (element.key === '0' && !element.extra_value) {
        // console.error('缺少标题');
        isCompleteFlag = false
        return
      }
      else if (element.type_id === '4' && !element.default_values) {
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
    {key: "1", title_name: "巡检点状态", type_id: "3", default_values: "正常/故障"},
    {key: "2", title_name: "标题3", type_id: "3", default_values: "a/v"},
  ]
  */
  transFromDataConstruct = () => {
    this.setState({
      uploadLoading: true
    })
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

    // console.log("模版数据L：", sample_data);
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