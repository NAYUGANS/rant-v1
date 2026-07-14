export async function observeImage(file) {
  const bitmap = await createImageBitmap(file);
  const max = 320;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(bitmap, 0, 0, w, h);
  const { data } = ctx.getImageData(0, 0, w, h);

  const lum = new Float32Array(w*h);
  let satSum=0, warm=0, bright=0, dark=0;
  for (let i=0,p=0;i<data.length;i+=4,p++) {
    const r=data[i]/255,g=data[i+1]/255,b=data[i+2]/255;
    const mx=Math.max(r,g,b), mn=Math.min(r,g,b);
    lum[p]=0.2126*r+0.7152*g+0.0722*b;
    satSum += mx ? (mx-mn)/mx : 0;
    if (r > b*1.12 && r > g*.95) warm++;
    if (lum[p]>.82) bright++;
    if (lum[p]<.18) dark++;
  }

  let edges=0, micro=0, samples=0;
  for (let y=1;y<h-1;y++) for (let x=1;x<w-1;x++) {
    const p=y*w+x;
    const gx=Math.abs(lum[p+1]-lum[p-1]);
    const gy=Math.abs(lum[p+w]-lum[p-w]);
    const e=gx+gy;
    if(e>.22) edges++;
    if(e>.10 && e<=.22) micro++;
    samples++;
  }
  const clamp=n=>Math.max(0,Math.min(1,n));
  const edgeRatio=edges/samples, microRatio=micro/samples;
  return {
    "linework.density": clamp(edgeRatio*7),
    "linework.micro_lines": clamp(microRatio*4),
    "texture.surface_noise": clamp((edgeRatio+microRatio)*2.7),
    "lighting.highlight_density": clamp(bright/(w*h)*5),
    "lighting.warm_reflection": clamp(warm/(w*h)*1.7),
    "rendering.shadow_complexity": clamp(dark/(w*h)*3),
    "rendering.color_saturation": clamp(satSum/(w*h)*1.5)
  };
}

export const LABELS = {
  "linework.density":"Line density",
  "linework.micro_lines":"Micro lines",
  "texture.surface_noise":"Surface noise",
  "lighting.highlight_density":"Highlight density",
  "lighting.warm_reflection":"Warm reflection",
  "rendering.shadow_complexity":"Shadow complexity",
  "rendering.color_saturation":"Color saturation"
};
