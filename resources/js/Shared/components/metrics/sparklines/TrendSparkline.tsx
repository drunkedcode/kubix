// resources/js/Shared/components/metrics/sparklines/TrendSparkline.tsx
import { Area, AreaChart, ResponsiveContainer } from 'recharts';

export interface TrendSparklineProps {
  /** Array de valores de la serie */
  data: number[];
  /** Color principal de la línea y relleno */
  color?: string;
  /** Altura del gráfico */
  height?: number;
  /** Ancho opcional, por defecto ocupa el 100% */
  width?: number | string;
  /** Mostrar relleno debajo de la línea */
  showArea?: boolean;
  /** Redondear la línea */
  smooth?: boolean;
  className?: string;
}

export default function TrendSparkline({
  data,
  color = '#3B82F6',
  height = 60,
  width = '100%',
  showArea = true,
  smooth = true,
  className = '',
}: TrendSparklineProps) {
  // Formatea los datos para Recharts
  const chartData = data.map((value, index) => ({ value, index }));

  return (
    <div className={`trend-sparkline ${className}`} style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
          <defs>
            <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type={smooth ? 'monotone' : 'linear'}
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={showArea ? `url(#gradient-${color.replace('#', '')})` : 'transparent'}
            dot={false}
            activeDot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}