// components/HighchartsTemperatureChart.jsx
import React from "react";
import { View } from "react-native";
import { WebView } from "react-native-webview";

export default function HighchartsTemperatureChart({ data, labels }) {
  const chartHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <script src="https://code.highcharts.com/highcharts.js"></script>
        <style>
          body, html { margin: 0; padding: 0; background: #333; }
          #container { height: 100%; width: 100%; }
        </style>
      </head>
      <body>
        <div id="container"></div>
        <script>
          Highcharts.chart('container', {
            chart: {
              type: 'spline',
              backgroundColor: '#333'
            },
            title: {
              text: 'Temperatura en Tiempo Real',
              style: { color: '#fff' }
            },
            xAxis: {
              categories: ${JSON.stringify(labels)},
              labels: {
                style: { color: '#fff', fontSize: '10px' }
              }
            },
            yAxis: {
              title: { text: '°C', style: { color: '#fff' } },
              labels: { style: { color: '#fff' } }
            },
            legend: { enabled: false },
            series: [{
              name: 'Temperatura',
              data: ${JSON.stringify(data)},
              color: '#f45b5b'
            }],
            credits: { enabled: false }
          });
        </script>
      </body>
    </html>
  `;

  return (
    <View style={{ height: 260, borderRadius: 16, overflow: "hidden" }}>
      <WebView
        originWhitelist={["*"]}
        source={{ html: chartHtml }}
        javaScriptEnabled
        scrollEnabled={false}
      />
    </View>
  );
}
