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
    }
  }
  componentDidMount = () => {
    this.transConstruct(this.props.data);
  }
  transConstruct = (data) => {
    let allCount = data.datasouce.length;
    let b = {};
    data.datasouce.forEach(item => {
      if (b.hasOwnProperty(item.status)) {
        b[item.status].push(item)
      } else {
        b[item.status] = [item]
      }
    })
    let titleStr = '';
    let group_data_by_status = [];
    for (var i in b) {
      // console.log("设备状态:",i,"设备数量:",b[i].length)
      let statusStr = '';
      if (i === "1") {
        statusStr = '正常'
      } else if (i === "2") {
        statusStr = '故障'
      } else if (i === "3") {
        statusStr = '待检'
      }
      titleStr = data.isAll ? "设备总数" : b[i][0].type_name+"数" ///获取表单的类型名
      group_data_by_status.push({ item: statusStr, count: b[i].length })
    }
    this.setState({
      data: group_data_by_status,
      allCount: allCount,
      titleStr: titleStr,
    })
  }
  render() {
    const { DataView } = DataSet;
    const { Html } = Guide;
    const dv = new DataView();
    const str = '<div style="color:#8c8c8c;font-size:14px;text-align: center;width: 10em;">' + this.state.titleStr + '<br><span style="color:#262626;font-size:24px">' + this.state.allCount + '</span></div>'

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
      <div style={{ backgroundColor: '#FFFFFF', height: 280, marginTop: 16,borderRadius:5 }}>
        <Chart
          height={280}
          data={dv}
          scale={cols}
          padding={[0, 0, 0, 0]}
          forceFit
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
          </Guide>
          <Geom
            type="intervalStack"
            position="percent"
            color="item"
            tooltip={[
              "item*percent",
              (item, percent) => {
                percent = `${(percent * 100).toFixed(1)}%`;
                return {
                  name: item,
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
                let floatVal = parseFloat(val.substring(0, val.length - 1)).toFixed(1)
                return item.point.item + ": " + floatVal + '%';
              }}
            />
          </Geom>
        </Chart>
      </div>
    );
  }
}
