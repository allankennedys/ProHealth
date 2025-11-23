import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from "react-native-svg";

interface BeatChartProps {
  data?: number[];
}

export default function BatimentoGrafico({ data = [72, 75, 90, 85, 110, 95, 70] }: BeatChartProps) {
  const width = 300;
  const height = 140;



  // Normaliza valores para caber no gráfico
  const max = Math.max(...data);
  const min = Math.min(...data);

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / (max - min)) * height;
    return `${x},${y}`;
  });

  // Gera curva suave (Bezier)
  const createSmoothPath = (pts: string[]) => {
    let path = `M ${pts[0]}`;
    for (let i = 1; i < pts.length; i++) {
      const [px, py] = pts[i - 1].split(",").map(Number);
      const [x, y] = pts[i].split(",").map(Number);

      const cx = (px + x) / 2;
      const cy = (py + y) / 2;

      path += ` Q ${px},${py} ${cx},${cy}`;
    }
    return path;
  };

  const smoothPath = createSmoothPath(points);

  // Detecta picos (valores acima de um threshold simples)
  const peakThreshold = max - (max - min) * 0.25;
  const peaks = data
    .map((v, i) => (v >= peakThreshold ? i : null))
    .filter((x) => x !== null) as number[];

  return (
    <View style={styles.card}>
      <Text>Batimentos Cardíacos Médios</Text>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="2">
            <Stop offset="0" stopColor="#ff4d4d" stopOpacity="1" />
            <Stop offset="1" stopColor="#ff9999" stopOpacity="0.3" />
          </LinearGradient>
        </Defs>

        {/* Linha suave */}
        <Path
          d={smoothPath}
          stroke="url(#grad)"
          strokeWidth={4}
          fill="none"
        />

        {/* Pontos de pico */}
        {peaks.map((i) => {
          const [x, y] = points[i].split(",").map(Number);
          return (
            <Circle
              key={i}
              cx={x}
              cy={y}
              r={6}
              fill="#ff4d4d"
              stroke="white"
              strokeWidth={2}
            />
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 330,
    height: 180,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 15,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
});
