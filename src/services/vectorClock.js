const REGIONS = ["us", "eu", "apac"];

const Comparison = {
  BEFORE: "BEFORE",
  AFTER: "AFTER",
  EQUAL: "EQUAL",
  CONCURRENT: "CONCURRENT"
};

// Create empty clock
function createInitialClock(localRegion) {
  const clock = {};
  REGIONS.forEach(region => {
    clock[region] = 0;
  });

  clock[localRegion] = 1;
  return clock;
}

// Increment local component
function increment(clock, localRegion) {
  const newClock = { ...clock };
  newClock[localRegion] += 1;
  return newClock;
}

// Compare two clocks
function compare(vc1, vc2) {
  let vc1IsLess = false;
  let vc1IsGreater = false;

  for (const region of REGIONS) {
    const v1 = vc1[region] || 0;
    const v2 = vc2[region] || 0;

    if (v1 < v2) {
      vc1IsLess = true;
    }

    if (v1 > v2) {
      vc1IsGreater = true;
    }
  }

  if (!vc1IsLess && !vc1IsGreater) {
    return Comparison.EQUAL;
  }

  if (vc1IsLess && !vc1IsGreater) {
    return Comparison.BEFORE;
  }

  if (!vc1IsLess && vc1IsGreater) {
    return Comparison.AFTER;
  }

  return Comparison.CONCURRENT;
}

// Merge clocks (element-wise max)
function merge(vc1, vc2) {
  const merged = {};

  for (const region of REGIONS) {
    merged[region] = Math.max(
      vc1[region] || 0,
      vc2[region] || 0
    );
  }

  return merged;
}

module.exports = {
  createInitialClock,
  increment,
  compare,
  merge,
  Comparison
};