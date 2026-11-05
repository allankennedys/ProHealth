import { View, Text } from "react-native";
import Svg, { Line, Polyline, Circle, Rect } from "react-native-svg";

type Series = { values: number[]; color: string };

/** Gráfico de linhas simples com faixa saudável sombreada. */
export default function TrendChart({
  series, min, max, height = 140, width = 320, labels,
}: {
  series: Series[]; min: number; max: number; height?: number; width?: number; labels?: string[];
}) {
  const all = series.flatMap((s) => s.values);
  if (all.length < 2) {
    return (
      <View style={{ height, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: "#888" }}>Dados insuficientes para o gráfico</Text>
      </View>
    );
  }
  const lo = Math.min(min, ...all) - 5;
  const hi = Math.max(max, ...all) + 5;
  const pad = 8;
  const y = (v: number) => height - pad - ((v - lo) / (hi - lo)) * (height - pad * 2);
  const n = Math.max(...series.map((s) => s.values.length));
  const x = (i: number) => pad + (i / Math.max(n - 1, 1)) * (width - pad * 2);

  return (
    <View>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <Rect x={0} y={y(max)} width={width} height={Math.max(y(min) - y(max), 0)} fill="#2E9E5B" opacity={0.12} />
        <Line x1={0} x2={width} y1={y(max)} y2={y(max)} stroke="#2E9E5B" strokeDasharray="4 4" opacity={0.6} />
        <Line x1={0} x2={width} y1={y(min)} y2={y(min)} stroke="#2E9E5B" strokeDasharray="4 4" opacity={0.6} />
        {series.map((s, si) => (
          <Polyline
            key={`l${si}`}
            points={s.values.map((v, i) => `${x(i)},${y(v)}`).join(" ")}
            fill="none" stroke={s.color} strokeWidth={3} strokeLinejoin="round"
          />
        ))}
        {series.map((s, si) =>
          s.values.map((v, i) => <Circle key={`${si}-${i}`} cx={x(i)} cy={y(v)} r={3.5} fill={s.color} />))}
      </Svg>
      {labels && (
        <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 4 }}>
          <Text style={{ fontSize: 11, color: "#888" }}>{labels[0]}</Text>
          <Text style={{ fontSize: 11, color: "#888" }}>{labels[labels.length - 1]}</Text>
        </View>
      )}
    </View>
  );
}
