import React from 'react';
import { Line, Pie } from 'react-chartjs-2';
import '../styles/ChartWidget.scss';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const ChartWidget = ({ type = 'line', data, title }) => {
  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: !!title, text: title },
    },
  };

  if (type === 'line') {
    return <Line data={data} options={options} />;
  } else if (type === 'pie') {
    return <Pie data={data} options={options} />;
  } else {
    return null;
  }
};

export default ChartWidget;
