import React from "react";
import {
  Chart,
  Geom,
  Tooltip,
  Coord,
  Label,
  Guide,
} from "bizcharts";
import DataSet from "@antv/data-set";

export default class PieView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      titleStr: '',
      allCount: '',
      checkMan: '',
    }
  }
  componentDidMount = () => {
    this.transConstruct(this.props.data);
  }
  transConstruct = (data) => {
    // console.log('获取原始数据：', data.datasource, '对应的标题：', data.title, data.checkMan);
    let newArr = [];
    let totalCount = 0;
    data.datasource.forEach((ele) => {
      // if (ele.status_count > 0) {
      totalCount += ele.status_count;
      let stautsTxt = '待检'
      if (ele.device_status === 1) { stautsTxt = '正常' }
      else if (ele.device_status === 2) { stautsTxt = '故障' }
      newArr.push({ item: stautsTxt, count: ele.status_count, begin: data.begin, end: data.end, date: data.date, deviceIdStr: data.deviceIdStr, statusStr: data.statusStr });
      // }
    })
    // console.log('处理后的数据：', newArr);
    this.setState({ data: newArr, titleStr: data.title, allCount: totalCount, checkMan: data.checkMan || '' })
  }
  render() {
    const { DataView } = DataSet;
    const { Html } = Guide;
    const dv = new DataView();
    const str = '<div style="color:#8c8c8c;font-size:10px;text-align:center;width: 12em;">' + this.state.titleStr + '<br><span style="color:#262626;font-size:24px">' + this.state.allCount + '</span></div>'
    let str2 = this.state.checkMan ? '<div style="color:#8c8c8c;font-size:14px;text-align:center;width: 12em;">[' + this.state.checkMan + ']</div>' : '<div></div>'

    dv.source(this.state.data).transform({
      type: "percent",
      field: "count",
      dimension: "item",
      as: "percent"
    });
    const cols = {
      percent: {
        formatter: val => {
          val = val * 100 + "%";
          return val;
        }
      }
    };
    return (
      <div style={{ backgroundColor: '#F0F2F5', height: 280, marginBottom: 10, borderRadius: 5 }}>
        <Chart
          height={280}
          data={dv}
          scale={cols}
          padding={[0, 0, 0, 0]}
          forceFit
          onPlotClick={e => {
            if (e.data) {
              this.props.openDrawer(e.data.point);
            }
          }}
        >
          <Coord type={"theta"} radius={0.75} innerRadius={0.6} />
          <Tooltip
            showTitle={false}
            itemTpl="<li><span style=&quot;background-color:{color};&quot; class=&quot;g2-tooltip-marker&quot;></span>{name}: {value}</li>"
          />
          <Guide>
            <Html
              position={["50%", "50%"]}
              html={str}
              alignX="middle"
              alignY="middle"
            />
            <Html
              position={["85%", "5%"]}
              html={str2}
              alignX="middle"
              alignY="middle"
            />
          </Guide>
          <Geom
            color={['item', ['#4AC9CA', '#FF6633', '#63AEFD']]}
            type="intervalStack"
            position="percent"
            // color="item"
            tooltip={[
              "item*percent",
              (item, percent) => {
                percent = `${(percent * 100).toFixed(2)}%`;
                return {
                  name: item + '率',
                  value: percent
                };
              }
            ]}
            style={{
              lineWidth: 1,
              stroke: "#fff"
            }}
          >
            <Label
              content="percent"
              formatter={(val, item) => {
                // let floatVal = parseFloat(val.substring(0, val.length - 1)).toFixed(1)
                // return item.point.item + ": " + floatVal + '%';
                return item.point.item + ": " + item.point.count + '处';
              }}
            />
          </Geom>
        </Chart>
      </div>
    );
  }
}
