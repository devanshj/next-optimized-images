import { applyImgLoader } from './img-loader';
import { applyWebpLoader } from './webp-loader';

export const isModuleInstalled = (name) => {
  try {
    require.resolve(name);
    return true;
  } catch (e) {
    return false;
  }
};

export const detectLoaders = () => {
  const jpeg = isModuleInstalled('imagemin-mozjpeg') ? 'imagemin-mozjpeg' : false;
  const gif = isModuleInstalled('imagemin-gifsicle') ? 'imagemin-gifsicle' : false;
  const svg = isModuleInstalled('imagemin-svgo') ? 'imagemin-svgo' : false;
  const svgSprite = isModuleInstalled('svg-sprite-loader') ? 'svg-sprite-loader' : false;
  const webp = isModuleInstalled('webp-loader') ? 'webp-loader' : false;

  let png = false;

  if (isModuleInstalled('imagemin-optipng')) {
    png = 'imagemin-optipng';
  } else if (isModuleInstalled('imagemin-pngquant')) {
    png = 'imagemin-pngquant';
  }

  return {
    jpeg,
    gif,
    svg,
    svgSprite,
    webp,
    png,
  };
};

export const getHandledImageTypes = (detectedLoaders, nextConfig) => {
  const handleImages = nextConfig.handleImages || [];

  return {
    jpeg: detectedLoaders.jpeg || handleImages.indexOf('jpeg') >= 0 || handleImages.indexOf('jpg') >= 0,
    png: detectedLoaders.png || handleImages.indexOf('png') >= 0,
    svg: detectedLoaders.svg || handleImages.indexOf('svg') >= 0,
    webp: detectedLoaders.webp || handleImages.indexOf('webp') >= 0,
    gif: detectedLoaders.gif || handleImages.indexOf('gif') >= 0,
  };
};

export const getNumLoadersInstalled = loaders => Object.values(loaders).filter(Boolean).length;

export const appendLoaders = (
  webpackConfig,
  nextConfig,
  detectedLoaders,
  isServer,
  optimize,
) => {
  let config = webpackConfig;
  const handledImageTypes = getHandledImageTypes(detectedLoaders, nextConfig);

  if (detectedLoaders.jpeg || detectedLoaders.png || detectedLoaders.gif || detectedLoaders.svg) {
    config = applyImgLoader(webpackConfig, nextConfig, optimize, isServer,
      detectedLoaders, handledImageTypes);
  } else if (handledImageTypes.jpeg) {
    config = applyImgLoader(webpackConfig, nextConfig, false, isServer,
      detectedLoaders, handledImageTypes);
  }

  if (detectedLoaders.webp) {
    config = applyWebpLoader(webpackConfig, nextConfig, optimize, isServer);
  } else if (handledImageTypes.webp) {
    config = applyWebpLoader(webpackConfig, nextConfig, false, isServer);
  }

  return config;
};