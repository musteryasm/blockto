import { MouseEventHandler, useEffect, useState, useCallback } from 'react';
import Image from 'next/image';

type Props = {
  src: string;
  className?: string;
  style?: React.CSSProperties;
  width?: number;
  square?: boolean;
  onError?: () => void;
  onClick?: MouseEventHandler;
  alt?: string;
};

const safeOrigins = [
  '/',
  'data:image',
  'https://imgur.com/',
  'https://i.imgur.com/',
  'https://imgproxy.iris.to/',
];

export const isSafeOrigin = (url: string) => {
  return safeOrigins.some((origin) => url.startsWith(origin));
};

const ProxyImg = (props: Props) => {
  const [proxyFailed, setProxyFailed] = useState(false);
  const [originalFailed, setOriginalFailed] = useState(false);

  const getSrc = useCallback(() => {
    if (
      props.src &&
      !isSafeOrigin(props.src)
    ) {
      const originalSrc = props.src;
      if (props.width) {
        const width = props.width * 2;
        const resizeType = props.square ? 'fill' : 'fit';
        return `https://imgproxy.iris.to/insecure/rs:${resizeType}:${width}:${width}/plain/${originalSrc}`;
      } else {
        return `https://imgproxy.iris.to/insecure/plain/${originalSrc}`;
      }
    } else {
      return props.src;
    }
  }, [props.src, props.width, props.square]);

  const [src, setSrc] = useState(() => getSrc());

  useEffect(() => {
    setSrc(getSrc());
    setProxyFailed(false);
    setOriginalFailed(false);
  }, [props.src, props.width, props.square, getSrc]);

  useEffect(() => {
    if (proxyFailed && !originalFailed) {
      console.log('image proxy failed', src, 'trying original source', props.src);
      setSrc(props.src);
    }
  }, [proxyFailed, props.src, src, originalFailed]);

  useEffect(() => {
    if (originalFailed) {
      const originalSrc = props.src;
      const originalOnError = props.onError;
      console.log('original source failed too', originalSrc);
      setSrc(
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhQJ/qwQX2QAAAABJRU5ErkJggg==',
      );
      originalOnError && originalOnError();
    }
  }, [originalFailed, props.src, props.onError]);

  return (
    <Image
      src={src}
      onError={() => {
        if (!proxyFailed) {
          setProxyFailed(true);
        } else {
          setOriginalFailed(true);
        }
      }}
      onClick={props.onClick}
      className={props.className}
      style={props.style}
      width={props.width}
      height={props.width}
      alt={props.alt || ''}
    />
  );
};

export default ProxyImg;
