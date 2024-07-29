import React, { useState } from 'react';
import { View, Text, Dimensions, TouchableWithoutFeedback } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

const UpdatedChart = ({ data, chartConfig, activeTrendTab, ...props }) => {
  const [selectedDataPoint, setSelectedDataPoint] = useState(null);

  const handleDataPointClick = (data) => {
    setSelectedDataPoint(data);
  };

  const formatDate = (day) => {
    const date = new Date(2024, 6, day); // Assuming July 2024
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  return (
    <TouchableWithoutFeedback onPress={() => setSelectedDataPoint(null)}>
      <View>
        <LineChart
          {...props}
          data={data}
          width={width - 40}
          height={300}
          chartConfig={{
            ...chartConfig,
            propsForDots: {
              r: "4",
              strokeWidth: "2",
              stroke: activeTrendTab === 'expense' ? "#FF0000" : "#4CAF50",
            },
          }}
          onDataPointClick={handleDataPointClick}
          yAxisLabel=""
          yAxisSuffix=""
          yLabelsOffset={5}
          withVerticalLabels={true}
          withHorizontalLines={false}
          withVerticalLines={false}
          withInnerLines={false}
          withOuterLines={false}
          yAxisInterval={4}
          bezier
          decorator={() => {
            return selectedDataPoint ? (
              <View
                style={{
                  backgroundColor: 'white',
                  borderRadius: 4,
                  borderWidth: 1,
                  borderColor: activeTrendTab === 'expense' ? '#FF0000' : '#4CAF50',
                  padding: 4,
                  position: 'absolute',
                  top: selectedDataPoint.y - 28,
                  left: selectedDataPoint.x - 30,
                }}
              >
                <Text style={{ color: activeTrendTab === 'expense' ? '#FF0000' : '#4CAF50', fontSize: 10 }}>
                  {`${formatDate(selectedDataPoint.index + 1)}: ${selectedDataPoint.value}`}
                </Text>
              </View>
            ) : null;
          }}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

export default UpdatedChart;