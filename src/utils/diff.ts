export interface DiffToken {
  text: string;
  changed: boolean;
}

/**
 * 두 텍스트를 단어 단위로 비교해 변경된 토큰을 반환합니다.
 * 교정 결과 하이라이트 표시용.
 */
export function wordDiff(original: string, revised: string): DiffToken[] {
  const origWords = original.trim().split(/\s+/).filter(Boolean);
  const revWords = revised.trim().split(/\s+/).filter(Boolean);

  const m = origWords.length;
  const n = revWords.length;

  // LCS dp
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        origWords[i - 1] === revWords[j - 1]
          ? dp[i - 1][j - 1] + 1
          : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }

  // 역추적 — 교정된 텍스트 기준, 변경된 단어만 표시
  const result: DiffToken[] = [];
  let i = m;
  let j = n;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && origWords[i - 1] === revWords[j - 1]) {
      result.unshift({ text: revWords[j - 1], changed: false });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.unshift({ text: revWords[j - 1], changed: true });
      j--;
    } else {
      i--;
    }
  }

  return result;
}
