interface Props {
  label?: string;
  fullHeight?: boolean;
}

export function LoadingScreen({ label = 'Загрузка', fullHeight = false }: Props) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        minHeight: fullHeight ? '80vh' : 220,
        padding: 40,
      }}
    >
      <div
        style={{
          position: 'relative',
          width: 64,
          height: 64,
        }}
      >
        {/* Внешнее кольцо */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '2px solid transparent',
            borderTopColor: '#4690FF',
            animation: 'loadingSpin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite',
          }}
        />
        {/* Среднее кольцо (обратное вращение) */}
        <div
          style={{
            position: 'absolute',
            inset: 8,
            borderRadius: '50%',
            border: '2px solid transparent',
            borderTopColor: 'rgba(70, 144, 255, 0.6)',
            animation: 'loadingSpin 1.6s cubic-bezier(0.5, 0, 0.5, 1) infinite reverse',
          }}
        />
        {/* Внутреннее кольцо */}
        <div
          style={{
            position: 'absolute',
            inset: 16,
            borderRadius: '50%',
            border: '2px solid transparent',
            borderTopColor: 'rgba(70, 144, 255, 0.3)',
            animation: 'loadingSpin 0.9s cubic-bezier(0.5, 0, 0.5, 1) infinite',
          }}
        />
        {/* Пульсирующая точка в центре */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 6,
            height: 6,
            margin: '-3px 0 0 -3px',
            borderRadius: '50%',
            background: '#4690FF',
            boxShadow: '0 0 16px #4690FF',
            animation: 'loadingPulse 1.4s ease-in-out infinite',
          }}
        />
      </div>

      <div
        style={{
          fontSize: 12,
          letterSpacing: '0.18em',
          color: 'rgba(255, 255, 255, 0.4)',
          textTransform: 'uppercase',
          fontWeight: 500,
        }}
      >
        {label}
      </div>
    </div>
  );
}