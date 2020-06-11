import React, { Component } from 'react';
import { Table, Input, Button, Popconfirm, Select, Modal, message, Row, Col, Icon } from 'antd';
import SampleViewTool from '../../util/SampleViewTool';
import HttpApi from '../../util/HttpApi'
import { tableCellOptionsData } from '../../util/AppData'
const Option = Select.Option;
var OptionsOfDateScheme = [];
var OptionsOfAllowTimeScheme = [];
var OptionsOfTitle = [];
var haveExistSampleIDs = [];
/**
 * 表格创建区---只用于创建模版
 */
export default class EditableTable extends Component {
  constructor(props) {
    super(props);
    console.log('EditableTable:', props)
    this.state = {
      uploadLoading: false,
      dataSource: [],
      // count: "1",
      modalvisible: false,
      sampleView: null,
    };
  }
  componentDidMount() {
    this.init();
  }
  init = async () => {
    await this.getSampleData();
    this.getTitleData();
    this.getDateSchemeData();
    this.getAllowTimeSchemeData();
    this.setState({
      dataSource: [{
        key: '0',
        title_name: '表头',
        type_id: '7',
        default_values: '',
        title_remark: ''
      }]
    })
  }
  getTitleData = () => {
    HttpApi.getDeviceTypeInfo({ effective: 1, area0_id: this.props.id }, (res) => {
      if (res.data.code === 0) {
        let copyArrData = JSON.parse(JSON.stringify(res.data.data))
        let titleDataArr = [];
        copyArrData.forEach(element => {
          titleDataArr.push({ "value": element.id + "", "text": element.sample_name })
        });
        OptionsOfTitle.length = 0;
        titleDataArr.forEach((item, index) => {
          OptionsOfTitle.push(<Option key={index} disabled={haveExistSampleIDs.indexOf(item.value) !== -1} value={item.value}>{item.text}</Option>)
        })
      }
    })
  }
  getSampleData = () => {
    return new Promise((resolve, reject) => {
      HttpApi.getSampleInfo({ effective: 1 }, (res) => {
        if (res.data.code === 0) {
          // console.log(res.data.data);
          let sampleIdArr = [];
          res.data.data.forEach(element => {
            sampleIdArr.push(element.device_type_id + "")
          });
          haveExistSampleIDs = sampleIdArr;
          resolve(true);
        }
      })
    })
  }
  getDateSchemeData = () => {
    let sql = `select * from scheme_of_cycleDate where effective = 1`
    HttpApi.obs({ sql }, (res) => {
      if (res.data.code === 0) {
        // console.log('getDateSchemeData:', res.data.data);
        OptionsOfDateScheme.length = 0;
        res.data.data.forEach((item, index) => {
          OptionsOfDateScheme.push(<Option key={index} value={item.id}>{item.title}</Option>)
        })
      }
    })
  }
  getAllowTimeSchemeData = () => {
    let sql = `select * from scheme_of_allowTime where effective = 1`
    HttpApi.obs({ sql }, (res) => {
      if (res.data.code === 0) {
        // console.log('getAllowTimeSchemeData:', res.data.data);
        OptionsOfAllowTimeScheme.length = 0;
        res.data.data.forEach((item, index) => {
          OptionsOfAllowTimeScheme.push(<Option key={index} value={item.id}>{item.title}</Option>)
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
        title: '说明',
        dataIndex: 'title_remark',
        render: (text, record) => {
          if (record.key === '0') {
            return <Select showSearch={true} filterOption={(inputValue, option) => { return option.props.children.indexOf(inputValue) !== -1 }} style={{ width: "100%" }}
              placeholder='请选择表单类型' value={record.default_values}
              onChange={(value, option) => this.onChangeHandler(record, value, "default_values", option.props.children)}
            >
              {OptionsOfTitle}
            </Select>
          }
          return <Input disabled={record.type_id !== '12' && record.type_id !== '2'}
            placeholder={record.type_id === '12' ? '可以输入标题备注' : (record.type_id === '2' ? '可以输入单位' : '/')}
            value={text} onChange={(e) => this.onChangeHandler(record, e.target.value, "title_remark")}></Input>
        }
      }, {
        title: '元素类型',
        dataIndex: 'type_id',
        render: (text, record) => {
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
      },
      {
        title: '日期方案',
        dataIndex: 'cyc_scheme_id',
        render: (text, record) => {
          if (record.type_id === '7') { return null }
          return <div style={{ display: 'flex', justifyContent: 'space-between' }}><Select style={{ width: "100%" }} value={text}
            onChange={(value, option) => this.onChangeHandler(record, value, "cyc_scheme_id")}
          >{OptionsOfDateScheme}</Select><Icon type="minus-circle" theme="twoTone" style={{ fontSize: 20, marginLeft: 15, alignSelf: 'center', cursor: "pointer" }}
            onClick={() => { this.onChangeHandler(record, null, "cyc_scheme_id") }}
            /></div>
        }
      }, {
        title: '时间段方案',
        dataIndex: 'atm_scheme_id',
        render: (text, record) => {
          if (record.type_id === '7') { return null }
          return <div style={{ display: 'flex', justifyContent: 'space-between' }}><Select style={{ width: "100%" }} value={text}
            onChange={(value, option) => this.onChangeHandler(record, value, "atm_scheme_id")}
          >{OptionsOfAllowTimeScheme}</Select><Icon type="minus-circle" theme="twoTone" style={{ fontSize: 20, marginLeft: 15, alignSelf: 'center', cursor: "pointer" }}
            onClick={() => { this.onChangeHandler(record, null, "atm_scheme_id") }}
            /></div>
        }
      },
      {
        title: '操作',
        dataIndex: 'operation',
        width: 100,
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
    this.setState({ dataSource: (dataSource.filter(item => item.key !== key)).map((item, index) => { item.key = String(index); return item }) });
  }
  handleAdd = () => {
    const { dataSource } = this.state;
    const newData = {
      key: String(this.state.dataSource.length),
      title_name: `标题${parseInt(this.state.dataSource.length)}`,
      type_id: "12", ///默认添加的是 id=12 的 通用组件（无需默认值）
      default_values: '',
      title_remark: '',///标题备注
      cyc_scheme_id: null,
      atm_scheme_id: null,
    };
    this.setState({
      dataSource: [...dataSource, newData],
      // count: parseInt(count) + 1 + "",
    });
  }
  onChangeHandler = (record, val, targetField, extraData) => {
    let copyData = JSON.parse(JSON.stringify(this.state.dataSource))
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
    console.log('确定上传');
    console.log('this.state.dataSource:', this.state.dataSource)
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
    let schemeList = [];
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
        if (element.cyc_scheme_id || element.atm_scheme_id) {
          schemeList.push({ "key_id": parseInt(element.key), "cyc_scheme_id": element.cyc_scheme_id, "atm_scheme_id": element.atm_scheme_id });
        }
        delete element.cyc_scheme_id;
        delete element.atm_scheme_id;
        contentArr.push(element);
      }
    });
    sample_data.device_type_id = device_type_id;
    sample_data.table_name = table_name;
    sample_data.content = JSON.stringify(contentArr);
    sample_data.area0_id = this.props.id;
    // console.log("模版数据L：", sample_data);
    // console.log('schemeList:', schemeList)
    // return;
    HttpApi.uploadSample(sample_data, (res) => {
      // console.log(res);
      if (res.data.code === 0) {
        // console.log('模版上传成功了');
        // message.success('模版上传成功');
        let sql = `select max(id) as max_id from samples`
        HttpApi.obs({ sql }, (res) => {
          if (res.data.code === 0) {
            let max_id = res.data.data[0].max_id;
            if (schemeList.length > 0) {
              let schemeListHasSampleId = [];
              schemeList.forEach((item, key) => {
                schemeListHasSampleId.push({ sample_id: max_id, ...item })
              })
              // console.log('schemeListHasSampleId:', schemeListHasSampleId)
              let sqlString = this.transformSqlLanguage(schemeListHasSampleId);
              let sql = `insert into sche_cyc_atm_map_sample(sample_id,key_id,cyc_scheme_id,atm_scheme_id) values ${sqlString}`
              // console.log('sql:', sql)
              HttpApi.obs({ sql }, (res) => {
                if (res.data.code === 0) {
                  message.success('添加表单以及方案成功', 5);
                  this.init();
                } else { message.error('添加表单以及方案失败', 5); }
              })
            } else {
              message.success('添加表单成功', 5);
              this.init();
              console.log('不需要添加日期方案和时间段方案 与 模版直接的映射关系了')
            }
          }
        })
        this.setState({
          uploadLoading: false,
          modalvisible: false
        })
      }
    })
  }
  transformSqlLanguage = (schemeListHasSampleId) => {
    let string = '';
    for (let index = 0; index < schemeListHasSampleId.length; index++) {
      let elememt = schemeListHasSampleId[index];
      let cellStr = '(' + elememt.sample_id + ',' + elememt.key_id + ',' + elememt.cyc_scheme_id + ',' + elememt.atm_scheme_id + ')' + (index === schemeListHasSampleId.length - 1 ? ';' : ',')
      string = string + cellStr
    }
    return string
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