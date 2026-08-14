// ═══════════════════════════════════════════════════════════════
// PRISM TYPING TOOL — Segment Classification Engine
//
// Classifies respondents into one of 16 PRISM segments using:
// 1. MaxDiff Best-Worst scores → z-scored dimensions
// 2. Attitude battery scores → additional z-scored dimensions
// 3. Euclidean distance to pre-computed segment centroids
// 4. Softmax probability assignment
// ═══════════════════════════════════════════════════════════════

const GOP_CENTROIDS = {
  TSP: [ 0.85, 0.30,-0.60,-0.80, 0.10, 0.55,-0.90,-0.70,-0.65,-0.95, 0.90, 0.70,  0.71, 0.26,-0.26,-0.11, 0.45,-0.30],
  CEC: [ 0.25, 0.80,-0.20,-0.50, 0.60, 0.30,-0.40,-0.30,-0.45,-0.55, 0.20, 0.35,  0.57, 0.07,-0.07, 0.05, 0.30,-0.15],
  TC:  [-0.10, 0.50, 0.85,-0.30,-0.20, 0.20,-0.35,-0.40,-0.30,-0.45, 0.10, 0.15,  0.94, 0.04, 0.29,-0.20, 0.25,-0.10],
  WE:  [-0.40,-0.30, 0.60, 0.80,-0.10,-0.25, 0.30, 0.40, 0.35,-0.10,-0.55,-0.30, -0.11,-0.43, 0.10, 0.50,-0.10, 0.45],
  PP:  [ 0.15, 0.25,-0.30,-0.40, 0.85,-0.15,-0.20,-0.10, 0.20,-0.30, 0.60,-0.10,  0.07, 0.07, 0.00, 0.00, 0.10, 0.15],
  HF:  [ 0.40, 0.10,-0.50,-0.60,-0.10, 0.90,-0.35,-0.55,-0.30,-0.40, 0.45, 0.85,  0.67, 0.16, 0.15,-0.45, 0.90,-0.20],
  PFF: [-0.70,-0.50,-0.15, 0.30,-0.05,-0.10, 0.85, 0.35, 0.55, 0.50,-0.60,-0.20, -0.75,-0.68, 0.65, 0.55,-0.15, 0.75],
  HHN: [-0.30,-0.20,-0.25, 0.45,-0.05, 0.10, 0.25, 0.85, 0.30, 0.40,-0.30, 0.05, -0.28,-0.23, 0.30, 0.85, 0.10, 0.35],
  MFL: [-0.25,-0.20,-0.10, 0.25, 0.10,-0.05, 0.40, 0.20, 0.80, 0.25,-0.15,-0.10, -0.12,-0.35, 0.25, 0.30,-0.05, 0.80],
  VS:  [-0.65,-0.55,-0.20, 0.15,-0.15,-0.30, 0.70, 0.30, 0.50, 0.90,-0.45,-0.40, -0.70,-0.93, 0.80, 0.40,-0.30, 0.60],
};

const DEM_CENTROIDS = {
  UCP: [ 0.85, 0.30,-0.20, -0.40, -0.55,  0.15, 0.70,  0.45, 0.20,  0.50,  0.80, 0.65,-0.70, 0.20, 0.40,-0.50],
  FJP: [ 0.30, 0.85, 0.10, -0.10, -0.30,  0.25, 0.20,  0.70, 0.40,  0.35,  0.50, 0.30,-0.25, 0.15, 0.80, 0.30],
  HCP: [-0.10, 0.20, 0.80,  0.15,  0.10, -0.15, 0.50,  0.25, 0.15,  0.45,  0.40, 0.55,-0.10,-0.10, 0.25,-0.20],
  HAD: [-0.30,-0.15,-0.25,  0.85,  0.20,  0.35,-0.40, -0.30, 0.50, -0.25, -0.20,-0.35, 0.55, 0.30,-0.30, 0.70],
  HCI: [-0.45,-0.30, 0.15,  0.40,  0.80,  0.10,-0.55, -0.40, 0.30, -0.15, -0.10,-0.20, 0.80, 0.20,-0.15, 0.60],
  GHI: [ 0.15, 0.10,-0.20,  0.30, -0.10,  0.85, 0.10,  0.20, 0.65,  0.25,  0.55, 0.15,-0.35, 0.85, 0.30, 0.80],
};

const GOP_NORM = {
  md: Array(12).fill(null).map(() => [0.0, 1.0]),
  att: [[3.50,0.95],[3.75,0.90],[3.80,1.20],[3.60,1.10],[4.20,0.85],[4.40,0.80]],
};
const DEM_NORM = {
  md: Array(10).fill(null).map(() => [0.0, 1.0]),
  att: [[4.80,1.15],[4.60,1.00],[3.50,1.20],[4.30,1.05],[4.10,1.15],[4.70,0.90]],
};

function computeMaxDiffScores(responses, numItems) {
  const scores = new Array(numItems).fill(0);
  for (const task of responses) {
    if (task.best !== null) scores[task.best - 1] += 1;
    if (task.worst !== null) scores[task.worst - 1] -= 1;
  }
  return scores;
}
function zScore(value, mean, std) { return std === 0 ? 0 : (value - mean) / std; }
function euclideanDist(a, b) { let s=0; for(let i=0;i<a.length;i++) s+=(a[i]-b[i])**2; return Math.sqrt(s); }
function softmax(distances) {
  const nd=distances.map(d=>-d/2.0), mx=Math.max(...nd), ex=nd.map(d=>Math.exp(d-mx)), s=ex.reduce((a,b)=>a+b,0);
  return ex.map(e=>e/s);
}

export function classify(responses) {
  const { party, maxdiffResponses, attitudeResponses } = responses;
  return (party==="GOP"||party==="IND_GOP") ? classifyGOP(maxdiffResponses,attitudeResponses) : classifyDEM(maxdiffResponses,attitudeResponses);
}

function classifyGOP(mdR, attR) {
  const mdS=computeMaxDiffScores(mdR,12), zS=[];
  for(let i=0;i<12;i++) zS.push(zScore(mdS[i],GOP_NORM.md[i][0],GOP_NORM.md[i][1]));
  const ak=["pharma_trust","govt_trust","vax_safety","natural_med","innovation","autonomy"];
  for(let i=0;i<ak.length;i++) zS.push(zScore(attR[ak[i]]||4,GOP_NORM.att[i][0],GOP_NORM.att[i][1]));
  const sc=Object.keys(GOP_CENTROIDS), ds=sc.map(c=>euclideanDist(zS,GOP_CENTROIDS[c])), ps=softmax(ds);
  const mi=ps.indexOf(Math.max(...ps)), r=sc.map((c,i)=>({code:c,probability:ps[i],distance:ds[i]}));
  r.sort((a,b)=>b.probability-a.probability);
  return {segment:sc[mi],probability:ps[mi],allProbabilities:r,zScores:zS};
}

function classifyDEM(mdR, attR) {
  const mdS=computeMaxDiffScores(mdR,10), zS=[];
  for(let i=0;i<10;i++) zS.push(zScore(mdS[i],DEM_NORM.md[i][0],DEM_NORM.md[i][1]));
  const ak=["m4a_support","corp_blame","incremental","global_health","equity","institution_trust"];
  for(let i=0;i<ak.length;i++) zS.push(zScore(attR[ak[i]]||4,DEM_NORM.att[i][0],DEM_NORM.att[i][1]));
  const sc=Object.keys(DEM_CENTROIDS), ds=sc.map(c=>euclideanDist(zS,DEM_CENTROIDS[c])), ps=softmax(ds);
  const mi=ps.indexOf(Math.max(...ps)), r=sc.map((c,i)=>({code:c,probability:ps[i],distance:ds[i]}));
  r.sort((a,b)=>b.probability-a.probability);
  return {segment:sc[mi],probability:ps[mi],allProbabilities:r,zScores:zS};
}