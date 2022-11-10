import React from "react";
import Highcharts from "highcharts";
import HighchartsSunburst from "highcharts/modules/sunburst";
import HighchartsReact from "highcharts-react-official";
HighchartsSunburst(Highcharts);

interface Props {
  data: any;
}

const Sunburst: React.FC<Props> = (props) => {
  const { data } = props;

  const options = {
    credits: {
      enabled: false,
    },
    tooltip: {
      valueDecimals: 2,
    },
    title: {
      text: "Result",
    },
    series: [
      {
        allowDrillToNode: true,
        type: "sunburst",
        data: data,
        point: {
          events: {
            click: (e: any) => {
              console.log(e.point.name);
            },
          },
        },
      },
    ],
    chart: {
      animation: {
        duration: 100,
      },
    },
  };

  return (
    <HighchartsReact
      highcharts={Highcharts}
      options={options}
      constructorType={"chart"}
    />
  );
};

export default Sunburst;
