export const DEFAULT_TASTE = {};

const keywordMap = [
  [/garis|line art|lineart/i, ["linework.density"]],
  [/detail garis|garis kecil|micro/i, ["linework.micro_lines"]],
  [/titik|kasar|noise|speckle|grain/i, ["texture.surface_noise"]],
  [/pantulan|highlight|cahaya/i, ["lighting.highlight_density"]],
  [/hangat|warm|jingga|oranye/i, ["lighting.warm_reflection"]],
  [/shadow|bayang|gelap/i, ["rendering.shadow_complexity"]],
  [/warna|saturasi|mencolok/i, ["rendering.color_saturation"]]
];

export function extractAttributes(feedback) {
  const found = new Set();
  keywordMap.forEach(([rx, keys]) => rx.test(feedback) && keys.forEach(k=>found.add(k)));
  return [...found];
}

export function updateTaste(taste, report, decision, feedback) {
  const next = structuredClone(taste || {});
  let keys = extractAttributes(feedback);
  if (!keys.length) return { taste: next, attributed: [], note: "Feedback ambigu: taste weights tidak diubah." };
  for (const key of keys) {
    const old = next[key] || { negative_weight: 0, observations: 0 };
    const signal = decision === "REJECT" ? report[key] : -report[key];
    const n = old.observations + 1;
    old.negative_weight = ((old.negative_weight * old.observations) + signal) / n;
    old.observations = n;
    next[key] = old;
  }
  return { taste: next, attributed: keys, note: null };
}

export function predict(report, taste) {
  const rows = Object.entries(taste || {}).filter(([,v])=>v.observations>0);
  if (!rows.length) return { status:"UNCERTAIN", score:null, evidence:0 };
  let sum=0, den=0, evidence=0;
  rows.forEach(([key,v])=>{
    const confidence = Math.min(.95, v.observations/8);
    const dislike = Math.max(0, v.negative_weight);
    sum += (report[key]||0)*dislike*confidence;
    den += Math.max(.001, dislike*confidence);
    evidence += v.observations;
  });
  if (!den) return { status:"UNCERTAIN", score:null, evidence };
  const score=Math.round(Math.max(0,Math.min(1,sum/den))*100);
  return { status: evidence < 3 ? "LOW CONFIDENCE" : score>=55 ? "LIKELY REJECT" : "LIKELY ACCEPT", score, evidence };
}
